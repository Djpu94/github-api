/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { GithubPort } from '../../domain/ports/github.port';
import { GithubProfile } from '../../domain/entities/github-profile.entity';
import { GithubRepo } from '../../domain/entities/github-repo.entity';

@Injectable()
export class GithubAdapter implements GithubPort {
  private readonly logger = new Logger(GithubAdapter.name);
  private readonly baseUrl = 'https://api.github.com';
  private readonly token: string | null;
  private readonly userAgent: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.token = this.configService.get<string>('GITHUB_TOKEN') || null;
    this.userAgent =
      this.configService.get<string>('USER_AGENT') || 'GitHub-Metrics-Service';
  }

  private getHeaders() {
    const headers: Record<string, string> = {
      'User-Agent': this.userAgent,
      Accept: 'application/vnd.github.v3+json',
    };

    if (this.token) {
      headers['Authorization'] = `token ${this.token}`;
    }

    return headers;
  }

  async getProfile(username: string): Promise<GithubProfile> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/users/${username}`, {
          headers: this.getHeaders(),
        }),
      );

      return GithubProfile.create(response.data);
    } catch (error) {
      this.handleGitHubError(
        error,
        `No se pudo obtener el perfil de ${username}`,
      );
    }
  }

  async getRepositories(username: string): Promise<GithubRepo[]> {
    try {
      const repos: GithubRepo[] = [];
      let page = 1;
      const perPage = 100;

      while (true) {
        const response = await firstValueFrom(
          this.httpService.get(`${this.baseUrl}/users/${username}/repos`, {
            headers: this.getHeaders(),
            params: {
              page,
              per_page: perPage,
              sort: 'updated',
              direction: 'desc',
            },
          }),
        );

        const pageRepos = response.data.map((repo: any) =>
          GithubRepo.create(repo),
        );
        repos.push(...pageRepos);

        // Si obtenemos menos repos de los solicitados, es la última página
        if (pageRepos.length < perPage) {
          break;
        }

        page++;
      }

      return repos;
    } catch (error) {
      this.handleGitHubError(
        error,
        `No se pudieron obtener los repositorios para ${username}`,
      );
    }
  }

  private handleGitHubError(error: any, defaultMessage: string): never {
    this.logger.error(`${defaultMessage}: ${error.message}`);

    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || defaultMessage;

      switch (status) {
        case 404:
          throw new HttpException(
            'Usuario de GitHub no encontrado',
            HttpStatus.NOT_FOUND,
          );
        case 403:
          if (error.response.headers['x-ratelimit-remaining'] === '0') {
            throw new HttpException(
              'Límite de frecuencia de la API de GitHub excedido.',
              HttpStatus.TOO_MANY_REQUESTS,
            );
          }
          throw new HttpException(
            'Acceso a la API de GitHub prohibido.',
            HttpStatus.FORBIDDEN,
          );
        case 429:
          throw new HttpException(
            'Límite de frecuencia de la API de GitHub excedido.',
            HttpStatus.TOO_MANY_REQUESTS,
          );
        case 503:
          throw new HttpException(
            'El servicio de API de GitHub no está disponible.',
            HttpStatus.SERVICE_UNAVAILABLE,
          );
        default:
          throw new HttpException(message, status);
      }
    }

    throw new HttpException(
      'La comunicación con la API de GitHub falló.',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

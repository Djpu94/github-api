/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Inject, Logger } from '@nestjs/common';
import { Metrics } from '../../domain/entities/metrics.entity';
import type { GithubPort } from '../../domain/ports/github.port';
import type { CachePort } from '../../domain/ports/cache.port';

@Injectable()
export class GetMetricsUseCase {
  private readonly logger = new Logger(GetMetricsUseCase.name);

  constructor(
    @Inject('GITHUB_PORT') private readonly githubPort: GithubPort,
    @Inject('CACHE_PORT') private readonly cachePort: CachePort,
  ) {}

  async execute(username: string): Promise<Metrics> {
    const startTime = Date.now();
    this.logger.log(
      `Cálculo de métricas iniciales para el usuario: ${username}`,
    );

    try {
      const cacheKey = `metrics:${username}`;

      const cached = await this.cachePort.get<Metrics>(cacheKey);
      if (cached) {
        this.logger.log(`Impacto en caché de métricas: ${username}`);
        return cached;
      }

      const [profile, repos] = await Promise.all([
        this.githubPort.getProfile(username),
        this.githubPort.getRepositories(username),
      ]);

      const metrics = this.calculateMetrics(username, profile, repos);

      await this.cachePort.set(cacheKey, metrics, 300);

      const duration = Date.now() - startTime;
      this.logger.log(
        `Cálculo de métricas completado para ${username} en ${duration}ms`,
      );

      return metrics;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(
        `El cálculo de métricas falló para ${username} despues de ${duration}ms: ${error.message}`,
      );
      throw error;
    }
  }

  private calculateMetrics(
    username: string,
    profile: any,
    repos: any[],
  ): Metrics {
    const totalStars = repos.reduce(
      (sum, repo) => sum + repo.stargazersCount,
      0,
    );

    const lastPushDate = this.findLastPushDate(repos);

    return Metrics.create(
      username,
      totalStars,
      profile.followers,
      profile.publicRepos,
      lastPushDate,
    );
  }

  private findLastPushDate(repos: any[]): Date | null {
    if (!repos || repos.length === 0) {
      return null;
    }

    let latestPush: Date | null = null;

    for (const repo of repos) {
      if (repo.pushedAt) {
        const pushDate = new Date(repo.pushedAt);

        if (!isNaN(pushDate.getTime())) {
          if (!latestPush || pushDate > latestPush) {
            latestPush = pushDate;
          }
        }
      }
    }

    return latestPush;
  }
}

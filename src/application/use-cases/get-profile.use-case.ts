import { Injectable, Inject } from '@nestjs/common';
import { GithubProfile } from '../../domain/entities/github-profile.entity';
import type { GithubPort } from '../../domain/ports/github.port';
import type { CachePort } from '../../domain/ports/cache.port';

@Injectable()
export class GetProfileUseCase {
  constructor(
    @Inject('GITHUB_PORT') private readonly githubPort: GithubPort,
    @Inject('CACHE_PORT') private readonly cachePort: CachePort,
  ) {}

  async execute(username: string): Promise<GithubProfile> {
    const cacheKey = `profile:${username}`;

    const cached = await this.cachePort.get<GithubProfile>(cacheKey);
    if (cached) {
      return cached;
    }

    const profile = await this.githubPort.getProfile(username);

    await this.cachePort.set(cacheKey, profile, 300);

    return profile;
  }
}

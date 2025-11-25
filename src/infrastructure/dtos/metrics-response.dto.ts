/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Expose, Transform } from 'class-transformer';
import { Metrics } from 'src/domain/entities/metrics.entity';

export class MetricsResponseDto {
  @Expose()
  username: string;

  @Expose()
  @Transform(({ value }) => ({
    totalStars: value.totalStars,
    followersToReposRatio: value.followersToReposRatio,
    lastPushDaysAgo: value.lastPushDaysAgo,
  }))
  metrics: {
    totalStars: number;
    followersToReposRatio: number | null;
    lastPushDaysAgo: number | null;
  };

  constructor(partial: Partial<MetricsResponseDto>) {
    Object.assign(this, partial);
  }

  // Método estático para crear desde la entidad Metrics
  static fromEntity(metrics: Metrics): MetricsResponseDto {
    return new MetricsResponseDto({
      username: metrics.username,
      metrics: {
        totalStars: metrics.totalStars,
        followersToReposRatio: metrics.followersToReposRatio,
        lastPushDaysAgo: metrics.lastPushDaysAgo,
      },
    });
  }
}

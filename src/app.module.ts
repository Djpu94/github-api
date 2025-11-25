// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { HealthController } from './infrastructure/controllers/health.controller';
import { ProfileController } from './infrastructure/controllers/profile.controller';
import { MetricsController } from './infrastructure/controllers/metrics.controller';
import { GetProfileUseCase } from './application/use-cases/get-profile.use-case';
import { GetMetricsUseCase } from './application/use-cases/get-metrics.use-case';
import { GithubAdapter } from './infrastructure/adapters/github.adapter';
import { MemoryCacheAdapter } from './infrastructure/adapters/memory-cache.adapter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    HttpModule,
  ],
  controllers: [HealthController, ProfileController, MetricsController],
  providers: [
    GetProfileUseCase,
    GetMetricsUseCase,
    {
      provide: 'GITHUB_PORT',
      useClass: GithubAdapter,
    },
    {
      provide: 'CACHE_PORT',
      useClass: MemoryCacheAdapter,
    },
  ],
})
export class AppModule {}

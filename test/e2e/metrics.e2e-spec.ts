// test/e2e/metrics.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('MetricsController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/metrics/:username', () => {
    it('should return metrics in correct format', () => {
      return request(app.getHttpServer())
        .get('/api/metrics/octocat')
        .expect(200)
        .expect((res) => {
          // Verificar estructura exacta del response
          expect(res.body).toHaveProperty('username');
          expect(res.body).toHaveProperty('metrics');
          expect(res.body.metrics).toHaveProperty('totalStars');
          expect(res.body.metrics).toHaveProperty('followersToReposRatio');
          expect(res.body.metrics).toHaveProperty('lastPushDaysAgo');

          // Verificar tipos de datos
          expect(typeof res.body.username).toBe('string');
          expect(typeof res.body.metrics.totalStars).toBe('number');

          // followersToReposRatio puede ser number o null
          if (res.body.metrics.followersToReposRatio !== null) {
            expect(typeof res.body.metrics.followersToReposRatio).toBe(
              'number',
            );
          }

          // lastPushDaysAgo puede ser number o null
          if (res.body.metrics.lastPushDaysAgo !== null) {
            expect(typeof res.body.metrics.lastPushDaysAgo).toBe('number');
          }
        });
    });
  });
});

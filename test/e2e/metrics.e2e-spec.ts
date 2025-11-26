import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, NotFoundException } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { GetMetricsUseCase } from '../../src/application/use-cases/get-metrics.use-case';

describe('MetricsController (e2e)', () => {
  let app: INestApplication;
  let getMetricsUseCase: GetMetricsUseCase;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    getMetricsUseCase = moduleFixture.get<GetMetricsUseCase>(GetMetricsUseCase);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /metrics/:username', () => {
    const username = 'octocat';

    it('debe retornar métricas para un usuario válido', () => {
      const mockMetrics = {
        username,
        totalStars: 150,
        followers: 5000,
        publicRepos: 45,
        lastPushDate: '2024-01-20T10:00:00.000Z',
      };

      jest
        .spyOn(getMetricsUseCase, 'execute')
        .mockResolvedValue(mockMetrics as any);

      return request(app.getHttpServer())
        .get(`/metrics/${username}`)
        .expect(200)
        .expect((response) => {
          expect(response.body).toEqual({
            username: mockMetrics.username,
            totalStars: mockMetrics.totalStars,
            followers: mockMetrics.followers,
            publicRepos: mockMetrics.publicRepos,
            lastPushDate: mockMetrics.lastPushDate,
          });
        });
    });

    it('debe retornar 404 cuando el usuario no existe', () => {
      const error = new NotFoundException('User not found');
      jest.spyOn(getMetricsUseCase, 'execute').mockRejectedValue(error);

      return request(app.getHttpServer())
        .get(`/metrics/nonexistentuser`)
        .expect(404)
        .expect((response) => {
          expect(response.body.message).toContain('User not found');
        });
    });

    it('debe retornar 500 para errores del servidor', () => {
      const error = new Error('Internal server error');
      jest.spyOn(getMetricsUseCase, 'execute').mockRejectedValue(error);

      return request(app.getHttpServer())
        .get(`/metrics/${username}`)
        .expect(500)
        .expect((response) => {
          expect(response.body.message).toContain('Internal server error');
        });
    });

    it('debe validar el parámetro username', () => {
      return request(app.getHttpServer()).get('/metrics/').expect(404);
    });
  });
});

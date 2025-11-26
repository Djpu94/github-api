import { Test, TestingModule } from '@nestjs/testing';
import { GetMetricsUseCase } from '../../src/application/use-cases/get-metrics.use-case';
import { GithubPort } from '../../src/domain/ports/github.port';
import { CachePort } from '../../src/domain/ports/cache.port';
import { GithubProfile } from '../../src/domain/entities/github-profile.entity';
import { GithubRepo } from '../../src/domain/entities/github-repo.entity';

describe('GetMetricsUseCase', () => {
  let useCase: GetMetricsUseCase;
  let githubPort: GithubPort;
  let cachePort: CachePort;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetMetricsUseCase,
        {
          provide: 'GITHUB_PORT',
          useValue: {
            getProfile: jest.fn(),
            getRepositories: jest.fn(),
          },
        },
        {
          provide: 'CACHE_PORT',
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<GetMetricsUseCase>(GetMetricsUseCase);
    githubPort = module.get('GITHUB_PORT');
    cachePort = module.get('CACHE_PORT');
  });

  describe('calculateMetrics', () => {
    it('should calculate metrics correctly for user with repos and activity', async () => {
      const mockProfile = new GithubProfile(
        'testuser',
        'Test User',
        'https://avatar.url',
        'Test bio',
        10, // publicRepos: 10
        100, // followers: 100
        'https://github.com/testuser',
      );

      const mockRepos = [
        new GithubRepo('repo1', 50, '2024-01-15T00:00:00Z'),
        new GithubRepo('repo2', 30, '2024-01-10T00:00:00Z'),
        new GithubRepo('repo3', 20, '2024-01-20T00:00:00Z'), // Más reciente
      ];

      jest.spyOn(cachePort, 'get').mockResolvedValue(null);
      jest.spyOn(githubPort, 'getProfile').mockResolvedValue(mockProfile);
      jest.spyOn(githubPort, 'getRepositories').mockResolvedValue(mockRepos);

      const result = await useCase.execute('testuser');

      expect(result.username).toBe('testuser');
      expect(result.totalStars).toBe(100); // 50 + 30 + 20
      expect(result.followersToReposRatio).toBe(10); // 100 followers / 10 repos = 10
      expect(result.lastPushDaysAgo).toBeGreaterThan(0); // Días desde 2024-01-20
    });

    it('should handle user with no repositories', async () => {
      const mockProfile = new GithubProfile(
        'testuser',
        'Test User',
        'https://avatar.url',
        'Test bio',
        0, // publicRepos: 0
        100, // followers: 100
        'https://github.com/testuser',
      );

      const mockRepos: GithubRepo[] = []; // Sin repositorios

      jest.spyOn(cachePort, 'get').mockResolvedValue(null);
      jest.spyOn(githubPort, 'getProfile').mockResolvedValue(mockProfile);
      jest.spyOn(githubPort, 'getRepositories').mockResolvedValue(mockRepos);

      const result = await useCase.execute('testuser');

      expect(result.totalStars).toBe(0);
      expect(result.followersToReposRatio).toBeNull(); // Ratio null cuando no hay repos
      expect(result.lastPushDaysAgo).toBeNull(); // No hay actividad
    });

    it('should handle user with repositories but no push activity', async () => {
      const mockProfile = new GithubProfile(
        'testuser',
        'Test User',
        'https://avatar.url',
        'Test bio',
        5, // publicRepos: 5
        50, // followers: 50
        'https://github.com/testuser',
      );

      const mockRepos = [
        new GithubRepo('repo1', 10, null), // Sin actividad
        new GithubRepo('repo2', 5, null), // Sin actividad
      ];

      jest.spyOn(cachePort, 'get').mockResolvedValue(null);
      jest.spyOn(githubPort, 'getProfile').mockResolvedValue(mockProfile);
      jest.spyOn(githubPort, 'getRepositories').mockResolvedValue(mockRepos);

      const result = await useCase.execute('testuser');

      expect(result.totalStars).toBe(15);
      expect(result.followersToReposRatio).toBe(10); // 50 / 5 = 10
      expect(result.lastPushDaysAgo).toBeNull(); // No hay actividad registrada
    });

    it('should format ratio with 1-2 decimales correctly', async () => {
      const mockProfile = new GithubProfile(
        'testuser',
        'Test User',
        'https://avatar.url',
        'Test bio',
        3, // publicRepos: 3
        10, // followers: 10
        'https://github.com/testuser',
      );

      const mockRepos = [new GithubRepo('repo1', 5, '2024-01-20T00:00:00Z')];

      jest.spyOn(cachePort, 'get').mockResolvedValue(null);
      jest.spyOn(githubPort, 'getProfile').mockResolvedValue(mockProfile);
      jest.spyOn(githubPort, 'getRepositories').mockResolvedValue(mockRepos);

      const result = await useCase.execute('testuser');

      // 10 / 3 = 3.333... → debería redondearse a 3.33
      expect(result.followersToReposRatio).toBe(3.33);
    });
  });
});

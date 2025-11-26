/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test } from '@nestjs/testing';
import { GetMetricsUseCase } from '../../src/application/use-cases/get-metrics.use-case';
import { Metrics } from '../../src/domain/entities/metrics.entity';

// Mock para las fechas consistentes en las pruebas
const mockDate = new Date('2024-01-25T10:00:00Z');

describe('GetMetricsUseCase', () => {
  let getMetricsUseCase: GetMetricsUseCase;
  let mockGithubPort: any;
  let mockCachePort: any;

  beforeEach(async () => {
    // Mock Date.now() para que las pruebas sean consistentes
    jest.spyOn(Date, 'now').mockImplementation(() => mockDate.getTime());

    mockGithubPort = {
      getProfile: jest.fn(),
      getRepositories: jest.fn(),
    };

    mockCachePort = {
      get: jest.fn(),
      set: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        GetMetricsUseCase,
        {
          provide: 'GITHUB_PORT',
          useValue: mockGithubPort,
        },
        {
          provide: 'CACHE_PORT',
          useValue: mockCachePort,
        },
      ],
    }).compile();

    getMetricsUseCase = moduleRef.get<GetMetricsUseCase>(GetMetricsUseCase);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('execute', () => {
    const username = 'testuser';
    const mockProfile = {
      followers: 100,
      publicRepos: 50,
    };
    const mockRepos = [
      { stargazersCount: 10, pushedAt: '2024-01-15T10:00:00Z' },
      { stargazersCount: 5, pushedAt: '2024-01-20T10:00:00Z' },
      { stargazersCount: 3, pushedAt: null },
    ];

    it('should return cached metrics when available', async () => {
      const cachedMetrics = Metrics.create(
        username,
        18,
        100,
        50,
        new Date('2024-01-20T10:00:00Z'),
      );

      mockCachePort.get.mockResolvedValue(cachedMetrics);

      const result = await getMetricsUseCase.execute(username);

      expect(result).toEqual(cachedMetrics);
      expect(mockCachePort.get).toHaveBeenCalledWith(`metrics:${username}`);
      expect(mockGithubPort.getProfile).not.toHaveBeenCalled();
      expect(mockGithubPort.getRepositories).not.toHaveBeenCalled();
    });

    it('should calculate metrics and cache when no cache available', async () => {
      mockCachePort.get.mockResolvedValue(null);
      mockGithubPort.getProfile.mockResolvedValue(mockProfile);
      mockGithubPort.getRepositories.mockResolvedValue(mockRepos);
      mockCachePort.set.mockResolvedValue(undefined);

      const result = await getMetricsUseCase.execute(username);

      expect(mockGithubPort.getProfile).toHaveBeenCalledWith(username);
      expect(mockGithubPort.getRepositories).toHaveBeenCalledWith(username);
      expect(mockCachePort.set).toHaveBeenCalledWith(
        `metrics:${username}`,
        expect.any(Metrics),
        300,
      );

      expect(result.totalStars).toBe(18);
      // followers: 100, publicRepos: 50 -> ratio = 100/50 = 2
      expect(result.followersToReposRatio).toBe(2);
      // lastPushDate: 2024-01-20, today: 2024-01-25 -> 5 days ago
      expect(result.lastPushDaysAgo).toBe(5);
    });

    it('should handle repositories without push dates', async () => {
      const reposWithoutPushes = [
        { stargazersCount: 10, pushedAt: null },
        { stargazersCount: 5, pushedAt: null },
      ];

      mockCachePort.get.mockResolvedValue(null);
      mockGithubPort.getProfile.mockResolvedValue(mockProfile);
      mockGithubPort.getRepositories.mockResolvedValue(reposWithoutPushes);

      const result = await getMetricsUseCase.execute(username);

      expect(result.lastPushDaysAgo).toBeNull();
      expect(result.totalStars).toBe(15);
    });

    it('should handle empty repositories array', async () => {
      mockCachePort.get.mockResolvedValue(null);
      mockGithubPort.getProfile.mockResolvedValue(mockProfile);
      mockGithubPort.getRepositories.mockResolvedValue([]);

      const result = await getMetricsUseCase.execute(username);

      expect(result.lastPushDaysAgo).toBeNull();
      expect(result.totalStars).toBe(0);
    });

    it('should throw error when GitHub API fails', async () => {
      const error = new Error('GitHub API error');
      mockCachePort.get.mockResolvedValue(null);
      mockGithubPort.getProfile.mockRejectedValue(error);

      await expect(getMetricsUseCase.execute(username)).rejects.toThrow(error);
    });
  });

  describe('calculateMetrics', () => {
    it('should correctly calculate metrics from profile and repos', () => {
      const username = 'testuser';
      const profile = { followers: 50, publicRepos: 10 };
      const repos = [
        { stargazersCount: 5, pushedAt: '2024-01-10T10:00:00Z' },
        { stargazersCount: 3, pushedAt: '2024-01-15T10:00:00Z' },
      ];

      const result = getMetricsUseCase['calculateMetrics'](
        username,
        profile,
        repos,
      );

      expect(result.totalStars).toBe(8);
      // followers: 50, publicRepos: 10 -> ratio = 50/10 = 5
      expect(result.followersToReposRatio).toBe(5);
      // lastPushDate: 2024-01-15, today: 2024-01-25 -> 10 days ago
      expect(result.lastPushDaysAgo).toBe(10);
    });

    it('should handle ratio with decimal values', () => {
      const username = 'testuser';
      const profile = { followers: 7, publicRepos: 3 };
      const repos = [{ stargazersCount: 5, pushedAt: '2024-01-15T10:00:00Z' }];

      const result = getMetricsUseCase['calculateMetrics'](
        username,
        profile,
        repos,
      );

      expect(result.totalStars).toBe(5);
      // followers: 7, publicRepos: 3 -> ratio = 7/3 = 2.333... -> rounded to 2.33
      expect(result.followersToReposRatio).toBe(2.33);
    });

    it('should return null ratio when no public repos', () => {
      const username = 'testuser';
      const profile = { followers: 100, publicRepos: 0 };
      const repos = [{ stargazersCount: 5, pushedAt: '2024-01-15T10:00:00Z' }];

      const result = getMetricsUseCase['calculateMetrics'](
        username,
        profile,
        repos,
      );

      expect(result.followersToReposRatio).toBeNull();
    });
  });

  describe('findLastPushDate', () => {
    it('should return null for empty repos array', () => {
      const result = getMetricsUseCase['findLastPushDate']([]);
      expect(result).toBeNull();
    });

    it('should return null when no repos have push dates', () => {
      const repos = [{ pushedAt: null }, { pushedAt: null }];
      const result = getMetricsUseCase['findLastPushDate'](repos);
      expect(result).toBeNull();
    });

    it('should find the latest push date', () => {
      const repos = [
        { pushedAt: '2024-01-10T10:00:00Z' },
        { pushedAt: '2024-01-15T10:00:00Z' },
        { pushedAt: '2024-01-12T10:00:00Z' },
      ];
      const result = getMetricsUseCase['findLastPushDate'](repos);
      expect(result).toEqual(new Date('2024-01-15T10:00:00Z'));
    });

    it('should handle invalid dates gracefully', () => {
      const repos = [
        { pushedAt: 'invalid-date' },
        { pushedAt: '2024-01-15T10:00:00Z' },
      ];
      const result = getMetricsUseCase['findLastPushDate'](repos);
      expect(result).toEqual(new Date('2024-01-15T10:00:00Z'));
    });
  });
});

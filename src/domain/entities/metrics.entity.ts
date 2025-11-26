export class Metrics {
  constructor(
    public readonly username: string,
    public readonly totalStars: number,
    public readonly followersToReposRatio: number | null,
    public readonly lastPushDaysAgo: number | null,
  ) {}

  static create(
    username: string,
    totalStars: number,
    followers: number,
    publicRepos: number,
    lastPushDate: Date | null,
  ): Metrics {
    const ratio = this.calculateFollowersToReposRatio(followers, publicRepos);

    const lastPushDaysAgo = this.calculateLastPushDaysAgo(lastPushDate);

    return new Metrics(username, totalStars, ratio, lastPushDaysAgo);
  }

  private static calculateFollowersToReposRatio(
    followers: number,
    publicRepos: number,
  ): number | null {
    if (publicRepos === 0) {
      return null;
    }

    const ratio = followers / publicRepos;

    if (ratio % 1 === 0) {
      return ratio;
    }

    const rounded = Math.round(ratio * 100) / 100;

    return rounded % 1 === 0 ? Math.floor(rounded) : rounded;
  }

  private static calculateLastPushDaysAgo(
    lastPushDate: Date | null,
  ): number | null {
    if (!lastPushDate) {
      return null;
    }

    const today = new Date();
    const diffTime = Math.abs(today.getTime() - lastPushDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  }

  toJSON() {
    return {
      username: this.username,
      metrics: {
        totalStars: this.totalStars,
        followersToReposRatio: this.followersToReposRatio,
        lastPushDaysAgo: this.lastPushDaysAgo,
      },
    };
  }
}

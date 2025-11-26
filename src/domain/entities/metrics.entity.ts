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
    // Calcular ratio seguidores/repositorios con 1-2 decimales
    const ratio = this.calculateFollowersToReposRatio(followers, publicRepos);

    // Calcular días desde última actividad
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

    // Formatear a 1-2 decimales
    // Si el número es entero, mostrar sin decimales
    // Si tiene decimales, mostrar con 1 o 2 decimales según necesidad
    if (ratio % 1 === 0) {
      return ratio;
    }

    // Redondear a 2 decimales, pero eliminar .00 si es entero
    const rounded = Math.round(ratio * 100) / 100;

    // Si al redondear queda como entero, retornar sin decimales
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

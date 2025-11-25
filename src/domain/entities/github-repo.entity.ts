export class GithubRepo {
  constructor(
    public readonly name: string,
    public readonly stargazersCount: number,
    public readonly pushedAt: string | null,
  ) {}

  static create(data: {
    name: string;
    stargazers_count: number;
    pushed_at: string | null;
  }): GithubRepo {
    return new GithubRepo(data.name, data.stargazers_count, data.pushed_at);
  }
}

export class GithubProfile {
  constructor(
    public readonly username: string,
    public readonly name: string | null,
    public readonly avatarUrl: string,
    public readonly bio: string | null,
    public readonly publicRepos: number,
    public readonly followers: number,
    public readonly profileUrl: string,
  ) {}

  static create(data: {
    login: string;
    name: string | null;
    avatar_url: string;
    bio: string | null;
    public_repos: number;
    followers: number;
    html_url: string;
  }): GithubProfile {
    return new GithubProfile(
      data.login,
      data.name,
      data.avatar_url,
      data.bio,
      data.public_repos,
      data.followers,
      data.html_url,
    );
  }
}

import { GithubProfile } from '../entities/github-profile.entity';
import { GithubRepo } from '../entities/github-repo.entity';

export interface GithubPort {
  getProfile(username: string): Promise<GithubProfile>;
  getRepositories(username: string): Promise<GithubRepo[]>;
}

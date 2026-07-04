export interface GithubTokenStatus {
  isConfigured: boolean;
  lastFour: string;
}

export interface GithubRepo {
  githubId: number;
  name: string;
  fullName: string;
  htmlUrl: string;
  description: string | null;
  updatedAt: string;
  isTracked: boolean;
}

export interface GithubRepoListResponse {
  tokenConfigured: boolean;
  repos: GithubRepo[];
}

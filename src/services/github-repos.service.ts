import axiosInstance from "@/lib/axios";
import type { ApiResponse } from "@/types/api.types";
import type {
  GithubRepo,
  GithubRepoListResponse,
  GithubTokenStatus,
} from "@/types/github-repos.types";

export const GithubReposService = {
  async getTokenStatus(): Promise<GithubTokenStatus> {
    const res = await axiosInstance.get<ApiResponse<GithubTokenStatus>>(
      "/admin/github-repos/token/"
    );
    return res.data.data;
  },

  async saveToken(token: string): Promise<GithubTokenStatus> {
    const res = await axiosInstance.put<ApiResponse<GithubTokenStatus>>(
      "/admin/github-repos/token/",
      { token }
    );
    return res.data.data;
  },

  async clearToken(): Promise<void> {
    await axiosInstance.delete("/admin/github-repos/token/");
  },

  async listOrgRepos(): Promise<GithubRepoListResponse> {
    const res = await axiosInstance.get<ApiResponse<GithubRepoListResponse>>(
      "/admin/github-repos/repos/"
    );
    return res.data.data;
  },

  async setTracked(
    githubId: number,
    isTracked: boolean,
    meta: { fullName: string; name: string; htmlUrl: string }
  ): Promise<GithubRepo> {
    const res = await axiosInstance.patch<ApiResponse<GithubRepo>>(
      `/admin/github-repos/repos/${githubId}/`,
      {
        is_tracked: isTracked,
        full_name: meta.fullName,
        name: meta.name,
        html_url: meta.htmlUrl,
      }
    );
    return res.data.data;
  },
};

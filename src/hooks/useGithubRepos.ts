import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { GithubReposService } from "@/services/github-repos.service";

export const githubRepoKeys = {
  tokenStatus: ["admin", "github-repos", "token"] as const,
  repos: ["admin", "github-repos", "repos"] as const,
};

export function useGithubTokenStatus() {
  return useQuery({
    queryKey: githubRepoKeys.tokenStatus,
    queryFn: () => GithubReposService.getTokenStatus(),
  });
}

export function useSaveGithubToken() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (token: string) => GithubReposService.saveToken(token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: githubRepoKeys.tokenStatus });
      queryClient.invalidateQueries({ queryKey: githubRepoKeys.repos });
    },
  });
}

export function useClearGithubToken() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => GithubReposService.clearToken(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: githubRepoKeys.tokenStatus });
      queryClient.invalidateQueries({ queryKey: githubRepoKeys.repos });
    },
  });
}

export function useOrgRepos() {
  return useQuery({
    queryKey: githubRepoKeys.repos,
    queryFn: () => GithubReposService.listOrgRepos(),
  });
}

export function useSetRepoTracked() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      githubId,
      isTracked,
      meta,
    }: {
      githubId: number;
      isTracked: boolean;
      meta: { fullName: string; name: string; htmlUrl: string };
    }) => GithubReposService.setTracked(githubId, isTracked, meta),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: githubRepoKeys.repos });
    },
  });
}

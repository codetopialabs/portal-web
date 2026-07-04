import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { GithubReposService } from "@/services/github-repos.service";
import type { GithubRepoListResponse } from "@/types/github-repos.types";

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
    onMutate: async ({ githubId, isTracked }) => {
      // Flip the checkbox immediately instead of waiting on the round trip —
      // the backend call itself is a plain DB write (no live GitHub call),
      // but there's no reason to make the UI wait on network latency for
      // something this reversible.
      await queryClient.cancelQueries({ queryKey: githubRepoKeys.repos });
      const previous = queryClient.getQueryData<GithubRepoListResponse>(githubRepoKeys.repos);
      if (previous) {
        queryClient.setQueryData<GithubRepoListResponse>(githubRepoKeys.repos, {
          ...previous,
          repos: previous.repos.map((repo) =>
            repo.githubId === githubId ? { ...repo, isTracked } : repo
          ),
        });
      }
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(githubRepoKeys.repos, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: githubRepoKeys.repos });
    },
  });
}

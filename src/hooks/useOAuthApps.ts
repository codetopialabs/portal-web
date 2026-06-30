"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { OAuthAppsService } from "@/services/oauth-apps.service";
import type { CreateOAuthAppInput, UpdateOAuthAppInput } from "@/types/oauth-apps.types";

export const oauthAppsKey = ["admin", "oauth-apps"] as const;

export function useOAuthApps() {
  return useQuery({
    queryKey: oauthAppsKey,
    queryFn: () => OAuthAppsService.getApps(),
  });
}

export function useCreateOAuthApp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateOAuthAppInput) => OAuthAppsService.createApp(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: oauthAppsKey });
    },
  });
}

export function useUpdateOAuthApp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateOAuthAppInput }) =>
      OAuthAppsService.updateApp(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: oauthAppsKey });
    },
  });
}

export function useDeleteOAuthApp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => OAuthAppsService.deleteApp(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: oauthAppsKey });
    },
  });
}

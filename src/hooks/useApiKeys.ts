"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiKeysService } from "@/services/api-keys.service";
import type { CreateApiKeyInput } from "@/types/api-keys.types";

const apiKeysKey = ["admin", "api-keys"] as const;

export function useApiKeys() {
  return useQuery({
    queryKey: apiKeysKey,
    queryFn: () => ApiKeysService.getKeys(),
  });
}

export function useCreateApiKey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateApiKeyInput) => ApiKeysService.createKey(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiKeysKey });
    },
  });
}

export function useRevokeApiKey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ApiKeysService.revokeKey(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiKeysKey });
    },
  });
}

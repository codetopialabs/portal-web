"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RecognitionsService } from "@/services/recognitions.service";
import type { RecognitionInput, RecognitionStatus } from "@/types/recognitions.types";

type AdminListParams = {
  status?: RecognitionStatus | "";
  category?: string;
  search?: string;
};

export const recognitionKeys = {
  all: ["recognitions"] as const,
  admin: (params?: AdminListParams) => ["recognitions", "admin", params] as const,
  detail: (id: string) => ["recognitions", "detail", id] as const,
  categories: ["recognitions", "categories"] as const,
};

export function useAdminRecognitions(params?: AdminListParams) {
  return useQuery({
    queryKey: recognitionKeys.admin(params),
    queryFn: () => RecognitionsService.listForAdmin(params),
  });
}

export function useRecognition(id: string | undefined) {
  return useQuery({
    queryKey: recognitionKeys.detail(id ?? ""),
    queryFn: () => RecognitionsService.get(id as string),
    enabled: Boolean(id),
  });
}

export function useRecognitionCategories() {
  return useQuery({
    queryKey: recognitionKeys.categories,
    queryFn: () => RecognitionsService.listCategories(),
    staleTime: 300_000,
  });
}

export function useCreateRecognition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: RecognitionInput) => RecognitionsService.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: recognitionKeys.all }),
  });
}

export function useUpdateRecognition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RecognitionInput }) =>
      RecognitionsService.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: recognitionKeys.all }),
  });
}

export function useDeleteRecognition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => RecognitionsService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: recognitionKeys.all }),
  });
}

export function usePublishRecognition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => RecognitionsService.publish(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: recognitionKeys.all }),
  });
}

export function useRevokeRecognition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      RecognitionsService.revoke(id, reason),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: recognitionKeys.all }),
  });
}

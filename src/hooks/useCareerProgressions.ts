"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CareerProgressionsService } from "@/services/career-progressions.service";
import type {
  CareerProgressionInput,
  CareerProgressionStatus,
} from "@/types/career-progressions.types";

export const careerProgressionKeys = {
  mine: ["career-progressions", "mine"] as const,
  eligibleRoles: ["career-progressions", "eligible-roles"] as const,
  admin: (params?: { status?: CareerProgressionStatus | ""; search?: string }) =>
    ["career-progressions", "admin", params] as const,
};

export function useEligibleRoles() {
  return useQuery({
    queryKey: careerProgressionKeys.eligibleRoles,
    queryFn: () => CareerProgressionsService.listEligibleRoles(),
  });
}

export function useMyCareerProgressions() {
  return useQuery({
    queryKey: careerProgressionKeys.mine,
    queryFn: () => CareerProgressionsService.listMine(),
  });
}

export function useSubmitCareerProgression() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CareerProgressionInput) => CareerProgressionsService.submit(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: careerProgressionKeys.mine }),
  });
}

export function useUpdateCareerProgression() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CareerProgressionInput }) =>
      CareerProgressionsService.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: careerProgressionKeys.mine }),
  });
}

export function useDeleteCareerProgression() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => CareerProgressionsService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: careerProgressionKeys.mine }),
  });
}

export function useCareerProgressionsForReview(params?: {
  status?: CareerProgressionStatus | "";
  search?: string;
}) {
  return useQuery({
    queryKey: careerProgressionKeys.admin(params),
    queryFn: () => CareerProgressionsService.listForReview(params),
  });
}

export function useReviewCareerProgression() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      action,
      reviewNote,
    }: {
      id: number;
      action: "approve" | "reject" | "revoke";
      reviewNote?: string;
    }) => CareerProgressionsService.review(id, action, reviewNote),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["career-progressions"] }),
  });
}

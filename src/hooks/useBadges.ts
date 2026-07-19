"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BadgesService } from "@/services/badges.service";
import { useAuthStore } from "@/store/auth.store";
import type { BadgeInput } from "@/types/badges.types";

export const badgeKeys = {
  admin: ["badges", "admin"] as const,
  detail: (slug: string) => ["badges", "admin", slug] as const,
  awards: (slug: string) => ["badges", "admin", slug, "awards"] as const,
  criteria: ["badges", "criteria"] as const,
  mine: ["badges", "mine"] as const,
  pending: ["badges", "pending"] as const,
  member: (username: string) => ["badges", "member", username] as const,
};

export function useAdminBadges() {
  return useQuery({ queryKey: badgeKeys.admin, queryFn: BadgesService.listAdmin });
}
export function useBadge(slug: string) {
  return useQuery({ queryKey: badgeKeys.detail(slug), queryFn: () => BadgesService.get(slug) });
}
export function useBadgeCriteria() {
  // Only fire once we have an access token — avoids a spurious 401 on first
  // render before the auth store has hydrated from cookies.
  const hasSession = useAuthStore((s) => Boolean(s.session?.accessToken));
  return useQuery({
    queryKey: badgeKeys.criteria,
    queryFn: BadgesService.criteriaCatalog,
    enabled: hasSession,
    retry: false,
    staleTime: 1000 * 60 * 5, // catalog doesn't change often
  });
}
export function useMyBadges() {
  return useQuery({ queryKey: badgeKeys.mine, queryFn: BadgesService.mine });
}
export function useMemberBadges(username: string) {
  return useQuery({
    queryKey: badgeKeys.member(username),
    queryFn: () => BadgesService.member(username),
    enabled: Boolean(username),
  });
}
export function useCreateBadge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: BadgeInput) => BadgesService.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: badgeKeys.admin }),
  });
}
export function useUpdateBadge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ slug, input }: { slug: string; input: Partial<BadgeInput> }) =>
      BadgesService.update(slug, input),
    onSuccess: (badge) => {
      qc.invalidateQueries({ queryKey: badgeKeys.admin });
      qc.setQueryData(badgeKeys.detail(badge.slug), badge);
    },
  });
}
export function useDeleteBadge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (slug: string) => BadgesService.remove(slug),
    onSuccess: () => qc.invalidateQueries({ queryKey: badgeKeys.admin }),
  });
}
export function useReconcileBadge() {
  return useMutation({
    mutationFn: (slug: string) => BadgesService.reconcile(slug),
  });
}
export function useAwardBadge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      slug,
      identifier,
      reason,
    }: {
      slug: string;
      identifier: string;
      reason: string;
    }) => BadgesService.award(slug, identifier, reason),
    onSuccess: () => qc.invalidateQueries({ queryKey: badgeKeys.admin }),
  });
}
export function useRevokeBadge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ awardId, reason }: { awardId: string; reason: string }) =>
      BadgesService.revoke(awardId, reason),
    onSuccess: () => qc.invalidateQueries({ queryKey: badgeKeys.admin }),
  });
}
export function useBadgeAwards(slug: string) {
  return useQuery({
    queryKey: badgeKeys.awards(slug),
    queryFn: () => BadgesService.listAwards(slug),
    enabled: Boolean(slug),
  });
}
export function useFeatureBadges() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: BadgesService.feature,
    onSuccess: (awards) => qc.setQueryData(badgeKeys.mine, awards),
  });
}
export function usePendingBadges() {
  return useQuery({
    queryKey: badgeKeys.pending,
    queryFn: BadgesService.pending,
  });
}

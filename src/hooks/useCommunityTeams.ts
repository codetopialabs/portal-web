"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { useFeature } from "@/hooks/useFeatures";
import { ME_QUERY_KEY } from "@/hooks/useMe";
import {
  type CommunityTeam,
  CommunityTeamsService,
  type ContributionStatus,
  type ContributionSubmit,
  type LeadershipUpdate,
  type MemberStatus,
  type RosterMemberUpdate,
} from "@/services/community-teams.service";
import { useUserStore } from "@/store/user.store";

export const COMMUNITY_TEAMS_KEY = ["community-teams"] as const;

/** The six community teams. Does nothing while the teamsV2 flag is off. */
export function useCommunityTeams() {
  const enabled = useFeature("teamsV2");
  return useQuery({
    queryKey: COMMUNITY_TEAMS_KEY,
    queryFn: () => CommunityTeamsService.list(),
    enabled,
    staleTime: 5 * 60_000,
  });
}

/**
 * The teams the current user leads or deputises. Being named on the team is
 * the whole of a lead's authority (no role, no permission), so this is how
 * the client knows to show My Team.
 */
export function useMyLedTeams(): { teams: CommunityTeam[]; isLoading: boolean } {
  const myId = useUserStore((s) => s.profile?.id);
  const { data, isLoading } = useCommunityTeams();
  const teams = useMemo(
    () => (data ?? []).filter((t) => t.lead?.id === myId || t.deputy?.id === myId),
    [data, myId]
  );
  return { teams, isLoading };
}

export function useCommunityTeam(slug: string | null) {
  const enabled = useFeature("teamsV2");
  return useQuery({
    queryKey: [...COMMUNITY_TEAMS_KEY, slug],
    queryFn: () => CommunityTeamsService.get(slug as string),
    enabled: enabled && !!slug,
    staleTime: 60_000,
  });
}

/** Set a team's lead, deputy and minimum. community_teams.assign_leads. */
export function useUpdateLeadership() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ slug, data }: { slug: string; data: LeadershipUpdate }) =>
      CommunityTeamsService.updateLeadership(slug, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: COMMUNITY_TEAMS_KEY });
      // The admin departments list shows lead and deputy too.
      qc.invalidateQueries({ queryKey: ["admin", "departments"] });
    },
  });
}

export function useTeamRoster(slug: string | null, status?: MemberStatus) {
  const enabled = useFeature("teamsV2");
  return useQuery({
    queryKey: [...COMMUNITY_TEAMS_KEY, slug, "roster", status ?? "all"],
    queryFn: () => CommunityTeamsService.roster(slug as string, status),
    enabled: enabled && !!slug,
    staleTime: 30_000,
  });
}

export function useUpdateRosterMember(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: RosterMemberUpdate }) =>
      CommunityTeamsService.updateMember(slug, userId, data),
    onSuccess: (_row, { userId }) => {
      qc.invalidateQueries({ queryKey: [...COMMUNITY_TEAMS_KEY, slug, "roster"] });
      qc.invalidateQueries({ queryKey: [...COMMUNITY_TEAMS_KEY, "health"] });
      // The edited member may be the current user (a lead editing their own row).
      const myId = useUserStore.getState().profile?.id;
      if (myId === userId) qc.invalidateQueries({ queryKey: ME_QUERY_KEY });
    },
  });
}

export function useTeamHealth() {
  const enabled = useFeature("teamsV2");
  return useQuery({
    queryKey: [...COMMUNITY_TEAMS_KEY, "health"],
    queryFn: () => CommunityTeamsService.health(),
    enabled,
    staleTime: 30_000,
  });
}

// ── Contributions ────────────────────────────────────────────────────────────

export const CONTRIBUTIONS_KEY = [...COMMUNITY_TEAMS_KEY, "contributions"] as const;

export function useMyContributions() {
  const enabled = useFeature("teamsV2");
  return useQuery({
    queryKey: [...CONTRIBUTIONS_KEY, "mine"],
    queryFn: () => CommunityTeamsService.myContributions(),
    enabled,
    staleTime: 30_000,
  });
}

export function useSubmitContribution() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ContributionSubmit) => CommunityTeamsService.submitContribution(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CONTRIBUTIONS_KEY });
    },
  });
}

export function useWithdrawContribution() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => CommunityTeamsService.withdrawContribution(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CONTRIBUTIONS_KEY });
    },
  });
}

/** A member's approved contributions, for their public profile. */
export function useMemberContributions(username: string) {
  const enabled = useFeature("teamsV2");
  return useQuery({
    queryKey: [...CONTRIBUTIONS_KEY, "by", username],
    queryFn: () => CommunityTeamsService.memberContributions(username),
    enabled: enabled && !!username,
    staleTime: 60_000,
  });
}

export function useTeamContributions(slug: string | null, status: ContributionStatus | "all") {
  const enabled = useFeature("teamsV2");
  return useQuery({
    queryKey: [...CONTRIBUTIONS_KEY, "team", slug, status],
    queryFn: () => CommunityTeamsService.teamContributions(slug as string, status),
    enabled: enabled && !!slug,
    staleTime: 15_000,
  });
}

export function useReviewContribution(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      decision,
      note,
    }: {
      id: string;
      decision: "approve" | "decline";
      note?: string;
    }) => CommunityTeamsService.reviewContribution(slug, id, decision, note),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CONTRIBUTIONS_KEY });
      // Approval refreshes the member's check-in, which the roster shows.
      qc.invalidateQueries({ queryKey: [...COMMUNITY_TEAMS_KEY, slug, "roster"] });
      qc.invalidateQueries({ queryKey: [...COMMUNITY_TEAMS_KEY, "health"] });
    },
  });
}

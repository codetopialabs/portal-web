"use client";

import { useQuery } from "@tanstack/react-query";
import { useFeature } from "@/hooks/useFeatures";
import { CommunityTeamsService } from "@/services/community-teams.service";

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

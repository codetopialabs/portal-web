import axiosInstance from "@/lib/axios";
import type { ApiResponse } from "@/types/api.types";

// Teams v2: the six community teams (Events, Projects & Tech, ...). Served
// from /community-teams/, which answers 404 while TEAMS_V2_ENABLED is off,
// so only call these behind useFeature("teamsV2"). Not to be confused with
// /teams/, the squad-style project teams in teams.service.ts.

export interface PersonSummary {
  id: string;
  username: string;
  fullName: string;
}

export interface TeamSummary {
  id: string;
  slug: string;
  name: string;
}

export interface CommunityTeam extends TeamSummary {
  description: string;
  lead: PersonSummary | null;
  deputy: PersonSummary | null;
  minActiveMembers: number;
  memberCount: number;
}

const BASE = "/community-teams";

export const CommunityTeamsService = {
  async list(): Promise<CommunityTeam[]> {
    const res = await axiosInstance.get<ApiResponse<CommunityTeam[]>>(`${BASE}/`);
    return res.data.data;
  },

  async get(slug: string): Promise<CommunityTeam> {
    const res = await axiosInstance.get<ApiResponse<CommunityTeam>>(`${BASE}/${slug}/`);
    return res.data.data;
  },
};

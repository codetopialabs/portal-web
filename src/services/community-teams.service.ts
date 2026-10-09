import axiosInstance from "@/lib/axios";
import type { ApiResponse } from "@/types/api.types";

// Teams v2: the five community teams (Events, Projects & Tech, ...). Served
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

export type MemberLevel = "member" | "contributor" | "core" | "lead" | "alumni";
export type MemberStatus = "" | "active" | "paused" | "inactive";
export type HoursPerMonth = "" | "1-2" | "3-5" | "6-10" | "10+";
/** Computed on the backend: Active with no check-in for 60+ days, Active
 * with no check-in ever, or nothing. */
export type RosterFlag = "stale" | "no_check_in" | null;
export type TeamHealth = "OK" | "UNDERSTAFFED" | "NO_LEAD";

export interface RosterMember {
  userId: string;
  username: string;
  fullName: string;
  profilePictureUrl: string | null;
  discordUsername: string;
  level: MemberLevel;
  roleTitle: string;
  status: MemberStatus;
  lastCheckIn: string | null;
  hoursPerMonth: HoursPerMonth;
  recentContribution: string;
  primaryTeam: TeamSummary | null;
  secondaryTeam: TeamSummary | null;
  flag: RosterFlag;
}

/** What a lead or deputy may change. Admins may also send primary_team,
 * secondary_team, hours_per_month and recent_contribution. */
export interface RosterMemberUpdate {
  level?: MemberLevel;
  roleTitle?: string;
  status?: MemberStatus;
  lastCheckIn?: string | null;
}

export interface TeamHealthRow {
  id: string;
  slug: string;
  name: string;
  lead: PersonSummary | null;
  deputy: PersonSummary | null;
  activeCoreCount: number;
  totalActiveCount: number;
  minActiveMembers: number;
  /** Contributions approved since the 1st of this month. */
  approvedThisMonth: number;
  health: TeamHealth;
}

export interface LeadershipUpdate {
  lead?: string | null;
  deputy?: string | null;
  minActiveMembers?: number;
}

export type ContributionStatus = "submitted" | "approved" | "declined";

/** A piece of work a member did for a team, with a public link as proof. */
export interface Contribution {
  id: string;
  member: PersonSummary;
  team: TeamSummary;
  title: string;
  description: string;
  link: string;
  doneOn: string;
  status: ContributionStatus;
  reviewedBy: PersonSummary | null;
  reviewedAt: string | null;
  reviewNote: string;
  createdAt: string;
}

export interface ContributionSubmit {
  team: string; // slug
  title: string;
  description: string;
  link: string;
  doneOn: string;
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

  async updateLeadership(slug: string, data: LeadershipUpdate): Promise<CommunityTeam> {
    const payload: Record<string, unknown> = {};
    if (data.lead !== undefined) payload.lead = data.lead;
    if (data.deputy !== undefined) payload.deputy = data.deputy;
    if (data.minActiveMembers !== undefined) payload.min_active_members = data.minActiveMembers;
    const res = await axiosInstance.patch<ApiResponse<CommunityTeam>>(`${BASE}/${slug}/`, payload);
    return res.data.data;
  },

  async roster(slug: string, status?: MemberStatus): Promise<RosterMember[]> {
    const res = await axiosInstance.get<ApiResponse<RosterMember[]>>(`${BASE}/${slug}/members/`, {
      params: status ? { status } : undefined,
    });
    return res.data.data;
  },

  async updateMember(
    slug: string,
    userId: string,
    data: RosterMemberUpdate
  ): Promise<RosterMember> {
    const payload: Record<string, unknown> = {};
    if (data.level !== undefined) payload.level = data.level;
    if (data.roleTitle !== undefined) payload.role_title = data.roleTitle;
    if (data.status !== undefined) payload.status = data.status;
    if (data.lastCheckIn !== undefined) payload.last_check_in = data.lastCheckIn;
    const res = await axiosInstance.patch<ApiResponse<RosterMember>>(
      `${BASE}/${slug}/members/${userId}/`,
      payload
    );
    return res.data.data;
  },

  async health(): Promise<TeamHealthRow[]> {
    const res = await axiosInstance.get<ApiResponse<TeamHealthRow[]>>(`${BASE}/health/`);
    return res.data.data;
  },

  // ── Contributions ──

  async myContributions(): Promise<Contribution[]> {
    const res = await axiosInstance.get<ApiResponse<Contribution[]>>(`${BASE}/contributions/`);
    return res.data.data;
  },

  async submitContribution(data: ContributionSubmit): Promise<Contribution> {
    const res = await axiosInstance.post<ApiResponse<Contribution>>(`${BASE}/contributions/`, {
      team: data.team,
      title: data.title,
      description: data.description,
      link: data.link,
      done_on: data.doneOn,
    });
    return res.data.data;
  },

  async withdrawContribution(id: string): Promise<void> {
    await axiosInstance.delete(`${BASE}/contributions/${id}/`);
  },

  async memberContributions(username: string): Promise<Contribution[]> {
    const res = await axiosInstance.get<ApiResponse<Contribution[]>>(
      `${BASE}/contributions/by/${encodeURIComponent(username)}/`,
      { silentError: true }
    );
    return res.data.data;
  },

  async teamContributions(
    slug: string,
    status: ContributionStatus | "all" = "submitted"
  ): Promise<Contribution[]> {
    const res = await axiosInstance.get<ApiResponse<Contribution[]>>(
      `${BASE}/${slug}/contributions/`,
      { params: { status } }
    );
    return res.data.data;
  },

  async reviewContribution(
    slug: string,
    id: string,
    decision: "approve" | "decline",
    note = ""
  ): Promise<Contribution> {
    const res = await axiosInstance.post<ApiResponse<Contribution>>(
      `${BASE}/${slug}/contributions/${id}/${decision}/`,
      { note }
    );
    return res.data.data;
  },
};

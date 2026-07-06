import axiosInstance from "@/lib/axios";
import type { ApiResponse } from "@/types/api.types";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TeamMemberPreview {
  id: string;
  fullName: string;
  profilePictureUrl: string | null;
}

export interface Team {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  createdAt: string;
  memberCount?: number;
  membersPreview?: TeamMemberPreview[];
  /** Only present on /teams/ (My Teams) -- the caller's own role on this team. */
  role?: "owner" | "lead" | "member";
  /** Only present for a Lead/Owner -- null for a plain Member, who can't act on either. */
  pendingJoinRequests?: number | null;
  openReviews?: number | null;
}

export interface BrowseTeam extends Team {
  isMember: boolean;
  hasPendingRequest: boolean;
}

export interface TeamJoinRequest {
  id: string;
  team: string;
  teamSlug: string;
  teamName: string;
  status: "pending" | "approved" | "declined";
  createdAt: string;
  user: {
    id: string;
    username: string;
    fullName: string;
    profilePictureUrl: string | null;
  };
  reviewedBy: {
    id: string;
    username: string;
    fullName: string;
    profilePictureUrl: string | null;
  } | null;
}

export interface ActivityActor {
  id: string;
  username: string;
  fullName: string;
  profilePictureUrl: string;
}

export type ActivityType =
  | "review_opened"
  | "status_changed"
  | "assigned"
  | "unassigned"
  | "labeled"
  | "unlabeled"
  | "review_edited"
  | "commented"
  | "member_joined";

export interface ActivityItem {
  id: string;
  type: ActivityType;
  actor: ActivityActor;
  review: { id: string; title: string } | null;
  context: { to?: string; from?: string; snippet?: string; role?: string; label?: string };
  createdAt: string;
}

export interface TeamMember {
  id: string;
  userId: string;
  teamId: string;
  role: "owner" | "lead" | "member";
  joinedAt: string;
  user: {
    id: string;
    username: string;
    fullName: string;
    profilePictureUrl: string | null;
  };
}

export interface TeamInvite {
  id: string;
  teamId: string;
  teamSlug: string;
  teamName: string;
  userId: string;
  status: "pending" | "accepted" | "declined";
  expiresAt: string;
  createdAt: string;
  team?: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    memberCount?: number;
  };
  user: {
    id: string;
    username: string;
    fullName: string;
    profilePictureUrl: string | null;
  };
  invitedBy?: {
    id: string;
    username: string;
    fullName: string;
    profilePictureUrl: string | null;
  };
}

export interface TeamLabel {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

export interface ReviewEvent {
  id: string;
  eventType: string;
  actor: {
    id: string;
    username: string;
    fullName: string;
    profilePictureUrl: string | null;
  };
  // biome-ignore lint/suspicious/noExplicitAny: context is a flexible JSON blob from the API
  context: Record<string, any>;
  createdAt: string;
}

export interface Review {
  id: string;
  title: string;
  description: string;
  authorId: string;
  teamId: string;
  status: "open" | "approved" | "closed";
  category: string | null;
  createdAt: string;
  updatedAt: string;
  commentsCount: number;
  labels: TeamLabel[];
  assignees: {
    id: string;
    username: string;
    fullName: string;
    profilePictureUrl: string | null;
  }[];
  events: ReviewEvent[];
  author: {
    id: string;
    username: string;
    fullName: string;
    profilePictureUrl: string | null;
  };
}

export interface ReviewComment {
  id: string;
  reviewId: string;
  authorId: string;
  text: string;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    username: string;
    fullName: string;
    profilePictureUrl: string | null;
  };
}

export interface ContributionItem {
  type: "review_approved" | "pull_request_merged";
  title: string;
  url: string;
  timestamp: string;
  source: "internal" | "github";
}

export interface ContributionDay {
  date: string; // "YYYY-MM-DD"
  count: number;
  level: number; // 0–4
  items: ContributionItem[];
}

export interface CreateTeamInput {
  name: string;
  description?: string;
}

export interface CreateReviewInput {
  title: string;
  description: string;
  category?: string;
}

export interface CreateCommentInput {
  text: string;
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const TeamsService = {
  /** List all teams the current user belongs to. */
  async getMyTeams(): Promise<Team[]> {
    const res = await axiosInstance.get<ApiResponse<Team[]>>("/teams/");
    return res.data.data;
  },

  /** Admin-only: every team platform-wide, regardless of membership. */
  async getAllTeams(): Promise<Team[]> {
    const res = await axiosInstance.get<ApiResponse<Team[]>>("/admin/teams/");
    return res.data.data;
  },

  /** Every team platform-wide, for any member to browse and request to
   * join. Annotated with the caller's own membership/request state. */
  async browseTeams(): Promise<BrowseTeam[]> {
    const res = await axiosInstance.get<ApiResponse<BrowseTeam[]>>("/teams/browse/");
    return res.data.data;
  },

  /** Request to join a team. */
  async requestToJoin(teamSlug: string): Promise<TeamJoinRequest> {
    const res = await axiosInstance.post<ApiResponse<TeamJoinRequest>>(
      `/teams/${teamSlug}/join-requests/`
    );
    return res.data.data;
  },

  /** List pending join requests for a team (Owner/Lead only). */
  async getJoinRequests(teamSlug: string): Promise<TeamJoinRequest[]> {
    const res = await axiosInstance.get<ApiResponse<TeamJoinRequest[]>>(
      `/teams/${teamSlug}/join-requests/`
    );
    return res.data.data;
  },

  /** Approve or decline a join request (Owner/Lead only). */
  async reviewJoinRequest(
    teamSlug: string,
    requestId: string,
    action: "approve" | "decline"
  ): Promise<void> {
    await axiosInstance.post(`/teams/${teamSlug}/join-requests/${requestId}/${action}/`);
  },

  /** Withdraw your own pending join request. */
  async withdrawJoinRequest(teamSlug: string, requestId: string): Promise<void> {
    await axiosInstance.delete(`/teams/${teamSlug}/join-requests/${requestId}/withdraw/`);
  },

  /** All of the current user's own pending join requests, across all teams. */
  async getMyJoinRequests(): Promise<TeamJoinRequest[]> {
    const res = await axiosInstance.get<ApiResponse<TeamJoinRequest[]>>(
      "/teams/join-requests/mine/"
    );
    return res.data.data;
  },

  /** Fetch a single team's details. */
  async getTeam(teamId: string): Promise<Team> {
    const res = await axiosInstance.get<ApiResponse<Team>>(`/teams/${teamId}/`);
    return res.data.data;
  },

  /** Merged, time-sorted activity feed for the team workspace overview. */
  async getTeamActivity(teamSlug: string): Promise<ActivityItem[]> {
    const res = await axiosInstance.get<ApiResponse<ActivityItem[]>>(
      `/teams/${teamSlug}/activity/`
    );
    return res.data.data;
  },

  /** Create a new team. The calling user becomes the Lead automatically. */
  async createTeam(data: CreateTeamInput): Promise<Team> {
    const res = await axiosInstance.post<ApiResponse<Team>>("/teams/", {
      name: data.name,
      description: data.description,
    });
    return res.data.data;
  },

  /** List members of a team. */
  async getTeamMembers(teamId: string): Promise<TeamMember[]> {
    const res = await axiosInstance.get<ApiResponse<TeamMember[]>>(`/teams/${teamId}/members/`);
    return res.data.data;
  },

  /** Get the current user's membership record in a team (includes their role). */
  async getMyMembership(teamId: string): Promise<TeamMember> {
    const res = await axiosInstance.get<ApiResponse<TeamMember>>(`/teams/${teamId}/members/me/`);
    return res.data.data;
  },

  /** Remove a member from a team. */
  async removeMember(teamId: string, userId: string): Promise<void> {
    await axiosInstance.delete(`/teams/${teamId}/members/${userId}/`);
  },

  /** Promote a member to Lead, or demote a Lead back to Member. Owner only. */
  async updateMemberRole(
    teamId: string,
    userId: string,
    role: "lead" | "member"
  ): Promise<TeamMember> {
    const res = await axiosInstance.patch<ApiResponse<TeamMember>>(
      `/teams/${teamId}/members/${userId}/`,
      { role }
    );
    return res.data.data;
  },

  /** Hand ownership to another existing team member. The caller (current
   * Owner) becomes a Lead. Owner only. */
  async transferOwnership(teamId: string, userId: string): Promise<TeamMember> {
    const res = await axiosInstance.post<ApiResponse<TeamMember>>(
      `/teams/${teamId}/transfer-ownership/`,
      { user_id: userId }
    );
    return res.data.data;
  },

  // ─── Invites ───────────────────────────────────────────────────────────────

  /** Send an invite to a user by username or id (team leads only). */
  async sendInvite(teamId: string, username: string): Promise<TeamInvite> {
    const res = await axiosInstance.post<ApiResponse<TeamInvite>>(`/teams/${teamId}/invites/`, {
      username,
    });
    return res.data.data;
  },

  /** List pending invites for a team (team leads only). */
  async getInvites(teamId: string): Promise<TeamInvite[]> {
    const res = await axiosInstance.get<ApiResponse<TeamInvite[]>>(`/teams/${teamId}/invites/`);
    return res.data.data;
  },

  /** Accept a team invite (the invitee calls this). */
  async acceptInvite(teamSlug: string, inviteId: string): Promise<void> {
    await axiosInstance.post(`/teams/${teamSlug}/invites/${inviteId}/accept/`);
  },

  /** Decline a team invite. */
  async declineInvite(teamSlug: string, inviteId: string): Promise<void> {
    await axiosInstance.post(`/teams/${teamSlug}/invites/${inviteId}/decline/`);
  },

  /** Revoke a pending invite (team leads only). */
  async revokeInvite(teamId: string, inviteId: string): Promise<void> {
    await axiosInstance.delete(`/teams/${teamId}/invites/${inviteId}/revoke/`);
  },

  /** Get my invites */
  async getMyInvites(): Promise<TeamInvite[]> {
    const res = await axiosInstance.get<ApiResponse<TeamInvite[]>>(`/teams/invites/mine/`);
    return res.data.data;
  },

  // ─── Reviews ──────────────────────────────────────────────────────────────

  /** List reviews for a team. */
  async getReviews(teamId: string): Promise<Review[]> {
    const res = await axiosInstance.get<ApiResponse<Review[]>>(`/teams/${teamId}/reviews/`);
    return res.data.data;
  },

  /** Fetch a single review. */
  async getReview(teamId: string, reviewId: string): Promise<Review> {
    const res = await axiosInstance.get<ApiResponse<Review>>(
      `/teams/${teamId}/reviews/${reviewId}/`
    );
    return res.data.data;
  },

  /** Create a new review (team members only). */
  async createReview(teamId: string, data: CreateReviewInput): Promise<Review> {
    const res = await axiosInstance.post<ApiResponse<Review>>(`/teams/${teamId}/reviews/`, data);
    return res.data.data;
  },

  /** Approve a review (team leads only). */
  async approveReview(teamId: string, reviewId: string): Promise<Review> {
    const res = await axiosInstance.patch<ApiResponse<Review>>(
      `/teams/${teamId}/reviews/${reviewId}/`,
      { status: "approved" }
    );
    return res.data.data;
  },

  /** Close a review. */
  async closeReview(teamId: string, reviewId: string): Promise<Review> {
    const res = await axiosInstance.patch<ApiResponse<Review>>(
      `/teams/${teamId}/reviews/${reviewId}/`,
      { status: "closed" }
    );
    return res.data.data;
  },

  // ─── Comments ─────────────────────────────────────────────────────────────

  /** Get all comments for a review. */
  async getComments(teamId: string, reviewId: string): Promise<ReviewComment[]> {
    const res = await axiosInstance.get<ApiResponse<ReviewComment[]>>(
      `/teams/${teamId}/reviews/${reviewId}/comments/`
    );
    return res.data.data;
  },

  /** Post a comment on a review. */
  async createComment(
    teamId: string,
    reviewId: string,
    data: CreateCommentInput
  ): Promise<ReviewComment> {
    const res = await axiosInstance.post<ApiResponse<ReviewComment>>(
      `/teams/${teamId}/reviews/${reviewId}/comments/`,
      data
    );
    return res.data.data;
  },

  /** Edit a comment. */
  async editComment(
    teamId: string,
    reviewId: string,
    commentId: string,
    data: { text: string }
  ): Promise<ReviewComment> {
    const res = await axiosInstance.patch<ApiResponse<ReviewComment>>(
      `/teams/${teamId}/reviews/${reviewId}/comments/${commentId}/`,
      data
    );
    return res.data.data;
  },

  /** Delete a comment. */
  async deleteComment(teamId: string, reviewId: string, commentId: string): Promise<void> {
    await axiosInstance.delete(`/teams/${teamId}/reviews/${reviewId}/comments/${commentId}/`);
  },

  /** Edit a review's title/description. */
  async editReview(
    teamId: string,
    reviewId: string,
    data: { title?: string; description?: string }
  ): Promise<Review> {
    const res = await axiosInstance.patch<ApiResponse<Review>>(
      `/teams/${teamId}/reviews/${reviewId}/`,
      data
    );
    return res.data.data;
  },

  /** Reopen a review. */
  async reopenReview(teamId: string, reviewId: string): Promise<Review> {
    const res = await axiosInstance.patch<ApiResponse<Review>>(
      `/teams/${teamId}/reviews/${reviewId}/`,
      { status: "open" }
    );
    return res.data.data;
  },

  // ─── Labels ───────────────────────────────────────────────────────────────

  /** List labels for a team. */
  async getTeamLabels(teamId: string): Promise<TeamLabel[]> {
    const res = await axiosInstance.get<ApiResponse<TeamLabel[]>>(`/teams/${teamId}/labels/`);
    return res.data.data;
  },

  /** Create a label for a team. */
  async createTeamLabel(teamId: string, data: { name: string; color: string }): Promise<TeamLabel> {
    const res = await axiosInstance.post<ApiResponse<TeamLabel>>(`/teams/${teamId}/labels/`, data);
    return res.data.data;
  },

  /** Add a label to a review. */
  async addReviewLabel(teamId: string, reviewId: string, labelId: string): Promise<Review> {
    const res = await axiosInstance.post<ApiResponse<Review>>(
      `/teams/${teamId}/reviews/${reviewId}/labels/`,
      { label_id: labelId }
    );
    return res.data.data;
  },

  /** Remove a label from a review. */
  async removeReviewLabel(teamId: string, reviewId: string, labelId: string): Promise<Review> {
    const res = await axiosInstance.delete<ApiResponse<Review>>(
      `/teams/${teamId}/reviews/${reviewId}/labels/`,
      { data: { label_id: labelId } }
    );
    return res.data.data;
  },

  // ─── Assignees ────────────────────────────────────────────────────────────

  /** Add an assignee to a review. */
  async addReviewAssignee(teamId: string, reviewId: string, userId: string): Promise<Review> {
    const res = await axiosInstance.post<ApiResponse<Review>>(
      `/teams/${teamId}/reviews/${reviewId}/assignees/`,
      { user_id: userId }
    );
    return res.data.data;
  },

  /** Remove an assignee from a review. */
  async removeReviewAssignee(teamId: string, reviewId: string, userId: string): Promise<Review> {
    const res = await axiosInstance.delete<ApiResponse<Review>>(
      `/teams/${teamId}/reviews/${reviewId}/assignees/`,
      { data: { user_id: userId } }
    );
    return res.data.data;
  },

  // ─── Contribution Graph ───────────────────────────────────────────────────

  /** Fetch a user's contributions (approved reviews) for graph rendering. */
  async getContributions(username: string, year?: number): Promise<ContributionDay[]> {
    const res = await axiosInstance.get<ApiResponse<ContributionDay[]>>(
      `/teams/contributions/${username}/`,
      { params: year ? { year } : {} }
    );
    return res.data.data;
  },
};

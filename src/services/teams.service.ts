import axiosInstance from "@/lib/axios";
import type { ApiResponse } from "@/types/api.types";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Team {
    id: string;
    name: string;
    description: string | null;
    memberTagName: string;
    createdAt: string;
    memberCount?: number;
}

export interface TeamMember {
    id: string;
    userId: string;
    teamId: string;
    role: "lead" | "member";
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
    userId: string;
    status: "pending" | "accepted" | "declined";
    expiresAt: string;
    createdAt: string;
    user: {
        id: string;
        username: string;
        fullName: string;
        profilePictureUrl: string | null;
    };
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
    createdAt: string;
    author: {
        id: string;
        username: string;
        fullName: string;
        profilePictureUrl: string | null;
    };
}

export interface ContributionDay {
    date: string;   // "YYYY-MM-DD"
    count: number;
    level: number;  // 0–4
}

export interface CreateTeamInput {
    name: string;
    memberTagName: string;
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

    /** Fetch a single team's details. */
    async getTeam(teamId: string): Promise<Team> {
        const res = await axiosInstance.get<ApiResponse<Team>>(`/teams/${teamId}/`);
        return res.data.data;
    },

    /** Create a new team. The calling user becomes the Lead automatically. */
    async createTeam(data: CreateTeamInput): Promise<Team> {
        const res = await axiosInstance.post<ApiResponse<Team>>("/teams/", data);
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
    async acceptInvite(teamId: string, inviteId: string): Promise<void> {
        await axiosInstance.post(`/teams/${teamId}/invites/${inviteId}/accept/`);
    },

    /** Decline a team invite. */
    async declineInvite(teamId: string, inviteId: string): Promise<void> {
        await axiosInstance.post(`/teams/${teamId}/invites/${inviteId}/decline/`);
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
        const res = await axiosInstance.post<ApiResponse<Review>>(
            `/teams/${teamId}/reviews/${reviewId}/approve/`
        );
        return res.data.data;
    },

    /** Close a review. */
    async closeReview(teamId: string, reviewId: string): Promise<Review> {
        const res = await axiosInstance.post<ApiResponse<Review>>(
            `/teams/${teamId}/reviews/${reviewId}/close/`
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

    // ─── Contribution Graph ───────────────────────────────────────────────────

    /** Fetch the contribution graph data for a given username. */
    async getContributions(username: string): Promise<ContributionDay[]> {
        const res = await axiosInstance.get<ApiResponse<ContributionDay[]>>(
            `/users/${username}/contributions/`
        );
        return res.data.data;
    },
};

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
    type CreateCommentInput,
    type CreateReviewInput,
    type CreateTeamInput,
    TeamsService,
} from "@/services/teams.service";

// ─── Teams ────────────────────────────────────────────────────────────────────

export function useMyTeams() {
    return useQuery({
        queryKey: ["teams"],
        queryFn: () => TeamsService.getMyTeams(),
    });
}

export function useTeam(teamId: string) {
    return useQuery({
        queryKey: ["teams", teamId],
        queryFn: () => TeamsService.getTeam(teamId),
        enabled: Boolean(teamId),
    });
}

export function useCreateTeam() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateTeamInput) => TeamsService.createTeam(data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["teams"] });
        },
        onError: () => {
            toast.error("Failed to create team. Please try again.");
        },
    });
}

// ─── Members ──────────────────────────────────────────────────────────────────

export function useTeamMembers(teamId: string) {
    return useQuery({
        queryKey: ["teams", teamId, "members"],
        queryFn: () => TeamsService.getTeamMembers(teamId),
        enabled: Boolean(teamId),
    });
}

export function useMyMembership(teamId: string) {
    return useQuery({
        queryKey: ["teams", teamId, "membership"],
        queryFn: () => TeamsService.getMyMembership(teamId),
        enabled: Boolean(teamId),
    });
}

// ─── Invites ──────────────────────────────────────────────────────────────────

export function useTeamInvites(teamId: string) {
    return useQuery({
        queryKey: ["teams", teamId, "invites"],
        queryFn: () => TeamsService.getInvites(teamId),
        enabled: Boolean(teamId),
    });
}

export function useSendInvite(teamId: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (username: string) => TeamsService.sendInvite(teamId, username),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["teams", teamId, "invites"] });
            toast.success("Invite sent.");
        },
        onError: () => {
            toast.error("Could not send invite. Check the username and try again.");
        },
    });
}

// ─── Reviews ─────────────────────────────────────────────────────────────────

export function useTeamReviews(teamId: string) {
    return useQuery({
        queryKey: ["teams", teamId, "reviews"],
        queryFn: () => TeamsService.getReviews(teamId),
        enabled: Boolean(teamId),
    });
}

export function useReview(teamId: string, reviewId: string) {
    return useQuery({
        queryKey: ["teams", teamId, "reviews", reviewId],
        queryFn: () => TeamsService.getReview(teamId, reviewId),
        enabled: Boolean(teamId) && Boolean(reviewId),
    });
}

export function useCreateReview(teamId: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateReviewInput) => TeamsService.createReview(teamId, data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["teams", teamId, "reviews"] });
            toast.success("Review opened.");
        },
        onError: () => {
            toast.error("Failed to open review. Please try again.");
        },
    });
}

export function useApproveReview(teamId: string, reviewId: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: () => TeamsService.approveReview(teamId, reviewId),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["teams", teamId, "reviews", reviewId] });
            qc.invalidateQueries({ queryKey: ["teams", teamId, "reviews"] });
            toast.success("Review approved.");
        },
        onError: () => {
            toast.error("Failed to approve review.");
        },
    });
}

export function useCloseReview(teamId: string, reviewId: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: () => TeamsService.closeReview(teamId, reviewId),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["teams", teamId, "reviews", reviewId] });
            qc.invalidateQueries({ queryKey: ["teams", teamId, "reviews"] });
            toast.success("Review closed.");
        },
        onError: () => {
            toast.error("Failed to close review.");
        },
    });
}

// ─── Comments ─────────────────────────────────────────────────────────────────

export function useReviewComments(teamId: string, reviewId: string) {
    return useQuery({
        queryKey: ["teams", teamId, "reviews", reviewId, "comments"],
        queryFn: () => TeamsService.getComments(teamId, reviewId),
        enabled: Boolean(teamId) && Boolean(reviewId),
    });
}

export function useCreateComment(teamId: string, reviewId: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateCommentInput) =>
            TeamsService.createComment(teamId, reviewId, data),
        onSuccess: () => {
            qc.invalidateQueries({
                queryKey: ["teams", teamId, "reviews", reviewId, "comments"],
            });
        },
        onError: () => {
            toast.error("Failed to post comment.");
        },
    });
}

// ─── Contributions ────────────────────────────────────────────────────────────

export function useContributions(username: string) {
    return useQuery({
        queryKey: ["contributions", username],
        queryFn: () => TeamsService.getContributions(username),
        enabled: Boolean(username),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

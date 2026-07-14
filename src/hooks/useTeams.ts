// biome-ignore-all lint/suspicious/noExplicitAny: React Query cache ops (getQueryData/setQueryData) use `any` because the cache entry shapes have no shared generic at this layer
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  type CreateCommentInput,
  type CreateReviewInput,
  type CreateTeamInput,
  TeamsService,
  type UpdateTeamInput,
} from "@/services/teams.service";

// ─── Teams ────────────────────────────────────────────────────────────────────

export function useMyTeams() {
  return useQuery({
    queryKey: ["teams"],
    queryFn: () => TeamsService.getMyTeams(),
    staleTime: 1000 * 30, // 30 seconds
  });
}

export function useAdminTeams() {
  return useQuery({
    queryKey: ["admin", "teams"],
    queryFn: () => TeamsService.getAllTeams(),
    staleTime: 1000 * 30,
  });
}

export function useTeam(teamId: string) {
  return useQuery({
    queryKey: ["teams", teamId],
    queryFn: () => TeamsService.getTeam(teamId),
    enabled: Boolean(teamId),
    staleTime: 1000 * 30, // 30 seconds
  });
}

export function useTeamActivity(teamSlug: string) {
  return useQuery({
    queryKey: ["teams", teamSlug, "activity"],
    queryFn: () => TeamsService.getTeamActivity(teamSlug),
    enabled: Boolean(teamSlug),
    // Light polling so the feed feels live without sockets; pauses when tab hidden.
    refetchInterval: 15_000,
    refetchIntervalInBackground: false,
  });
}

export function useCreateTeam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTeamInput) => TeamsService.createTeam(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["teams"] });
    },
  });
}

export function useUpdateTeam(teamSlug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateTeamInput) => TeamsService.updateTeam(teamSlug, data),
    onSuccess: (updated) => {
      qc.setQueryData(["teams", teamSlug], updated);
      qc.invalidateQueries({ queryKey: ["teams"] });
      qc.invalidateQueries({ queryKey: ["teams", "browse"] });
      toast.success("Team updated.");
    },
  });
}

// ─── Members ──────────────────────────────────────────────────────────────────

export function useTeamMembers(teamId: string) {
  return useQuery({
    queryKey: ["teams", teamId, "members"],
    queryFn: () => TeamsService.getTeamMembers(teamId),
    enabled: Boolean(teamId),
    staleTime: 1000 * 30,
  });
}

export function useMyMembership(teamId: string) {
  return useQuery({
    queryKey: ["teams", teamId, "members", "me"],
    queryFn: () => TeamsService.getMyMembership(teamId),
    enabled: Boolean(teamId),
    staleTime: 1000 * 30,
    retry: false, // Don't retry 403s (non-member)
  });
}

export function useRemoveMember(teamId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => TeamsService.removeMember(teamId, userId),
    onMutate: async (userId) => {
      await qc.cancelQueries({ queryKey: ["teams", teamId, "members"] });
      const previous = qc.getQueryData<any[]>(["teams", teamId, "members"]);
      qc.setQueryData(["teams", teamId, "members"], (old: any[]) =>
        (old ?? []).filter((m) => m.user.id !== userId)
      );
      return { previous };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["teams", teamId, "members"] });
      toast.success("Member removed.");
    },
    onError: (_error, _userId, context) => {
      if (context?.previous) {
        qc.setQueryData(["teams", teamId, "members"], context.previous);
      }
    },
  });
}

export function useUpdateMemberRole(teamId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: "lead" | "member" }) =>
      TeamsService.updateMemberRole(teamId, userId, role),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["teams", teamId, "members"] });
      toast.success("Role updated.");
    },
  });
}

export function useTransferOwnership(teamId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => TeamsService.transferOwnership(teamId, userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["teams", teamId, "members"] });
      qc.invalidateQueries({ queryKey: ["teams", teamId, "members", "me"] });
      toast.success("Ownership transferred.");
    },
  });
}

// ─── Invites ──────────────────────────────────────────────────────────────────

export function useTeamInvites(teamId: string) {
  return useQuery({
    queryKey: ["teams", teamId, "invites"],
    queryFn: () => TeamsService.getInvites(teamId),
    enabled: Boolean(teamId),
    staleTime: 1000 * 30,
    retry: false,
  });
}

export function useMyInvites() {
  return useQuery({
    queryKey: ["teams", "invites", "mine"],
    queryFn: () => TeamsService.getMyInvites(),
    staleTime: 1000 * 15, // 15 seconds — invites change more often
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
  });
}

export function useAcceptInvite(teamId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (inviteId: string) => TeamsService.acceptInvite(teamId, inviteId),
    onSuccess: () => {
      // Invalidate everything team-related so the UI re-fetches membership, members, invites
      qc.invalidateQueries({ queryKey: ["teams"] });
      qc.invalidateQueries({ queryKey: ["teams", "invites", "mine"] });
      qc.invalidateQueries({ queryKey: ["teams", teamId, "members"] });
      qc.invalidateQueries({ queryKey: ["teams", teamId, "members", "me"] });
      toast.success("Invite accepted! You are now a team member.");
    },
  });
}

export function useDeclineInvite(teamId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (inviteId: string) => TeamsService.declineInvite(teamId, inviteId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["teams"] });
      qc.invalidateQueries({ queryKey: ["teams", "invites", "mine"] });
      toast.success("Invite declined.");
    },
  });
}

export function useRevokeInvite(teamId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (inviteId: string) => TeamsService.revokeInvite(teamId, inviteId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["teams", teamId, "invites"] });
      toast.success("Invite revoked.");
    },
  });
}

// ─── Browse teams / join requests ──────────────────────────────────────────────

export function useBrowseTeams() {
  return useQuery({
    queryKey: ["teams", "browse"],
    queryFn: () => TeamsService.browseTeams(),
    staleTime: 1000 * 30,
  });
}

export function useMyJoinRequests() {
  return useQuery({
    queryKey: ["teams", "join-requests", "mine"],
    queryFn: () => TeamsService.getMyJoinRequests(),
    staleTime: 1000 * 15,
  });
}

export function useRequestToJoin(teamSlug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => TeamsService.requestToJoin(teamSlug),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["teams", "browse"] });
      qc.invalidateQueries({ queryKey: ["teams", "join-requests", "mine"] });
      toast.success("Request sent. A team lead will review it.");
    },
  });
}

export function useWithdrawJoinRequest(teamSlug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (requestId: string) => TeamsService.withdrawJoinRequest(teamSlug, requestId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["teams", "browse"] });
      qc.invalidateQueries({ queryKey: ["teams", "join-requests", "mine"] });
      toast.success("Request withdrawn.");
    },
  });
}

export function useTeamJoinRequests(teamId: string) {
  return useQuery({
    queryKey: ["teams", teamId, "join-requests"],
    queryFn: () => TeamsService.getJoinRequests(teamId),
    enabled: Boolean(teamId),
    staleTime: 1000 * 30,
    retry: false,
  });
}

export function useReviewJoinRequest(teamId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ requestId, action }: { requestId: string; action: "approve" | "decline" }) =>
      TeamsService.reviewJoinRequest(teamId, requestId, action),
    onSuccess: (_data, { action }) => {
      qc.invalidateQueries({ queryKey: ["teams", teamId, "join-requests"] });
      qc.invalidateQueries({ queryKey: ["teams", teamId, "members"] });
      toast.success(action === "approve" ? "Request approved." : "Request declined.");
    },
  });
}

// ─── Reviews ─────────────────────────────────────────────────────────────────

export function useTeamReviews(teamId: string) {
  return useQuery({
    queryKey: ["teams", teamId, "reviews"],
    queryFn: () => TeamsService.getReviews(teamId),
    enabled: Boolean(teamId),
    staleTime: 1000 * 20, // 20 seconds
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
  });
}

export function useApproveReview(teamId: string, reviewId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => TeamsService.approveReview(teamId, reviewId),
    onSuccess: (data) => {
      qc.setQueryData(["teams", teamId, "reviews", reviewId], data);
      qc.invalidateQueries({ queryKey: ["teams", teamId, "reviews"] });
      toast.success("Review approved.");
    },
  });
}

export function useCloseReview(teamId: string, reviewId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => TeamsService.closeReview(teamId, reviewId),
    onSuccess: (data) => {
      qc.setQueryData(["teams", teamId, "reviews", reviewId], data);
      qc.invalidateQueries({ queryKey: ["teams", teamId, "reviews"] });
      toast.success("Review closed.");
    },
  });
}

// ─── Comments ─────────────────────────────────────────────────────────────────

export function useReviewComments(teamId: string, reviewId: string) {
  return useQuery({
    queryKey: ["teams", teamId, "reviews", reviewId, "comments"],
    queryFn: () => TeamsService.getComments(teamId, reviewId),
    enabled: Boolean(teamId) && Boolean(reviewId),
    staleTime: 1000 * 15, // 15 seconds
  });
}

export function useCreateComment(teamId: string, reviewId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCommentInput) => TeamsService.createComment(teamId, reviewId, data),
    onMutate: async (data) => {
      // Cancel any outgoing re-fetches so they don't overwrite our optimistic update
      await qc.cancelQueries({ queryKey: ["teams", teamId, "reviews", reviewId, "comments"] });
      const previousComments = qc.getQueryData<any[]>([
        "teams",
        teamId,
        "reviews",
        reviewId,
        "comments",
      ]);
      // Optimistically add a placeholder comment
      const optimistic = {
        id: `optimistic-${Date.now()}`,
        text: data.text,
        isEdited: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        // author will be filled in by the real response; use null as placeholder
        author: null,
        _optimistic: true,
      };
      qc.setQueryData(["teams", teamId, "reviews", reviewId, "comments"], (old: any[]) => [
        ...(old ?? []),
        optimistic,
      ]);
      return { previousComments };
    },
    onError: (_error, _data, context) => {
      // Roll back
      if (context?.previousComments) {
        qc.setQueryData(
          ["teams", teamId, "reviews", reviewId, "comments"],
          context.previousComments
        );
      }
    },
    onSuccess: () => {
      // Replace the optimistic entry with the real server response
      qc.invalidateQueries({
        queryKey: ["teams", teamId, "reviews", reviewId, "comments"],
      });
    },
  });
}

export function useEditComment(teamId: string, reviewId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ commentId, text }: { commentId: string; text: string }) =>
      TeamsService.editComment(teamId, reviewId, commentId, { text }),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["teams", teamId, "reviews", reviewId, "comments"],
      });
      toast.success("Comment updated.");
    },
  });
}

export function useDeleteComment(teamId: string, reviewId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) => TeamsService.deleteComment(teamId, reviewId, commentId),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["teams", teamId, "reviews", reviewId, "comments"],
      });
      toast.success("Comment deleted.");
    },
  });
}

export function useEditReview(teamId: string, reviewId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { title?: string; description?: string }) =>
      TeamsService.editReview(teamId, reviewId, data),
    onSuccess: (data) => {
      qc.setQueryData(["teams", teamId, "reviews", reviewId], data);
      qc.invalidateQueries({ queryKey: ["teams", teamId, "reviews"] });
      toast.success("Review updated.");
    },
  });
}

export function useReopenReview(teamId: string, reviewId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => TeamsService.reopenReview(teamId, reviewId),
    onSuccess: (data) => {
      qc.setQueryData(["teams", teamId, "reviews", reviewId], data);
      qc.invalidateQueries({ queryKey: ["teams", teamId, "reviews"] });
      toast.success("Review reopened.");
    },
  });
}

// ─── Labels ───────────────────────────────────────────────────────────────────

export function useTeamLabels(teamId: string) {
  return useQuery({
    queryKey: ["teams", teamId, "labels"],
    queryFn: () => TeamsService.getTeamLabels(teamId),
    enabled: Boolean(teamId),
  });
}

export function useCreateTeamLabel(teamId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; color: string }) =>
      TeamsService.createTeamLabel(teamId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["teams", teamId, "labels"] });
      toast.success("Label created.");
    },
  });
}

export function useAddReviewLabel(teamId: string, reviewId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (labelId: string) => TeamsService.addReviewLabel(teamId, reviewId, labelId),
    onMutate: async (labelId) => {
      await qc.cancelQueries({ queryKey: ["teams", teamId, "reviews", reviewId] });
      const previousReview = qc.getQueryData<any>(["teams", teamId, "reviews", reviewId]);
      const teamLabels = qc.getQueryData<any[]>(["teams", teamId, "labels"]);
      const label = teamLabels?.find((l: any) => l.id === labelId);

      if (previousReview && label && !previousReview.labels.find((l: any) => l.id === labelId)) {
        qc.setQueryData(["teams", teamId, "reviews", reviewId], {
          ...previousReview,
          labels: [...previousReview.labels, label],
        });
      }
      return { previousReview };
    },
    onError: (_error, _labelId, context) => {
      if (context?.previousReview) {
        qc.setQueryData(["teams", teamId, "reviews", reviewId], context.previousReview);
      }
    },
    onSuccess: (data) => {
      qc.setQueryData(["teams", teamId, "reviews", reviewId], data);
      qc.invalidateQueries({ queryKey: ["teams", teamId, "reviews"] });
    },
  });
}

export function useRemoveReviewLabel(teamId: string, reviewId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (labelId: string) => TeamsService.removeReviewLabel(teamId, reviewId, labelId),
    onMutate: async (labelId) => {
      await qc.cancelQueries({ queryKey: ["teams", teamId, "reviews", reviewId] });
      const previousReview = qc.getQueryData<any>(["teams", teamId, "reviews", reviewId]);

      if (previousReview) {
        qc.setQueryData(["teams", teamId, "reviews", reviewId], {
          ...previousReview,
          labels: previousReview.labels.filter((l: any) => l.id !== labelId),
        });
      }
      return { previousReview };
    },
    onError: (_error, _labelId, context) => {
      if (context?.previousReview) {
        qc.setQueryData(["teams", teamId, "reviews", reviewId], context.previousReview);
      }
    },
    onSuccess: (data) => {
      qc.setQueryData(["teams", teamId, "reviews", reviewId], data);
      qc.invalidateQueries({ queryKey: ["teams", teamId, "reviews"] });
    },
  });
}

// ─── Assignees ────────────────────────────────────────────────────────────────

export function useAddReviewAssignee(teamId: string, reviewId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => TeamsService.addReviewAssignee(teamId, reviewId, userId),
    onMutate: async (userId) => {
      await qc.cancelQueries({ queryKey: ["teams", teamId, "reviews", reviewId] });
      const previousReview = qc.getQueryData<any>(["teams", teamId, "reviews", reviewId]);
      const teamMembers = qc.getQueryData<any[]>(["teams", teamId, "members"]);
      const member = teamMembers?.find((m: any) => m.user.id === userId);

      if (previousReview && member && !previousReview.assignees.find((a: any) => a.id === userId)) {
        qc.setQueryData(["teams", teamId, "reviews", reviewId], {
          ...previousReview,
          assignees: [...previousReview.assignees, member.user],
        });
      }
      return { previousReview };
    },
    onError: (_error, _userId, context) => {
      if (context?.previousReview) {
        qc.setQueryData(["teams", teamId, "reviews", reviewId], context.previousReview);
      }
    },
    onSuccess: (data) => {
      qc.setQueryData(["teams", teamId, "reviews", reviewId], data);
      qc.invalidateQueries({ queryKey: ["teams", teamId, "reviews"] });
    },
  });
}

export function useRemoveReviewAssignee(teamId: string, reviewId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => TeamsService.removeReviewAssignee(teamId, reviewId, userId),
    onMutate: async (userId) => {
      await qc.cancelQueries({ queryKey: ["teams", teamId, "reviews", reviewId] });
      const previousReview = qc.getQueryData<any>(["teams", teamId, "reviews", reviewId]);

      if (previousReview) {
        qc.setQueryData(["teams", teamId, "reviews", reviewId], {
          ...previousReview,
          assignees: previousReview.assignees.filter((a: any) => a.id !== userId),
        });
      }
      return { previousReview };
    },
    onError: (_error, _userId, context) => {
      if (context?.previousReview) {
        qc.setQueryData(["teams", teamId, "reviews", reviewId], context.previousReview);
      }
    },
    onSuccess: (data) => {
      qc.setQueryData(["teams", teamId, "reviews", reviewId], data);
      qc.invalidateQueries({ queryKey: ["teams", teamId, "reviews"] });
    },
  });
}

// ─── Contributions ────────────────────────────────────────────────────────────

export function useContributions(username: string, year?: number) {
  return useQuery({
    queryKey: ["contributions", username, year],
    queryFn: () => TeamsService.getContributions(username, year),
    enabled: Boolean(username),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

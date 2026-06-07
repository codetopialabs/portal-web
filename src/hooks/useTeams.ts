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
    queryKey: ["teams", teamId, "members", "me"],
    queryFn: () => TeamsService.getMyMembership(teamId),
    enabled: Boolean(teamId),
  });
}

export function useRemoveMember(teamId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => TeamsService.removeMember(teamId, userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["teams", teamId, "members"] });
      toast.success("Member removed.");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to remove member.");
    },
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

export function useMyInvites() {
  return useQuery({
    queryKey: ["teams", "invites", "mine"],
    queryFn: () => TeamsService.getMyInvites(),
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

export function useAcceptInvite(teamId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (inviteId: string) => TeamsService.acceptInvite(teamId, inviteId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["teams"] });
      toast.success("Invite accepted! You are now a team member.");
    },
    onError: () => {
      toast.error("Failed to accept invite.");
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
    onError: () => {
      toast.error("Failed to decline invite.");
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
    onError: () => {
      toast.error("Failed to revoke invite.");
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
    onSuccess: (data) => {
      qc.setQueryData(["teams", teamId, "reviews", reviewId], data);
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
    onSuccess: (data) => {
      qc.setQueryData(["teams", teamId, "reviews", reviewId], data);
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
    mutationFn: (data: CreateCommentInput) => TeamsService.createComment(teamId, reviewId, data),
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
    onError: () => {
      toast.error("Failed to edit comment.");
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
    onError: () => {
      toast.error("Failed to delete comment.");
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
    onError: () => {
      toast.error("Failed to update review.");
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
    onError: () => {
      toast.error("Failed to reopen review.");
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
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to create label.");
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
    onError: (error: any, _labelId, context) => {
      if (context?.previousReview) {
        qc.setQueryData(["teams", teamId, "reviews", reviewId], context.previousReview);
      }
      toast.error(error.response?.data?.detail || "Failed to add label.");
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
    onError: (error: any, _labelId, context) => {
      if (context?.previousReview) {
        qc.setQueryData(["teams", teamId, "reviews", reviewId], context.previousReview);
      }
      toast.error(error.response?.data?.detail || "Failed to remove label.");
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
    onError: (error: any, _userId, context) => {
      if (context?.previousReview) {
        qc.setQueryData(["teams", teamId, "reviews", reviewId], context.previousReview);
      }
      toast.error(error.response?.data?.detail || "Failed to add assignee.");
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
    onError: (error: any, _userId, context) => {
      if (context?.previousReview) {
        qc.setQueryData(["teams", teamId, "reviews", reviewId], context.previousReview);
      }
      toast.error(error.response?.data?.detail || "Failed to remove assignee.");
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

"use client";

import { Check, CheckCircle2, Circle, FileText, X, XCircle } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Skeleton } from "@/components/ui/skeleton";
import { useAcceptInvite, useDeclineInvite } from "@/hooks/useTeams";
import type { Review, TeamInvite } from "@/services/teams.service";

interface TeamOverviewTabProps {
  teamSlug: string;
  teamName: string;
  reviews: Review[] | undefined;
  reviewsLoading: boolean;
  myInvite: TeamInvite | undefined;
}

export function TeamOverviewTab({
  teamSlug,
  teamName,
  reviews,
  reviewsLoading,
  myInvite,
}: TeamOverviewTabProps) {
  const { mutate: acceptInvite, isPending: acceptPending } = useAcceptInvite(teamSlug);
  const { mutate: declineInvite, isPending: declinePending } = useDeclineInvite(teamSlug);

  const recentReviews = reviews?.slice(0, 5) ?? [];

  return (
    <div className="space-y-8">
      {myInvite && (
        <div className="border border-emerald-200 bg-emerald-50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-sans font-bold text-emerald-900">You've been invited!</h3>
            <p className="font-mono text-xs text-emerald-700 mt-1">
              {myInvite.invitedBy?.fullName} invited you to join {teamName}.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ConfirmModal
              title="Decline Invite"
              description={`Are you sure you want to decline the invitation to join ${teamName}?`}
              confirmText="Decline"
              onConfirm={() => declineInvite(myInvite.id)}
              isLoading={declinePending}
            >
              <Button
                variant="outline"
                size="sm"
                disabled={declinePending || acceptPending}
                className="font-mono text-[10px] uppercase tracking-widest border-emerald-200 text-emerald-700 hover:bg-emerald-100"
              >
                <X className="mr-1.5 h-3 w-3" />
                Decline
              </Button>
            </ConfirmModal>
            <Button
              size="sm"
              onClick={() => acceptInvite(myInvite.id)}
              disabled={acceptPending || declinePending}
              className="font-mono text-[10px] uppercase tracking-widest bg-emerald-600 text-white hover:bg-emerald-700"
            >
              <Check className="mr-1.5 h-3 w-3" />
              Accept
            </Button>
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-sans font-black uppercase tracking-tight text-zinc-950">
            Recent Activity
          </h2>
        </div>

        <div className="border border-zinc-200 bg-white divide-y divide-zinc-100 overflow-hidden rounded-none">
          {reviewsLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full rounded-none" />
              ))}
            </div>
          ) : recentReviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-6">
              <div className="mb-3 flex h-12 w-12 items-center justify-center border border-zinc-100 bg-zinc-50 rounded-none">
                <FileText className="h-5 w-5 text-zinc-300" />
              </div>
              <p className="font-mono text-xs text-zinc-400">No activity yet.</p>
            </div>
          ) : (
            recentReviews.map((review) => (
              <Link
                key={review.id}
                href={`/teams/${teamSlug}/reviews/${review.id}`}
                className="flex items-center gap-4 px-5 py-4 hover:bg-zinc-50 transition-colors"
              >
                <div className="shrink-0">
                  {review.status === "open" ? (
                    <Circle className="h-4 w-4 text-emerald-500" />
                  ) : review.status === "approved" ? (
                    <CheckCircle2 className="h-4 w-4 text-violet-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-zinc-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-sm font-semibold text-zinc-900 truncate">
                    {review.title}
                  </p>
                  <p className="font-mono text-[10px] text-zinc-400 mt-0.5">
                    by {review.author.fullName}
                    {review.category ? ` · ${review.category}` : ""}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={`shrink-0 font-mono text-[10px] uppercase tracking-widest rounded-none ${
                    review.status === "open"
                      ? "border-emerald-200 text-emerald-700"
                      : review.status === "approved"
                        ? "border-violet-200 text-violet-700"
                        : "border-zinc-200 text-zinc-400"
                  }`}
                >
                  {review.status}
                </Badge>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

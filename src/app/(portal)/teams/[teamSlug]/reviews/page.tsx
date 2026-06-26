"use client";

import { ArrowLeft, CheckCircle2, Circle, FileText, Plus, XCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { DashboardShell } from "@/components/dashboard/Shell";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useTeam, useTeamReviews } from "@/hooks/useTeams";
import { getAvatarUrl } from "@/lib/utils";

export default function ReviewsListPage() {
  return (
    <RouteGuard>
      <ReviewsListContent />
    </RouteGuard>
  );
}

function ReviewsListContent() {
  const { teamSlug } = useParams<{ teamSlug: string }>();
  const { data: team, isLoading: teamLoading } = useTeam(teamSlug);
  const { data: reviews, isLoading: reviewsLoading } = useTeamReviews(teamSlug);

  const [filter, setFilter] = useState<"all" | "open" | "approved" | "closed">("all");

  const filteredReviews = reviews?.filter((r) => filter === "all" || r.status === filter);

  if (teamLoading) {
    return (
      <DashboardShell>
        <div className="w-full max-w-none space-y-6 pb-20">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-10 w-full" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="w-full max-w-none space-y-6 pb-20">
        {/* Back */}
        <Link
          href={`/teams/${teamSlug}`}
          className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-text-muted transition-colors hover:text-text-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Dashboard
        </Link>

        {/* Header */}
        <div className="flex flex-col gap-4 border-b border-grey-200 pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.24em] text-text-muted">
              {team?.name}
            </p>
            <h1 className="mt-2 font-sans text-3xl font-black uppercase tracking-tight text-text-primary">
              Contribution Reviews
            </h1>
            <p className="mt-2 max-w-2xl font-mono text-sm leading-6 text-text-tertiary">
              Submit your work for review or browse your team's contributions.
            </p>
          </div>
          <Link
            href={`/teams/${teamSlug}/reviews/new`}
            className="inline-flex h-10 items-center justify-center bg-grey-900 px-5 font-mono text-[11px] font-black uppercase tracking-[0.16em] text-white hover:bg-grey-800 transition-colors"
          >
            <Plus className="mr-2 h-4 w-4" />
            Open Review
          </Link>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 border-b border-grey-200 pb-4">
          {(["all", "open", "approved", "closed"] as const).map((f) => (
            <button
              type="button"
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 font-mono text-[11px] uppercase tracking-widest transition-colors rounded-none ${
                filter === f
                  ? "bg-grey-900 text-white"
                  : "bg-grey-100 text-text-tertiary hover:bg-grey-200 hover:text-text-primary"
              }`}
            >
              {f}
              {f !== "all" && reviews && (
                <span className="ml-2 opacity-50">
                  ({reviews.filter((r) => r.status === f).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="border border-grey-200 bg-white divide-y divide-grey-100 overflow-hidden">
          {reviewsLoading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : !filteredReviews || filteredReviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center px-6">
              <div className="mb-4 flex h-14 w-14 items-center justify-center border border-grey-200 bg-grey-50">
                <FileText className="h-6 w-6 text-text-muted" />
              </div>
              <h3 className="font-sans font-black uppercase tracking-tight text-text-primary">
                {filter === "all" ? "No reviews yet" : `No ${filter} reviews`}
              </h3>
              <p className="mt-1 font-mono text-xs text-text-muted">
                {filter === "all"
                  ? "Be the first to open a review in this team."
                  : `No ${filter} reviews exist in this team yet.`}
              </p>
              {filter === "all" && (
                <Link
                  href={`/teams/${teamSlug}/reviews/new`}
                  className="mt-6 inline-flex h-9 items-center justify-center border border-grey-200 bg-white px-4 font-mono text-[10px] uppercase tracking-widest text-text-primary hover:bg-grey-100 hover:text-text-primary transition-colors"
                >
                  <Plus className="mr-2 h-3.5 w-3.5" />
                  Open First Review
                </Link>
              )}
            </div>
          ) : (
            filteredReviews.map((review) => (
              <Link
                key={review.id}
                href={`/teams/${teamSlug}/reviews/${review.id}`}
                className="group flex items-center gap-4 px-6 py-5 hover:bg-grey-50 transition-colors"
              >
                <div className="shrink-0">
                  {review.status === "open" ? (
                    <Circle className="h-5 w-5 text-success-500" />
                  ) : review.status === "approved" ? (
                    <CheckCircle2 className="h-5 w-5 text-info-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-text-muted" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-sans font-black uppercase tracking-tight text-text-primary group-hover:text-text-secondary truncate">
                      {review.title}
                    </h3>
                    {review.category && (
                      <Badge
                        variant="secondary"
                        className="font-mono text-[9px] uppercase tracking-widest bg-grey-100 text-text-tertiary"
                      >
                        {review.category}
                      </Badge>
                    )}
                  </div>
                  <p className="font-mono text-[11px] text-text-muted mt-1">
                    #{review.id.slice(0, 8)} opened by {review.author.fullName}
                  </p>
                </div>
                <div className="flex items-center gap-6">
                  {review.assignees && review.assignees.length > 0 && (
                    <div className="hidden sm:flex items-center">
                      {review.assignees.slice(0, 3).map((assignee: any, i: number) => (
                        <Image
                          key={assignee.id}
                          src={getAvatarUrl(assignee.profilePictureUrl, assignee.fullName)}
                          alt={assignee.fullName}
                          title={assignee.fullName}
                          width={20}
                          height={20}
                          className="h-5 w-5 border border-white object-cover"
                          style={{ marginLeft: i > 0 ? "-6px" : 0, zIndex: 3 - i }}
                        />
                      ))}
                      {review.assignees.length > 3 && (
                        <span
                          className="flex h-5 min-w-5 items-center justify-center bg-grey-100 border border-white font-mono text-[9px] font-bold text-text-secondary px-1"
                          style={{ marginLeft: "-6px" }}
                        >
                          +{review.assignees.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                  <div className="hidden sm:flex flex-col items-end">
                    <span className="font-mono text-[10px] font-bold text-text-primary">
                      {review.commentsCount}
                    </span>
                    <span className="font-mono text-[9px] uppercase tracking-widest text-text-muted">
                      Comments
                    </span>
                  </div>
                  <Badge
                    variant="outline"
                    className={`shrink-0 font-mono text-[10px] uppercase tracking-widest ${
                      review.status === "open"
                        ? "border-success-200 text-success-700"
                        : review.status === "approved"
                          ? "border-info-200 text-info-700"
                          : "border-grey-200 text-text-muted"
                    }`}
                  >
                    {review.status}
                  </Badge>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </DashboardShell>
  );
}

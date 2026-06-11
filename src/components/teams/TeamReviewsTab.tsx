"use client";

import { CheckCircle2, Circle, FileText, Plus, XCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getAvatarUrl } from "@/lib/utils";
import type { Review } from "@/services/teams.service";

interface TeamReviewsTabProps {
  teamSlug: string;
  reviews: Review[] | undefined;
  reviewsLoading: boolean;
}

export function TeamReviewsTab({ teamSlug, reviews, reviewsLoading }: TeamReviewsTabProps) {
  const [filter, setFilter] = useState<"all" | "open" | "approved" | "closed">("all");

  const filteredReviews = reviews?.filter((r) => filter === "all" || r.status === filter);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 pb-4">
        <div className="flex items-center gap-2">
          {(["all", "open", "approved", "closed"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 font-mono text-[11px] uppercase tracking-widest transition-colors rounded-none ${
                filter === f
                  ? "bg-zinc-900 text-white"
                  : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900"
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
        <Link
          href={`/teams/${teamSlug}/reviews/new`}
          className="inline-flex h-9 items-center justify-center bg-zinc-900 px-5 font-mono text-[11px] font-black uppercase tracking-[0.16em] text-white hover:bg-zinc-800 transition-colors"
        >
          <Plus className="mr-2 h-4 w-4" />
          Open Review
        </Link>
      </div>

      <div className="border border-zinc-200 bg-white divide-y divide-zinc-100 overflow-hidden">
        {reviewsLoading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : !filteredReviews || filteredReviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center px-6">
            <div className="mb-4 flex h-14 w-14 items-center justify-center border border-zinc-200 bg-zinc-50">
              <FileText className="h-6 w-6 text-zinc-300" />
            </div>
            <h3 className="font-sans font-black uppercase tracking-tight text-zinc-900">
              No reviews found
            </h3>
            <p className="mt-1 font-mono text-xs text-zinc-400">
              {filter === "all"
                ? "Be the first to open a review in this team."
                : `There are no ${filter} reviews in this team.`}
            </p>
          </div>
        ) : (
          filteredReviews.map((review) => (
            <Link
              key={review.id}
              href={`/teams/${teamSlug}/reviews/${review.id}`}
              className="group flex items-center gap-4 px-6 py-5 hover:bg-zinc-50 transition-colors"
            >
              <div className="shrink-0">
                {review.status === "open" ? (
                  <Circle className="h-5 w-5 text-emerald-500" />
                ) : review.status === "approved" ? (
                  <CheckCircle2 className="h-5 w-5 text-violet-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-zinc-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-sans font-black uppercase tracking-tight text-zinc-950 group-hover:text-zinc-700 truncate">
                    {review.title}
                  </h3>
                  {review.category && (
                    <Badge
                      variant="secondary"
                      className="font-mono text-[9px] uppercase tracking-widest bg-zinc-100 text-zinc-500"
                    >
                      {review.category}
                    </Badge>
                  )}
                  {review.labels?.map((label) => (
                    <span
                      key={label.id}
                      className="font-mono text-[9px] uppercase tracking-widest px-1.5 py-0.5 border text-zinc-700"
                      style={{
                        borderColor: label.color,
                        backgroundColor: `${label.color}15`,
                      }}
                    >
                      {label.name}
                    </span>
                  ))}
                </div>
                <p className="font-mono text-[11px] text-zinc-400 mt-1">
                  #{review.id.slice(0, 8)} opened by {review.author.fullName}
                </p>
              </div>
              <div className="flex items-center gap-6">
                {review.assignees && review.assignees.length > 0 && (
                  <div className="hidden sm:flex -space-x-2">
                    {review.assignees.slice(0, 3).map((assignee) => (
                      <Image
                        key={assignee.id}
                        src={getAvatarUrl(assignee.profilePictureUrl, assignee.fullName)}
                        alt={assignee.fullName}
                        width={24}
                        height={24}
                        className="h-6 w-6 rounded-none border-2 border-white object-cover"
                        title={`Reviewer: ${assignee.fullName}`}
                      />
                    ))}
                    {review.assignees.length > 3 && (
                      <span className="flex h-6 w-6 items-center justify-center border-2 border-white bg-zinc-100 font-mono text-[9px] font-bold text-zinc-600">
                        +{review.assignees.length - 3}
                      </span>
                    )}
                  </div>
                )}
                <div className="hidden sm:flex flex-col items-end">
                  <span className="font-mono text-[10px] font-bold text-zinc-900">
                    {review.commentsCount}
                  </span>
                  <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-400">
                    Comments
                  </span>
                </div>
                <Badge
                  variant="outline"
                  className={`shrink-0 font-mono text-[10px] uppercase tracking-widest ${
                    review.status === "open"
                      ? "border-emerald-200 text-emerald-700"
                      : review.status === "approved"
                        ? "border-violet-200 text-violet-700"
                        : "border-zinc-200 text-zinc-400"
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
  );
}

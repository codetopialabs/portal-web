"use client";

import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Loader2,
  MessageSquare,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { DashboardShell } from "@/components/dashboard/Shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useApproveReview,
  useCloseReview,
  useCreateComment,
  useMyMembership,
  useReview,
  useReviewComments,
} from "@/hooks/useTeams";
import { getAvatarUrl } from "@/lib/utils";

export default function ReviewDetailPage() {
  const { teamId } = useParams<{ teamId: string }>();
  return (
    <RouteGuard permission={`teams.view:${teamId}`}>
      <ReviewDetailContent />
    </RouteGuard>
  );
}

function ReviewDetailContent() {
  const { teamId, reviewId } = useParams<{ teamId: string; reviewId: string }>();

  const { data: review, isLoading: reviewLoading, isError } = useReview(teamId, reviewId);
  const { data: comments, isLoading: commentsLoading } = useReviewComments(teamId, reviewId);
  const { data: membership } = useMyMembership(teamId);

  const [commentText, setCommentText] = useState("");
  const { mutate: createComment, isPending: commentPending } = useCreateComment(teamId, reviewId);
  const { mutate: approveReview, isPending: approvePending } = useApproveReview(teamId, reviewId);
  const { mutate: closeReview, isPending: closePending } = useCloseReview(teamId, reviewId);

  const isLead = membership?.role === "lead";
  const isOpen = review?.status === "open";

  function handleComment(e: React.FormEvent) {
    e.preventDefault();
    if (!commentText.trim()) return;
    createComment(
      { text: commentText.trim() },
      {
        onSuccess: () => setCommentText(""),
      }
    );
  }

  if (reviewLoading) {
    return (
      <DashboardShell>
        <div className="w-full max-w-none space-y-6 pb-20">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-20 w-full" />
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3 space-y-6">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </DashboardShell>
    );
  }

  if (isError || !review) {
    return (
      <DashboardShell>
        <div className="flex flex-col items-center justify-center py-24 border border-zinc-200 bg-white text-center">
          <p className="font-mono text-sm text-zinc-500">Review not found.</p>
          <Link
            href={`/teams/${teamId}/reviews`}
            className="mt-4 font-mono text-xs uppercase tracking-widest text-zinc-400 hover:text-zinc-900 transition-colors"
          >
            ← Back to Reviews
          </Link>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="w-full max-w-none space-y-6 pb-20">
        {/* Back */}
        <Link
          href={`/teams/${teamId}/reviews`}
          className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-zinc-400 transition-colors hover:text-zinc-900"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          All Reviews
        </Link>

        {/* Header */}
        <div className="border-b border-zinc-200 pb-8">
          <div className="flex flex-wrap items-center gap-3">
            <Badge
              variant="outline"
              className={`font-mono text-[10px] uppercase tracking-widest ${
                review.status === "open"
                  ? "border-emerald-200 text-emerald-700"
                  : review.status === "approved"
                    ? "border-violet-200 text-violet-700"
                    : "border-zinc-200 text-zinc-400"
              }`}
            >
              {review.status}
            </Badge>
            {review.category && (
              <Badge
                variant="secondary"
                className="font-mono text-[10px] uppercase tracking-widest bg-zinc-100 text-zinc-500"
              >
                {review.category}
              </Badge>
            )}
          </div>
          <h1 className="mt-3 font-sans text-3xl font-black uppercase tracking-tight text-zinc-950">
            {review.title}{" "}
            <span className="font-mono text-zinc-300 font-normal">#{review.id.slice(0, 8)}</span>
          </h1>
          <div className="mt-4 flex items-center gap-3">
            {/* biome-ignore lint/performance/noImgElement: author avatar */}
            <img
              src={getAvatarUrl(review.author.profilePictureUrl, review.author.fullName)}
              alt={review.author.fullName}
              className="h-6 w-6 border border-zinc-200 object-cover"
            />
            <p className="font-mono text-xs text-zinc-500">
              <span className="font-bold text-zinc-900">{review.author.fullName}</span> opened this
              review
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Discussion */}
          <div className="lg:col-span-3 space-y-8">
            {/* Description Card */}
            <div className="border border-zinc-200 bg-white">
              <div className="bg-zinc-50 px-5 py-3 border-b border-zinc-200 flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                  Initial Contribution
                </span>
              </div>
              <div className="p-6">
                <p className="font-mono text-sm leading-relaxed text-zinc-800 whitespace-pre-wrap">
                  {review.description}
                </p>
              </div>
            </div>

            {/* Comments Timeline */}
            <div className="space-y-6 relative before:absolute before:left-4 before:top-0 before:bottom-0 before:w-px before:bg-zinc-100">
              {commentsLoading ? (
                <div className="pl-12 space-y-4">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              ) : comments && comments.length > 0 ? (
                comments.map((comment) => (
                  <div key={comment.id} className="relative pl-12">
                    <div className="absolute left-0 top-0">
                      {/* biome-ignore lint/performance/noImgElement: comment author avatar */}
                      <img
                        src={getAvatarUrl(
                          comment.author.profilePictureUrl,
                          comment.author.fullName
                        )}
                        alt={comment.author.fullName}
                        className="h-8 w-8 border border-zinc-200 object-cover bg-white"
                      />
                    </div>
                    <div className="border border-zinc-200 bg-white shadow-sm">
                      <div className="bg-zinc-50 px-4 py-2 border-b border-zinc-200 flex items-center justify-between">
                        <span className="font-mono text-[10px] font-bold text-zinc-900">
                          {comment.author.fullName}
                        </span>
                        <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-400">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="p-4">
                        <p className="font-mono text-xs text-zinc-700 whitespace-pre-wrap">
                          {comment.text}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : null}

              {/* Add Comment */}
              <div className="relative pl-12">
                <div className="absolute left-0 top-0 flex h-8 w-8 items-center justify-center border border-dashed border-zinc-200 bg-zinc-50">
                  <MessageSquare className="h-4 w-4 text-zinc-300" />
                </div>
                <div className="border border-zinc-200 bg-white shadow-sm">
                  <form onSubmit={handleComment}>
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Add a comment..."
                      rows={4}
                      className="block w-full border-0 p-4 font-mono text-xs text-zinc-900 outline-none rounded-none placeholder:text-zinc-400 focus:ring-0 resize-none"
                    />
                    <div className="flex items-center justify-between border-t border-zinc-100 bg-zinc-50/50 p-3">
                      <div className="flex items-center gap-2">
                        {isLead && isOpen && (
                          <>
                            <Button
                              type="button"
                              onClick={() => closeReview()}
                              disabled={closePending || approvePending}
                              variant="ghost"
                              className="h-8 font-mono text-[10px] uppercase tracking-widest text-zinc-400 hover:text-red-600"
                            >
                              <XCircle className="mr-1.5 h-3.5 w-3.5" />
                              Close
                            </Button>
                            <Button
                              type="button"
                              onClick={() => approveReview()}
                              disabled={approvePending || closePending}
                              variant="outline"
                              className="h-8 border-violet-200 bg-violet-50 font-mono text-[10px] uppercase tracking-widest text-violet-700 hover:bg-violet-100 hover:text-violet-800"
                            >
                              <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
                              Approve
                            </Button>
                          </>
                        )}
                      </div>
                      <Button
                        type="submit"
                        disabled={commentPending || !commentText.trim()}
                        className="h-8 bg-zinc-900 px-4 font-mono text-[10px] uppercase tracking-widest"
                      >
                        {commentPending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Comment"}
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div>
              <h3 className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-3">
                Status
              </h3>
              <div className="flex items-center gap-2">
                {review.status === "open" ? (
                  <Circle className="h-4 w-4 text-emerald-500" />
                ) : review.status === "approved" ? (
                  <CheckCircle2 className="h-4 w-4 text-violet-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-zinc-400" />
                )}
                <span className="font-mono text-xs font-bold uppercase tracking-widest text-zinc-900">
                  {review.status}
                </span>
              </div>
            </div>

            <div className="pt-6 border-t border-zinc-100">
              <h3 className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-3">
                Team
              </h3>
              <Link
                href={`/teams/${teamId}`}
                className="font-mono text-xs font-bold text-zinc-900 hover:underline"
              >
                {membership?.teamId === teamId ? "My Team Workspace" : "View Team Dashboard"}
              </Link>
            </div>

            <div className="pt-6 border-t border-zinc-100">
              <h3 className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-3">
                Timeline
              </h3>
              <p className="font-mono text-[10px] text-zinc-500">
                Created: {new Date(review.createdAt).toLocaleString()}
              </p>
              <p className="mt-1 font-mono text-[10px] text-zinc-500">
                Updated: {new Date(review.updatedAt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

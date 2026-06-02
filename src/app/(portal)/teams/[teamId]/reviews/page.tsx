"use client";

import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  FileText,
  Loader2,
  Plus,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { DashboardShell } from "@/components/dashboard/Shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useCreateReview, useTeam, useTeamReviews } from "@/hooks/useTeams";

export default function ReviewsListPage() {
  const { teamId } = useParams<{ teamId: string }>();
  return (
    <RouteGuard permission={`teams.view:${teamId}`}>
      <ReviewsListContent />
    </RouteGuard>
  );
}

function ReviewsListContent() {
  const { teamId } = useParams<{ teamId: string }>();
  const { data: team, isLoading: teamLoading } = useTeam(teamId);
  const { data: reviews, isLoading: reviewsLoading } = useTeamReviews(teamId);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({ title: "", description: "", category: "" });
  const { mutate: createReview, isPending: createPending } = useCreateReview(teamId);

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) return;

    createReview(
      {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category.trim() || undefined,
      },
      {
        onSuccess: () => {
          setIsCreateOpen(false);
          setFormData({ title: "", description: "", category: "" });
        },
      }
    );
  }

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
          href={`/teams/${teamId}`}
          className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-zinc-400 transition-colors hover:text-zinc-900"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Dashboard
        </Link>

        {/* Header */}
        <div className="flex flex-col gap-4 border-b border-zinc-200 pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.24em] text-zinc-400">
              {team?.name}
            </p>
            <h1 className="mt-2 font-sans text-3xl font-black uppercase tracking-tight text-zinc-950">
              Contribution Reviews
            </h1>
            <p className="mt-2 max-w-2xl font-mono text-sm leading-6 text-zinc-500">
              Submit your work for review or browse your team's contributions.
            </p>
          </div>
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="h-10 bg-zinc-900 px-5 font-mono text-[11px] font-black uppercase tracking-[0.16em] text-white hover:bg-zinc-800"
          >
            <Plus className="mr-2 h-4 w-4" />
            Open Review
          </Button>
        </div>

        {/* List */}
        <div className="border border-zinc-200 bg-white divide-y divide-zinc-100 overflow-hidden">
          {reviewsLoading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : !reviews || reviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center px-6">
              <div className="mb-4 flex h-14 w-14 items-center justify-center border border-zinc-200 bg-zinc-50">
                <FileText className="h-6 w-6 text-zinc-300" />
              </div>
              <h3 className="font-sans font-black uppercase tracking-tight text-zinc-900">
                No reviews yet
              </h3>
              <p className="mt-1 font-mono text-xs text-zinc-400">
                Be the first to open a review in this team.
              </p>
              <Button
                onClick={() => setIsCreateOpen(true)}
                variant="outline"
                className="mt-6 h-9 font-mono text-[10px] uppercase tracking-widest"
              >
                <Plus className="mr-2 h-3.5 w-3.5" />
                Open First Review
              </Button>
            </div>
          ) : (
            reviews.map((review) => (
              <Link
                key={review.id}
                href={`/teams/${teamId}/reviews/${review.id}`}
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
                      <Badge variant="secondary" className="font-mono text-[9px] uppercase tracking-widest bg-zinc-100 text-zinc-500">
                        {review.category}
                      </Badge>
                    )}
                  </div>
                  <p className="font-mono text-[11px] text-zinc-400 mt-1">
                    #{review.id.slice(0, 8)} opened by {review.author.fullName}
                  </p>
                </div>
                <div className="flex items-center gap-6">
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

      {/* Create Review Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleCreate}>
            <DialogHeader>
              <DialogTitle className="font-sans font-black uppercase tracking-tight">
                Open a Review
              </DialogTitle>
              <DialogDescription className="font-mono text-xs">
                Describe your contribution. The Team Lead will review and approve it.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-5 py-6">
              <div className="space-y-1.5">
                <Label htmlFor="title" className="font-mono text-[10px] font-black uppercase tracking-widest text-zinc-500">
                  Title
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="What did you work on?"
                  className="font-mono text-sm"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="category" className="font-mono text-[10px] font-black uppercase tracking-widest text-zinc-500">
                  Category (optional)
                </Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g. Frontend, Documentation, Bugfix"
                  className="font-mono text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description" className="font-mono text-[10px] font-black uppercase tracking-widest text-zinc-500">
                  Description
                </Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Provide details about your contribution..."
                  rows={5}
                  className="block w-full border border-zinc-200 bg-white px-3 py-2 font-mono text-sm text-zinc-900 outline-none rounded-none focus:border-zinc-400 focus:ring-0 transition-colors"
                  required
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsCreateOpen(false)}
                className="font-mono text-[10px] uppercase tracking-widest"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createPending || !formData.title.trim() || !formData.description.trim()}
                className="bg-zinc-900 font-mono text-[10px] uppercase tracking-widest hover:bg-zinc-800"
              >
                {createPending ? (
                  <>
                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Review"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}

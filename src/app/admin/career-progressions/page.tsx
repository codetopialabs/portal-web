"use client";

import {
  Ban,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  Loader2,
  Search,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCareerProgressionsForReview,
  useReviewCareerProgression,
} from "@/hooks/useCareerProgressions";
import { getAvatarUrl } from "@/lib/utils";
import type { CareerProgression, CareerProgressionStatus } from "@/types/career-progressions.types";

const STATUS_META: Record<
  CareerProgressionStatus,
  { label: string; icon: typeof Clock3; pill: string; bar: string }
> = {
  pending: {
    label: "Pending",
    icon: Clock3,
    pill: "border-amber-300 bg-amber-50 text-amber-700",
    bar: "bg-amber-400",
  },
  approved: {
    label: "Approved",
    icon: CheckCircle2,
    pill: "border-zinc-900 bg-zinc-900 text-white",
    bar: "bg-zinc-900",
  },
  rejected: {
    label: "Changes Requested",
    icon: XCircle,
    pill: "border-red-200 bg-red-50 text-red-600",
    bar: "bg-red-500",
  },
  revoked: {
    label: "Revoked",
    icon: Ban,
    pill: "border-zinc-300 bg-zinc-100 text-zinc-600",
    bar: "bg-zinc-500",
  },
};

const FILTERS = [
  { value: "pending" as const, label: "Pending" },
  { value: "approved" as const, label: "Approved" },
  { value: "rejected" as const, label: "Changes Requested" },
  { value: "revoked" as const, label: "Revoked" },
  { value: "" as const, label: "All" },
];

function formatDateRange(startDate: string, endDate: string | null): string {
  const fmt = (d: string) =>
    new Intl.DateTimeFormat("en", { month: "short", year: "numeric" }).format(new Date(d));
  return `${fmt(startDate)} – ${endDate ? fmt(endDate) : "Present"}`;
}

function getDuration(startDate: string, endDate: string | null): string {
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();
  const totalMonths =
    (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  if (totalMonths < 1) return "< 1 mo";
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  const parts: string[] = [];
  if (years > 0) parts.push(`${years} yr${years > 1 ? "s" : ""}`);
  if (months > 0) parts.push(`${months} mo${months > 1 ? "s" : ""}`);
  return parts.join(" ");
}

function StatusPill({ status }: { status: CareerProgressionStatus }) {
  const meta = STATUS_META[status];
  const Icon = meta.icon;
  return (
    <span
      className={`inline-flex h-6 items-center gap-1.5 border px-2.5 font-mono text-[10px] font-black uppercase tracking-widest ${meta.pill}`}
    >
      <Icon className="h-3 w-3" />
      {meta.label}
    </span>
  );
}

function ReviewCard({ item }: { item: CareerProgression }) {
  const review = useReviewCareerProgression();
  const [note, setNote] = useState("");
  const meta = STATUS_META[item.status];

  async function submit(action: "approve" | "reject" | "revoke") {
    try {
      await review.mutateAsync({ id: item.id, action, reviewNote: note });
      toast.success(
        action === "approve"
          ? "Progression approved."
          : action === "revoke"
            ? "Entry revoked and removed from their public profile."
            : "Changes requested."
      );
      setNote("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Review failed.");
    }
  }

  return (
    <article className="border border-zinc-200 bg-white overflow-hidden flex">
      <div className={`w-1 shrink-0 ${meta.bar}`} />
      <div className="p-5">
        {/* Top row — avatar + info + status */}
        <div className="flex items-center gap-4">
          {/* biome-ignore lint/performance/noImgElement: avatar URL from API */}
          <img
            src={getAvatarUrl(item.profilePictureUrl, item.fullName)}
            alt={item.fullName}
            className="h-10 w-10 shrink-0 object-cover border border-zinc-100"
          />

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-sans text-base font-bold text-zinc-950 leading-snug">
                  {item.title}
                </h3>
                <p className="font-mono text-[11px] text-zinc-500">Codetopia Community</p>
              </div>
              <StatusPill status={item.status} />
            </div>

            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5">
              <span className="font-mono text-[11px] text-zinc-400">
                {formatDateRange(item.startDate, item.endDate)}
                <span className="mx-1.5 text-zinc-300">·</span>
                {getDuration(item.startDate, item.endDate)}
              </span>
              <Link
                href={`/@${item.username}`}
                className="flex items-center gap-1 font-mono text-[11px] text-zinc-400 hover:text-zinc-900 transition-colors"
              >
                <span className="font-bold text-zinc-600">{item.fullName}</span>
                <span className="text-zinc-300">·</span>
                <span>@{item.username}</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Description */}
        {item.description && (
          <p className="mt-4 whitespace-pre-wrap font-mono text-xs leading-5 text-zinc-500 border-l-2 border-zinc-100 pl-4">
            {item.description}
          </p>
        )}

        {/* Review note (non-pending) */}
        {item.status !== "pending" && item.reviewNote && (
          <div className="mt-4 border border-zinc-100 bg-zinc-50 px-4 py-3">
            <p className="font-mono text-xs font-medium text-zinc-400 mb-1">Review note</p>
            <p className="font-mono text-xs leading-5 text-zinc-600">{item.reviewNote}</p>
          </div>
        )}

        {/* Revoke approval */}
        {item.status === "approved" && (
          <div className="mt-5 border-t border-zinc-100 pt-4 space-y-3">
            <div>
              <p className="font-mono text-xs font-medium text-zinc-400 mb-2">
                Reason for revoking
                <span className="ml-1.5 font-normal text-zinc-400">
                  — required, shown to the member
                </span>
              </p>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Why is this entry being revoked?"
                className="min-h-[60px] w-full resize-none border border-zinc-200 px-3 py-2.5 font-mono text-sm placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none transition-colors"
              />
            </div>
            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                disabled={review.isPending || !note.trim()}
                onClick={() => submit("revoke")}
                className="h-9 rounded-none border-zinc-200 font-mono text-sm font-medium text-zinc-500 hover:border-red-300 hover:bg-red-50 hover:text-red-700 transition-colors disabled:opacity-50"
              >
                {review.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Ban className="h-3.5 w-3.5" />
                )}
                Revoke
              </Button>
            </div>
          </div>
        )}

        {/* Review actions (pending only) */}
        {item.status === "pending" && (
          <div className="mt-5 border-t border-zinc-100 pt-5 space-y-3">
            <div>
              <p className="font-mono text-xs font-medium text-zinc-400 mb-2">
                Review note
                <span className="ml-1.5 font-normal text-zinc-400">
                  — optional, shown to member if changes are requested
                </span>
              </p>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Leave feedback for the member..."
                className="min-h-[80px] w-full resize-none border border-zinc-200 px-3 py-2.5 font-mono text-sm placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none transition-colors"
              />
            </div>
            <div className="flex flex-wrap justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={review.isPending}
                onClick={() => submit("reject")}
                className="h-9 rounded-none border-zinc-200 font-mono text-sm font-medium text-zinc-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700 transition-colors"
              >
                {review.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <XCircle className="h-3.5 w-3.5" />
                )}
                Request Changes
              </Button>
              <Button
                type="button"
                disabled={review.isPending}
                onClick={() => submit("approve")}
                className="h-9 rounded-none bg-zinc-950 font-mono text-sm font-medium text-white hover:bg-zinc-800 transition-colors"
              >
                {review.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                )}
                Approve
              </Button>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

function AdminCareerProgressionsContent() {
  const [status, setStatus] = useState<CareerProgressionStatus | "">("pending");
  const [search, setSearch] = useState("");
  const params = useMemo(() => ({ status, search: search.trim() || undefined }), [status, search]);
  const { data: progressions = [], isLoading } = useCareerProgressionsForReview(params);

  return (
    <div className="mx-auto w-full max-w-5xl pb-10">
      {/* Header */}
      <header className="mb-6">
        <div className="mb-1 flex items-center gap-2">
          <BriefcaseBusiness className="h-3.5 w-3.5 text-zinc-400" />
          <p className="font-mono text-xs font-medium text-zinc-400">Admin · Community</p>
        </div>
        <h1 className="font-sans text-4xl font-bold tracking-tight text-zinc-950">
          Career Progressions
        </h1>
        <p className="mt-1.5 font-mono text-xs text-zinc-400">
          Review milestones before they appear on public member profiles.
        </p>
      </header>

      {/* Tabs + search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-zinc-200 pb-0 mb-6">
        {/* Underline tabs */}
        <div className="flex">
          {FILTERS.map(({ value, label }) => {
            const isActive = status === value;
            return (
              <button
                key={value || "all"}
                type="button"
                onClick={() => setStatus(value)}
                className={`relative px-4 py-2.5 font-mono text-sm font-medium transition-colors ${
                  isActive
                    ? "text-zinc-950 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-zinc-950"
                    : "text-zinc-400 hover:text-zinc-700"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-56 pb-px">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search…"
            className="h-8 rounded-none border-zinc-200 bg-transparent pl-9 font-mono text-xs shadow-none"
          />
        </div>
      </div>

      {/* Count */}
      {!isLoading && progressions.length > 0 && (
        <p className="mb-4 font-mono text-[11px] text-zinc-400">
          {progressions.length} submission{progressions.length !== 1 ? "s" : ""}
        </p>
      )}

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-36 w-full rounded-none" />
          ))}
        </div>
      ) : progressions.length === 0 ? (
        <div className="border border-dashed border-zinc-200 bg-white py-16 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center border border-zinc-200">
            <BriefcaseBusiness className="h-5 w-5 text-zinc-300" />
          </div>
          <p className="font-sans text-sm font-bold text-zinc-900">Nothing to review</p>
          <p className="mt-1.5 font-mono text-xs text-zinc-400">
            No career progressions match this filter.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {progressions.map((item) => (
            <ReviewCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminCareerProgressionsPage() {
  return (
    <RouteGuard permission="career_progressions.review">
      <AdminCareerProgressionsContent />
    </RouteGuard>
  );
}

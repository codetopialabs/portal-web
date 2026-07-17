"use client";

import {
  AlertTriangle,
  Ban,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  HelpCircle,
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
import { useUserStore } from "@/store/user.store";
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
  const currentUser = useUserStore((s) => s.profile);
  const isOwnSubmission = currentUser?.username === item.username;
  const [note, setNote] = useState("");
  const [activeAction, setActiveAction] = useState<"reject" | "revoke" | null>(null);
  const _meta = STATUS_META[item.status];

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
      setActiveAction(null);
    } catch {
      // Axios interceptor already surfaces the error toast.
    }
  }

  function handleActionClick(action: "reject" | "revoke") {
    if (activeAction === action) {
      // Already open — this is the confirm click
      submit(action);
    } else {
      setActiveAction(action);
      setNote("");
    }
  }

  function cancelAction() {
    setActiveAction(null);
    setNote("");
  }

  return (
    <article className="border border-zinc-200 bg-white overflow-hidden">
      {/* ── Main row ── */}
      <div className="flex items-center gap-4 px-5 py-4">
        {/* biome-ignore lint/performance/noImgElement: avatar URL from API */}
        <img
          src={getAvatarUrl(item.profilePictureUrl, item.fullName)}
          alt={item.fullName}
          className="h-9 w-9 shrink-0 object-cover border border-zinc-200"
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
            <h3 className="font-sans text-sm font-bold text-zinc-950 leading-snug">{item.title}</h3>
            <StatusPill status={item.status} />
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className="font-mono text-[11px] text-zinc-400">
              {formatDateRange(item.startDate, item.endDate)}
              <span className="mx-1.5 text-zinc-300">·</span>
              {getDuration(item.startDate, item.endDate)}
            </span>
            <span className="text-zinc-300">·</span>
            <Link
              href={`/@${item.username}`}
              className="font-mono text-[11px] font-medium text-zinc-500 hover:text-zinc-900 hover:underline"
            >
              {item.fullName} · @{item.username}
            </Link>
          </div>
        </div>
      </div>

      {/* ── Description ── */}
      {item.description && (
        <div className="mx-5 mb-3 border border-dashed border-zinc-200 px-3 py-2.5">
          <p className="whitespace-pre-wrap font-mono text-xs leading-5 text-zinc-500">
            {item.description}
          </p>
        </div>
      )}

      {/* ── Prior review note (non-pending) ── */}
      {item.status !== "pending" && item.reviewNote && (
        <div className="mx-5 mb-3 border-l-2 border-zinc-200 pl-3">
          <p className="font-mono text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-0.5">
            Review note
          </p>
          <p className="font-mono text-xs leading-5 text-zinc-500">{item.reviewNote}</p>
        </div>
      )}

      {/* ── Self-submission notice ── */}
      {isOwnSubmission && (item.status === "approved" || item.status === "pending") && (
        <div className="mx-5 mb-3 flex items-center gap-2 border border-amber-200 bg-amber-50 px-3 py-2">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-600" />
          <p className="font-mono text-[11px] font-medium text-amber-700">
            Submitted by you — you can't review your own entry.
          </p>
        </div>
      )}

      {/* ── Manual verification notice ── */}
      {item.needsManualVerification && item.status === "pending" && (
        <div className="mx-5 mb-3 flex items-start gap-2 border border-blue-200 bg-blue-50 px-3 py-2">
          <HelpCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-600" />
          <p className="font-mono text-[11px] font-medium text-blue-700">
            Could not auto-verify this team claim — the member doesn't currently show up with the
            required team membership. This may just mean they've since left or changed roles; team
            data only reflects who's on the team right now, not history. Use your own judgment.
          </p>
        </div>
      )}

      {/* ── Action zone ── */}
      {!isOwnSubmission && (item.status === "approved" || item.status === "pending") && (
        <div className="border-t border-zinc-100 px-5 py-3">
          {/* Progressive disclosure textarea */}
          {activeAction && (
            <div className="mb-3">
              <textarea
                // biome-ignore lint/a11y/noAutofocus: intentional for UX
                autoFocus
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={
                  activeAction === "revoke"
                    ? "Reason for revoking (required, shown to member)…"
                    : "Feedback for the member (optional)…"
                }
                className="min-h-[60px] w-full resize-none border border-zinc-200 bg-white px-3 py-2 font-mono text-xs placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none"
              />
            </div>
          )}

          <div className="flex flex-wrap items-center justify-end gap-2">
            {/* Cancel when something is open */}
            {activeAction && (
              <button
                type="button"
                onClick={cancelAction}
                className="font-mono text-xs text-zinc-400 hover:text-zinc-700"
              >
                Cancel
              </button>
            )}

            {/* Revoke (approved) */}
            {item.status === "approved" && (
              <Button
                type="button"
                variant="outline"
                disabled={review.isPending || (activeAction === "revoke" && !note.trim())}
                onClick={() => handleActionClick("revoke")}
                className="h-7 rounded-none border-zinc-200 font-mono text-xs font-medium text-zinc-500 hover:border-red-300 hover:text-red-600 disabled:opacity-40"
              >
                {review.isPending && activeAction === "revoke" ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Ban className="h-3 w-3" />
                )}
                {activeAction === "revoke" ? "Confirm Revoke" : "Revoke"}
              </Button>
            )}

            {/* Request Changes (pending) */}
            {item.status === "pending" && (
              <Button
                type="button"
                variant="outline"
                disabled={review.isPending}
                onClick={() => handleActionClick("reject")}
                className="h-7 rounded-none border-zinc-200 font-mono text-xs font-medium text-zinc-600 hover:border-amber-300 hover:text-amber-700 disabled:opacity-40"
              >
                {review.isPending && activeAction === "reject" ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <XCircle className="h-3 w-3" />
                )}
                {activeAction === "reject" ? "Confirm Request" : "Request Changes"}
              </Button>
            )}

            {/* Approve (pending) — always visible, no textarea needed */}
            {item.status === "pending" && (
              <Button
                type="button"
                disabled={review.isPending}
                onClick={() => submit("approve")}
                className="h-7 rounded-none bg-zinc-950 font-mono text-xs font-medium text-white hover:bg-zinc-800"
              >
                {review.isPending && !activeAction ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-3 w-3" />
                )}
                Approve
              </Button>
            )}
          </div>
        </div>
      )}
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

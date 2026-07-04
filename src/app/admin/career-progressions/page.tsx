"use client";

import { BriefcaseBusiness, CheckCircle2, Clock3, Loader2, Search, XCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useCareerProgressionsForReview,
  useReviewCareerProgression,
} from "@/hooks/useCareerProgressions";
import { getAvatarUrl } from "@/lib/utils";
import type { CareerProgression, CareerProgressionStatus } from "@/types/career-progressions.types";

const STATUS_META: Record<
  CareerProgressionStatus,
  { label: string; icon: typeof Clock3; className: string }
> = {
  pending: {
    label: "Pending",
    icon: Clock3,
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  approved: {
    label: "Approved",
    icon: CheckCircle2,
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  rejected: {
    label: "Rejected",
    icon: XCircle,
    className: "border-red-200 bg-red-50 text-red-700",
  },
};

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
      className={`inline-flex h-6 items-center gap-1.5 border px-2.5 font-mono text-[10px] font-black uppercase tracking-widest ${meta.className}`}
    >
      <Icon className="h-3 w-3" />
      {meta.label}
    </span>
  );
}

function ReviewCard({ item }: { item: CareerProgression }) {
  const review = useReviewCareerProgression();
  const [note, setNote] = useState("");

  async function submit(action: "approve" | "reject") {
    try {
      await review.mutateAsync({ id: item.id, action, reviewNote: note });
      toast.success(action === "approve" ? "Progression approved." : "Progression rejected.");
      setNote("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Review failed.");
    }
  }

  return (
    <article className="border border-zinc-200 bg-white p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 gap-3">
          {/* biome-ignore lint/performance/noImgElement: avatar URL from API */}
          <img
            src={getAvatarUrl(item.profilePictureUrl, item.fullName)}
            alt={item.fullName}
            className="h-10 w-10 shrink-0 object-cover"
          />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-sans text-base font-black uppercase tracking-tight text-zinc-950">
                {item.title}
              </h3>
              <StatusPill status={item.status} />
            </div>
            {item.organization && (
              <p className="mt-0.5 font-mono text-xs font-bold text-zinc-500">
                {item.organization}
              </p>
            )}
            <p className="mt-1 font-mono text-xs text-zinc-400">
              {formatDateRange(item.startDate, item.endDate)}
              <span className="ml-2 text-zinc-300">·</span>
              <span className="ml-2">{getDuration(item.startDate, item.endDate)}</span>
            </p>
            <p className="mt-1 font-mono text-xs text-zinc-400">
              {item.fullName} · @{item.username}
            </p>
          </div>
        </div>
      </div>

      {item.description && (
        <p className="mt-4 whitespace-pre-wrap font-sans text-sm leading-6 text-zinc-600">
          {item.description}
        </p>
      )}

      {item.status === "pending" ? (
        <div className="mt-5 space-y-3 border-t border-zinc-100 pt-4">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Optional review note — shown to the member if rejected"
            className="min-h-20 w-full resize-none rounded-none border border-zinc-200 px-3 py-2.5 font-mono text-sm placeholder:text-zinc-300 focus:border-zinc-900 focus:outline-none"
          />
          <div className="flex flex-wrap justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={review.isPending}
              onClick={() => submit("reject")}
              className="h-10 rounded-none border-red-200 font-mono text-xs font-black uppercase tracking-widest text-red-700 hover:bg-red-50"
            >
              {review.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}{" "}
              Reject
            </Button>
            <Button
              type="button"
              disabled={review.isPending}
              onClick={() => submit("approve")}
              className="h-10 rounded-none bg-zinc-950 font-mono text-xs font-black uppercase tracking-widest text-white hover:bg-zinc-800"
            >
              {review.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}{" "}
              Approve
            </Button>
          </div>
        </div>
      ) : item.reviewNote ? (
        <p className="mt-4 border-l-2 border-zinc-900 pl-3 font-mono text-xs leading-5 text-zinc-500">
          {item.reviewNote}
        </p>
      ) : null}
    </article>
  );
}

function AdminCareerProgressionsContent() {
  const [status, setStatus] = useState<CareerProgressionStatus | "">("pending");
  const [search, setSearch] = useState("");
  const params = useMemo(() => ({ status, search: search.trim() || undefined }), [status, search]);
  const { data: progressions = [], isLoading } = useCareerProgressionsForReview(params);

  return (
    <div className="w-full pb-4">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <BriefcaseBusiness className="h-4 w-4 text-zinc-400" />
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
              Admin · Community
            </p>
          </div>
          <h1 className="font-sans text-4xl font-black uppercase tracking-tight text-zinc-950">
            Career Progressions
          </h1>
          <p className="mt-3 font-mono text-sm leading-relaxed text-zinc-500">
            Review milestones before they appear on public member profiles.
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search submissions"
            className="h-10 rounded-none border-zinc-200 bg-white pl-9 font-mono text-sm"
          />
        </div>
      </header>

      <div className="mb-5 flex flex-wrap gap-2">
        {(["pending", "approved", "rejected", ""] as const).map((value) => (
          <button
            key={value || "all"}
            type="button"
            onClick={() => setStatus(value)}
            className={`h-9 border px-3 font-mono text-xs font-black uppercase tracking-widest ${status === value
              ? "border-zinc-950 bg-zinc-950 text-white"
              : "border-zinc-200 bg-white text-zinc-500 hover:border-zinc-500"
              }`}
          >
            {value || "All"}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="border border-zinc-200 bg-white p-8 font-mono text-sm text-zinc-400">
          Loading submissions...
        </div>
      ) : progressions.length === 0 ? (
        <div className="border border-dashed border-zinc-300 bg-white p-14 text-center">
          <BriefcaseBusiness className="mx-auto mb-3 h-8 w-8 text-zinc-300" />
          <p className="font-sans font-black uppercase tracking-widest text-zinc-900">
            Nothing to review
          </p>
          <p className="mt-2 font-mono text-xs text-zinc-400">
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

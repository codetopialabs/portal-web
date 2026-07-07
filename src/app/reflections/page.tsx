"use client";

import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  CircleDashed,
  ClipboardCheck,
  Clock,
  MessageSquareText,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { DashboardShell } from "@/components/dashboard/Shell";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentReflection, useMyReflections } from "@/hooks/useReflections";
import { cn } from "@/lib/utils";
import type { ReflectionRecord, ReflectionStatus } from "@/types/reflections.types";

/* ── Status config ───────────────────────────────────────────────────────── */

const STATUS: Record<
  ReflectionStatus,
  { label: string; icon: React.ElementType; text: string; bg: string; border: string; pill: string }
> = {
  not_started: {
    label: "Not started",
    icon: CircleDashed,
    text: "text-text-muted",
    bg: "bg-grey-50",
    border: "border-grey-200",
    pill: "border-grey-300 bg-grey-100 text-text-secondary",
  },
  submitted: {
    label: "Submitted",
    icon: Clock,
    text: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
    pill: "border-zinc-900 bg-zinc-900 text-white",
  },
  under_review: {
    label: "Under review",
    icon: Clock,
    text: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
    pill: "border-amber-500 bg-amber-500 text-white",
  },
  approved: {
    label: "Approved",
    icon: CheckCircle2,
    text: "text-emerald-700",
    bg: "bg-white",
    border: "border-grey-200",
    pill: "border-emerald-600 bg-emerald-600 text-white",
  },
  changes_requested: {
    label: "Changes requested",
    icon: XCircle,
    text: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-200",
    pill: "border-red-600 bg-red-600 text-white",
  },
};

type FilterKey = "all" | "approved" | "pending" | "needs_action";

const FILTER_TABS: { key: FilterKey; label: string; statuses: ReflectionStatus[] }[] = [
  {
    key: "all",
    label: "All",
    statuses: ["submitted", "under_review", "approved", "changes_requested"],
  },
  { key: "approved", label: "Approved", statuses: ["approved"] },
  { key: "pending", label: "In review", statuses: ["submitted", "under_review"] },
  { key: "needs_action", label: "Needs action", statuses: ["changes_requested"] },
];

function StatusPill({ status }: { status: ReflectionStatus }) {
  const cfg = STATUS[status] ?? STATUS.submitted;
  const Icon = cfg.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wide",
        cfg.pill
      )}
    >
      <Icon className="h-3 w-3" />
      {cfg.label}
    </span>
  );
}

function formatPeriod(period: string) {
  const d = new Date(period);
  if (Number.isNaN(d.getTime())) return period;
  return new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(d);
}

function formatDate(value: string | null) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(
    d
  );
}

/* ── Current cycle banner ────────────────────────────────────────────────── */

function CurrentCycleBanner() {
  const { data, isLoading } = useCurrentReflection();

  if (isLoading) return <Skeleton className="h-24 w-full rounded-none" />;
  if (!data?.isOpen) return null;

  const status = (data.status ?? "not_started") as ReflectionStatus;
  const cfg = STATUS[status];
  const needsAction = status === "not_started" || status === "changes_requested";

  return (
    <div className={cn("border-l-4 px-5 py-4", cfg.bg, cfg.border)}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={cn("flex h-9 w-9 shrink-0 items-center justify-center border", cfg.border)}
          >
            <cfg.icon className={cn("h-4 w-4", cfg.text)} />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-sans text-base font-bold text-text-primary">This month</p>
              <StatusPill status={status} />
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-3">
              {data.daysRemaining !== undefined && (
                <span className="flex items-center gap-1 font-mono text-[10px] text-text-muted">
                  <CalendarClock className="h-3 w-3" />
                  {data.daysRemaining === 0 ? "Due today" : `${data.daysRemaining}d left`}
                </span>
              )}
              {status === "changes_requested" &&
                data.reviewerNotes &&
                Object.keys(data.reviewerNotes).length > 0 && (
                  <span className="font-mono text-[10px] text-red-600 truncate max-w-xs">
                    {data.reviewerNotes["_legacy"]
                      ? `"${data.reviewerNotes["_legacy"]}"`
                      : "Feedback added to your answers — click to view"}
                  </span>
                )}
            </div>
          </div>
        </div>
        {needsAction && (
          <Button asChild className="h-9 shrink-0 rounded-none font-mono text-xs font-bold gap-2">
            <Link href="/reflections/submit">
              {status === "changes_requested" ? "Update" : "Write now"}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}

/* ── History card ────────────────────────────────────────────────────────── */

function ReflectionCard({ r }: { r: ReflectionRecord }) {
  const [expanded, setExpanded] = useState(false);
  const status = r.status as ReflectionStatus;
  const submitted = formatDate(r.submittedAt);
  const reviewed = formatDate(r.reviewedAt);
  const answerCount = Object.keys(r.answers ?? {}).length;

  return (
    <div className="group flex flex-col gap-0 border border-grey-200 bg-white transition-colors hover:border-grey-400">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left"
      >
        {/* Left */}
        <div className="min-w-0 flex-1">
          <p className="font-sans text-lg font-bold text-text-primary leading-none">
            {formatPeriod(r.period)}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
            {submitted && (
              <span className="font-mono text-[10px] text-text-muted">
                Submitted <span className="text-text-secondary font-bold">{submitted}</span>
              </span>
            )}
            {reviewed && (
              <span className="font-mono text-[10px] text-text-muted">
                Reviewed <span className="text-text-secondary font-bold">{reviewed}</span>
              </span>
            )}
          </div>
        </div>

        {/* Right */}
        <div className="flex shrink-0 items-center gap-3">
          <div className="flex flex-col items-end gap-2">
            <StatusPill status={status} />
            <span className="font-mono text-[10px] text-text-muted">
              {answerCount} answer{answerCount !== 1 ? "s" : ""}
            </span>
          </div>
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-icon-muted transition-transform",
              expanded && "rotate-180"
            )}
          />
        </div>
      </button>

      {expanded && (
        <div className="space-y-4 border-t border-grey-200 bg-grey-50/60 px-5 py-4">
          {/* Legacy flat note (pre-migration data) */}
          {r.reviewerNotes?.["_legacy"] && (
            <div className="border border-grey-200 bg-white p-4">
              <div className="mb-1.5 flex items-center gap-1.5 font-mono text-xs font-semibold text-text-muted">
                <MessageSquareText className="h-3.5 w-3.5" />
                Reviewer feedback
              </div>
              <p className="whitespace-pre-wrap font-mono text-sm text-text-secondary">
                {r.reviewerNotes["_legacy"]}
              </p>
            </div>
          )}

          {r.questions.map((q) => {
            const perQuestionNote = r.reviewerNotes?.[q.id];
            return (
              <div key={q.id}>
                <p className="font-mono text-xs font-bold text-text-primary">{q.prompt}</p>
                <p className="mt-1 whitespace-pre-wrap font-mono text-sm text-text-tertiary">
                  {r.answers?.[q.id] || "—"}
                </p>
                {perQuestionNote?.trim() && (
                  <div className="mt-2 border-l-2 border-warning-400 pl-3">
                    <p className="font-mono text-[10px] font-bold uppercase tracking-wide text-warning-600">
                      Reviewer note
                    </p>
                    <p className="mt-0.5 font-mono text-xs leading-5 text-warning-700">
                      {perQuestionNote}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── History list with filters ───────────────────────────────────────────── */

function HistorySection() {
  const { data: history, isLoading } = useMyReflections();
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");

  const activeTab = FILTER_TABS.find((t) => t.key === activeFilter) ?? FILTER_TABS[0];
  const filtered = (history ?? []).filter((r) =>
    activeTab.statuses.includes(r.status as ReflectionStatus)
  );

  const countFor = (tab: (typeof FILTER_TABS)[0]) =>
    (history ?? []).filter((r) => tab.statuses.includes(r.status as ReflectionStatus)).length;

  return (
    <div>
      {/* Filter tabs */}
      <div className="mb-5 flex border-b border-grey-200">
        {FILTER_TABS.map((tab) => {
          const isActive = activeFilter === tab.key;
          const count = countFor(tab);
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveFilter(tab.key)}
              className={cn(
                "relative flex items-center gap-1.5 px-4 py-2.5 font-mono text-xs font-semibold transition-colors",
                isActive
                  ? "text-text-primary after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-zinc-900"
                  : "text-text-muted hover:text-text-secondary"
              )}
            >
              {tab.label}
              <span
                className={cn(
                  "flex h-4 min-w-4 items-center justify-center px-1 font-mono text-[9px] font-black rounded-sm",
                  isActive ? "bg-zinc-900 text-white" : "bg-grey-100 text-text-muted"
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex flex-col gap-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-none" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="border border-dashed border-grey-300 py-14 text-center">
          <p className="font-sans text-base font-bold text-text-primary">
            {activeFilter === "all"
              ? "No reflections yet"
              : `No ${STATUS[activeFilter as ReflectionStatus]?.label.toLowerCase()} reflections`}
          </p>
          <p className="mt-1 font-mono text-xs text-text-muted">
            {activeFilter === "all"
              ? "Your submitted reflections will show up here."
              : "Try a different filter."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((r) => (
            <ReflectionCard key={r.id} r={r} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────────────────── */

function ReflectionsContent() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      {/* Header */}
      <header className="mb-6">
        <div className="mb-1 flex items-center gap-2">
          <ClipboardCheck className="h-4 w-4 text-icon-tertiary" />
          <p className="font-mono text-xs font-medium text-text-muted">My space</p>
        </div>
        <h1 className="font-sans text-4xl font-bold tracking-tight text-text-primary">
          Reflections
        </h1>
      </header>

      {/* Current cycle */}
      <div className="mb-6">
        <CurrentCycleBanner />
      </div>

      {/* History */}
      <HistorySection />
    </div>
  );
}

export default function ReflectionsPage() {
  return (
    <RouteGuard permission="reflections.submit">
      <DashboardShell>
        <ReflectionsContent />
      </DashboardShell>
    </RouteGuard>
  );
}

"use client";

import {
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Download,
  FileText,
  MessageSquareWarning,
  Search,
  Settings2,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { DashboardShell } from "@/components/dashboard/Shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { usePermission } from "@/hooks/usePermission";
import { useReflections, useReviewReflection } from "@/hooks/useReflections";
import type { ReflectionRecord, ReflectionStatus } from "@/types/reflections.types";

const STATUS_META: Record<ReflectionStatus, { label: string; className: string }> = {
  not_started: { label: "Not started", className: "border-grey-200 bg-grey-50 text-text-muted" },
  submitted: { label: "Submitted", className: "border-info-200 bg-info-50 text-info-700" },
  under_review: {
    label: "Under review",
    className: "border-warning-200 bg-warning-50 text-warning-700",
  },
  approved: { label: "Approved", className: "border-success-200 bg-success-50 text-success-700" },
  changes_requested: {
    label: "Changes requested",
    className: "border-error-200 bg-error-50 text-error-700",
  },
};

function StatusPill({ status }: { status: ReflectionStatus }) {
  const meta = STATUS_META[status] ?? STATUS_META.submitted;
  return (
    <span
      className={`inline-flex h-6 items-center border px-2.5 font-mono text-[11px] font-bold ${meta.className}`}
    >
      {meta.label}
    </span>
  );
}

function FilterTab({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`-mb-px flex items-center gap-2 border-b-2 px-1 pb-3 font-mono text-xs font-bold uppercase tracking-wide transition-colors ${
        active
          ? "border-grey-900 text-text-primary"
          : "border-transparent text-text-muted hover:text-text-primary"
      }`}
    >
      {label}
      <span
        className={`inline-flex h-4 min-w-4 items-center justify-center px-1 font-mono text-[10px] ${
          active ? "bg-grey-900 text-white" : "bg-grey-100 text-text-secondary"
        }`}
      >
        {count}
      </span>
    </button>
  );
}

function formatDate(value: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(
    d
  );
}

function formatPeriod(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(d);
}

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/**
 * Calendar-style period filter: a popover with a year stepper and a month grid.
 * Only months that actually have submissions are selectable.
 */
function PeriodPicker({
  value,
  periods,
  onChange,
}: {
  value: string;
  periods: string[];
  onChange: (value: string) => void;
}) {
  // Map "year-monthIndex" -> the real period value (e.g. "2026-05-25").
  const lookup = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of periods) {
      const d = new Date(p);
      if (!Number.isNaN(d.getTime())) map.set(`${d.getFullYear()}-${d.getMonth()}`, p);
    }
    return map;
  }, [periods]);

  const years = useMemo(() => {
    const set = new Set<number>();
    for (const p of periods) {
      const d = new Date(p);
      if (!Number.isNaN(d.getTime())) set.add(d.getFullYear());
    }
    return [...set].sort((a, b) => a - b);
  }, [periods]);

  const selectedYear = value !== "all" ? new Date(value).getFullYear() : undefined;
  const defaultYear = selectedYear ?? years[years.length - 1] ?? new Date().getFullYear();
  const [displayYear, setDisplayYear] = useState(defaultYear);

  const minYear = years[0] ?? displayYear;
  const maxYear = years[years.length - 1] ?? displayYear;

  const label = value === "all" ? "All months" : formatPeriod(value);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex h-9 items-center gap-2 border border-grey-200 bg-white px-3 font-mono text-xs font-bold text-text-secondary transition-colors hover:bg-grey-50"
        >
          <CalendarDays className="h-3.5 w-3.5 text-icon-muted" />
          {label}
          <ChevronDown className="h-3.5 w-3.5 text-icon-muted" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 rounded-none border-grey-200 p-0 shadow-none">
        <PopoverClose asChild>
          <button
            type="button"
            onClick={() => onChange("all")}
            className={`flex w-full items-center justify-between border-b border-grey-200 px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-wide transition-colors hover:bg-grey-50 ${
              value === "all" ? "text-text-primary" : "text-text-muted"
            }`}
          >
            All months
            {value === "all" && <span className="h-1.5 w-1.5 bg-grey-900" />}
          </button>
        </PopoverClose>

        <div className="flex items-center justify-between border-b border-grey-200 px-3 py-2">
          <button
            type="button"
            onClick={() => setDisplayYear((y) => Math.max(minYear, y - 1))}
            disabled={displayYear <= minYear}
            className="text-icon-muted transition-colors hover:text-text-primary disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="font-sans text-sm font-black text-text-primary">{displayYear}</span>
          <button
            type="button"
            onClick={() => setDisplayYear((y) => Math.min(maxYear, y + 1))}
            disabled={displayYear >= maxYear}
            className="text-icon-muted transition-colors hover:text-text-primary disabled:opacity-30"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-1.5 p-3">
          {MONTH_LABELS.map((month, index) => {
            const period = lookup.get(`${displayYear}-${index}`);
            const has = !!period;
            const active = !!period && period === value;
            const cell = (
              <button
                key={month}
                type="button"
                disabled={!has}
                onClick={() => period && onChange(period)}
                className={`h-9 border font-mono text-xs font-bold transition-colors ${
                  active
                    ? "border-grey-900 bg-grey-900 text-white"
                    : has
                      ? "border-grey-200 bg-white text-text-secondary hover:border-grey-900 hover:bg-grey-50"
                      : "cursor-not-allowed border-transparent bg-grey-50/60 text-grey-300"
                }`}
              >
                {month}
              </button>
            );
            return has ? (
              <PopoverClose key={month} asChild>
                {cell}
              </PopoverClose>
            ) : (
              <div key={month}>{cell}</div>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function ReviewSheet({
  reflection,
  onClose,
}: {
  reflection: ReflectionRecord;
  onClose: () => void;
}) {
  const { mutate: review, isPending } = useReviewReflection();
  const [notes, setNotes] = useState(reflection.reviewerNotes ?? "");
  const canReview = usePermission("reflections.review");

  function act(action: "approve" | "request_changes") {
    if (action === "request_changes" && !notes.trim()) {
      toast.error("Add a note describing the changes needed.");
      return;
    }
    review(
      { id: reflection.id, action, notes },
      {
        onSuccess: () => {
          toast.success(action === "approve" ? "Reflection approved." : "Changes requested.");
          onClose();
        },
        onError: () => toast.error("Failed to submit review."),
      }
    );
  }

  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="flex w-full flex-col gap-0 border-grey-200 bg-white p-0 sm:max-w-xl">
        <SheetHeader className="border-b border-grey-200 p-5 pr-12">
          <SheetTitle className="font-sans text-xl font-black uppercase tracking-tight text-text-primary">
            {reflection.fullName}
          </SheetTitle>
          <SheetDescription className="flex flex-wrap items-center gap-2 pt-1 font-mono text-xs text-text-secondary">
            @{reflection.username} · submitted {formatDate(reflection.submittedAt)}
            <StatusPill status={reflection.status} />
          </SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
          {/* Prior decision, if any */}
          {reflection.reviewerNotes?.trim() && (
            <div
              className={`border p-3 ${
                reflection.status === "approved"
                  ? "border-success-200 bg-success-50"
                  : "border-warning-200 bg-warning-50"
              }`}
            >
              <div
                className={`flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-widest ${
                  reflection.status === "approved" ? "text-success-700" : "text-warning-700"
                }`}
              >
                <MessageSquareWarning className="h-3.5 w-3.5" />
                {reflection.status === "changes_requested" ? "Changes requested" : "Reviewer note"}
                {reflection.reviewedByEmail ? ` · ${reflection.reviewedByEmail}` : ""}
              </div>
              <p
                className={`mt-1.5 font-mono text-xs leading-6 ${
                  reflection.status === "approved" ? "text-success-700" : "text-warning-700"
                }`}
              >
                {reflection.reviewerNotes}
              </p>
            </div>
          )}

          {reflection.questions.length === 0 ? (
            <p className="font-mono text-sm text-text-tertiary">No questions recorded.</p>
          ) : (
            reflection.questions.map((q, i) => {
              const answer = reflection.answers[q.id]?.trim() || "";
              return (
                <div key={q.id} className="border border-grey-200">
                  <div className="border-b border-grey-200 bg-grey-50 px-4 py-2">
                    <p className="font-mono text-xs font-bold text-text-primary">
                      {i + 1}. {q.prompt}
                    </p>
                  </div>
                  <div className="px-4 py-3">
                    {q.type === "file" ? (
                      answer ? (
                        <a
                          href={answer}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 border border-grey-300 bg-grey-50 px-3 py-2 font-mono text-xs font-bold text-text-primary transition-colors hover:bg-grey-100"
                        >
                          <FileText className="h-4 w-4 text-icon-tertiary" />
                          View attachment
                          <Download className="h-3.5 w-3.5" />
                        </a>
                      ) : (
                        <p className="font-mono text-sm text-text-tertiary">No file uploaded.</p>
                      )
                    ) : (
                      <p className="whitespace-pre-wrap font-mono text-sm leading-6 text-text-secondary">
                        {answer || "—"}
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          )}

          {canReview && reflection.status !== "approved" && (
            <div className="border-t border-grey-200 pt-4">
              <p className="mb-2 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted">
                Comments to the member (required to request changes)
              </p>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="What should the member revise before resubmitting?"
                className="w-full resize-y rounded-none border border-grey-300 bg-white p-3 font-mono text-sm text-text-primary outline-none focus:border-grey-900"
              />
            </div>
          )}
        </div>

        {canReview && reflection.status !== "approved" && (
          <SheetFooter className="border-t border-grey-200 bg-grey-50 p-4 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => act("request_changes")}
              disabled={isPending}
              className="h-10 gap-2 rounded-none border-error-200 font-mono text-xs font-bold text-error-700 hover:bg-error-50"
            >
              <MessageSquareWarning className="h-4 w-4" />
              Send back for changes
            </Button>
            <Button
              type="button"
              onClick={() => act("approve")}
              disabled={isPending}
              className="h-10 gap-2 rounded-none font-mono text-xs font-bold"
            >
              <Check className="h-4 w-4" />
              Approve
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}

function ReflectionsAdminContent() {
  const { data: reflections, isLoading } = useReflections();
  const [statusFilter, setStatusFilter] = useState<ReflectionStatus | "all">("all");
  const [periodFilter, setPeriodFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<ReflectionRecord | null>(null);
  const canManage = usePermission("reflections.manage");

  // Distinct months (newest first) for the time-frame picker.
  const periods = useMemo(() => {
    const set = new Set((reflections ?? []).map((r) => r.period));
    return [...set].sort((a, b) => b.localeCompare(a));
  }, [reflections]);

  // Everything for the currently-selected month (drives both the counts and the table).
  const periodScoped = useMemo(() => {
    const all = reflections ?? [];
    return periodFilter === "all" ? all : all.filter((r) => r.period === periodFilter);
  }, [reflections, periodFilter]);

  const stats = useMemo(() => {
    const count = (s: ReflectionStatus) => periodScoped.filter((r) => r.status === s).length;
    return {
      total: periodScoped.length,
      awaiting: count("submitted") + count("under_review"),
      changes: count("changes_requested"),
      approved: count("approved"),
    };
  }, [periodScoped]);

  const visible = useMemo(() => {
    let rows = periodScoped;
    if (statusFilter === "submitted") {
      rows = rows.filter((r) => r.status === "submitted" || r.status === "under_review");
    } else if (statusFilter !== "all") {
      rows = rows.filter((r) => r.status === statusFilter);
    }
    const term = search.trim().toLowerCase();
    if (term) {
      rows = rows.filter(
        (r) => r.fullName.toLowerCase().includes(term) || r.username.toLowerCase().includes(term)
      );
    }
    return rows;
  }, [periodScoped, statusFilter, search]);

  return (
    <div className="w-full pb-20">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4 text-icon-tertiary" />
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted">
              Admin · Engagement
            </p>
          </div>
          <h1 className="font-sans text-4xl font-black uppercase tracking-tight text-text-primary">
            Reflections
          </h1>
          <p className="mt-3 font-mono text-sm leading-relaxed text-text-tertiary">
            Review members' monthly reflections, request changes, and manage the questions they
            answer.
          </p>
        </div>
        {canManage && (
          <Button
            asChild
            variant="outline"
            className="h-11 shrink-0 rounded-none font-mono text-xs font-bold"
          >
            <Link href="/admin/reflections/questions">
              <Settings2 className="h-4 w-4" />
              Manage questions
            </Link>
          </Button>
        )}
      </header>

      {/* Toolbar: underline tabs (with counts) + search */}
      <div className="mb-5 flex flex-col gap-4 border-b border-grey-200 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-5">
          <FilterTab
            label="All"
            count={stats.total}
            active={statusFilter === "all"}
            onClick={() => setStatusFilter("all")}
          />
          <FilterTab
            label="Awaiting"
            count={stats.awaiting}
            active={statusFilter === "submitted"}
            onClick={() => setStatusFilter("submitted")}
          />
          <FilterTab
            label="Changes"
            count={stats.changes}
            active={statusFilter === "changes_requested"}
            onClick={() => setStatusFilter("changes_requested")}
          />
          <FilterTab
            label="Approved"
            count={stats.approved}
            active={statusFilter === "approved"}
            onClick={() => setStatusFilter("approved")}
          />
        </div>
        <div className="flex items-center gap-2 pb-3">
          <PeriodPicker value={periodFilter} periods={periods} onChange={setPeriodFilter} />
          <div className="relative lg:w-56">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-icon-muted" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search members"
              className="h-9 rounded-none border-grey-200 bg-white pl-9 font-mono text-sm"
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: skeleton rows
            <Skeleton key={i} className="h-16 w-full rounded-none" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="border border-dashed border-grey-300 bg-white p-14 text-center">
          <p className="font-sans text-base font-black text-text-primary">No reflections here</p>
          <p className="mt-2 font-mono text-xs text-text-tertiary">
            {statusFilter === "all"
              ? "Reflections appear once members start submitting."
              : "Nothing matches this filter right now."}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden border border-grey-200 bg-white">
          <div className="hidden grid-cols-[2fr_1.4fr_1.2fr_1fr_auto] gap-4 border-b border-grey-200 bg-grey-50 px-5 py-3 lg:grid">
            {["Member", "Period", "Submitted", "Status", ""].map((h, i) => (
              <span
                // biome-ignore lint/suspicious/noArrayIndexKey: static headers
                key={i}
                className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted"
              >
                {h || <span className="sr-only">Action</span>}
              </span>
            ))}
          </div>
          <div className="divide-y divide-grey-200">
            {visible.map((r) => (
              <button
                type="button"
                key={r.id}
                onClick={() => setSelected(r)}
                className="grid w-full grid-cols-1 gap-2 px-5 py-4 text-left transition-colors hover:bg-grey-50 lg:grid-cols-[2fr_1.4fr_1.2fr_1fr_auto] lg:items-center"
              >
                <div className="min-w-0">
                  <p className="truncate font-sans text-sm font-black uppercase tracking-tight text-text-primary">
                    {r.fullName}
                  </p>
                  <p className="font-mono text-xs text-text-muted">@{r.username}</p>
                </div>
                <div className="font-mono text-xs text-text-tertiary">{formatDate(r.period)}</div>
                <div className="font-mono text-xs text-text-tertiary">
                  {formatDate(r.submittedAt)}
                </div>
                <div>
                  <StatusPill status={r.status} />
                </div>
                <span className="font-mono text-xs font-bold text-text-secondary lg:text-right">
                  Review →
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {selected && <ReviewSheet reflection={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

export default function ReflectionsAdminPage() {
  return (
    <RouteGuard permission="reflections.view_any">
      <DashboardShell>
        <ReflectionsAdminContent />
      </DashboardShell>
    </RouteGuard>
  );
}

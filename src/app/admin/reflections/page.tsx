"use client";

import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Search,
  Settings2,
  UserCheck,
  UserX,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminMembers } from "@/hooks/useAdmin";
import { usePermission } from "@/hooks/usePermission";
import { useReflections } from "@/hooks/useReflections";
import { getAvatarUrl } from "@/lib/utils";
import type { ReflectionRecord, ReflectionStatus } from "@/types/reflections.types";

/* ── Status meta ─────────────────────────────────────────────────────────── */

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

/* ── Tab ─────────────────────────────────────────────────────────────────── */

function Tab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`-mb-px border-b-2 px-1 pb-3 font-mono text-sm font-bold transition-colors ${active
        ? "border-grey-900 text-text-primary"
        : "border-transparent text-text-muted hover:text-text-primary"
        }`}
    >
      {label}
    </button>
  );
}

/* ── Sub-filter pill ─────────────────────────────────────────────────────── */

function SubFilter({
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
      className={`flex h-8 items-center gap-2 border px-3 font-mono text-xs font-bold transition-colors ${active
        ? "border-grey-900 bg-grey-900 text-white"
        : "border-grey-200 bg-white text-text-secondary hover:border-grey-400"
        }`}
    >
      {label}
      <span
        className={`inline-flex h-4 min-w-4 items-center justify-center px-1 text-[10px] ${active ? "bg-white/20 text-white" : "bg-grey-100 text-text-secondary"}`}
      >
        {count}
      </span>
    </button>
  );
}

/* ── Helpers ─────────────────────────────────────────────────────────────── */

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

function sinceSubmitted(submittedAt: string | null): string {
  if (!submittedAt) return "";
  const days = Math.floor((Date.now() - new Date(submittedAt).getTime()) / 86_400_000);
  if (days === 0) return "today";
  if (days === 1) return "1d ago";
  return `${days}d ago`;
}

/* ── Period picker ───────────────────────────────────────────────────────── */

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

function PeriodPicker({
  value,
  periods,
  onChange,
}: {
  value: string | null;
  periods: string[];
  onChange: (v: string) => void;
}) {
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

  const selectedYear =
    value !== "all" && value !== null ? new Date(value).getFullYear() : undefined;
  const defaultYear = selectedYear ?? years[years.length - 1] ?? new Date().getFullYear();
  const [displayYear, setDisplayYear] = useState(defaultYear);
  const minYear = years[0] ?? displayYear;
  const maxYear = years[years.length - 1] ?? displayYear;
  const label = value === "all" ? "All periods" : value ? formatPeriod(value) : "Select period";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex h-9 items-center gap-2 border border-grey-200 bg-white px-3 font-mono text-xs font-bold text-text-secondary transition-colors hover:bg-grey-50"
        >
          <CalendarDays className="h-3.5 w-3.5 text-icon-muted" />
          {label}
          <ChevronRight className="h-3.5 w-3.5 rotate-90 text-icon-muted" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 rounded-none border-grey-200 p-0 shadow-none">
        <PopoverClose asChild>
          <button
            type="button"
            onClick={() => onChange("all")}
            className={`flex w-full items-center justify-between border-b border-grey-200 px-4 py-2.5 font-mono text-sm font-bold transition-colors hover:bg-grey-50 ${value === "all" ? "text-text-primary" : "text-text-muted"}`}
          >
            All periods
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
                className={`h-9 border font-mono text-xs font-bold transition-colors ${active ? "border-grey-900 bg-grey-900 text-white" : has ? "border-grey-200 bg-white text-text-secondary hover:border-grey-900 hover:bg-grey-50" : "cursor-not-allowed border-transparent bg-grey-50/60 text-grey-300"}`}
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

/* ── Submitted tab ───────────────────────────────────────────────────────── */

type SubmittedFilter = "awaiting" | "changes_requested" | "approved";

function SubmittedTab({
  reflections,
  isLoading,
  periodFilter,
  periods,
  onPeriodChange,
}: {
  reflections: ReflectionRecord[];
  isLoading: boolean;
  periodFilter: string | null;
  periods: string[];
  onPeriodChange: (v: string) => void;
}) {
  const [subFilter, setSubFilter] = useState<SubmittedFilter>("awaiting");
  const [search, setSearch] = useState("");

  const periodScoped = useMemo(
    () =>
      periodFilter === "all" ? reflections : reflections.filter((r) => r.period === periodFilter),
    [reflections, periodFilter]
  );

  const counts = useMemo(
    () => ({
      awaiting: periodScoped.filter((r) => r.status === "submitted" || r.status === "under_review")
        .length,
      changes_requested: periodScoped.filter((r) => r.status === "changes_requested").length,
      approved: periodScoped.filter((r) => r.status === "approved").length,
    }),
    [periodScoped]
  );

  const visible = useMemo(() => {
    let rows = periodScoped;
    if (subFilter === "awaiting")
      rows = rows.filter((r) => r.status === "submitted" || r.status === "under_review");
    else rows = rows.filter((r) => r.status === subFilter);
    const term = search.trim().toLowerCase();
    if (term)
      rows = rows.filter(
        (r) => r.fullName.toLowerCase().includes(term) || r.username.toLowerCase().includes(term)
      );
    return rows;
  }, [periodScoped, subFilter, search]);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <SubFilter
            label="Awaiting review"
            count={counts.awaiting}
            active={subFilter === "awaiting"}
            onClick={() => setSubFilter("awaiting")}
          />
          <SubFilter
            label="Changes requested"
            count={counts.changes_requested}
            active={subFilter === "changes_requested"}
            onClick={() => setSubFilter("changes_requested")}
          />
          <SubFilter
            label="Approved"
            count={counts.approved}
            active={subFilter === "approved"}
            onClick={() => setSubFilter("approved")}
          />
        </div>
        <div className="flex items-center gap-2">
          <PeriodPicker value={periodFilter} periods={periods} onChange={onPeriodChange} />
          <div className="relative w-48">
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

      {/* List */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: skeleton loader — static count, order never changes
            <Skeleton key={i} className="h-16 w-full rounded-none" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="border border-dashed border-grey-300 bg-white p-14 text-center">
          <p className="font-sans text-base font-black text-text-primary">Nothing here</p>
          <p className="mt-2 font-mono text-xs text-text-tertiary">
            No reflections match this filter.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden border border-grey-200 bg-white">
          {/* Header row */}
          <div className="hidden grid-cols-[2fr_1.2fr_1fr_1fr_auto] gap-4 border-b border-grey-200 bg-grey-50 px-5 py-3 lg:grid">
            {["Member", "Period", "Submitted", "Status", "actions"].map((h) => (
              <span
                key={h}
                className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted"
              >
                {h === "actions" ? "" : h}
              </span>
            ))}
          </div>
          <div className="divide-y divide-grey-200">
            {visible.map((r) => (
              <Link
                key={r.id}
                href={`/admin/reflections/${r.id}/review`}
                className="grid w-full grid-cols-1 gap-2 px-5 py-4 text-left transition-colors hover:bg-grey-50 lg:grid-cols-[2fr_1.2fr_1fr_1fr_auto] lg:items-center"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* biome-ignore lint/performance/noImgElement: avatar URL from API, next/image domain config not set up yet */}
                  <img
                    src={getAvatarUrl(r.profilePictureUrl || null, r.fullName)}
                    alt={r.fullName}
                    className="h-8 w-8 shrink-0 object-cover"
                  />
                  <div className="min-w-0">
                    <p className="truncate font-sans text-sm font-bold text-text-primary">
                      {r.fullName}
                    </p>
                    <p className="font-mono text-xs text-text-muted">@{r.username}</p>
                  </div>
                </div>
                <div className="font-mono text-xs text-text-tertiary">{formatPeriod(r.period)}</div>
                <div className="font-mono text-xs text-text-tertiary">
                  {formatDate(r.submittedAt)}
                  {r.submittedAt && (
                    <span className="ml-1.5 text-text-muted opacity-60">
                      {sinceSubmitted(r.submittedAt)}
                    </span>
                  )}
                </div>
                <div>
                  <StatusPill status={r.status} />
                </div>
                <span className="font-mono text-xs font-bold text-text-secondary lg:text-right">
                  Review →
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Not Submitted tab ───────────────────────────────────────────────────── */

function NotSubmittedTab({
  reflections,
  isLoading,
  isMembersLoading,
  periodFilter,
  periods,
  onPeriodChange,
  allMembers,
}: {
  reflections: ReflectionRecord[];
  isLoading: boolean;
  isMembersLoading: boolean;
  periodFilter: string | null;
  periods: string[];
  onPeriodChange: (v: string) => void;
  allMembers: Array<{
    id: string;
    username: string;
    fullName: string;
    profilePictureUrl?: string | null;
    primaryRole: string | null;
    roles: string[];
  }>;
}) {
  const [search, setSearch] = useState("");

  // For "not submitted", we need a specific period to compare against.
  // Use the most recent period if "all" is selected.
  const effectivePeriod = useMemo(() => {
    if (periodFilter !== "all") return periodFilter;
    return periods[0] ?? null; // periods is sorted newest first
  }, [periodFilter, periods]);

  const submittedUsernames = useMemo(() => {
    const inPeriod = effectivePeriod
      ? reflections.filter((r) => r.period === effectivePeriod)
      : reflections;
    return new Set(inPeriod.map((r) => r.username.toLowerCase()));
  }, [reflections, effectivePeriod]);

  const notSubmitted = useMemo(() => {
    let members = allMembers.filter((m) => !submittedUsernames.has(m.username.toLowerCase()));
    const term = search.trim().toLowerCase();
    if (term)
      members = members.filter(
        (m) => m.fullName.toLowerCase().includes(term) || m.username.toLowerCase().includes(term)
      );
    return members;
  }, [allMembers, submittedUsernames, search]);

  const loading = isLoading || isMembersLoading;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-mono text-xs text-text-tertiary">
          {effectivePeriod ? (
            <>
              Members who haven't submitted for{" "}
              <span className="font-bold text-text-primary">{formatPeriod(effectivePeriod)}</span>
            </>
          ) : (
            "No reflection period found yet."
          )}
        </p>
        <div className="flex items-center gap-2">
          <PeriodPicker value={periodFilter} periods={periods} onChange={onPeriodChange} />
          <div className="relative w-48">
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

      {/* List */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: skeleton loader — static count, order never changes
            <Skeleton key={i} className="h-16 w-full rounded-none" />
          ))}
        </div>
      ) : notSubmitted.length === 0 ? (
        <div className="border border-dashed border-grey-300 bg-white p-14 text-center">
          <UserCheck className="mx-auto mb-3 h-8 w-8 text-success-500" />
          <p className="font-sans text-base font-black text-text-primary">Everyone has submitted</p>
          <p className="mt-2 font-mono text-xs text-text-tertiary">
            All active members submitted for this period.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden border border-grey-200 bg-white">
          <div className="hidden grid-cols-[2fr_1.5fr_auto] gap-4 border-b border-grey-200 bg-grey-50 px-5 py-3 lg:grid">
            {["Member", "Role", "actions"].map((h) => (
              <span
                key={h}
                className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted"
              >
                {h === "actions" ? "" : h}
              </span>
            ))}
          </div>
          <div className="divide-y divide-grey-200">
            {notSubmitted.map((m) => (
              <Link
                key={m.id}
                href={`/admin/reflections/members/${m.username}`}
                className="grid w-full grid-cols-1 gap-2 px-5 py-4 text-left transition-colors hover:bg-grey-50 lg:grid-cols-[2fr_1.5fr_auto] lg:items-center"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* biome-ignore lint/performance/noImgElement: avatar URL from API, next/image domain config not set up yet */}
                  <img
                    src={getAvatarUrl(m.profilePictureUrl ?? null, m.fullName)}
                    alt={m.fullName}
                    className="h-8 w-8 shrink-0 object-cover"
                  />
                  <div className="min-w-0">
                    <p className="truncate font-sans text-sm font-bold text-text-primary">
                      {m.fullName}
                    </p>
                    <p className="font-mono text-xs text-text-muted">@{m.username}</p>
                  </div>
                </div>
                <div className="font-mono text-xs text-text-tertiary">
                  {m.primaryRole ?? m.roles[0] ?? "—"}
                </div>
                <div className="flex items-center gap-1.5">
                  <UserX className="h-4 w-4 text-error-500" />
                  <span className="font-mono text-xs font-bold text-text-secondary">
                    View history →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Main content ────────────────────────────────────────────────────────── */

function ReflectionsAdminContent() {
  const { data: reflections = [], isLoading } = useReflections();
  const { data: membersData, isLoading: isMembersLoading } = useAdminMembers();
  const [activeTab, setActiveTab] = useState<"submitted" | "not_submitted">("submitted");
  const [periodFilter, setPeriodFilter] = useState<string | null>(null);
  const canManage = usePermission("reflections.manage");

  const periods = useMemo(() => {
    const set = new Set(reflections.map((r) => r.period));
    return [...set].sort((a, b) => b.localeCompare(a));
  }, [reflections]);

  // Auto-select the most recent period once data loads
  useEffect(() => {
    if (periodFilter === null && periods.length > 0) {
      setPeriodFilter(periods[0]);
    }
  }, [periods, periodFilter]);

  const effectivePeriodFilter = periodFilter ?? periods[0] ?? "all";

  const allMembers = useMemo(
    () => (membersData ?? []).filter((m) => m.isActive && m.isOnboarded),
    [membersData]
  );

  return (
    <div className="w-full pb-20">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4 text-icon-tertiary" />
            <p className="font-mono text-xs font-medium text-text-muted">Admin · Engagement</p>
          </div>
          <h1 className="font-sans text-4xl font-bold tracking-tight text-text-primary">
            Reflections
          </h1>
          <p className="mt-3 font-mono text-sm leading-relaxed text-text-tertiary">
            Review members' monthly reflections, request changes, and track who's yet to submit.
          </p>
        </div>
        {canManage && (
          <Button
            asChild
            variant="outline"
            className="h-11 shrink-0 rounded-none font-mono text-xs font-bold"
          >
            <Link href="/admin/reflections/settings">
              <Settings2 className="h-4 w-4" />
              Settings
            </Link>
          </Button>
        )}
      </header>

      {/* Tabs */}
      <div className="mb-6 flex items-center gap-6 border-b border-grey-200">
        <Tab
          label="Submitted"
          active={activeTab === "submitted"}
          onClick={() => setActiveTab("submitted")}
        />
        <Tab
          label="Not Submitted"
          active={activeTab === "not_submitted"}
          onClick={() => setActiveTab("not_submitted")}
        />
      </div>

      {activeTab === "submitted" ? (
        <SubmittedTab
          reflections={reflections}
          isLoading={isLoading}
          periodFilter={effectivePeriodFilter}
          periods={periods}
          onPeriodChange={(v) => setPeriodFilter(v)}
        />
      ) : (
        <NotSubmittedTab
          reflections={reflections}
          isLoading={isLoading}
          isMembersLoading={isMembersLoading}
          periodFilter={periodFilter}
          periods={periods}
          onPeriodChange={(v) => setPeriodFilter(v)}
          allMembers={allMembers}
        />
      )}
    </div>
  );
}

export default function ReflectionsAdminPage() {
  return (
    <RouteGuard permission="reflections.view_any">
      <ReflectionsAdminContent />
    </RouteGuard>
  );
}

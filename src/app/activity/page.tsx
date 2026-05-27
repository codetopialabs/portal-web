"use client";

import {
  AppWindow,
  Filter,
  Key,
  Laptop,
  LogIn,
  LogOut,
  RefreshCw,
  Shield,
  ShieldAlert,
  User,
  UserPlus,
} from "lucide-react";
import React from "react";
import type { DriveStep } from "driver.js";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { DashboardShell } from "@/components/dashboard/Shell";
import { useAdminActivity } from "@/hooks/useAdmin";
import { usePermission } from "@/hooks/usePermission";
import { useWalkthrough } from "@/hooks/useWalkthrough";
import { type ActivityLogEntry, SessionService } from "@/services/auth.service";

// ─── event type config ────────────────────────────────────────────────────────

type EventCategory = "auth" | "account" | "profile" | "session";

const EVENT_CONFIG: Record<
  string,
  {
    icon: React.ElementType;
    category: EventCategory;
    color: string;
  }
> = {
  login: { icon: LogIn, category: "auth", color: "text-emerald-600" },
  logout: { icon: LogOut, category: "auth", color: "text-zinc-500" },
  token_refresh: { icon: RefreshCw, category: "auth", color: "text-zinc-400" },
  register: { icon: UserPlus, category: "account", color: "text-blue-600" },
  email_verified: { icon: Shield, category: "account", color: "text-blue-500" },
  password_changed: { icon: Key, category: "account", color: "text-amber-600" },
  password_reset_requested: { icon: Key, category: "account", color: "text-amber-400" },
  password_reset_completed: { icon: Key, category: "account", color: "text-amber-600" },
  profile_updated: { icon: User, category: "profile", color: "text-zinc-600" },
  avatar_updated: { icon: User, category: "profile", color: "text-zinc-600" },
  session_revoked: { icon: Laptop, category: "session", color: "text-red-500" },
  all_sessions_revoked: { icon: Laptop, category: "session", color: "text-red-600" },
  role_assigned: { icon: Shield, category: "account", color: "text-indigo-600" },
  role_revoked: { icon: Shield, category: "account", color: "text-indigo-400" },
  role_created: { icon: Shield, category: "account", color: "text-indigo-600" },
  role_updated: { icon: Shield, category: "account", color: "text-indigo-500" },
  role_deleted: { icon: ShieldAlert, category: "account", color: "text-red-500" },
  user_updated: { icon: User, category: "profile", color: "text-zinc-700" },
  user_suspended: { icon: ShieldAlert, category: "account", color: "text-red-500" },
  user_reactivated: { icon: Shield, category: "account", color: "text-emerald-600" },
  user_deleted: { icon: ShieldAlert, category: "account", color: "text-red-700" },
};

const CATEGORY_FILTERS: { label: string; value: EventCategory | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Auth", value: "auth" },
  { label: "Account", value: "account" },
  { label: "Profile", value: "profile" },
  { label: "Session", value: "session" },
];

// ─── helpers ──────────────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatEventLabel(eventType?: string): string {
  if (!eventType) return "Activity";
  return eventType
    .split("_")
    .map((word) => (word ? word[0].toUpperCase() + word.slice(1) : ""))
    .join(" ");
}

const PAGE_SIZE = 15;

// ─── page ─────────────────────────────────────────────────────────────────────

export default function ActivityPage() {
  return (
    <RouteGuard permission="activity.view">
      <ActivityPageContent />
    </RouteGuard>
  );
}

function ActivityPageContent() {
  const canViewOrgActivity = usePermission("activity.view_any");
  const [entries, setEntries] = React.useState<ActivityLogEntry[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [errorStatus, setErrorStatus] = React.useState<number | null>(null);
  const [page, setPage] = React.useState(1);
  const [filter, setFilter] = React.useState<EventCategory | "all">("all");
  const [viewMode, setViewMode] = React.useState<"mine" | "org">("mine");

  const orgOffset = (page - 1) * PAGE_SIZE;
  const {
    data: orgActivity,
    isLoading: orgLoading,
    isError: orgError,
    error: orgErrorValue,
  } = useAdminActivity(
    { limit: PAGE_SIZE, offset: orgOffset },
    viewMode === "org" && canViewOrgActivity
  );

  const walkthroughSteps: DriveStep[] = [
    {
      element: "#activity-org-toggle",
      popover: {
        title: "Org Activity",
        description: "Switch to the organization-wide activity stream when you have access.",
      },
    },
  ];

  useWalkthrough({
    tourId: "org_activity_view",
    steps: walkthroughSteps,
    enabled: canViewOrgActivity,
  });

  React.useEffect(() => {
    if (viewMode !== "mine") return;
    setLoading(true);
    setErrorStatus(null);
    SessionService.getActivity(PAGE_SIZE, (page - 1) * PAGE_SIZE)
      .then(({ results, total }) => {
        setEntries(results);
        setTotal(total);
      })
      .catch((err) => {
        setErrorStatus(err.status || 500);
      })
      .finally(() => setLoading(false));
  }, [page, viewMode]);

  React.useEffect(() => {
    setPage(1);
  }, [viewMode, filter]);

  const activeEntries = viewMode === "org" ? orgActivity?.results ?? [] : entries;

  const filtered =
    filter === "all"
      ? activeEntries
      : activeEntries.filter((e) => EVENT_CONFIG[e.eventType]?.category === filter);

  const activeTotal = viewMode === "org" ? orgActivity?.total ?? 0 : total;
  const totalPages =
    filter === "all"
      ? Math.max(1, Math.ceil(activeTotal / PAGE_SIZE))
      : Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const isLoadingState = viewMode === "org" ? orgLoading : loading;
  const errorStatusValue =
    viewMode === "org"
      ? (orgErrorValue as { status?: number } | undefined)?.status ?? (orgError ? 500 : null)
      : errorStatus;
  const totalCount = activeTotal || activeEntries.length;

  return (
    <DashboardShell>
      <div className="w-full max-w-none space-y-6 pb-20">
        <div className="flex flex-col gap-4 border-b border-zinc-200 pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.24em] text-zinc-400">
              Audit trail
            </p>
            <h1 className="mt-2 font-sans text-3xl font-black uppercase tracking-tight text-zinc-950">
              Activity Log
            </h1>
            <p className="mt-2 max-w-2xl font-mono text-sm leading-6 text-zinc-500">
              Review sign-ins, account changes, profile updates, and session events tied to your
              account.
            </p>
            {canViewOrgActivity && (
              <div id="activity-org-toggle" className="mt-4 flex flex-wrap gap-2">
                {[
                  { label: "My Activity", value: "mine" as const },
                  { label: "Org Activity", value: "org" as const },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setViewMode(option.value)}
                    className={`font-mono text-xs px-3 py-1.5 border transition-all uppercase tracking-widest ${viewMode === option.value
                        ? "bg-zinc-900 text-white border-zinc-900"
                        : "bg-white text-zinc-500 border-zinc-200 hover:border-zinc-400 hover:text-zinc-900"
                      }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <span className="w-fit border border-zinc-200 bg-white px-3 py-1.5 font-mono text-[10px] font-black uppercase tracking-[0.16em] text-zinc-500">
            {totalCount} events
          </span>
        </div>

        {/* filter pills */}
        <div className="flex flex-wrap gap-2">
          {CATEGORY_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => {
                setFilter(f.value);
                setPage(1);
              }}
              className={`font-mono text-xs px-3 py-1.5 border transition-all uppercase tracking-widest ${filter === f.value
                  ? "bg-zinc-900 text-white border-zinc-900"
                  : "bg-white text-zinc-500 border-zinc-200 hover:border-zinc-400 hover:text-zinc-900"
                }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* log */}
        {isLoadingState ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center gap-2">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-2 h-2 rounded-full bg-zinc-300 animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        ) : errorStatusValue === 403 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center border border-zinc-200 bg-white space-y-4">
            <div className="w-14 h-14 border border-red-100 bg-red-50 flex items-center justify-center rounded-full">
              <ShieldAlert className="w-6 h-6 text-red-600" />
            </div>
            <div className="space-y-1">
              <h3 className="font-sans font-black uppercase tracking-tight text-zinc-900 text-lg">
                Access Denied
              </h3>
              <p className="font-mono text-sm text-zinc-500 max-w-sm mx-auto">
                Security protocol CT-RBAC-01 prevents your account from auditing activity logs at
                this privilege level.
              </p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center border border-zinc-200 bg-white">
            <div className="w-12 h-12 border border-zinc-200 bg-zinc-50 flex items-center justify-center mb-4">
              <Filter className="w-5 h-5 text-zinc-300" />
            </div>
            <p className="font-mono text-sm text-zinc-500">No activity yet.</p>
          </div>
        ) : (
          <div className="bg-white border border-zinc-200 divide-y divide-zinc-100 overflow-hidden">
            {filtered.map((entry) => {
              const cfg = EVENT_CONFIG[entry.eventType] ?? {
                icon: AppWindow,
                color: "text-zinc-400",
              };
              const Icon = cfg.icon;
              const eventLabel =
                "eventLabel" in entry && entry.eventLabel
                  ? entry.eventLabel
                  : formatEventLabel(entry.eventType);
              return (
                <div
                  key={entry.id}
                  className="flex items-start gap-4 px-5 py-4 hover:bg-zinc-50 transition-colors"
                >
                  <div className="w-8 h-8 border border-zinc-100 bg-zinc-50 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-mono font-semibold text-sm text-zinc-900 leading-tight">
                          {eventLabel}
                        </p>
                        {entry.detail && (
                          <p className="font-mono text-xs text-zinc-400 mt-0.5">{entry.detail}</p>
                        )}
                      </div>
                      <span className="font-mono text-xs text-zinc-400 whitespace-nowrap shrink-0">
                        {timeAgo(entry.createdAt)}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-1.5 font-mono text-xs text-zinc-400">
                      {entry.deviceName && <span>{entry.deviceName}</span>}
                      {entry.deviceName && entry.ipAddress && (
                        <span className="text-zinc-200">·</span>
                      )}
                      {entry.ipAddress && <span>{entry.ipAddress}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-zinc-400">
              {filter === "all" ? totalCount : filtered.length} event
              {(filter === "all" ? totalCount : filtered.length) !== 1 ? "s" : ""} · page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => p - 1)}
                disabled={page === 1}
                className="h-8 px-4 border border-zinc-200 font-mono text-xs uppercase tracking-widest text-zinc-600 hover:border-zinc-900 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Prev
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => p + 1)}
                disabled={page === totalPages || (filter !== "all" && filtered.length < PAGE_SIZE)}
                className="h-8 px-4 border border-zinc-200 font-mono text-xs uppercase tracking-widest text-zinc-600 hover:border-zinc-900 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}

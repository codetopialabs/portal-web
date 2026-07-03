"use client";

import { AlertTriangle, ClipboardCheck, Mail, MoonStar, TrendingUp, Users } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminOverview } from "@/hooks/useAdmin";
import type { AdminOverviewCompositionBucket } from "@/types/admin-overview.types";

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function titleCase(s: string): string {
  return s
    .split("_")
    .map((w) => w[0]?.toUpperCase() + w.slice(1))
    .join(" ");
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  tone = "default",
  href,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  tone?: "default" | "warning";
  href?: string;
}) {
  const content = (
    <>
      <div className="flex items-center justify-between">
        <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
          {label}
        </p>
        <Icon className={`w-4 h-4 ${tone === "warning" ? "text-red-500" : "text-zinc-300"}`} />
      </div>
      <p
        className={`font-sans text-3xl font-black tracking-tight ${
          tone === "warning" ? "text-red-600" : "text-zinc-950"
        }`}
      >
        {value}
      </p>
      {sub && <p className="font-mono text-xs text-zinc-400">{sub}</p>}
    </>
  );

  const className = `bg-white border p-5 flex flex-col gap-2 transition-colors ${
    tone === "warning"
      ? `border-red-200 bg-red-50/40 ${href ? "hover:border-red-300 hover:bg-red-50" : ""}`
      : `border-zinc-200 ${href ? "hover:border-zinc-400 hover:bg-zinc-50" : ""}`
  }`;

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }
  return <div className={className}>{content}</div>;
}

function GrowthChart({ growth }: { growth: { weekStart: string; count: number }[] }) {
  const max = Math.max(1, ...growth.map((g) => g.count));
  return (
    <div className="bg-white border border-zinc-200 p-5 h-full">
      <p className="font-sans font-black uppercase tracking-widest text-sm text-zinc-900 mb-4">
        Member Growth — 12 Weeks
      </p>
      <div className="flex items-end gap-1.5 h-24">
        {growth.map((point) => (
          <div key={point.weekStart} className="flex-1 flex flex-col items-center gap-1 group">
            <div className="w-full flex items-end h-20">
              <div
                className="w-full bg-zinc-900 group-hover:bg-zinc-700 transition-colors"
                style={{ height: `${Math.max(4, (point.count / max) * 100)}%` }}
                title={`${point.weekStart}: ${point.count} new`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReflectionsTrendChart({
  trend,
}: {
  trend: { period: string; participationRate: number }[];
}) {
  if (trend.length === 0) {
    return (
      <div className="bg-white border border-zinc-200 p-5 h-full flex flex-col">
        <p className="font-sans font-black uppercase tracking-widest text-sm text-zinc-900 mb-4">
          Reflection Participation Trend
        </p>
        <p className="font-mono text-xs text-zinc-400">No reflection cycles yet.</p>
      </div>
    );
  }
  return (
    <div className="bg-white border border-zinc-200 p-5 h-full">
      <p className="font-sans font-black uppercase tracking-widest text-sm text-zinc-900 mb-4">
        Reflection Participation Trend
      </p>
      <div className="flex items-end gap-2 h-24">
        {trend.map((point) => (
          <div key={point.period} className="flex-1 flex flex-col items-center gap-1 group">
            <div className="w-full flex items-end h-20">
              <div
                className="w-full bg-emerald-600 group-hover:bg-emerald-500 transition-colors"
                style={{ height: `${Math.max(4, point.participationRate * 100)}%` }}
                title={`${point.period}: ${Math.round(point.participationRate * 100)}%`}
              />
            </div>
            <span className="font-mono text-[9px] text-zinc-400">
              {new Date(point.period).toLocaleDateString("en-US", { month: "short" })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CompositionList({
  title,
  buckets,
}: {
  title: string;
  buckets: AdminOverviewCompositionBucket[];
}) {
  const max = Math.max(1, ...buckets.map((b) => b.count));
  return (
    <div>
      <p className="font-mono text-[10px] font-black uppercase tracking-[0.15em] text-zinc-400 mb-2">
        {title}
      </p>
      {buckets.length === 0 ? (
        <p className="font-mono text-xs text-zinc-400">No data yet.</p>
      ) : (
        <div className="space-y-1.5">
          {buckets.map((bucket) => (
            <div key={bucket.value ?? "unspecified"} className="flex items-center gap-2">
              <span className="font-mono text-[11px] text-zinc-600 w-28 truncate shrink-0">
                {bucket.label ?? (bucket.value ? titleCase(bucket.value) : "Unspecified")}
              </span>
              <div className="flex-1 h-3 bg-zinc-100">
                <div
                  className="h-full bg-zinc-900"
                  style={{ width: `${(bucket.count / max) * 100}%` }}
                />
              </div>
              <span className="font-mono text-[11px] font-bold text-zinc-900 w-6 text-right shrink-0">
                {bucket.count}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function AdminOverview() {
  const { data, isLoading } = useAdminOverview();

  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton placeholders
          <Skeleton key={i} className="h-28 w-full" />
        ))}
      </div>
    );
  }

  const {
    members,
    engagement,
    reflections,
    reflectionsTrend,
    memberComposition,
    pendingActions,
    teams,
    roleDistribution,
    recentActivity,
  } = data;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="Total Members"
          value={members.total.toLocaleString()}
          sub={`+${members.new7d} this week`}
          href="/admin/members"
        />
        <StatCard
          icon={ClipboardCheck}
          label="Reflection Participation"
          value={reflections ? `${Math.round(reflections.participationRate * 100)}%` : "—"}
          sub={
            reflections
              ? `${reflections.submitted} of ${reflections.eligible} this cycle`
              : "No active cycle"
          }
          href="/admin/reflections"
        />
        <StatCard
          icon={TrendingUp}
          label="Active Teams"
          value={teams.active.toLocaleString()}
          href="/teams"
        />
        <StatCard
          icon={AlertTriangle}
          label="Needs Attention"
          value={pendingActions.total.toLocaleString()}
          sub={
            pendingActions.total > 0
              ? `${pendingActions.flaggedAccounts} flagged · ${pendingActions.reflectionsAwaitingReview} to review`
              : "All clear"
          }
          tone={pendingActions.total > 0 ? "warning" : "default"}
          href={pendingActions.total > 0 ? "#pending-actions" : undefined}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard
          icon={MoonStar}
          label="Dormant Members"
          value={engagement.dormantMembers.toLocaleString()}
          sub="No login in 30+ days"
          tone={engagement.dormantMembers > 0 ? "warning" : "default"}
          href="/admin/members?status=dormant"
        />
        <StatCard
          icon={Mail}
          label="Unverified Emails"
          value={engagement.unverifiedEmails.toLocaleString()}
          sub="Never confirmed their address"
          tone={engagement.unverifiedEmails > 0 ? "warning" : "default"}
          href="/admin/members?status=unverified"
        />
      </div>

      {(pendingActions.flaggedAccountsList.length > 0 ||
        pendingActions.reflectionsAwaitingReviewList.length > 0) && (
        <div id="pending-actions" className="bg-red-50/40 border border-red-200 p-5 scroll-mt-6">
          <p className="font-sans font-black uppercase tracking-widest text-sm text-red-700 mb-4">
            Awaiting Your Review
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {pendingActions.flaggedAccountsList.length > 0 && (
              <div>
                <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 mb-2">
                  Flagged Accounts
                </p>
                <div className="space-y-1.5">
                  {pendingActions.flaggedAccountsList.map((f) => (
                    <Link
                      key={f.username}
                      href={`/admin/members/${f.username}`}
                      className="flex items-center justify-between text-xs font-mono text-zinc-700 hover:text-zinc-900 hover:underline"
                    >
                      <span className="truncate">@{f.username}</span>
                      <span className="text-zinc-400 shrink-0 ml-2">{timeAgo(f.flaggedAt)}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {pendingActions.reflectionsAwaitingReviewList.length > 0 && (
              <div>
                <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 mb-2">
                  Reflections To Review
                </p>
                <div className="space-y-1.5">
                  {pendingActions.reflectionsAwaitingReviewList.map((r) => (
                    <Link
                      key={`${r.username}-${r.period}`}
                      href={`/admin/reflections/members/${r.username}`}
                      className="flex items-center justify-between text-xs font-mono text-zinc-700 hover:text-zinc-900 hover:underline"
                    >
                      <span className="truncate">@{r.username}</span>
                      <span className="text-zinc-400 shrink-0 ml-2">
                        {r.submittedAt ? timeAgo(r.submittedAt) : "—"}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <GrowthChart growth={members.growth} />
        </div>
        <div className="bg-white border border-zinc-200 p-5">
          <p className="font-sans font-black uppercase tracking-widest text-sm text-zinc-900 mb-4">
            Role Distribution
          </p>
          <div className="space-y-2.5">
            {roleDistribution
              .filter((r) => r.memberCount > 0)
              .map((role) => (
                <Link
                  key={role.name}
                  href={`/admin/roles/${role.name}`}
                  className="flex items-center justify-between hover:bg-zinc-50 -mx-1 px-1 rounded transition-colors"
                >
                  <span className="font-mono text-xs text-zinc-600 truncate">
                    {role.displayName || role.name}
                  </span>
                  <span className="font-mono text-xs font-bold text-zinc-900">
                    {role.memberCount}
                  </span>
                </Link>
              ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ReflectionsTrendChart trend={reflectionsTrend} />
        <div className="bg-white border border-zinc-200 p-5 space-y-4">
          <p className="font-sans font-black uppercase tracking-widest text-sm text-zinc-900">
            Member Composition
          </p>
          <CompositionList title="Experience Level" buckets={memberComposition.byExperienceLevel} />
          <CompositionList title="Discipline" buckets={memberComposition.byDiscipline} />
          <CompositionList title="Referral Source" buckets={memberComposition.byReferralSource} />
        </div>
      </div>

      <div className="bg-white border border-zinc-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="font-sans font-black uppercase tracking-widest text-sm text-zinc-900">
            Recent Activity
          </p>
          <Link
            href="/activity"
            className="font-mono text-[10px] uppercase tracking-wider text-zinc-400 hover:text-zinc-900 transition-colors"
          >
            View All
          </Link>
        </div>
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {recentActivity.map((entry, i) => (
            <Link
              href={`/admin/members/${entry.user.username}`}
              // biome-ignore lint/suspicious/noArrayIndexKey: feed entries have no stable id
              key={i}
              className="flex items-center justify-between gap-4 text-sm border-b border-zinc-100 last:border-0 pb-3 last:pb-0 hover:bg-zinc-50 -mx-1 px-1 rounded transition-colors"
            >
              <div className="min-w-0">
                <p className="font-mono text-xs text-zinc-900 truncate">
                  <span className="font-bold">{entry.user.username}</span> — {entry.eventLabel}
                </p>
                {entry.detail && (
                  <p className="font-mono text-[11px] text-zinc-400 truncate">{entry.detail}</p>
                )}
              </div>
              <span className="font-mono text-[10px] text-zinc-400 shrink-0">
                {timeAgo(entry.createdAt)}
              </span>
            </Link>
          ))}
          {recentActivity.length === 0 && (
            <p className="font-mono text-xs text-zinc-400">No recent activity.</p>
          )}
        </div>
      </div>
    </div>
  );
}

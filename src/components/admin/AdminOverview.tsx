"use client";

import {
  Activity as ActivityIcon,
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  BriefcaseBusiness,
  CheckCircle2,
  ClipboardCheck,
  GitPullRequest,
  KeyRound,
  Link2,
  LogIn,
  LogOut,
  Mail,
  MessageCircle,
  Minus,
  MoonStar,
  Pencil,
  ShieldCheck,
  TrendingUp,
  UserCog,
  Users,
  Users2,
} from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminOverview } from "@/hooks/useAdmin";
import type {
  AdminOverviewActivityEntry,
  AdminOverviewCompositionBucket,
  AdminOverviewRoleDistribution,
} from "@/types/admin-overview.types";

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

function formatWeekLabel(iso: string): string {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(iso));
}

// ─── Activity feed icon categorization ─────────────────────────────────────
// Grouped by prefix/keyword rather than one branch per exact event type —
// the enum has 40+ values, but they fall into a handful of visual buckets.
const ACTIVITY_ICON_RULES: Array<{
  test: (t: string) => boolean;
  icon: React.ElementType;
  badgeClassName: string;
}> = [
  {
    test: (t) => t === "account_flagged",
    icon: AlertTriangle,
    badgeClassName: "bg-red-50 text-red-600",
  },
  {
    test: (t) => t.includes("changes_requested") || t === "career_progression_revoked",
    icon: AlertTriangle,
    badgeClassName: "bg-amber-50 text-amber-600",
  },
  {
    test: (t) => t.includes("approved") || t === "account_flag_resolved" || t === "email_verified",
    icon: CheckCircle2,
    badgeClassName: "bg-emerald-50 text-emerald-600",
  },
  {
    test: (t) => t.startsWith("role_"),
    icon: ShieldCheck,
    badgeClassName: "bg-violet-50 text-violet-600",
  },
  {
    test: (t) => t.startsWith("team_"),
    icon: Users2,
    badgeClassName: "bg-violet-50 text-violet-600",
  },
  {
    test: (t) => t.startsWith("review_"),
    icon: GitPullRequest,
    badgeClassName: "bg-zinc-100 text-zinc-600",
  },
  {
    test: (t) => t.startsWith("reflection_"),
    icon: ClipboardCheck,
    badgeClassName: "bg-zinc-100 text-zinc-600",
  },
  {
    test: (t) => t.startsWith("career_progression_"),
    icon: BriefcaseBusiness,
    badgeClassName: "bg-zinc-100 text-zinc-600",
  },
  {
    test: (t) => t.startsWith("user_suspended") || t === "user_deleted",
    icon: UserCog,
    badgeClassName: "bg-red-50 text-red-600",
  },
  {
    test: (t) => t.startsWith("user_"),
    icon: UserCog,
    badgeClassName: "bg-zinc-100 text-zinc-600",
  },
  {
    test: (t) => t === "profile_updated" || t === "avatar_updated" || t === "username_changed",
    icon: Pencil,
    badgeClassName: "bg-zinc-100 text-zinc-600",
  },
  {
    test: (t) => t === "session_revoked" || t === "all_sessions_revoked" || t === "logout",
    icon: LogOut,
    badgeClassName: "bg-zinc-100 text-zinc-600",
  },
  {
    test: (t) => t === "login" || t === "register" || t === "token_refresh",
    icon: LogIn,
    badgeClassName: "bg-zinc-100 text-zinc-600",
  },
  {
    test: (t) => t.startsWith("password_") || t.startsWith("api_key_"),
    icon: KeyRound,
    badgeClassName: "bg-zinc-100 text-zinc-600",
  },
  {
    test: (t) => t.startsWith("oauth_"),
    icon: Link2,
    badgeClassName: "bg-zinc-100 text-zinc-600",
  },
  {
    test: (t) => t === "discord_linked",
    icon: MessageCircle,
    badgeClassName: "bg-violet-50 text-violet-600",
  },
];

function activityIconFor(eventType: string) {
  return (
    ACTIVITY_ICON_RULES.find((rule) => rule.test(eventType)) ?? {
      icon: ActivityIcon,
      badgeClassName: "bg-zinc-100 text-zinc-600",
    }
  );
}

// ─── Small building blocks ──────────────────────────────────────────────────

function SectionHeader({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="mb-4 flex items-center gap-2.5">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center bg-zinc-950 text-white">
        <Icon className="h-3.5 w-3.5" />
      </div>
      <p className="font-sans text-sm font-black uppercase tracking-widest text-zinc-900">
        {title}
      </p>
    </div>
  );
}

function TrendBadge({ delta }: { delta: number | null }) {
  if (delta === null) return null;
  if (delta === 0) {
    return (
      <span className="inline-flex items-center gap-0.5 font-mono text-[10px] font-bold text-zinc-400">
        <Minus className="h-2.5 w-2.5" />
        0%
      </span>
    );
  }
  const isUp = delta > 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 font-mono text-[10px] font-bold ${
        isUp ? "text-emerald-600" : "text-red-500"
      }`}
    >
      {isUp ? <ArrowUp className="h-2.5 w-2.5" /> : <ArrowDown className="h-2.5 w-2.5" />}
      {Math.abs(delta)}%
    </span>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  trend,
  tone = "default",
  href,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  trend?: number | null;
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
      {(sub || trend !== undefined) && (
        <div className="flex items-center gap-2">
          {sub && <p className="font-mono text-xs text-zinc-400">{sub}</p>}
          {trend !== undefined && <TrendBadge delta={trend} />}
        </div>
      )}
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
  const total = growth.reduce((sum, g) => sum + g.count, 0);

  return (
    <div className="bg-white border border-zinc-200 p-5 h-full">
      <div className="mb-4 flex items-start justify-between gap-3">
        <SectionHeader icon={TrendingUp} title="Member Growth" />
        <p className="font-mono text-[11px] text-zinc-400">
          <span className="font-bold text-zinc-900">{total}</span> new in 12 weeks
        </p>
      </div>
      <div className="flex items-end gap-1.5 h-28">
        {growth.map((point, i) => (
          <div key={point.weekStart} className="flex-1 flex flex-col items-center gap-1.5 group">
            <div className="w-full flex items-end justify-center h-20 relative">
              <span className="absolute -top-4 font-mono text-[9px] font-bold text-zinc-400 opacity-0 transition-opacity group-hover:opacity-100">
                {point.count}
              </span>
              <div
                className="w-full rounded-t-sm bg-zinc-800 transition-colors group-hover:bg-zinc-950"
                style={{ height: `${Math.max(4, (point.count / max) * 100)}%` }}
              />
            </div>
            <span
              className={`font-mono text-[8px] text-zinc-400 ${i % 2 === 1 ? "invisible sm:visible" : ""}`}
            >
              {formatWeekLabel(point.weekStart)}
            </span>
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
  return (
    <div className="bg-white border border-zinc-200 p-5 h-full flex flex-col">
      <SectionHeader icon={ClipboardCheck} title="Reflection Participation Trend" />
      {trend.length === 0 ? (
        <p className="font-mono text-xs text-zinc-400">No reflection cycles yet.</p>
      ) : (
        <div className="flex items-end gap-2 h-28">
          {trend.map((point) => (
            <div key={point.period} className="flex-1 flex flex-col items-center gap-1.5 group">
              <div className="w-full flex items-end justify-center h-20 relative">
                <span className="absolute -top-4 font-mono text-[9px] font-bold text-zinc-400 opacity-0 transition-opacity group-hover:opacity-100">
                  {Math.round(point.participationRate * 100)}%
                </span>
                <div
                  className="w-full rounded-t-sm bg-emerald-500 transition-colors group-hover:bg-emerald-600"
                  style={{ height: `${Math.max(4, point.participationRate * 100)}%` }}
                />
              </div>
              <span className="font-mono text-[9px] text-zinc-400">
                {new Date(point.period).toLocaleDateString("en-US", { month: "short" })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function BarList({
  items,
}: {
  items: { key: string; label: string; count: number; href?: string }[];
}) {
  const max = Math.max(1, ...items.map((b) => b.count));
  if (items.length === 0) {
    return <p className="font-mono text-xs text-zinc-400">No data yet.</p>;
  }
  return (
    <div className="space-y-1.5">
      {items.map((item) => {
        const row = (
          <>
            <span className="font-mono text-[11px] text-zinc-600 w-28 truncate shrink-0">
              {item.label}
            </span>
            <div className="flex-1 h-3 bg-zinc-100">
              <div
                className="h-full bg-zinc-900 transition-all"
                style={{ width: `${(item.count / max) * 100}%` }}
              />
            </div>
            <span className="font-mono text-[11px] font-bold text-zinc-900 w-6 text-right shrink-0">
              {item.count}
            </span>
          </>
        );
        if (item.href) {
          return (
            <Link
              key={item.key}
              href={item.href}
              className="flex items-center gap-2 -mx-1 px-1 rounded transition-colors hover:bg-zinc-50"
            >
              {row}
            </Link>
          );
        }
        return (
          <div key={item.key} className="flex items-center gap-2">
            {row}
          </div>
        );
      })}
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
  return (
    <div>
      <p className="font-mono text-[10px] font-black uppercase tracking-[0.15em] text-zinc-400 mb-2">
        {title}
      </p>
      <BarList
        items={buckets.map((b) => ({
          key: b.value ?? "unspecified",
          label: b.label ?? (b.value ? titleCase(b.value) : "Unspecified"),
          count: b.count,
        }))}
      />
    </div>
  );
}

function RoleDistributionCard({ roles }: { roles: AdminOverviewRoleDistribution[] }) {
  const active = roles
    .filter((r) => r.memberCount > 0)
    .sort((a, b) => b.memberCount - a.memberCount);

  return (
    <div className="bg-white border border-zinc-200 p-5">
      <SectionHeader icon={Users} title="Role Distribution" />
      <BarList
        items={active.map((role) => ({
          key: role.name,
          label: role.displayName || role.name,
          count: role.memberCount,
          href: `/admin/roles/${role.name}`,
        }))}
      />
    </div>
  );
}

function ActivityRow({ entry }: { entry: AdminOverviewActivityEntry }) {
  const { icon: Icon, badgeClassName } = activityIconFor(entry.eventType);
  return (
    <Link
      href={`/admin/members/${entry.user.username}`}
      className="flex items-center gap-3 border-b border-zinc-100 last:border-0 pb-3 last:pb-0 -mx-1 px-1 rounded transition-colors hover:bg-zinc-50"
    >
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center ${badgeClassName}`}>
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-mono text-xs text-zinc-900 truncate">
          <span className="font-bold">{entry.user.username}</span> {entry.eventLabel}
        </p>
        {entry.detail && (
          <p className="font-mono text-[11px] text-zinc-400 truncate">{entry.detail}</p>
        )}
      </div>
      <span className="font-mono text-[10px] text-zinc-400 shrink-0">
        {timeAgo(entry.createdAt)}
      </span>
    </Link>
  );
}

// ─── Loading skeleton (roughly matches the real layout) ────────────────────

function OverviewSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton placeholders
          <Skeleton key={i} className="h-28 w-full" />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton placeholders
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Skeleton className="h-52 w-full lg:col-span-2" />
        <Skeleton className="h-52 w-full" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Skeleton className="h-52 w-full" />
        <Skeleton className="h-52 w-full" />
      </div>
      <Skeleton className="h-80 w-full" />
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export function AdminOverview() {
  const { data, isLoading } = useAdminOverview();

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <div>
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
            Admin Panel
          </p>
          <h1 className="font-sans text-3xl font-black uppercase tracking-tight text-zinc-950">
            Overview
          </h1>
        </div>
        <OverviewSkeleton />
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

  // Week-over-week delta for the Total Members trend badge, derived from
  // the same 12-week growth series already fetched — no extra backend call.
  const lastWeek = members.growth.at(-1)?.count ?? 0;
  const priorWeek = members.growth.at(-2)?.count ?? 0;
  const weekOverWeek =
    priorWeek > 0
      ? Math.round(((lastWeek - priorWeek) / priorWeek) * 100)
      : lastWeek > 0
        ? 100
        : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
            Admin Panel
          </p>
          <h1 className="font-sans text-3xl font-black uppercase tracking-tight text-zinc-950">
            Overview
          </h1>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-400">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
          </span>
          Live
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="Total Members"
          value={members.total.toLocaleString()}
          sub={`+${members.new7d} this week`}
          trend={weekOverWeek}
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
          href="/admin/teams"
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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={ShieldCheck}
          label="Onboarding Rate"
          value={`${Math.round(members.onboardingRate * 100)}%`}
          sub={`${members.new30d} joined in 30d`}
        />
        <StatCard
          icon={MoonStar}
          label="Dormant Members"
          value={engagement.dormantMembers.toLocaleString()}
          sub="No login in 15+ days"
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
        <RoleDistributionCard roles={roleDistribution} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ReflectionsTrendChart trend={reflectionsTrend} />
        <div className="bg-white border border-zinc-200 p-5 space-y-4">
          <SectionHeader icon={Users2} title="Member Composition" />
          <CompositionList title="Experience Level" buckets={memberComposition.byExperienceLevel} />
          <CompositionList title="Discipline" buckets={memberComposition.byDiscipline} />
          <CompositionList title="Referral Source" buckets={memberComposition.byReferralSource} />
        </div>
      </div>

      <div className="bg-white border border-zinc-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <SectionHeader icon={ActivityIcon} title="Recent Activity" />
          <Link
            href="/activity"
            className="font-mono text-[10px] uppercase tracking-wider text-zinc-400 hover:text-zinc-900 transition-colors"
          >
            View All
          </Link>
        </div>
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {recentActivity.map((entry, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: feed entries have no stable id
            <ActivityRow key={i} entry={entry} />
          ))}
          {recentActivity.length === 0 && (
            <p className="font-mono text-xs text-zinc-400">No recent activity.</p>
          )}
        </div>
      </div>
    </div>
  );
}

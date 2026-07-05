"use client";

import {
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Compass,
  GitPullRequest,
  GraduationCap,
  Layers,
  MoonStar,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminOverview } from "@/hooks/useAdmin";
import type {
  AdminOverviewCompositionBucket,
  AdminOverviewOtherExample,
} from "@/types/admin-overview.types";

// Short labels for these compact bar lists -- the onboarding form's labels
// (e.g. "Social media (Twitter/X, LinkedIn, etc.)") are written to help
// someone pick the right dropdown option and are too long to read at a
// glance here.
const REFERRAL_SOURCE_DISPLAY_LABELS: Record<string, string> = {
  friend_referral: "Friend Referral",
  social_media: "Social Media",
  discord_discovery: "Discord",
  online_search: "Search",
  event_hackathon: "Event/Hackathon",
  newsletter_blog: "Newsletter/Blog",
  other: "Other",
};

const DISCIPLINE_DISPLAY_LABELS: Record<string, string> = {
  software_engineering: "Software Engineering",
  ux_ui_design: "UX/UI Design",
  data_science: "Data Science",
  ml_ai: "ML/AI",
  cybersecurity: "Cybersecurity",
  cloud_devops: "Cloud/DevOps",
  product_management: "Product Mgmt",
  hardware_embedded: "Hardware/Embedded",
  robotics_iot: "Robotics/IoT",
  mobile_development: "Mobile Dev",
  qa_testing: "QA/Testing",
  technical_writing: "Tech Writing",
  other: "Other",
};

function bucketLabel(displayLabels: Record<string, string>, value: string | null): string {
  if (!value) return "Unspecified";
  // Free text a member typed under "other" -- show it as-is, it's already readable.
  return displayLabels[value] ?? value;
}

// Shared header for every overview card: icon-in-a-square + bold title.
// Keep every new card on this pattern rather than one-off label styles.
function CardHeader({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center bg-zinc-950 text-white">
        <Icon className="h-3.5 w-3.5" />
      </div>
      <p className="font-sans text-base font-bold text-zinc-900">{title}</p>
    </div>
  );
}

function formatWeekLabel(iso: string): string {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(iso));
}

function TotalMembersCard({ total, new7d, href }: { total: number; new7d: number; href: string }) {
  return (
    <Link
      href={href}
      className="block bg-white border border-zinc-200 p-5 h-full transition-colors hover:border-zinc-400 hover:bg-zinc-50"
    >
      <div className="mb-4">
        <CardHeader icon={Users} title="Total Members" />
      </div>
      <p className="font-sans text-5xl font-black tracking-tight text-zinc-950">
        {total.toLocaleString()}
      </p>
      <p className="mt-1 font-mono text-xs text-zinc-400">+{new7d} this week</p>
    </Link>
  );
}

function DormantMembersCard({ count, href }: { count: number; href: string }) {
  const hasDormant = count > 0;
  return (
    <Link
      href={href}
      className={`block border p-5 h-full transition-colors ${
        hasDormant
          ? "border-red-200 bg-red-50/40 hover:border-red-300 hover:bg-red-50"
          : "border-zinc-200 bg-white hover:border-zinc-400 hover:bg-zinc-50"
      }`}
    >
      <div className="mb-4">
        <CardHeader icon={MoonStar} title="Dormant Members" />
      </div>
      <p
        className={`font-sans text-5xl font-black tracking-tight ${
          hasDormant ? "text-red-600" : "text-zinc-950"
        }`}
      >
        {count.toLocaleString()}
      </p>
      <p className="mt-1 font-mono text-xs text-zinc-400">No login in 15+ days</p>
    </Link>
  );
}

function GrowthChart({
  growth,
  href,
}: {
  growth: { weekStart: string; count: number }[];
  href: string;
}) {
  const max = Math.max(1, ...growth.map((g) => g.count));
  const total = growth.reduce((sum, g) => sum + g.count, 0);

  return (
    <Link
      href={href}
      className="block bg-white border border-zinc-200 p-5 transition-colors hover:border-zinc-400 hover:bg-zinc-50"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <CardHeader icon={TrendingUp} title="Member Growth" />
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
    </Link>
  );
}

function FlaggedAccountsCard({ count, href }: { count: number; href: string }) {
  const hasFlagged = count > 0;
  return (
    <Link
      href={href}
      className={`block border p-5 h-full transition-colors ${
        hasFlagged
          ? "border-red-200 bg-red-50/40 hover:border-red-300 hover:bg-red-50"
          : "border-zinc-200 bg-white hover:border-zinc-400 hover:bg-zinc-50"
      }`}
    >
      <div className="mb-4">
        <CardHeader icon={AlertTriangle} title="Flagged Accounts" />
      </div>
      <p
        className={`font-sans text-5xl font-black tracking-tight ${
          hasFlagged ? "text-red-600" : "text-zinc-950"
        }`}
      >
        {count.toLocaleString()}
      </p>
      <p className="mt-1 font-mono text-xs text-zinc-400">Awaiting your review</p>
    </Link>
  );
}

function ReviewThroughputCard({
  open,
  approved,
  closed,
  avgTimeToApproveDays,
  href,
}: {
  open: number;
  approved: number;
  closed: number;
  avgTimeToApproveDays: number | null;
  href: string;
}) {
  const tiles = [
    { key: "open", label: "Open", count: open },
    { key: "approved", label: "Approved", count: approved },
    { key: "closed", label: "Closed", count: closed },
  ];

  return (
    <Link
      href={href}
      className="block bg-white border border-zinc-200 p-5 transition-colors hover:border-zinc-400 hover:bg-zinc-50"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <CardHeader icon={GitPullRequest} title="Review Throughput" />
        {avgTimeToApproveDays !== null && (
          <p className="font-mono text-[11px] text-zinc-400">
            avg <span className="font-bold text-zinc-900">{avgTimeToApproveDays}d</span> to approve
          </p>
        )}
      </div>
      <div className="grid grid-cols-3 gap-4">
        {tiles.map((tile) => (
          <div key={tile.key}>
            <p className="font-sans text-3xl font-black tracking-tight text-zinc-950">
              {tile.count}
            </p>
            <p className="font-mono text-xs text-zinc-400">{tile.label}</p>
          </div>
        ))}
      </div>
    </Link>
  );
}

function JoinRequestApprovalCard({
  approved,
  declined,
  pending,
  approvalRate,
  href,
}: {
  approved: number;
  declined: number;
  pending: number;
  approvalRate: number;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="block bg-white border border-zinc-200 p-5 h-full transition-colors hover:border-zinc-400 hover:bg-zinc-50"
    >
      <div className="mb-4">
        <CardHeader icon={UserCheck} title="Join Request Approval" />
      </div>
      <p className="font-sans text-5xl font-black tracking-tight text-zinc-950">
        {Math.round(approvalRate * 100)}%
      </p>
      <p className="mt-1 font-mono text-xs text-zinc-400">
        {approved} approved · {declined} declined
        {pending > 0 && ` · ${pending} pending`}
      </p>
    </Link>
  );
}

function BreakdownCard({
  icon,
  title,
  buckets,
  otherExamples = [],
  labelFor,
}: {
  icon: React.ElementType;
  title: string;
  buckets: AdminOverviewCompositionBucket[];
  otherExamples?: AdminOverviewOtherExample[];
  labelFor: (value: string | null) => string;
}) {
  const [otherExpanded, setOtherExpanded] = useState(false);
  const sorted = [...buckets].sort((a, b) => b.count - a.count);
  const max = Math.max(1, ...sorted.map((b) => b.count));

  return (
    <div className="bg-white border border-zinc-200 p-5">
      <div className="mb-4">
        <CardHeader icon={icon} title={title} />
      </div>
      {sorted.length === 0 ? (
        <p className="font-mono text-xs text-zinc-400">No data yet.</p>
      ) : (
        <div className="space-y-2">
          {sorted.map((bucket) => {
            const label = bucket.label ?? labelFor(bucket.value);
            const isOther = bucket.value === "other" && otherExamples.length > 0;
            const row = (
              <>
                <span className="font-mono text-xs text-zinc-600 w-32 shrink-0 leading-snug flex items-center gap-1">
                  {isOther &&
                    (otherExpanded ? (
                      <ChevronDown className="h-3 w-3 shrink-0" />
                    ) : (
                      <ChevronRight className="h-3 w-3 shrink-0" />
                    ))}
                  {label}
                </span>
                <div className="flex-1 h-3 bg-zinc-100 mt-1">
                  <div
                    className="h-full bg-zinc-900 transition-all"
                    style={{ width: `${(bucket.count / max) * 100}%` }}
                  />
                </div>
                <span className="font-mono text-xs font-bold text-zinc-900 w-6 text-right shrink-0">
                  {bucket.count}
                </span>
              </>
            );

            return (
              <div key={bucket.value ?? "unspecified"}>
                {isOther ? (
                  <button
                    type="button"
                    onClick={() => setOtherExpanded((v) => !v)}
                    className="flex w-full items-start gap-3 text-left hover:bg-zinc-50 transition-colors"
                  >
                    {row}
                  </button>
                ) : (
                  <div className="flex items-start gap-3">{row}</div>
                )}
                {isOther && otherExpanded && (
                  <div className="mt-2 ml-4 space-y-1 border-l border-zinc-200 pl-3">
                    {otherExamples.map((example) => (
                      <div
                        key={example.text}
                        className="flex items-center justify-between gap-3 font-mono text-[11px] text-zinc-500"
                      >
                        <span className="truncate">{example.text}</span>
                        <span className="font-bold text-zinc-700 shrink-0">{example.count}</span>
                      </div>
                    ))}
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

// ─── Page ────────────────────────────────────────────────────────────────────

export function AdminOverview() {
  const { data, isLoading } = useAdminOverview();

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <div>
          <p className="font-mono text-xs font-medium text-zinc-400">Admin Panel</p>
          <h1 className="font-sans text-4xl font-bold tracking-tight text-zinc-950">Overview</h1>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full sm:col-span-2" />
        </div>
      </div>
    );
  }

  const {
    members,
    engagement,
    memberComposition,
    contributionPipeline,
    pendingActions,
    teamHealth,
  } = data;

  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-xs font-medium text-zinc-400">Admin Panel</p>
        <h1 className="font-sans text-4xl font-bold tracking-tight text-zinc-950">Overview</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
        <TotalMembersCard total={members.total} new7d={members.new7d} href="/admin/members" />
        <DormantMembersCard
          count={engagement.dormantMembers}
          href="/admin/members?status=dormant"
        />
        <FlaggedAccountsCard
          count={pendingActions.flaggedAccounts}
          href="/admin/members?status=flagged"
        />
        <div className="sm:col-span-2">
          <GrowthChart growth={members.growth} href="/admin/members" />
        </div>
      </div>

      <BreakdownCard
        icon={Compass}
        title="Referral Source"
        buckets={memberComposition.byReferralSource}
        otherExamples={memberComposition.referralSourceOtherExamples}
        labelFor={(value) => bucketLabel(REFERRAL_SOURCE_DISPLAY_LABELS, value)}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <BreakdownCard
          icon={Layers}
          title="Discipline"
          buckets={memberComposition.byDiscipline}
          otherExamples={memberComposition.disciplineOtherExamples}
          labelFor={(value) => bucketLabel(DISCIPLINE_DISPLAY_LABELS, value)}
        />
        <BreakdownCard
          icon={GraduationCap}
          title="Experience Level"
          buckets={memberComposition.byExperienceLevel}
          labelFor={(value) => value ?? "Unspecified"}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ReviewThroughputCard
          open={contributionPipeline.reviews.open}
          approved={contributionPipeline.reviews.approved}
          closed={contributionPipeline.reviews.closed}
          avgTimeToApproveDays={contributionPipeline.reviews.avgTimeToApproveDays}
          href="/admin/teams"
        />
        <JoinRequestApprovalCard
          approved={teamHealth.joinRequests.approved}
          declined={teamHealth.joinRequests.declined}
          pending={teamHealth.joinRequests.pending}
          approvalRate={teamHealth.joinRequests.approvalRate}
          href="/admin/teams"
        />
      </div>
    </div>
  );
}

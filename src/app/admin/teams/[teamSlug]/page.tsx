"use client";

import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Circle,
  Crown,
  FileText,
  MessageSquare,
  Pencil,
  RotateCcw,
  ShieldCheck,
  Tag,
  UserPlus,
  Users2,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { Skeleton } from "@/components/ui/skeleton";
import { useTeam, useTeamActivity, useTeamMembers, useTeamReviews } from "@/hooks/useTeams";
import { getAvatarUrl } from "@/lib/utils";
import type { ActivityItem } from "@/services/teams.service";

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(
    new Date(iso)
  );
}

function relativeTime(iso: string): string {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (Number.isNaN(s)) return "";
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86_400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 604_800) return `${Math.floor(s / 86_400)}d ago`;
  return formatDate(iso);
}

// ─── Activity feed helpers (self-contained admin-side copy; the personal
// TeamOverviewTab lives under the (portal) route group and stays out of
// the admin section entirely) ────────────────────────────────────────────

function describeActivity(item: ActivityItem): string {
  switch (item.type) {
    case "review_opened":
      return "opened";
    case "status_changed":
      if (item.context.to === "approved") return "approved";
      if (item.context.to === "closed") return "closed";
      if (item.context.to === "changes_requested") return "requested changes on";
      if (item.context.to === "open") return "reopened";
      return "updated the status of";
    case "commented":
      return "commented on";
    case "assigned":
    case "unassigned":
      return "updated assignees on";
    case "labeled":
      return "labeled";
    case "unlabeled":
      return "removed a label from";
    case "review_edited":
      return "edited";
    case "member_joined":
      return "joined the team";
    default:
      return "updated";
  }
}

function ActivityIcon({ item }: { item: ActivityItem }) {
  const base = "h-4 w-4 shrink-0 text-zinc-400";
  switch (item.type) {
    case "status_changed":
      if (item.context.to === "approved") return <Check className={base} />;
      if (item.context.to === "closed") return <XCircle className={base} />;
      if (item.context.to === "open") return <RotateCcw className={base} />;
      return <Pencil className={base} />;
    case "commented":
      return <MessageSquare className={base} />;
    case "labeled":
    case "unlabeled":
      return <Tag className={base} />;
    case "member_joined":
      return <UserPlus className={base} />;
    default:
      return <Pencil className={base} />;
  }
}

function ReviewStatusPill({ status }: { status: string }) {
  const meta: Record<string, { icon: typeof Circle; className: string; label: string }> = {
    open: { icon: Circle, className: "bg-zinc-900 text-white", label: "Open" },
    approved: { icon: CheckCircle2, className: "bg-emerald-600 text-white", label: "Approved" },
    closed: { icon: XCircle, className: "bg-zinc-400 text-white", label: "Closed" },
  };
  const { icon: Icon, className, label } = meta[status] ?? meta.open;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-widest ${className}`}
    >
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}

function RoleBadge({ role }: { role: string }) {
  if (role === "owner") {
    return (
      <span className="inline-flex items-center gap-1 border border-amber-200 bg-amber-50 px-2 py-1 font-mono text-[9px] font-black uppercase tracking-widest text-amber-700">
        <Crown className="h-3 w-3" />
        Owner
      </span>
    );
  }
  if (role === "lead") {
    return (
      <span className="inline-flex items-center gap-1 border border-violet-200 bg-violet-50 px-2 py-1 font-mono text-[9px] font-black uppercase tracking-widest text-violet-700">
        <ShieldCheck className="h-3 w-3" />
        Lead
      </span>
    );
  }
  return null;
}

function AdminTeamDetailContent() {
  const { teamSlug } = useParams<{ teamSlug: string }>();
  const { data: team, isLoading: teamLoading, isError: teamError } = useTeam(teamSlug);
  const { data: members, isLoading: membersLoading } = useTeamMembers(teamSlug);
  const { data: reviews, isLoading: reviewsLoading } = useTeamReviews(teamSlug);
  const { data: activity, isLoading: activityLoading } = useTeamActivity(teamSlug);

  const owners = members?.filter((m) => m.role === "owner") ?? [];
  const leads = members?.filter((m) => m.role === "lead") ?? [];
  const regularMembers = members?.filter((m) => m.role === "member") ?? [];

  if (teamLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-28" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (teamError || !team) {
    return (
      <div className="flex flex-col items-center justify-center py-24 border border-zinc-200 bg-white text-center">
        <p className="font-mono text-sm text-zinc-500">Team not found.</p>
        <Link
          href="/admin/teams"
          className="mt-4 font-mono text-xs uppercase tracking-widest text-zinc-400 hover:text-zinc-900 transition-colors"
        >
          ← Back to Teams
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href="/admin/teams"
        className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-zinc-400 transition-colors hover:text-zinc-900"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        All Teams
      </Link>

      <div className="border border-zinc-200 bg-white p-6">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
          Admin Panel · Team
        </p>
        <h1 className="mt-1 font-sans text-3xl font-black uppercase tracking-tight text-zinc-950">
          {team.name}
        </h1>
        {team.description && (
          <p className="mt-2 max-w-2xl font-mono text-sm leading-6 text-zinc-500">
            {team.description}
          </p>
        )}
        <div className="mt-4 flex flex-wrap gap-6 border-t border-zinc-100 pt-4">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-400">
              Members
            </p>
            <p className="font-sans text-lg font-black text-zinc-950">{team.memberCount ?? 0}</p>
          </div>
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-400">
              Leads
            </p>
            <p className="font-sans text-lg font-black text-zinc-950">{leads.length}</p>
          </div>
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-400">
              Reviews
            </p>
            <p className="font-sans text-lg font-black text-zinc-950">{reviews?.length ?? 0}</p>
          </div>
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-400">
              Created
            </p>
            <p className="font-sans text-lg font-black text-zinc-950">
              {formatDate(team.createdAt)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Members */}
        <div className="border border-zinc-200 bg-white">
          <div className="flex items-center gap-2.5 border-b border-zinc-100 px-5 py-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center bg-zinc-950 text-white">
              <Users2 className="h-3.5 w-3.5" />
            </div>
            <p className="font-sans text-sm font-black uppercase tracking-widest text-zinc-900">
              Members
            </p>
          </div>

          {membersLoading ? (
            <div className="space-y-2 p-5">
              {Array.from({ length: 4 }).map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton placeholders
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : members?.length === 0 ? (
            <p className="p-5 font-mono text-xs text-zinc-400">No members yet.</p>
          ) : (
            <div className="divide-y divide-zinc-100 max-h-96 overflow-y-auto">
              {[...owners, ...leads, ...regularMembers].map((member) => (
                <Link
                  key={member.id}
                  href={`/admin/members/${member.user.username}`}
                  className="flex items-center justify-between gap-3 p-4 transition-colors hover:bg-zinc-50"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    {/* biome-ignore lint/performance/noImgElement: user avatar */}
                    <img
                      src={getAvatarUrl(member.user.profilePictureUrl, member.user.fullName)}
                      alt={member.user.fullName}
                      className="h-9 w-9 shrink-0 rounded-full object-cover"
                    />
                    <div className="min-w-0">
                      <p className="truncate font-sans text-sm font-bold text-zinc-950">
                        {member.user.fullName}
                      </p>
                      <p className="truncate font-mono text-xs text-zinc-400">
                        @{member.user.username}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <RoleBadge role={member.role} />
                    <span className="font-mono text-[9px] text-zinc-400">
                      Joined {formatDate(member.joinedAt)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Activity */}
        <div className="border border-zinc-200 bg-white">
          <div className="flex items-center gap-2.5 border-b border-zinc-100 px-5 py-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center bg-zinc-950 text-white">
              <FileText className="h-3.5 w-3.5" />
            </div>
            <p className="font-sans text-sm font-black uppercase tracking-widest text-zinc-900">
              Activity
            </p>
          </div>

          {activityLoading ? (
            <div className="space-y-2 p-5">
              {Array.from({ length: 4 }).map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton placeholders
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : !activity || activity.length === 0 ? (
            <p className="p-5 font-mono text-xs text-zinc-400">No activity yet.</p>
          ) : (
            <div className="divide-y divide-zinc-100 max-h-96 overflow-y-auto">
              {activity.map((item) => (
                <div key={item.id} className="flex items-start gap-3 p-4">
                  {/* biome-ignore lint/performance/noImgElement: user avatar */}
                  <img
                    src={getAvatarUrl(item.actor.profilePictureUrl, item.actor.fullName)}
                    alt=""
                    className="mt-0.5 h-6 w-6 shrink-0 rounded-full object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-xs leading-5 text-zinc-600">
                      <span className="font-bold text-zinc-900">{item.actor.fullName}</span>{" "}
                      {describeActivity(item)}{" "}
                      {item.review && (
                        <Link
                          href={`/teams/${teamSlug}/reviews/${item.review.id}`}
                          className="font-bold text-zinc-900 hover:underline"
                        >
                          {item.review.title}
                        </Link>
                      )}
                    </p>
                    <p className="mt-0.5 font-mono text-[10px] text-zinc-400">
                      {relativeTime(item.createdAt)}
                    </p>
                  </div>
                  <ActivityIcon item={item} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      <div className="border border-zinc-200 bg-white">
        <div className="flex items-center gap-2.5 border-b border-zinc-100 px-5 py-3">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center bg-zinc-950 text-white">
            <FileText className="h-3.5 w-3.5" />
          </div>
          <p className="font-sans text-sm font-black uppercase tracking-widest text-zinc-900">
            Reviews
          </p>
        </div>

        {reviewsLoading ? (
          <div className="space-y-2 p-5">
            {Array.from({ length: 3 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton placeholders
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : !reviews || reviews.length === 0 ? (
          <p className="p-5 font-mono text-xs text-zinc-400">No reviews yet.</p>
        ) : (
          <div className="divide-y divide-zinc-100">
            {reviews.map((review) => (
              <Link
                key={review.id}
                href={`/teams/${teamSlug}/reviews/${review.id}`}
                className="flex items-center justify-between gap-4 p-4 transition-colors hover:bg-zinc-50"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-sans text-sm font-bold text-zinc-950">
                    {review.title}
                  </p>
                  <p className="mt-0.5 font-mono text-[11px] text-zinc-400">
                    @{review.author.username} · {formatDate(review.createdAt)} ·{" "}
                    {review.commentsCount} comment{review.commentsCount !== 1 ? "s" : ""}
                  </p>
                </div>
                <ReviewStatusPill status={review.status} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminTeamDetailPage() {
  return (
    <RouteGuard permission="admin.panel.access">
      <AdminTeamDetailContent />
    </RouteGuard>
  );
}

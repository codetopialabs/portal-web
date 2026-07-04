"use client";

import {
  Check,
  GitPullRequestArrow,
  MessageSquare,
  Pencil,
  RotateCcw,
  Tag,
  UserPlus,
  Users,
  X,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Skeleton } from "@/components/ui/skeleton";
import { useAcceptInvite, useDeclineInvite, useTeamActivity } from "@/hooks/useTeams";
import { getAvatarUrl } from "@/lib/utils";
import type { ActivityItem, TeamInvite } from "@/services/teams.service";

interface TeamOverviewTabProps {
  teamSlug: string;
  teamName: string;
  myInvite: TeamInvite | undefined;
}

function relativeTime(iso: string) {
  const d = new Date(iso);
  const s = (Date.now() - d.getTime()) / 1000;
  if (Number.isNaN(s)) return "";
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86_400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 604_800) return `${Math.floor(s / 86_400)}d ago`;
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(d);
}

function describe(item: ActivityItem): string {
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

function FeedIcon({ item }: { item: ActivityItem }) {
  const base = "h-4 w-4 shrink-0";
  switch (item.type) {
    case "review_opened":
      return <GitPullRequestArrow className={`${base} text-zinc-900`} />;
    case "status_changed":
      if (item.context.to === "approved") return <Check className={`${base} text-zinc-600`} />;
      if (item.context.to === "closed") return <XCircle className={`${base} text-text-muted`} />;
      if (item.context.to === "open") return <RotateCcw className={`${base} text-zinc-900`} />;
      return <Pencil className={`${base} text-icon-tertiary`} />;
    case "commented":
      return <MessageSquare className={`${base} text-icon-tertiary`} />;
    case "labeled":
    case "unlabeled":
      return <Tag className={`${base} text-icon-tertiary`} />;
    case "member_joined":
      return <UserPlus className={`${base} text-icon-tertiary`} />;
    default:
      return <Pencil className={`${base} text-icon-tertiary`} />;
  }
}

function InviteBanner({
  teamSlug,
  teamName,
  invite,
}: {
  teamSlug: string;
  teamName: string;
  invite: TeamInvite;
}) {
  const { mutate: accept, isPending: accepting } = useAcceptInvite(teamSlug);
  const { mutate: decline, isPending: declining } = useDeclineInvite(teamSlug);
  return (
    <div className="flex flex-col justify-between gap-4 border border-emerald-600 bg-emerald-600 p-4 sm:flex-row sm:items-center">
      <div>
        <h3 className="font-sans text-sm font-black text-white">You've been invited</h3>
        <p className="mt-1 font-mono text-xs text-emerald-100">
          {invite.invitedBy?.fullName} invited you to join {teamName}.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <ConfirmModal
          title="Decline invite"
          description={`Decline the invitation to join ${teamName}?`}
          confirmText="Decline"
          onConfirm={() => decline(invite.id)}
          isLoading={declining}
        >
          <Button
            variant="outline"
            size="sm"
            disabled={accepting || declining}
            className="h-9 rounded-none border-white bg-transparent font-mono text-xs font-bold text-white hover:bg-emerald-700 hover:border-emerald-700"
          >
            <X className="mr-1.5 h-3.5 w-3.5" />
            Decline
          </Button>
        </ConfirmModal>
        <Button
          size="sm"
          onClick={() => accept(invite.id)}
          disabled={accepting || declining}
          className="h-9 rounded-none bg-white font-mono text-xs font-bold text-emerald-700 hover:bg-emerald-50"
        >
          <Check className="mr-1.5 h-3.5 w-3.5" />
          Accept
        </Button>
      </div>
    </div>
  );
}

export function TeamOverviewTab({ teamSlug, teamName, myInvite }: TeamOverviewTabProps) {
  const { data: feed, isLoading } = useTeamActivity(teamSlug);

  return (
    <div className="space-y-6">
      {myInvite && <InviteBanner teamSlug={teamSlug} teamName={teamName} invite={myInvite} />}

      <section className="border border-grey-200 bg-white">
        <div className="flex items-center justify-between gap-4 border-b border-grey-200 bg-grey-50 px-5 py-3">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-icon-tertiary" />
            <h2 className="font-sans text-base font-bold text-text-primary">Activity</h2>
          </div>
          <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-text-muted">
            <span className="h-1.5 w-1.5 animate-pulse bg-zinc-900" />
            Live
          </span>
        </div>

        {isLoading ? (
          <div className="space-y-3 p-5">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-10 w-full rounded-none" />
            ))}
          </div>
        ) : !feed || feed.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="font-mono text-xs text-text-muted">
              No activity yet. Open a review to get things moving.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-grey-100">
            {feed.map((item) => (
              <div key={item.id} className="flex items-start gap-3 px-5 py-3">
                <Image
                  src={getAvatarUrl(item.actor.profilePictureUrl, item.actor.fullName)}
                  alt=""
                  width={24}
                  height={24}
                  className="mt-0.5 h-6 w-6 shrink-0 border border-grey-200 object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-xs leading-5 text-text-secondary">
                    <span className="font-bold text-text-primary">{item.actor.fullName}</span>{" "}
                    {describe(item)}{" "}
                    {item.review && (
                      <Link
                        href={`/teams/${teamSlug}/reviews/${item.review.id}`}
                        className="font-bold text-text-primary hover:underline"
                      >
                        {item.review.title}
                      </Link>
                    )}
                  </p>
                  {item.context.snippet && (
                    <p className="mt-0.5 truncate font-mono text-[11px] italic text-text-muted">
                      "{item.context.snippet}"
                    </p>
                  )}
                  <p className="mt-0.5 font-mono text-[10px] text-text-muted">
                    {relativeTime(item.createdAt)}
                  </p>
                </div>
                <FeedIcon item={item} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

"use client";

import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  FileText,
  Loader2,
  UserPlus,
  Users,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { DashboardShell } from "@/components/dashboard/Shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useMyMembership,
  useSendInvite,
  useTeam,
  useTeamMembers,
  useTeamReviews,
} from "@/hooks/useTeams";
import { getAvatarUrl } from "@/lib/utils";

export default function TeamDashboardPage() {
  const { teamId } = useParams<{ teamId: string }>();
  return (
    <RouteGuard permission={`teams.view:${teamId}`}>
      <TeamDashboardContent />
    </RouteGuard>
  );
}

function TeamDashboardContent() {
  const { teamId } = useParams<{ teamId: string }>();

  const { data: team, isLoading: teamLoading, isError: teamError } = useTeam(teamId);
  const { data: members, isLoading: membersLoading } = useTeamMembers(teamId);
  const { data: membership } = useMyMembership(teamId);
  const { data: reviews, isLoading: reviewsLoading } = useTeamReviews(teamId);

  const isLead = membership?.role === "lead";
  const recentReviews = reviews?.slice(0, 5) ?? [];

  const [showInvite, setShowInvite] = useState(false);
  const [inviteUsername, setInviteUsername] = useState("");
  const { mutate: sendInvite, isPending: invitePending } = useSendInvite(teamId);

  function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteUsername.trim()) return;
    sendInvite(inviteUsername.trim(), {
      onSuccess: () => {
        setInviteUsername("");
        setShowInvite(false);
      },
    });
  }

  if (teamLoading) {
    return (
      <DashboardShell>
        <div className="w-full max-w-none space-y-6 pb-20">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-32 w-full" />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="md:col-span-2">
              <Skeleton className="h-64 w-full" />
            </div>
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </DashboardShell>
    );
  }

  if (teamError || !team) {
    return (
      <DashboardShell>
        <div className="flex flex-col items-center justify-center py-24 border border-zinc-200 bg-white text-center">
          <p className="font-mono text-sm text-zinc-500">
            Team not found or you don't have access.
          </p>
          <Link
            href="/teams"
            className="mt-4 font-mono text-xs uppercase tracking-widest text-zinc-400 hover:text-zinc-900 transition-colors"
          >
            ← Back to Teams
          </Link>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="w-full max-w-none space-y-6 pb-20">
        {/* Back */}
        <Link
          href="/teams"
          className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-zinc-400 transition-colors hover:text-zinc-900"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          All Teams
        </Link>

        {/* Team Header */}
        <div className="border-b border-zinc-200 pb-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <p className="font-mono text-[10px] font-black uppercase tracking-[0.24em] text-zinc-400">
                  Team Workspace
                </p>
                {membership && (
                  <Badge
                    variant="outline"
                    className="font-mono text-[10px] uppercase tracking-widest rounded-none"
                  >
                    {isLead ? "Lead" : team.memberTagName}
                  </Badge>
                )}
              </div>
              <h1 className="mt-2 font-sans text-3xl font-black uppercase tracking-tight text-zinc-950">
                {team.name}
              </h1>
              {team.description && (
                <p className="mt-2 max-w-2xl font-mono text-sm leading-6 text-zinc-500">
                  {team.description}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {isLead && (
                <Button
                  variant="outline"
                  onClick={() => setShowInvite((v) => !v)}
                  className="h-9 font-mono text-[11px] uppercase tracking-widest rounded-none"
                >
                  <UserPlus className="mr-2 h-3.5 w-3.5" />
                  Invite
                </Button>
              )}
              <Link
                href={`/teams/${teamId}/reviews`}
                className="inline-flex h-9 items-center gap-2 bg-zinc-900 px-5 font-mono text-[11px] font-black uppercase tracking-[0.16em] text-white transition-colors hover:bg-zinc-800 rounded-none"
              >
                <FileText className="h-3.5 w-3.5" />
                Reviews
              </Link>
            </div>
          </div>

          {/* Invite form */}
          {showInvite && isLead && (
            <form onSubmit={handleInvite} className="mt-4 flex items-center gap-3 max-w-sm">
              <Input
                value={inviteUsername}
                onChange={(e) => setInviteUsername(e.target.value)}
                placeholder="Enter username..."
                className="h-9 font-mono text-sm rounded-none"
              />
              <Button
                type="submit"
                disabled={invitePending || !inviteUsername.trim()}
                className="h-9 shrink-0 font-mono text-[11px] uppercase tracking-widest rounded-none"
              >
                {invitePending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Send"}
              </Button>
            </form>
          )}
        </div>

        {/* Body */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Recent Reviews feed */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-sans font-black uppercase tracking-tight text-zinc-950">
                Recent Reviews
              </h2>
              <Link
                href={`/teams/${teamId}/reviews`}
                className="font-mono text-[10px] uppercase tracking-widest text-zinc-400 hover:text-zinc-900 transition-colors"
              >
                View all →
              </Link>
            </div>

            <div className="border border-zinc-200 bg-white divide-y divide-zinc-100 overflow-hidden rounded-none">
              {reviewsLoading ? (
                <div className="p-6 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full rounded-none" />
                  ))}
                </div>
              ) : recentReviews.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center border border-zinc-100 bg-zinc-50 rounded-none">
                    <FileText className="h-5 w-5 text-zinc-300" />
                  </div>
                  <p className="font-mono text-xs text-zinc-400">No reviews yet.</p>
                  <p className="mt-1 font-mono text-[10px] text-zinc-300">
                    Members can open a review from the Reviews page.
                  </p>
                </div>
              ) : (
                recentReviews.map((review) => (
                  <Link
                    key={review.id}
                    href={`/teams/${teamId}/reviews/${review.id}`}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-zinc-50 transition-colors"
                  >
                    <div className="shrink-0">
                      {review.status === "open" ? (
                        <Circle className="h-4 w-4 text-emerald-500" />
                      ) : review.status === "approved" ? (
                        <CheckCircle2 className="h-4 w-4 text-violet-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-zinc-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-sm font-semibold text-zinc-900 truncate">
                        {review.title}
                      </p>
                      <p className="font-mono text-[10px] text-zinc-400 mt-0.5">
                        by {review.author.fullName}
                        {review.category ? ` · ${review.category}` : ""}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={`shrink-0 font-mono text-[10px] uppercase tracking-widest rounded-none ${
                        review.status === "open"
                          ? "border-emerald-200 text-emerald-700"
                          : review.status === "approved"
                            ? "border-violet-200 text-violet-700"
                            : "border-zinc-200 text-zinc-400"
                      }`}
                    >
                      {review.status}
                    </Badge>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Roster sidebar */}
          <div className="space-y-4">
            <h2 className="font-sans font-black uppercase tracking-tight text-zinc-950">
              Team Roster
            </h2>

            <div className="border border-zinc-200 bg-white divide-y divide-zinc-100 overflow-hidden rounded-none">
              {membersLoading ? (
                <div className="p-4 space-y-3">
                  {[1, 2].map((i) => (
                    <Skeleton key={i} className="h-10 w-full rounded-none" />
                  ))}
                </div>
              ) : !members || members.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center px-4">
                  <Users className="h-5 w-5 text-zinc-300 mb-2" />
                  <p className="font-mono text-[10px] text-zinc-400">No members yet.</p>
                </div>
              ) : (
                members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                      {/* biome-ignore lint/performance/noImgElement: member avatar */}
                      <img
                        src={getAvatarUrl(member.user.profilePictureUrl, member.user.fullName)}
                        alt={member.user.fullName}
                        className="h-7 w-7 border border-zinc-200 object-cover rounded-none"
                      />
                      <div className="min-w-0">
                        <p className="font-mono text-xs font-semibold text-zinc-900 truncate">
                          {member.user.fullName}
                        </p>
                        <p className="font-mono text-[10px] text-zinc-400">
                          @{member.user.username}
                        </p>
                      </div>
                    </div>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">
                      {member.role === "lead" ? "Lead" : team.memberTagName}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

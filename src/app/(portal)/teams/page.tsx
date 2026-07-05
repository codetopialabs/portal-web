"use client";

import { AlertCircle, Check, Crown, Mail, Users, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { DashboardShell } from "@/components/dashboard/Shell";
import { AvatarStack } from "@/components/ui/avatar-stack";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePermission } from "@/hooks/usePermission";
import { useAcceptInvite, useDeclineInvite, useMyInvites, useMyTeams } from "@/hooks/useTeams";
import { getAvatarUrl } from "@/lib/utils";
import type { TeamInvite } from "@/services/teams.service";

export default function TeamsDirectoryPage() {
  return (
    <RouteGuard permission="authenticated">
      <TeamsDirectoryContent />
    </RouteGuard>
  );
}

function RoleBadge({ role }: { role?: "owner" | "lead" | "member" }) {
  if (!role) return null;
  if (role === "owner") {
    return (
      <span className="inline-flex shrink-0 items-center gap-1 border border-amber-300 bg-amber-50 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-amber-700">
        <Crown className="h-3 w-3" />
        Owner
      </span>
    );
  }
  return (
    <span className="inline-flex shrink-0 items-center border border-grey-200 bg-white px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-text-secondary">
      {role === "lead" ? "Lead" : "Member"}
    </span>
  );
}

function AttentionBadge({
  pendingJoinRequests,
  openReviews,
}: {
  pendingJoinRequests?: number | null;
  openReviews?: number | null;
}) {
  const total = (pendingJoinRequests ?? 0) + (openReviews ?? 0);
  if (total === 0) return null;
  return (
    <span
      title={`${pendingJoinRequests ?? 0} join request(s) · ${openReviews ?? 0} open review(s)`}
      className="inline-flex shrink-0 items-center gap-1 bg-red-600 px-1.5 py-0.5 font-mono text-[10px] font-bold text-white"
    >
      <AlertCircle className="h-3 w-3" />
      {total}
    </span>
  );
}

function PendingInviteCard({ invite }: { invite: TeamInvite }) {
  const { mutate: accept, isPending: accepting } = useAcceptInvite(invite.teamSlug);
  const { mutate: decline, isPending: declining } = useDeclineInvite(invite.teamSlug);
  const busy = accepting || declining;

  return (
    <div className="border border-grey-200 bg-white p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-grey-100 bg-grey-50">
          <Mail className="h-4 w-4 text-text-muted" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-mono text-xs font-medium text-text-muted">Pending Invite</p>
          <h3 className="mt-0.5 font-sans font-bold text-text-primary truncate">
            {invite.teamName ?? invite.teamSlug}
          </h3>
          {invite.team?.description && (
            <p className="mt-1 font-mono text-[10px] leading-5 text-text-muted line-clamp-2">
              {invite.team.description}
            </p>
          )}
        </div>
      </div>

      {/* Inviter */}
      {invite.invitedBy && (
        <div className="flex items-center gap-2 border-t border-grey-100 pt-3">
          <Image
            src={getAvatarUrl(invite.invitedBy.profilePictureUrl, invite.invitedBy.fullName)}
            alt=""
            width={20}
            height={20}
            className="h-5 w-5 rounded-none border border-grey-200 object-cover shrink-0"
          />
          <p className="font-mono text-[10px] text-text-tertiary truncate">
            Invited by{" "}
            <span className="font-bold text-text-secondary">{invite.invitedBy.fullName}</span>
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          disabled={busy}
          onClick={() => accept(invite.id)}
          className="h-8 flex-1 rounded-none bg-grey-900 font-mono text-xs font-medium text-white hover:bg-grey-800"
        >
          <Check className="mr-1.5 h-3.5 w-3.5" />
          Accept
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={busy}
          onClick={() => decline(invite.id)}
          className="h-8 flex-1 rounded-none font-mono text-xs font-medium"
        >
          <X className="mr-1.5 h-3.5 w-3.5" />
          Decline
        </Button>
      </div>
    </div>
  );
}

function TeamsDirectoryContent() {
  const { data: teams, isLoading: teamsLoading, isError } = useMyTeams();
  const { data: myInvites, isLoading: invitesLoading } = useMyInvites();
  const canCreate = usePermission("teams.create");

  const pendingInvites = myInvites?.filter((i) => i.status === "pending") ?? [];
  const isLoading = teamsLoading || invitesLoading;
  const hasTeams = teams && teams.length > 0;
  const hasInvites = pendingInvites.length > 0;

  return (
    <DashboardShell>
      <div className="w-full max-w-none space-y-6 pb-20">
        {/* Header */}
        <div className="flex flex-col gap-4 border-b border-grey-200 pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-mono text-xs font-medium text-text-muted">Workspace</p>
            <h1 className="mt-2 font-sans text-4xl font-bold tracking-tight text-text-primary">
              Teams
            </h1>
            <p className="mt-2 max-w-2xl font-mono text-sm leading-6 text-text-tertiary">
              Collaborate, open contribution reviews, and track your team's progress together.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/teams/browse"
              className="inline-flex h-10 w-fit items-center border border-grey-200 bg-white px-6 font-mono text-sm font-medium text-text-primary transition-colors hover:border-grey-400 rounded-none"
            >
              Browse Teams
            </Link>
            {canCreate && (
              <Link
                href="/teams/new"
                className="inline-flex h-10 w-fit items-center bg-grey-900 px-6 font-mono text-sm font-medium text-white transition-colors hover:bg-grey-800 rounded-none"
              >
                New Team
              </Link>
            )}
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-36 w-full rounded-none" />
            ))}
          </div>
        )}

        {/* Error */}
        {isError && !isLoading && (
          <div className="flex flex-col items-center justify-center py-20 text-center border border-grey-200 bg-white rounded-none">
            <p className="font-mono text-sm text-text-tertiary">
              Failed to load teams. Please refresh.
            </p>
          </div>
        )}

        {/* Pending invites section */}
        {!isLoading && hasInvites && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <p className="font-mono text-xs font-medium text-text-muted">Pending Invitations</p>
              <span className="flex h-4 min-w-4 items-center justify-center bg-grey-900 font-mono text-[9px] font-bold text-white px-1">
                {pendingInvites.length}
              </span>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {pendingInvites.map((invite) => (
                <PendingInviteCard key={invite.id} invite={invite} />
              ))}
            </div>
          </div>
        )}

        {/* Empty state — no teams AND no invites */}
        {!isLoading && !isError && !hasTeams && !hasInvites && (
          <div className="flex flex-col items-center justify-center py-12 border border-grey-200 bg-white text-center rounded-none">
            <div className="mb-6 flex h-16 w-16 items-center justify-center border border-grey-100 bg-grey-50 rounded-none">
              <Users className="h-6 w-6 text-text-muted" />
            </div>
            <h3 className="font-sans text-xl font-bold text-text-primary">
              You are not in a team yet
            </h3>
            <p className="mt-2 max-w-xs font-mono text-xs leading-5 text-text-tertiary">
              Teams are where the magic happens. Join one to start collaborating and tracking your
              contributions.
            </p>
            {canCreate && (
              <Link
                href="/teams/new"
                className="mt-8 inline-flex h-10 items-center bg-grey-900 px-8 font-mono text-sm font-medium text-white transition-colors hover:bg-grey-800 rounded-none"
              >
                Create Your First Team
              </Link>
            )}
          </div>
        )}

        {/* Team Cards */}
        {!isLoading && !isError && hasTeams && (
          <div className="space-y-3">
            {hasInvites && (
              <p className="font-mono text-xs font-medium text-text-muted">Your Teams</p>
            )}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {teams.map((team) => (
                <Link
                  key={team.id}
                  href={`/teams/${team.slug}`}
                  className="group flex flex-col justify-between border border-grey-200 bg-white p-6 transition-colors hover:border-grey-300 hover:bg-grey-50 rounded-none"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-sans font-bold text-text-primary group-hover:text-text-secondary">
                        {team.name}
                      </h3>
                      {team.description && (
                        <p className="mt-1 font-mono text-xs leading-5 text-text-muted line-clamp-2">
                          {team.description}
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <AttentionBadge
                        pendingJoinRequests={team.pendingJoinRequests}
                        openReviews={team.openReviews}
                      />
                      <RoleBadge role={team.role} />
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-grey-100 pt-4">
                    {team.membersPreview && team.membersPreview.length > 0 ? (
                      <AvatarStack
                        members={team.membersPreview}
                        totalCount={team.memberCount ?? team.membersPreview.length}
                      />
                    ) : (
                      <div className="flex items-center gap-1.5 font-mono text-xs text-text-muted">
                        <Users className="h-3.5 w-3.5" />
                        <span>{team.memberCount ?? "—"} members</span>
                      </div>
                    )}
                    <span className="font-mono text-[10px] font-black uppercase tracking-[0.16em] text-text-muted group-hover:text-text-primary transition-colors">
                      Open →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}

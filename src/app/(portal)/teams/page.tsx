"use client";

import { Check, Mail, Users, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { DashboardShell } from "@/components/dashboard/Shell";
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

function PendingInviteCard({ invite }: { invite: TeamInvite }) {
  const { mutate: accept, isPending: accepting } = useAcceptInvite(invite.teamSlug);
  const { mutate: decline, isPending: declining } = useDeclineInvite(invite.teamSlug);
  const busy = accepting || declining;

  return (
    <div className="border border-zinc-200 bg-white p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-zinc-100 bg-zinc-50">
          <Mail className="h-4 w-4 text-zinc-400" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">
            Pending Invite
          </p>
          <h3 className="mt-0.5 font-sans font-black uppercase tracking-tight text-zinc-950 truncate">
            {invite.teamName ?? invite.teamSlug}
          </h3>
          {invite.team?.description && (
            <p className="mt-1 font-mono text-[10px] leading-5 text-zinc-400 line-clamp-2">
              {invite.team.description}
            </p>
          )}
        </div>
      </div>

      {/* Inviter */}
      {invite.invitedBy && (
        <div className="flex items-center gap-2 border-t border-zinc-100 pt-3">
          <Image
            src={getAvatarUrl(invite.invitedBy.profilePictureUrl, invite.invitedBy.fullName)}
            alt=""
            width={20}
            height={20}
            className="h-5 w-5 rounded-none border border-zinc-200 object-cover shrink-0"
          />
          <p className="font-mono text-[10px] text-zinc-500 truncate">
            Invited by <span className="font-bold text-zinc-700">{invite.invitedBy.fullName}</span>
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          disabled={busy}
          onClick={() => accept(invite.id)}
          className="h-8 flex-1 rounded-none bg-zinc-900 font-mono text-[10px] uppercase tracking-widest text-white hover:bg-zinc-800"
        >
          <Check className="mr-1.5 h-3.5 w-3.5" />
          Accept
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={busy}
          onClick={() => decline(invite.id)}
          className="h-8 flex-1 rounded-none font-mono text-[10px] uppercase tracking-widest"
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
        <div className="flex flex-col gap-4 border-b border-zinc-200 pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.24em] text-zinc-400">
              Workspace
            </p>
            <h1 className="mt-2 font-sans text-3xl font-black uppercase tracking-tight text-zinc-950">
              Teams
            </h1>
            <p className="mt-2 max-w-2xl font-mono text-sm leading-6 text-zinc-500">
              Collaborate, open contribution reviews, and track your team's progress together.
            </p>
          </div>
          {canCreate && (
            <Link
              href="/teams/new"
              className="inline-flex h-10 w-fit items-center bg-zinc-900 px-6 font-mono text-[11px] font-black uppercase tracking-[0.16em] text-white transition-colors hover:bg-zinc-800 rounded-none"
            >
              New Team
            </Link>
          )}
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
          <div className="flex flex-col items-center justify-center py-20 text-center border border-zinc-200 bg-white rounded-none">
            <p className="font-mono text-sm text-zinc-500">Failed to load teams. Please refresh.</p>
          </div>
        )}

        {/* Pending invites section */}
        {!isLoading && hasInvites && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                Pending Invitations
              </p>
              <span className="flex h-4 min-w-4 items-center justify-center bg-zinc-900 font-mono text-[9px] font-bold text-white px-1">
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
          <div className="flex flex-col items-center justify-center py-32 border border-zinc-200 bg-white text-center rounded-none">
            <div className="mb-6 flex h-16 w-16 items-center justify-center border border-zinc-100 bg-zinc-50 rounded-none">
              <Users className="h-6 w-6 text-zinc-300" />
            </div>
            <h3 className="font-sans text-xl font-black uppercase tracking-tight text-zinc-900">
              You are not in a team yet
            </h3>
            <p className="mt-2 max-w-xs font-mono text-xs leading-5 text-zinc-500">
              Teams are where the magic happens. Join one to start collaborating and tracking your
              contributions.
            </p>
            {canCreate && (
              <Link
                href="/teams/new"
                className="mt-8 inline-flex h-10 items-center bg-zinc-900 px-8 font-mono text-[11px] font-black uppercase tracking-[0.16em] text-white transition-colors hover:bg-zinc-800 rounded-none"
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
              <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                Your Teams
              </p>
            )}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {teams.map((team) => (
                <Link
                  key={team.id}
                  href={`/teams/${team.slug}`}
                  className="group flex flex-col justify-between border border-zinc-200 bg-white p-6 transition-colors hover:border-zinc-400 hover:bg-zinc-50 rounded-none"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-sans font-black uppercase tracking-tight text-zinc-950 group-hover:text-zinc-700">
                        {team.name}
                      </h3>
                      {team.description && (
                        <p className="mt-1 font-mono text-xs leading-5 text-zinc-400 line-clamp-2">
                          {team.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-zinc-100 pt-4">
                    <div className="flex items-center gap-1.5 font-mono text-xs text-zinc-400">
                      <Users className="h-3.5 w-3.5" />
                      <span>{team.memberCount ?? "—"} members</span>
                    </div>
                    <span className="font-mono text-[10px] font-black uppercase tracking-[0.16em] text-zinc-400 group-hover:text-zinc-900 transition-colors">
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

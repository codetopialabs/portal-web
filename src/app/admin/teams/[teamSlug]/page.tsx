"use client";

import { ArrowLeft, Crown, Users2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { Skeleton } from "@/components/ui/skeleton";
import { useTeam, useTeamMembers } from "@/hooks/useTeams";
import { getAvatarUrl } from "@/lib/utils";

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(
    new Date(iso)
  );
}

function AdminTeamDetailContent() {
  const { teamSlug } = useParams<{ teamSlug: string }>();
  const { data: team, isLoading: teamLoading, isError: teamError } = useTeam(teamSlug);
  const { data: members, isLoading: membersLoading } = useTeamMembers(teamSlug);

  const leads = members?.filter((m) => m.role === "lead") ?? [];
  const regularMembers = members?.filter((m) => m.role !== "lead") ?? [];

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
              Created
            </p>
            <p className="font-sans text-lg font-black text-zinc-950">
              {formatDate(team.createdAt)}
            </p>
          </div>
        </div>
      </div>

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
          <div className="divide-y divide-zinc-100">
            {[...leads, ...regularMembers].map((member) => (
              <Link
                key={member.id}
                href={`/admin/members/${member.user.username}`}
                className="flex items-center justify-between gap-4 p-4 transition-colors hover:bg-zinc-50"
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
                <div className="flex shrink-0 items-center gap-3">
                  {member.role === "lead" && (
                    <span className="inline-flex items-center gap-1 border border-amber-200 bg-amber-50 px-2 py-1 font-mono text-[9px] font-black uppercase tracking-widest text-amber-700">
                      <Crown className="h-3 w-3" />
                      Lead
                    </span>
                  )}
                  <span className="font-mono text-[10px] text-zinc-400">
                    Joined {formatDate(member.joinedAt)}
                  </span>
                </div>
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

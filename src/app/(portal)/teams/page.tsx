"use client";

import { Users } from "lucide-react";
import Link from "next/link";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { DashboardShell } from "@/components/dashboard/Shell";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { usePermission } from "@/hooks/usePermission";
import { useMyTeams } from "@/hooks/useTeams";

export default function TeamsDirectoryPage() {
  return (
    <RouteGuard permission="authenticated">
      <TeamsDirectoryContent />
    </RouteGuard>
  );
}

function TeamsDirectoryContent() {
  const { data: teams, isLoading, isError } = useMyTeams();
  const canCreate = usePermission("teams.create");

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

        {/* Empty State */}
        {!isLoading && !isError && (!teams || teams.length === 0) && (
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
        {!isLoading && !isError && teams && teams.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {teams.map((team) => (
              <Link
                key={team.id}
                href={`/teams/${team.id}`}
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
                  <Badge
                    variant="outline"
                    className="shrink-0 font-mono text-[10px] uppercase tracking-widest rounded-none"
                  >
                    {team.memberTagName}
                  </Badge>
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
        )}
      </div>
    </DashboardShell>
  );
}

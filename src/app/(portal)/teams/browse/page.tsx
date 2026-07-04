"use client";

import { ArrowLeft, Check, Loader2, Search, Users } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { DashboardShell } from "@/components/dashboard/Shell";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useBrowseTeams, useRequestToJoin } from "@/hooks/useTeams";
import type { BrowseTeam } from "@/services/teams.service";

function TeamCard({ team }: { team: BrowseTeam }) {
  const { mutate: requestToJoin, isPending } = useRequestToJoin(team.slug);

  return (
    <div className="flex flex-col justify-between border border-grey-200 bg-white p-6">
      <div>
        <h3 className="font-sans font-bold text-text-primary">{team.name}</h3>
        {team.description && (
          <p className="mt-1 font-mono text-xs leading-5 text-text-muted line-clamp-2">
            {team.description}
          </p>
        )}
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-grey-100 pt-4">
        <div className="flex items-center gap-1.5 font-mono text-xs text-text-muted">
          <Users className="h-3.5 w-3.5" />
          <span>{team.memberCount ?? "—"} members</span>
        </div>

        {team.isMember ? (
          <Link
            href={`/teams/${team.slug}`}
            className="font-mono text-[10px] font-black uppercase tracking-[0.16em] text-text-muted hover:text-text-primary transition-colors"
          >
            Open →
          </Link>
        ) : team.hasPendingRequest ? (
          <span className="inline-flex items-center gap-1.5 font-mono text-xs font-medium text-amber-600">
            <Check className="h-3 w-3" />
            Requested
          </span>
        ) : (
          <button
            type="button"
            disabled={isPending}
            onClick={() => requestToJoin()}
            className="inline-flex h-8 items-center gap-1.5 bg-grey-900 px-3 font-mono text-xs font-medium text-white transition-colors hover:bg-grey-800 disabled:opacity-50"
          >
            {isPending && <Loader2 className="h-3 w-3 animate-spin" />}
            Request to Join
          </button>
        )}
      </div>
    </div>
  );
}

function BrowseTeamsContent() {
  const { data: teams, isLoading, isError } = useBrowseTeams();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const list = teams ?? [];
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (t) => t.name.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q)
    );
  }, [teams, search]);

  return (
    <DashboardShell>
      <div className="w-full max-w-none space-y-6 pb-20">
        <div>
          <Link
            href="/teams"
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-text-muted transition-colors hover:text-text-primary"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            My Teams
          </Link>
          <div className="mt-3 flex flex-col gap-4 border-b border-grey-200 pb-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="font-mono text-xs font-medium text-text-muted">Workspace</p>
              <h1 className="mt-2 font-sans text-4xl font-bold tracking-tight text-text-primary">
                Browse Teams
              </h1>
              <p className="mt-2 max-w-2xl font-mono text-sm leading-6 text-text-tertiary">
                Every team on the platform. Request to join one and a team lead will review it.
              </p>
            </div>
          </div>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search teams..."
            className="h-10 rounded-none pl-9 font-mono text-sm"
          />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-36 w-full rounded-none" />
            ))}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-20 text-center border border-grey-200 bg-white">
            <p className="font-mono text-sm text-text-tertiary">
              Failed to load teams. Please refresh.
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center border border-grey-200 bg-white">
            <p className="font-mono text-sm text-text-tertiary">
              {search ? "No teams match your search." : "No teams yet."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((team) => (
              <TeamCard key={team.id} team={team} />
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}

export default function BrowseTeamsPage() {
  return (
    <RouteGuard permission="authenticated">
      <BrowseTeamsContent />
    </RouteGuard>
  );
}

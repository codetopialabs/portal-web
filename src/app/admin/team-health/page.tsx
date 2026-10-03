"use client";

import { HeartPulse } from "lucide-react";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { HealthPill } from "@/components/community-teams/pills";
import { Skeleton } from "@/components/ui/skeleton";
import { useTeamHealth } from "@/hooks/useCommunityTeams";
import { useFeature } from "@/hooks/useFeatures";
import { cn } from "@/lib/utils";

// Teams v2: one row per team for the Leads Council scoreboard. Counts and
// the health label are computed on the backend so this agrees with the API.

const GRID = "lg:grid-cols-[1.8fr_1.4fr_1.4fr_0.9fr_0.9fr_0.9fr_0.9fr_1fr]";
const HEADERS = [
  "Team",
  "Lead",
  "Deputy",
  "Active Core",
  "Total Active",
  "Minimum",
  "This Month",
  "Health",
];

function TeamHealthContent() {
  const teamsV2 = useFeature("teamsV2");
  const { data: rows, isLoading, isError } = useTeamHealth();

  const summary = rows
    ? {
        ok: rows.filter((r) => r.health === "OK").length,
        understaffed: rows.filter((r) => r.health === "UNDERSTAFFED").length,
        noLead: rows.filter((r) => r.health === "NO_LEAD").length,
      }
    : null;

  return (
    <div className="pb-20">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs font-medium text-zinc-400">Admin Panel</p>
          <h1 className="font-sans text-4xl font-bold tracking-tight text-zinc-950">Team Health</h1>
          <p className="mt-1 max-w-xl font-mono text-xs leading-5 text-zinc-500">
            The Leads Council scoreboard. A team is OK when it has a lead and at least its minimum
            number of Active members; understaffed when it has a lead but too few; and marked NO
            LEAD until one is named.
          </p>
        </div>
        {summary && (
          <div className="flex items-center gap-4 font-mono text-xs">
            <span className="text-emerald-700">{summary.ok} OK</span>
            <span className="text-amber-700">{summary.understaffed} understaffed</span>
            <span className="text-red-700">{summary.noLead} no lead</span>
          </div>
        )}
      </div>

      {!teamsV2 && (
        <div className="flex flex-col items-center justify-center gap-2 border border-dashed border-zinc-200 bg-zinc-50 py-16 text-center">
          <HeartPulse className="h-6 w-6 text-zinc-300" />
          <p className="font-mono text-xs text-zinc-400">
            The new team structure has not been switched on.
          </p>
        </div>
      )}

      {teamsV2 && isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton placeholders
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      )}

      {teamsV2 && isError && (
        <div className="border border-red-200 bg-red-50 p-8 text-center">
          <p className="font-sans text-sm font-bold text-red-700">
            Team health could not be loaded.
          </p>
        </div>
      )}

      {teamsV2 && rows && (
        <div className="overflow-hidden border border-zinc-200 bg-white">
          <div
            className={cn(
              "hidden gap-4 border-b border-zinc-200 bg-zinc-50 px-5 py-3 lg:grid",
              GRID
            )}
          >
            {HEADERS.map((h) => (
              <span
                key={h}
                className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400"
              >
                {h}
              </span>
            ))}
          </div>
          <div className="divide-y divide-zinc-100">
            {rows.map((row) => (
              <div
                key={row.id}
                className={cn(
                  "grid grid-cols-1 gap-2 px-4 py-4 lg:items-center lg:px-5",
                  GRID,
                  row.health === "NO_LEAD" && "border-l-2 border-red-500",
                  row.health === "UNDERSTAFFED" && "border-l-2 border-amber-400"
                )}
              >
                <div>
                  <p className="font-sans text-sm font-bold text-zinc-900">{row.name}</p>
                  <p className="font-mono text-[10px] text-zinc-400">{row.slug}</p>
                </div>
                <div className="font-mono text-xs text-zinc-700">
                  {row.lead ? row.lead.fullName : <span className="text-red-600">Open</span>}
                </div>
                <div className="font-mono text-xs text-zinc-700">
                  {row.deputy ? (
                    row.deputy.fullName
                  ) : (
                    <span className="text-zinc-400">Not named</span>
                  )}
                </div>
                <div className="font-mono text-sm text-zinc-900">{row.activeCoreCount}</div>
                <div className="font-mono text-sm text-zinc-900">
                  {row.totalActiveCount}
                  {row.totalActiveCount < row.minActiveMembers && (
                    <span className="ml-1 font-mono text-[10px] text-amber-700">
                      short {row.minActiveMembers - row.totalActiveCount}
                    </span>
                  )}
                </div>
                <div className="font-mono text-sm text-zinc-500">{row.minActiveMembers}</div>
                <div
                  className={`font-mono text-sm ${row.approvedThisMonth > 0 ? "text-zinc-900" : "text-zinc-400"}`}
                  title="Contributions approved since the 1st of this month"
                >
                  {row.approvedThisMonth}
                </div>
                <div>
                  <HealthPill health={row.health} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function TeamHealthPage() {
  return (
    <RouteGuard permission="community_teams.health">
      <TeamHealthContent />
    </RouteGuard>
  );
}

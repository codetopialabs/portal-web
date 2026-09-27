"use client";

import { UsersRound } from "lucide-react";
import { useState } from "react";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { Roster } from "@/components/community-teams/Roster";
import { DashboardShell } from "@/components/dashboard/Shell";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyLedTeams } from "@/hooks/useCommunityTeams";
import { useFeature } from "@/hooks/useFeatures";
import { usePermission } from "@/hooks/usePermission";

// Teams v2: a lead's or deputy's view of their own team's roster.

const selectTrigger =
  "h-10 w-64 rounded-none border-grey-200 bg-white px-2 font-mono text-xs text-text-primary focus-visible:border-grey-900 focus-visible:ring-0";
const selectContent =
  "rounded-none border border-grey-200 bg-white font-mono text-xs shadow-md z-50 p-1";
const selectItem =
  "rounded-none font-mono py-1.5 px-2 text-text-primary hover:bg-grey-50 cursor-pointer focus:bg-grey-50 focus:outline-none";

function MyTeamContent() {
  const teamsV2 = useFeature("teamsV2");
  const { teams, isLoading } = useMyLedTeams();
  const fullAccess = usePermission("community_teams.edit_roster");
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const team = teams.find((t) => t.slug === selectedSlug) ?? teams[0];

  return (
    <DashboardShell>
      <div className="w-full max-w-none space-y-6 pb-20">
        <div className="flex flex-col gap-4 border-b border-grey-200 pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-mono text-xs font-medium text-text-muted">Workspace</p>
            <h1 className="mt-2 font-sans text-4xl font-bold tracking-tight text-text-primary">
              My Team
            </h1>
            <p className="mt-2 max-w-2xl font-mono text-sm leading-6 text-text-tertiary">
              Your roster: who is active, who needs a check-in, and who holds which role. Members
              flagged Stale have not checked in for 60 days.
            </p>
          </div>
          {teams.length > 1 && (
            <Select value={team?.slug} onValueChange={setSelectedSlug}>
              <SelectTrigger className={selectTrigger} aria-label="Team">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className={selectContent}>
                {teams.map((t) => (
                  <SelectItem key={t.slug} value={t.slug} className={selectItem}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {!teamsV2 || (!isLoading && teams.length === 0) ? (
          <div className="border border-dashed border-grey-300 bg-white p-14 text-center">
            <UsersRound className="mx-auto h-6 w-6 text-grey-300" />
            <p className="mt-3 font-sans text-base font-black text-text-primary">
              {teamsV2 ? "You are not leading a team" : "Not available yet"}
            </p>
            <p className="mt-1 font-mono text-xs text-text-tertiary">
              {teamsV2
                ? "This page is for team leads and deputies. Ask the Community Lead if you should be one."
                : "The six-team structure has not been switched on."}
            </p>
          </div>
        ) : isLoading || !team ? (
          <Skeleton className="h-64 w-full rounded-none" />
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-1 font-mono text-xs text-text-tertiary">
              <span className="font-sans text-lg font-bold text-text-primary">{team.name}</span>
              <span>Lead: {team.lead?.fullName ?? "Open"}</span>
              <span>Deputy: {team.deputy?.fullName ?? "Not named"}</span>
              <span>Needs {team.minActiveMembers} active</span>
            </div>
            <Roster team={team} fullAccess={fullAccess} />
          </>
        )}
      </div>
    </DashboardShell>
  );
}

export default function MyTeamPage() {
  return (
    <RouteGuard permission="authenticated">
      <MyTeamContent />
    </RouteGuard>
  );
}

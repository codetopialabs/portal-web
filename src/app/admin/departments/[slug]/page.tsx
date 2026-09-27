"use client";

import { ArrowLeft, Pencil } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { DepartmentDialog } from "@/components/admin/DepartmentDialog";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { ContributionQueue } from "@/components/community-teams/ContributionQueue";
import { HealthPill } from "@/components/community-teams/pills";
import { Roster } from "@/components/community-teams/Roster";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCommunityTeam, useTeamHealth } from "@/hooks/useCommunityTeams";
import { useDepartments } from "@/hooks/useDepartments";
import { useFeature } from "@/hooks/useFeatures";
import { usePermission } from "@/hooks/usePermission";

// Teams v2: one team, for admins. Lead and deputy, health, and the full
// roster with every field editable. Flag off: the page explains itself and
// links back, since departments have no detail view without Teams v2.

function TeamDetailContent() {
  const { slug } = useParams<{ slug: string }>();
  const teamsV2 = useFeature("teamsV2");
  const { data: team, isLoading, isError } = useCommunityTeam(teamsV2 ? slug : null);
  const { data: departments } = useDepartments();
  const { data: healthRows } = useTeamHealth();
  const fullAccess = usePermission("community_teams.edit_roster");
  const [editing, setEditing] = useState(false);

  const department = departments?.find((d) => d.slug === slug);
  const health = healthRows?.find((row) => row.slug === slug);

  return (
    <div className="pb-20">
      <Link
        href="/admin/departments"
        className="mb-4 inline-flex items-center gap-1.5 font-mono text-xs text-zinc-500 hover:text-zinc-900"
      >
        <ArrowLeft className="h-3 w-3" />
        All teams
      </Link>

      {!teamsV2 && (
        <div className="border border-dashed border-zinc-200 bg-zinc-50 py-16 text-center">
          <p className="font-mono text-xs text-zinc-400">
            Team pages arrive with the six-team structure, which has not been switched on.
          </p>
        </div>
      )}

      {teamsV2 && isLoading && <Skeleton className="h-40 w-full" />}

      {teamsV2 && isError && (
        <div className="border border-red-200 bg-red-50 p-8 text-center">
          <p className="font-sans text-sm font-bold text-red-700">This team could not be loaded.</p>
        </div>
      )}

      {teamsV2 && team && (
        <div className="space-y-8">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-zinc-200 pb-6">
            <div>
              <p className="font-mono text-xs font-medium text-zinc-400">Admin Panel · Team</p>
              <div className="mt-1 flex flex-wrap items-center gap-3">
                <h1 className="font-sans text-4xl font-bold tracking-tight text-zinc-950">
                  {team.name}
                </h1>
                {health && <HealthPill health={health.health} />}
              </div>
              {team.description && (
                <p className="mt-2 max-w-2xl font-mono text-xs leading-5 text-zinc-500">
                  {team.description}
                </p>
              )}
            </div>
            {department && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditing(true)}
                className="h-10 rounded-none font-mono text-xs"
              >
                <Pencil className="mr-1.5 h-3.5 w-3.5" />
                Edit team
              </Button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-px border border-zinc-200 bg-zinc-200 sm:grid-cols-3 lg:grid-cols-6">
            {[
              ["Lead", team.lead?.fullName ?? "Open", !team.lead],
              ["Deputy", team.deputy?.fullName ?? "Not named", false],
              ["Members", String(team.memberCount), false],
              ["Active", String(health?.totalActiveCount ?? "–"), false],
              ["Active Core", String(health?.activeCoreCount ?? "–"), false],
              ["Minimum", String(team.minActiveMembers), false],
            ].map(([label, value, warn]) => (
              <div key={label as string} className="bg-white px-4 py-3">
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400">
                  {label}
                </p>
                <p
                  className={`mt-1 truncate font-mono text-sm ${warn ? "text-red-600" : "text-zinc-900"}`}
                >
                  {value}
                </p>
              </div>
            ))}
          </div>

          <section className="space-y-3">
            <h2 className="font-sans text-lg font-bold text-zinc-900">Roster</h2>
            <p className="font-mono text-xs text-zinc-500">
              Everyone whose primary team is {team.name}. You can set any field here, including
              level Lead.
            </p>
            <Roster team={team} fullAccess={fullAccess} />
          </section>

          <ContributionQueue slug={team.slug} teamName={team.name} />

          {department && (
            <DepartmentDialog open={editing} onOpenChange={setEditing} department={department} />
          )}
        </div>
      )}
    </div>
  );
}

export default function TeamDetailPage() {
  return (
    <RouteGuard permission="admin.panel.access">
      <TeamDetailContent />
    </RouteGuard>
  );
}

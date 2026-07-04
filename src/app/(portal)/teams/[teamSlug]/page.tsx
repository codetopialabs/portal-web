"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { DashboardShell } from "@/components/dashboard/Shell";
import { TeamMembersTab } from "@/components/teams/TeamMembersTab";
import { TeamOverviewTab } from "@/components/teams/TeamOverviewTab";
import { TeamReviewsTab } from "@/components/teams/TeamReviewsTab";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyInvites, useMyMembership, useTeam, useTeamReviews } from "@/hooks/useTeams";

export default function TeamWorkspacePage() {
  return (
    <RouteGuard>
      <Suspense>
        <TeamWorkspaceContent />
      </Suspense>
    </RouteGuard>
  );
}

function TeamWorkspaceContent() {
  const { teamSlug } = useParams<{ teamSlug: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const tab = searchParams.get("tab") || "overview";

  // Core data — always needed for header & tab bar
  const { data: team, isLoading: teamLoading, isError: teamError } = useTeam(teamSlug);
  const { data: membership } = useMyMembership(teamSlug);
  // Reviews are needed for overview + reviews tabs — fetch always so both tabs feel instant
  const { data: reviews, isLoading: reviewsLoading } = useTeamReviews(teamSlug);
  // Invites are needed for the overview tab invite banner
  const { data: myInvites } = useMyInvites();

  const isOwner = membership?.role === "owner";
  const isLead = isOwner || membership?.role === "lead";
  const myInvite = myInvites?.find((invite) => invite.teamSlug === teamSlug);

  function setTab(newTab: string) {
    router.push(`${pathname}?tab=${newTab}`);
  }

  if (teamLoading) {
    return (
      <DashboardShell>
        <div className="w-full max-w-none space-y-6 pb-20">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-10 w-full" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </div>
      </DashboardShell>
    );
  }

  if (teamError || !team) {
    return (
      <DashboardShell>
        <div className="flex flex-col items-center justify-center py-24 border border-grey-200 bg-white text-center">
          <p className="font-mono text-sm text-text-tertiary">
            Team not found or you don't have access.
          </p>
          <Link
            href="/teams"
            className="mt-4 font-mono text-xs uppercase tracking-widest text-text-muted hover:text-text-primary transition-colors"
          >
            ← Back to Teams
          </Link>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="w-full max-w-none space-y-8 pb-20">
        {/* Back */}
        <Link
          href="/teams"
          className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-text-muted transition-colors hover:text-text-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          All Teams
        </Link>

        {/* Header */}
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.24em] text-text-muted">
              Team Workspace
            </p>
            {membership && (
              <Badge
                variant="outline"
                className="font-mono text-[10px] uppercase tracking-widest rounded-none"
              >
                {isOwner ? "Owner" : isLead ? "Lead" : "Member"}
              </Badge>
            )}
          </div>
          <div className="flex items-end justify-between gap-4 mt-2">
            <div>
              <h1 className="font-sans text-3xl font-black uppercase tracking-tight text-text-primary">
                {team.name}
              </h1>
              {team.description && (
                <p className="mt-2 max-w-2xl font-mono text-sm leading-6 text-text-tertiary">
                  {team.description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="border-b border-grey-200 flex items-center gap-6">
          {[
            { key: "overview", label: "Overview" },
            { key: "reviews", label: "Reviews", count: reviews?.length },
            { key: "members", label: "Members" },
          ].map(({ key, label, count }) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`pb-3 font-mono text-xs uppercase tracking-widest transition-colors relative flex items-center gap-2 ${
                tab === key
                  ? "text-text-primary font-bold"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              {label}
              {count !== undefined && (
                <span className="inline-flex items-center justify-center rounded-full bg-grey-100 px-2 py-0.5 text-[9px] font-bold text-text-secondary">
                  {count}
                </span>
              )}
              {tab === key && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-grey-900" />
              )}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        <div className="mt-6">
          {tab === "overview" && (
            <TeamOverviewTab teamSlug={teamSlug} teamName={team.name} myInvite={myInvite} />
          )}
          {tab === "reviews" && (
            <TeamReviewsTab teamSlug={teamSlug} reviews={reviews} reviewsLoading={reviewsLoading} />
          )}
          {tab === "members" && (
            <TeamMembersTab
              teamSlug={teamSlug}
              isLead={isLead}
              isOwner={isOwner}
              currentUserId={membership?.user.id}
            />
          )}
        </div>
      </div>
    </DashboardShell>
  );
}

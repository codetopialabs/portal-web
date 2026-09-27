"use client";

import { ClipboardCheck, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { ContributionCard } from "@/components/community-teams/ContributionCard";
import { SubmitContributionDialog } from "@/components/community-teams/SubmitContributionDialog";
import { DashboardShell } from "@/components/dashboard/Shell";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyContributions, useWithdrawContribution } from "@/hooks/useCommunityTeams";
import { useFeature } from "@/hooks/useFeatures";
import { useUserStore } from "@/store/user.store";

// Teams v2: a member's own contributions, and where they submit new ones.

function ContributionsContent() {
  const teamsV2 = useFeature("teamsV2");
  const primaryTeam = useUserStore((s) => s.profile?.primaryTeam?.slug);
  const { data: contributions, isLoading } = useMyContributions();
  const { mutate: withdraw, isPending: withdrawing } = useWithdrawContribution();
  const [open, setOpen] = useState(false);

  const approved = contributions?.filter((c) => c.status === "approved").length ?? 0;

  return (
    <DashboardShell>
      <div className="w-full max-w-none space-y-6 pb-20">
        <div className="flex flex-col gap-4 border-b border-grey-200 pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-mono text-xs font-medium text-text-muted">Workspace</p>
            <h1 className="mt-2 font-sans text-4xl font-bold tracking-tight text-text-primary">
              Contributions
            </h1>
            <p className="mt-2 max-w-2xl font-mono text-sm leading-6 text-text-tertiary">
              Work you did for a team, with a link as proof. Your team lead reviews it. Approved
              work shows on your public profile and is what leads look at when offering roles.
            </p>
          </div>
          {teamsV2 && (
            <Button
              type="button"
              onClick={() => setOpen(true)}
              className="h-10 rounded-none bg-grey-900 px-6 font-mono text-sm font-medium hover:bg-grey-800"
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Submit a contribution
            </Button>
          )}
        </div>

        {!teamsV2 && (
          <div className="border border-dashed border-grey-300 bg-white p-14 text-center">
            <ClipboardCheck className="mx-auto h-6 w-6 text-grey-300" />
            <p className="mt-3 font-sans text-base font-black text-text-primary">
              Not available yet
            </p>
            <p className="mt-1 font-mono text-xs text-text-tertiary">
              The six-team structure has not been switched on.
            </p>
          </div>
        )}

        {teamsV2 && isLoading && (
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-28 w-full rounded-none" />
            ))}
          </div>
        )}

        {teamsV2 && contributions && contributions.length === 0 && (
          <div className="border border-dashed border-grey-300 bg-white p-14 text-center">
            <ClipboardCheck className="mx-auto h-6 w-6 text-grey-300" />
            <p className="mt-3 font-sans text-base font-black text-text-primary">
              Nothing submitted yet
            </p>
            <p className="mt-1 font-mono text-xs text-text-tertiary">
              Hosted a session, designed a flyer, wrote a guide, fixed a bug? Submit it with a link.
            </p>
          </div>
        )}

        {teamsV2 && contributions && contributions.length > 0 && (
          <>
            <p className="font-mono text-xs text-text-tertiary">
              {contributions.length} submitted · {approved} approved
            </p>
            <div className="divide-y divide-grey-200 border border-grey-200 bg-white">
              {contributions.map((c) => (
                <ContributionCard key={c.id} contribution={c}>
                  {c.status === "submitted" && (
                    <ConfirmModal
                      title="Withdraw this contribution?"
                      description="It has not been reviewed yet. You can submit it again later."
                      confirmText="Withdraw"
                      isLoading={withdrawing}
                      onConfirm={() =>
                        withdraw(c.id, { onSuccess: () => toast.success("Withdrawn.") })
                      }
                    >
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 rounded-none font-mono text-xs text-error-600 hover:text-error-700"
                      >
                        <Trash2 className="mr-1.5 h-3 w-3" />
                        Withdraw
                      </Button>
                    </ConfirmModal>
                  )}
                </ContributionCard>
              ))}
            </div>
          </>
        )}

        <SubmitContributionDialog open={open} onOpenChange={setOpen} defaultTeam={primaryTeam} />
      </div>
    </DashboardShell>
  );
}

export default function ContributionsPage() {
  return (
    <RouteGuard permission="authenticated">
      <ContributionsContent />
    </RouteGuard>
  );
}

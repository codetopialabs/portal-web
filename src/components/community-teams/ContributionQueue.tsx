"use client";

import { Check, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ContributionCard } from "@/components/community-teams/ContributionCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useReviewContribution, useTeamContributions } from "@/hooks/useCommunityTeams";
import { cn } from "@/lib/utils";
import type { ContributionStatus } from "@/services/community-teams.service";

// Teams v2: a team's contribution queue for its lead or deputy (or an
// admin). Waiting items first; approved and declined for the record.

const TABS: { value: ContributionStatus; label: string }[] = [
  { value: "submitted", label: "Waiting" },
  { value: "approved", label: "Approved" },
  { value: "declined", label: "Declined" },
];

function ReviewActions({ slug, id }: { slug: string; id: string }) {
  const review = useReviewContribution(slug);
  const [note, setNote] = useState("");

  async function decide(decision: "approve" | "decline") {
    try {
      await review.mutateAsync({ id, decision, note: note.trim() });
      toast.success(decision === "approve" ? "Approved." : "Declined.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save.");
    }
  }

  return (
    <div className="flex w-full flex-col gap-2 lg:w-72">
      <Input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        maxLength={300}
        placeholder="Note to the member (optional)"
        className="h-9 rounded-none border-grey-200 font-mono text-xs"
      />
      <div className="flex gap-2">
        <Button
          type="button"
          onClick={() => decide("approve")}
          disabled={review.isPending}
          className="h-9 flex-1 rounded-none bg-grey-900 font-mono text-xs hover:bg-grey-800"
        >
          <Check className="mr-1.5 h-3.5 w-3.5" />
          Approve
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => decide("decline")}
          disabled={review.isPending}
          className="h-9 flex-1 rounded-none font-mono text-xs"
        >
          <X className="mr-1.5 h-3.5 w-3.5" />
          Decline
        </Button>
      </div>
    </div>
  );
}

export function ContributionQueue({ slug, teamName }: { slug: string; teamName: string }) {
  const [tab, setTab] = useState<ContributionStatus>("submitted");
  const { data: rows, isLoading } = useTeamContributions(slug, tab);
  const { data: waiting } = useTeamContributions(slug, "submitted");

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-sans text-lg font-bold text-text-primary">Contributions</h2>
          <p className="font-mono text-xs text-text-tertiary">
            Work members submitted for {teamName}. Open the link, then approve or decline. Approving
            sets their check-in to today.
          </p>
        </div>
        <div className="flex border border-grey-200 bg-white">
          {TABS.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setTab(t.value)}
              className={cn(
                "px-3 py-1.5 font-mono text-xs transition-colors",
                tab === t.value
                  ? "bg-grey-900 text-white"
                  : "text-text-tertiary hover:bg-grey-50 hover:text-text-primary"
              )}
            >
              {t.label}
              {t.value === "submitted" && waiting && waiting.length > 0 && (
                <span className="ml-1.5 text-amber-400">{waiting.length}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {isLoading && <Skeleton className="h-24 w-full rounded-none" />}

      {rows && rows.length === 0 && (
        <div className="border border-dashed border-grey-300 bg-white p-8 text-center">
          <p className="font-mono text-xs text-text-tertiary">
            {tab === "submitted" ? "Nothing waiting for review." : `Nothing ${tab} yet.`}
          </p>
        </div>
      )}

      {rows && rows.length > 0 && (
        <div className="divide-y divide-grey-200 border border-grey-200 bg-white">
          {rows.map((c) => (
            <ContributionCard key={c.id} contribution={c} showMember>
              {c.status === "submitted" && <ReviewActions slug={slug} id={c.id} />}
            </ContributionCard>
          ))}
        </div>
      )}
    </section>
  );
}

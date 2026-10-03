import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Contribution } from "@/services/community-teams.service";

export function formatDoneOn(value: string): string {
  const date = new Date(`${value}T00:00:00`);
  return date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

export function ContributionStatusPill({ status }: { status: Contribution["status"] }) {
  const tone =
    status === "approved"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : status === "declined"
        ? "border-red-200 bg-red-50 text-red-700"
        : "border-amber-200 bg-amber-50 text-amber-700";
  const label = status === "submitted" ? "Awaiting review" : status;
  return (
    <span
      className={cn(
        "inline-flex items-center border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider",
        tone
      )}
    >
      {label}
    </span>
  );
}

/** One contribution, as a member or a lead sees it. `children` holds the
 * actions (withdraw, approve, decline). */
export function ContributionCard({
  contribution,
  showMember,
  children,
}: {
  contribution: Contribution;
  showMember?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 p-5 lg:flex-row lg:items-start lg:justify-between">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-sans text-sm font-bold text-text-primary">{contribution.title}</h3>
          <ContributionStatusPill status={contribution.status} />
        </div>
        <p className="mt-0.5 font-mono text-[11px] text-text-tertiary">
          {showMember && (
            <>
              <span className="text-text-primary">{contribution.member.fullName}</span>
              {" · "}
            </>
          )}
          {contribution.team.name} · {formatDoneOn(contribution.doneOn)}
        </p>
        <p className="mt-2 whitespace-pre-line font-sans text-sm leading-6 text-text-secondary">
          {contribution.description}
        </p>
        <a
          href={contribution.link}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-flex items-center gap-1.5 font-mono text-xs text-text-primary underline underline-offset-2 hover:text-grey-700"
        >
          <ExternalLink className="h-3 w-3" />
          Open the work
        </a>
        {contribution.reviewNote && (
          <p className="mt-2 border-l-2 border-grey-200 pl-3 font-mono text-xs text-text-tertiary">
            {contribution.reviewedBy?.fullName ?? "Reviewer"}: {contribution.reviewNote}
          </p>
        )}
      </div>
      {children && <div className="flex shrink-0 items-center gap-2">{children}</div>}
    </div>
  );
}

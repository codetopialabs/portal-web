import { cn } from "@/lib/utils";
import type { MemberStatus, RosterFlag, TeamHealth } from "@/services/community-teams.service";

// Small labels shared by My Team and Team Health. Everything they show is
// computed on the backend; these only pick the colour.

export function FlagPill({ flag }: { flag: RosterFlag }) {
  if (!flag) return <span className="font-mono text-[11px] text-text-muted">OK</span>;
  const stale = flag === "stale";
  return (
    <span
      className={cn(
        "inline-flex items-center border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider",
        stale
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-amber-200 bg-amber-50 text-amber-700"
      )}
    >
      {stale ? "Stale" : "No check-in"}
    </span>
  );
}

export function StatusPill({ status }: { status: MemberStatus }) {
  if (!status) return <span className="font-mono text-[11px] text-text-muted">Not set</span>;
  const tone =
    status === "active"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : status === "paused"
        ? "border-amber-200 bg-amber-50 text-amber-700"
        : "border-grey-200 bg-grey-50 text-text-tertiary";
  return (
    <span
      className={cn(
        "inline-flex items-center border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider",
        tone
      )}
    >
      {status}
    </span>
  );
}

export function HealthPill({ health }: { health: TeamHealth }) {
  const tone =
    health === "OK"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : health === "UNDERSTAFFED"
        ? "border-amber-200 bg-amber-50 text-amber-700"
        : "border-red-200 bg-red-50 text-red-700";
  return (
    <span
      className={cn(
        "inline-flex items-center border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider",
        tone
      )}
    >
      {health.replace("_", " ")}
    </span>
  );
}

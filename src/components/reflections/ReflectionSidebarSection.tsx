"use client";

import {
  CheckCircle2,
  ChevronRight,
  CircleDashed,
  ClipboardCheck,
  Clock,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useSidebar } from "@/components/ui/sidebar";
import { useCurrentReflection, useMyReflections } from "@/hooks/useReflections";
import { cn } from "@/lib/utils";
import type { ReflectionStatus } from "@/types/reflections.types";

/* ── Status config ───────────────────────────────────────────────────────── */

const STATUS_CONFIG: Record<
  ReflectionStatus,
  { label: string; dot: string; icon: React.ElementType }
> = {
  not_started: { label: "Not started", dot: "bg-zinc-600", icon: CircleDashed },
  submitted: { label: "Submitted", dot: "bg-blue-400", icon: Clock },
  under_review: { label: "Under review", dot: "bg-amber-400", icon: Clock },
  approved: { label: "Approved", dot: "bg-emerald-400", icon: CheckCircle2 },
  changes_requested: { label: "Changes requested", dot: "bg-red-400", icon: XCircle },
};

function formatPeriod(period: string) {
  const d = new Date(period);
  if (Number.isNaN(d.getTime())) return period;
  return new Intl.DateTimeFormat("en", { month: "short", year: "numeric" }).format(d);
}

/* ── Component ───────────────────────────────────────────────────────────── */

export function ReflectionSidebarSection() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const { data: current } = useCurrentReflection();
  const { data: history = [] } = useMyReflections();

  const currentStatus: ReflectionStatus = (current?.status as ReflectionStatus) ?? "not_started";
  const isOpen = current?.isOpen;
  const currentHref =
    isOpen && (currentStatus === "not_started" || currentStatus === "changes_requested")
      ? "/reflections/submit"
      : "/reflections";

  // Past reflections = all history entries, sorted newest first (already sorted by backend)
  const past = history.slice(0, 5);

  if (isCollapsed) {
    return (
      <Link
        href={currentHref}
        className={cn(
          "mx-3 flex h-9 items-center justify-center rounded-none transition-colors hover:bg-zinc-900",
          isOpen && currentStatus !== "approved" ? "text-amber-400" : "text-zinc-500"
        )}
        title="Reflections"
      >
        <ClipboardCheck className="h-4 w-4" />
      </Link>
    );
  }

  return (
    <div className="mb-8 px-3">
      {/* Section label */}
      <p className="px-2 mb-2 font-mono text-xs font-semibold text-zinc-600">Reflections</p>

      {/* Current cycle card */}
      <Link
        href={currentHref}
        className="group flex items-center justify-between gap-2 rounded-none border border-zinc-800 bg-zinc-900/60 px-3 py-2.5 transition-colors hover:bg-zinc-900"
      >
        <div className="flex min-w-0 items-center gap-2">
          <ClipboardCheck className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
          <div className="min-w-0">
            <p className="font-mono text-xs font-semibold text-zinc-300 truncate">
              {isOpen ? "This month" : "No cycle open"}
            </p>
            {isOpen && (
              <div className="mt-0.5 flex items-center gap-1.5">
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full shrink-0",
                    STATUS_CONFIG[currentStatus].dot
                  )}
                />
                <span className="font-mono text-[9px] text-zinc-500 truncate">
                  {STATUS_CONFIG[currentStatus].label}
                </span>
              </div>
            )}
          </div>
        </div>
        {isOpen && (currentStatus === "not_started" || currentStatus === "changes_requested") && (
          <ChevronRight className="h-3 w-3 shrink-0 text-zinc-600 transition-colors group-hover:text-zinc-400" />
        )}
      </Link>

      {/* Past reflections */}
      {past.length > 0 && (
        <div className="mt-1 flex flex-col">
          {past.map((r) => {
            const cfg = STATUS_CONFIG[r.status as ReflectionStatus] ?? STATUS_CONFIG.submitted;
            return (
              <div key={r.id} className="flex items-center justify-between gap-2 px-3 py-1.5">
                <span className="font-mono text-[10px] text-zinc-500 truncate">
                  {formatPeriod(r.period)}
                </span>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className={cn("h-1.5 w-1.5 rounded-full", cfg.dot)} />
                  <span className="font-mono text-[9px] text-zinc-600 truncate max-w-[80px]">
                    {cfg.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

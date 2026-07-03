"use client";

import { ArrowRight, PenLine } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCurrentReflection } from "@/hooks/useReflections";

export function ReflectionPrompt() {
  const pathname = usePathname();
  const { data } = useCurrentReflection();

  const shouldPrompt = !!data?.shouldPrompt;

  // Don't nag on the reflection page itself.
  if (!shouldPrompt || pathname === "/reflections" || pathname === "/reflections/submit") {
    return null;
  }

  const daysRemaining = data?.daysRemaining;
  const changesRequested = data?.status === "changes_requested";
  const headline = changesRequested
    ? "Your reflection needs an update"
    : "Your monthly reflection is open";

  return (
    <div className="flex items-center gap-3 border-b border-warning-200 bg-warning-50 px-4 py-2.5 sm:px-6">
      <PenLine className="h-4 w-4 shrink-0 text-warning-700" />
      <p className="min-w-0 flex-1 font-mono text-xs text-warning-700">
        <span className="font-bold">{headline}.</span>{" "}
        {typeof daysRemaining === "number" && daysRemaining > 0
          ? `${daysRemaining} day(s) left to submit.`
          : "Due today."}
      </p>
      <Link
        href="/reflections/submit"
        className="hidden shrink-0 items-center gap-1.5 border border-warning-700 bg-warning-700 px-3 py-1 font-mono text-xs font-bold text-white transition-colors hover:bg-warning-600 sm:inline-flex"
      >
        Write reflection
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}

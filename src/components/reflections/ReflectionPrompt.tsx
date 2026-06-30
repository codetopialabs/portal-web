"use client";

import { ArrowRight, PenLine, Sparkles } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCurrentReflection } from "@/hooks/useReflections";

export function ReflectionPrompt() {
  const pathname = usePathname();
  const { data } = useCurrentReflection();

  const [modalOpen, setModalOpen] = useState(false);

  const [modalSeen, setModalSeen] = useState(false);

  const shouldPrompt = !!data?.shouldPrompt;

  // Open the modal once per page-load session when a reflection is awaiting action.
  useEffect(() => {
    if (shouldPrompt && !modalSeen) {
      setModalOpen(true);
      setModalSeen(true);
    }
  }, [shouldPrompt, modalSeen]);

  // Don't nag on the reflection page itself.
  if (!shouldPrompt || pathname === "/reflections" || pathname === "/reflections/submit") {
    return null;
  }

  const daysRemaining = data?.daysRemaining;
  const changesRequested = data?.status === "changes_requested";
  const headline = changesRequested
    ? "Your reflection needs an update"
    : "Your monthly reflection is open";
  const body = changesRequested
    ? "A reviewer asked for a few changes to your reflection. Take a moment to update and resubmit it."
    : "Take a few minutes to share what you learned this month. It's a quick, monthly check-in.";

  return (
    <>
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

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md rounded-none border-grey-900 bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-sans text-xl font-black uppercase tracking-tight text-text-primary">
              <Sparkles className="h-5 w-5 text-warning-600" />
              {headline}
            </DialogTitle>
            <DialogDescription className="pt-2 font-mono text-xs leading-6 text-text-secondary">
              {body}
            </DialogDescription>
          </DialogHeader>

          {typeof daysRemaining === "number" && (
            <div className="border border-grey-200 bg-grey-50 px-4 py-3 text-center">
              <p className="font-sans text-2xl font-black text-text-primary">
                {daysRemaining > 0 ? daysRemaining : 0}
              </p>
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted">
                day(s) remaining
              </p>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="h-10 border border-grey-200 bg-white px-4 font-mono text-xs font-bold text-text-secondary transition-colors hover:bg-grey-50"
            >
              Later
            </button>
            <Link
              href="/reflections/submit"
              onClick={() => setModalOpen(false)}
              className="inline-flex h-10 items-center justify-center gap-2 border border-grey-900 bg-grey-900 px-4 font-mono text-xs font-bold text-white transition-colors hover:bg-grey-800"
            >
              Write reflection
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

"use client";

import { PenLine } from "lucide-react";
import { usePathname } from "next/navigation";
import { SystemBanner } from "@/components/dashboard/Navbar";
import { useCurrentReflection } from "@/hooks/useReflections";

export function ReflectionPrompt() {
  const pathname = usePathname();
  const { data } = useCurrentReflection();

  const shouldPrompt = !!data?.shouldPrompt;

  // Don't nag on the reflection pages themselves.
  if (!shouldPrompt || pathname === "/reflections" || pathname === "/reflections/submit") {
    return null;
  }

  const daysRemaining = data?.daysRemaining;
  const changesRequested = data?.status === "changes_requested";
  const hasPerQuestionNotes =
    changesRequested &&
    data?.reviewerNotes &&
    Object.entries(data.reviewerNotes).some(([k, v]) => k !== "_legacy" && v?.trim());
  const legacyNote = data?.reviewerNotes?.["_legacy"];

  const label = changesRequested
    ? "Your reflection needs an update."
    : "Your monthly reflection is open.";

  const body = changesRequested && (hasPerQuestionNotes || legacyNote)
    ? "Feedback has been added to your answers."
    : typeof daysRemaining === "number" && daysRemaining > 0
      ? `${daysRemaining} day(s) left to submit.`
      : "Due today.";

  return (
    <SystemBanner
      variant="warning"
      icon={PenLine}
      label={label}
      body={body}
      ctaLabel="Write reflection"
      ctaHref="/reflections/submit"
    />
  );
}

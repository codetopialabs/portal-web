"use client";

import { useEffect, useState } from "react";

import { maskValue } from "@/lib/mask";
import { cn } from "@/lib/utils";
import { usePrivacyStore } from "@/store/privacy.store";

const KIND_LABELS: Record<"ip" | "email" | "text", string> = {
  ip: "IP address",
  email: "email address",
  text: "value",
};

/**
 * Renders a sensitive value masked, revealing it on click. Guards against the
 * obvious leak: a member screen-sharing settings, activity, or admin pages in
 * a call has their IP and email sitting in plain text.
 *
 * Reveal is per-value and resets on navigation. `usePrivacyStore` flips
 * everything at once for members who don't want the friction.
 */
export function SensitiveText({
  value,
  kind = "text",
  fallback = "—",
  className,
}: {
  value: string | null | undefined;
  kind?: "ip" | "email" | "text";
  /** Shown when there is no value at all — never masked. */
  fallback?: string;
  className?: string;
}) {
  const revealAll = usePrivacyStore((s) => s.revealSensitive);
  const [revealed, setRevealed] = useState(false);

  // The store is persisted, so it hydrates after the server render. Staying
  // masked until mount keeps the markup consistent and fails closed.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const trimmed = value?.trim();
  if (!trimmed) return <span className={className}>{fallback}</span>;

  const isVisible = revealed || (mounted && revealAll);
  const label = KIND_LABELS[kind];

  return (
    <button
      type="button"
      onClick={() => setRevealed((v) => !v)}
      title={isVisible ? `Hide ${label}` : `Show ${label}`}
      aria-label={isVisible ? `${label}: ${trimmed}. Hide it` : `Show ${label}`}
      className={cn(
        "cursor-pointer border-b border-dotted border-current/30 text-left align-baseline transition-colors hover:border-current/60 focus-visible:outline-none focus-visible:border-current",
        !isVisible && "select-none tracking-tight",
        className
      )}
    >
      {isVisible ? trimmed : maskValue(trimmed, kind)}
    </button>
  );
}

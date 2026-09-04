"use client";

import { AlertTriangle, Clock } from "lucide-react";

import { useMe } from "@/hooks/useMe";
import { parseFlagReason } from "@/lib/flag-reasons";
import { cn } from "@/lib/utils";

/**
 * The checklist an admin flagged this member for, shown on the page they're
 * sent to fix it. The nav banner hides here precisely so this can take over —
 * without it the member arrives with no idea what they were flagged for.
 */
export function FlaggedProfileChecklist({ className }: { className?: string }) {
  const { profile } = useMe();

  if (!profile?.isFlagged || !profile.activeFlag) return null;

  if (profile.activeFlag.profileUpdatedAfterFlag) {
    return (
      <div
        className={cn("flex items-start gap-3 border border-amber-200 bg-amber-50 p-4", className)}
      >
        <Clock className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
        <div>
          <p className="font-sans text-sm font-bold text-amber-900">Account under review</p>
          <p className="mt-1 font-mono text-xs leading-relaxed text-amber-800">
            Your changes have been sent to the team — we'll let you know the outcome shortly. You
            can keep editing in the meantime.
          </p>
        </div>
      </div>
    );
  }

  const items = parseFlagReason(profile.activeFlag.reason);

  return (
    <div className={cn("border border-red-200 bg-red-50 p-4", className)}>
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
        <div className="min-w-0">
          <p className="font-sans text-sm font-bold text-red-900">
            {items.length > 1
              ? `Your account is flagged — ${items.length} things to fix`
              : "Your account is flagged"}
          </p>
          <ul className="mt-2 space-y-1.5">
            {items.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2 font-mono text-xs leading-relaxed text-red-800"
              >
                <span aria-hidden className="mt-1.5 h-1 w-1 shrink-0 bg-red-400" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 font-mono text-[11px] leading-relaxed text-red-700">
            Save your changes once you've addressed these — your profile goes back to a reviewer
            automatically.
          </p>
        </div>
      </div>
    </div>
  );
}

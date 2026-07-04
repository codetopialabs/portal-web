"use client";

import { AlertTriangle, ArrowRight, Clock } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMe } from "@/hooks/useMe";

export function AccountFlaggedBanner() {
  const { profile } = useMe();
  const pathname = usePathname();

  if (!profile?.isFlagged || !profile.activeFlag) return null;
  if (pathname === "/settings/profile") return null;

  const underReview = profile.activeFlag.profileUpdatedAfterFlag;

  if (underReview) {
    return (
      <div className="flex items-center gap-3 border-b border-amber-300 bg-amber-500 px-4 py-2.5 sm:px-6">
        <Clock className="h-4 w-4 shrink-0 text-white" />
        <p className="min-w-0 flex-1 font-mono text-xs font-bold text-white">
          Account under review.{" "}
          <span className="font-normal opacity-90">
            Your changes have been sent to the team — we'll let you know the outcome shortly.
          </span>
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 border-b border-red-700 bg-red-600 px-4 py-3 sm:px-6">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-white" />
      <div className="min-w-0 flex-1">
        <p className="font-mono text-xs font-bold text-white">
          Your account has been flagged for review.
        </p>
        <p className="mt-0.5 whitespace-pre-wrap font-mono text-[11px] text-red-100">
          Reason: {profile.activeFlag.reason}
        </p>
      </div>
      <Link
        href="/settings/profile"
        className="inline-flex shrink-0 items-center gap-1.5 border border-white bg-white px-3 py-1 font-mono text-[11px] font-bold text-red-700 transition-colors hover:bg-red-50"
      >
        Fix &amp; submit
        <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  );
}

"use client";

import { AlertTriangle, Clock } from "lucide-react";
import { usePathname } from "next/navigation";
import { useMe } from "@/hooks/useMe";
import { parseFlagReason } from "@/lib/flag-reasons";
import { SystemBanner } from "./Navbar";

export function AccountFlaggedBanner() {
  const { profile } = useMe();
  const pathname = usePathname();

  if (!profile?.isFlagged || !profile.activeFlag) return null;
  if (pathname === "/settings/profile") return null;

  const underReview = profile.activeFlag.profileUpdatedAfterFlag;

  if (underReview) {
    return (
      <SystemBanner
        variant="info"
        icon={Clock}
        label="Account under review."
        body="Your changes have been sent to the team — we'll let you know the outcome shortly."
      />
    );
  }

  // A flag can list several things to fix; the banner is one line, so it
  // summarises and the full checklist lives on the profile settings page.
  const items = parseFlagReason(profile.activeFlag.reason);
  const body =
    items.length > 1
      ? `${items.length} things to fix — ${items[0]}`
      : `Reason: ${items[0] ?? profile.activeFlag.reason}`;

  return (
    <SystemBanner
      variant="alert"
      icon={AlertTriangle}
      label="Your account has been flagged for review."
      body={body}
      ctaLabel="Fix & submit"
      ctaHref="/settings/profile"
    />
  );
}

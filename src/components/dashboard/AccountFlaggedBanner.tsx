"use client";

import { AlertTriangle, Clock } from "lucide-react";
import { usePathname } from "next/navigation";
import { useMe } from "@/hooks/useMe";
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

  return (
    <SystemBanner
      variant="alert"
      icon={AlertTriangle}
      label="Your account has been flagged for review."
      body={`Reason: ${profile.activeFlag.reason}`}
      ctaLabel="Fix & submit"
      ctaHref="/settings/profile"
    />
  );
}

"use client";

import { AlertTriangle, Clock, PenLine, Users } from "lucide-react";
import { usePathname } from "next/navigation";
import { usePermission } from "@/hooks/usePermission";
import { useMe } from "@/hooks/useMe";
import { useCurrentReflection, useUpcomingCycle } from "@/hooks/useReflections";
import { useMyInvites } from "@/hooks/useTeams";
import type { BannerVariant } from "@/components/dashboard/Navbar";

export interface BannerDef {
  id: string;
  variant: BannerVariant;
  icon: React.ElementType;
  label: string;
  body?: string;
  ctaLabel?: string;
  ctaHref?: string;
}

/* Priority weight — higher = shown first */
const PRIORITY: Record<BannerVariant, number> = {
  alert: 30,
  warning: 20,
  info: 10,
};

function useAccountFlagBanner(pathname: string): BannerDef | null {
  const { profile } = useMe();
  if (!profile?.isFlagged || !profile.activeFlag) return null;
  if (pathname === "/settings/profile") return null;

  const underReview = profile.activeFlag.profileUpdatedAfterFlag;

  if (underReview) {
    return {
      id: "account-under-review",
      variant: "info",
      icon: Clock,
      label: "Account under review.",
      body: "Your changes have been sent to the team — we'll let you know shortly.",
    };
  }

  return {
    id: "account-flagged",
    variant: "alert",
    icon: AlertTriangle,
    label: "Your account has been flagged for review.",
    body: `Reason: ${profile.activeFlag.reason}`,
    ctaLabel: "Fix & submit",
    ctaHref: "/settings/profile",
  };
}

function useReflectionBanner(pathname: string): BannerDef | null {
  const { data } = useCurrentReflection();
  if (!data?.shouldPrompt || pathname === "/reflections" || pathname === "/reflections/submit")
    return null;

  const changesRequested = data.status === "changes_requested";
  const hasPerQuestionNotes =
    changesRequested &&
    data.reviewerNotes &&
    Object.entries(data.reviewerNotes).some(([k, v]) => k !== "_legacy" && v?.trim());
  const legacyNote = data.reviewerNotes?.["_legacy"];
  const daysRemaining = data.daysRemaining;

  const label = changesRequested
    ? "Your reflection needs an update."
    : "Your monthly reflection is open.";

  const body =
    changesRequested && (hasPerQuestionNotes || legacyNote)
      ? "Feedback has been added to your answers."
      : typeof daysRemaining === "number" && daysRemaining > 0
        ? `${daysRemaining} day(s) left to submit.`
        : "Due today.";

  return {
    id: "reflection-prompt",
    variant: "warning",
    icon: PenLine,
    label,
    body,
    ctaLabel: changesRequested ? "Update" : "Write now",
    ctaHref: "/reflections/submit",
  };
}

function useQuestionsUnconfirmedBanner(): BannerDef | null {
  const canManage = usePermission("reflections.manage");
  const { data: upcoming } = useUpcomingCycle();

  if (!canManage || !upcoming || upcoming.questionsConfirmed) return null;

  const period = (() => {
    const d = new Date(upcoming.period);
    if (Number.isNaN(d.getTime())) return upcoming.period;
    return new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(d);
  })();

  return {
    id: "questions-unconfirmed",
    variant: "warning",
    icon: AlertTriangle,
    label: `Set ${period} reflection questions.`,
    body: "The cycle won't open to members until you confirm them.",
    ctaLabel: "Set questions",
    ctaHref: "/admin/reflections/settings",
  };
}

export function useNotifications() {
  const pathname = usePathname();

  const flagBanner = useAccountFlagBanner(pathname || "");
  const reflectionBanner = useReflectionBanner(pathname || "");
  const questionsBanner = useQuestionsUnconfirmedBanner();

  const { data: invites = [] } = useMyInvites();

  const inviteBanners: BannerDef[] = invites.map((invite) => ({
    id: `invite-${invite.teamSlug}`,
    variant: "info",
    icon: Users,
    label: `You have been invited to join ${invite.teamName}.`,
    body: undefined,
    ctaLabel: "View invite",
    ctaHref: `/teams`,
  }));

  // Collect active banners and sort by priority (highest first)
  const banners = [flagBanner, reflectionBanner, questionsBanner, ...inviteBanners]
    .filter((b): b is BannerDef => b !== null)
    .sort((a, b) => PRIORITY[b.variant] - PRIORITY[a.variant]);

  return banners;
}

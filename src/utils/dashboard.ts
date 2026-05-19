import type { StrengthItem } from "@/types/dashboard";
import type { UserProfile } from "@/types/user";

export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function buildStrengthItems(profile: UserProfile): StrengthItem[] {
  const skills = profile.skills ?? [];
  const socialLinks = [
    profile.githubHandle,
    profile.twitterHandle,
    profile.linkedinUrl,
    profile.websiteUrl,
    profile.discordUsername,
  ].filter(Boolean);

  return [
    {
      key: "avatar",
      label: "Profile picture",
      weight: 20,
      fulfilled: Boolean(profile.profilePictureUrl),
      href: "/settings/profile",
      hint: "Upload a photo so members can recognise you.",
    },
    {
      key: "bio",
      label: "Bio",
      weight: 15,
      fulfilled: Boolean(profile.bio),
      href: "/settings/profile",
      hint: "Add a short bio to tell your story.",
    },
    {
      key: "currentRole",
      label: "Current role / title",
      weight: 12,
      fulfilled: Boolean(profile.currentRole || profile.discipline),
      href: "/settings/profile",
      hint: "Set your current role or discipline.",
    },
    {
      key: "skills",
      label: "Skills (3+)",
      weight: 15,
      fulfilled: skills.length >= 3,
      href: "/settings/profile",
      hint: "Add at least three skills to show what you work with.",
    },
    {
      key: "location",
      label: "Location",
      weight: 8,
      fulfilled: Boolean(profile.location),
      href: "/settings/profile",
      hint: "Add your city or country.",
    },
    {
      key: "cover",
      label: "Cover image",
      weight: 10,
      fulfilled: Boolean(profile.coverImageUrl),
      href: "/settings/profile",
      hint: "Personalise your profile with a cover image.",
    },
    {
      key: "social",
      label: "At least one social link",
      weight: 12,
      fulfilled: socialLinks.length > 0,
      href: "/settings/profile",
      hint: "Link GitHub, LinkedIn, Twitter, Discord, or your website.",
    },
    {
      key: "goal",
      label: "Primary goal",
      weight: 8,
      fulfilled: Boolean(profile.primaryGoal),
      href: "/settings/profile",
      hint: "Tell the community what you're working toward.",
    },
  ];
}

export function calcStrength(items: StrengthItem[]): number {
  return items.filter((i) => i.fulfilled).reduce((acc, i) => acc + i.weight, 0);
}

export function strengthLabel(pct: number): { text: string; color: string } {
  if (pct >= 90) return { text: "Excellent", color: "text-emerald-600" };
  if (pct >= 70) return { text: "Strong", color: "text-sky-600" };
  if (pct >= 50) return { text: "Good", color: "text-amber-600" };
  if (pct >= 25) return { text: "Getting started", color: "text-orange-600" };
  return { text: "Needs attention", color: "text-red-600" };
}

export function strengthBarColor(pct: number): string {
  if (pct >= 90) return "bg-emerald-500";
  if (pct >= 70) return "bg-sky-500";
  if (pct >= 50) return "bg-amber-500";
  if (pct >= 25) return "bg-orange-500";
  return "bg-red-500";
}

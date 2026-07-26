import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicProfileContent } from "@/components/profile/PublicProfileContent";
import { fetchMemberProfile } from "@/lib/member";

interface PageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username: rawUsername } = await params;
  const username = decodeURIComponent(rawUsername).replace(/^@/, "");
  const profile = await fetchMemberProfile(username);

  if (!profile) {
    return { title: "Member not found · Codetopia" };
  }

  const primaryRole = profile.primaryRole || profile.communityRoles?.[0] || "Member";
  const description = profile.bio?.trim() || `${primaryRole} at Codetopia Community.`;

  return {
    title: `${profile.fullName} (@${profile.username}) · Codetopia`,
    description,
    openGraph: {
      title: `${profile.fullName} (@${profile.username})`,
      description,
      type: "profile",
    },
    twitter: {
      card: "summary_large_image",
      title: `${profile.fullName} (@${profile.username})`,
      description,
    },
  };
}

export default async function MemberProfilePage({ params }: PageProps) {
  const { username: rawUsername } = await params;
  const username = decodeURIComponent(rawUsername).replace(/^@/, "");

  const profile = await fetchMemberProfile(username);
  if (!profile) {
    notFound();
  }

  return <PublicProfileContent initialProfile={profile} />;
}

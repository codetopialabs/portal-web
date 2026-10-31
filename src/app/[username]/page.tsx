import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { PublicProfileContent } from "@/components/profile/PublicProfileContent";
import { fetchMemberProfile } from "@/lib/member";

interface PageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username: rawUsername } = await params;
  const username = decodeURIComponent(rawUsername).replace(/^@/, "");
  // If the profile can't be loaded right now, the page shows that; the title
  // just stays plain.
  const profile = await fetchMemberProfile(username).catch(() => undefined);

  if (profile === undefined) {
    return { title: `@${username} · Codetopia Community` };
  }
  if (!profile) {
    return { title: "Member not found · Codetopia Community" };
  }

  const primaryRole = profile.primaryRole || profile.communityRoles?.[0] || "Member";
  const description = profile.bio?.trim() || `${primaryRole} in the Codetopia Community.`;

  return {
    title: `${profile.fullName} (@${profile.username}) · Codetopia Community`,
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
  const decoded = decodeURIComponent(rawUsername);
  const username = decoded.replace(/^@/, "");
  // Profiles live at /@username; older /username links still arrive here and
  // are sent on, so shared links keep working.
  if (!decoded.startsWith("@")) {
    permanentRedirect(`/@${encodeURIComponent(username)}`);
  }

  const profile = await fetchMemberProfile(username);
  if (!profile) {
    notFound();
  }

  return <PublicProfileContent initialProfile={profile} />;
}

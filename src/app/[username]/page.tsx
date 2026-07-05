import { notFound } from "next/navigation";
import { PublicProfileContent } from "@/components/profile/PublicProfileContent";
import type { CommunityMember } from "@/services/user.service";

interface PageProps {
  params: Promise<{ username: string }>;
}

async function fetchMemberProfile(username: string): Promise<CommunityMember | null> {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/users/members/${encodeURIComponent(username)}/`;
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      console.error(
        `[member profile] ${res.status} ${res.statusText} fetching "${username}" from ${url}`
      );
      return null;
    }
    const json = await res.json();
    return json.data as CommunityMember;
  } catch (error) {
    console.error(`[member profile] fetch threw for "${username}" (${url}):`, error);
    return null;
  }
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

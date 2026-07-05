import { notFound } from "next/navigation";
import { PublicProfileContent } from "@/components/profile/PublicProfileContent";
import type { CommunityMember } from "@/services/user.service";

interface PageProps {
  params: Promise<{ username: string }>;
}

async function fetchMemberProfile(username: string): Promise<CommunityMember | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/users/members/${encodeURIComponent(username)}/`,
      { cache: "no-store" }
    );
    if (!res.ok) return null;
    const json = await res.json();
    return json.data as CommunityMember;
  } catch {
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

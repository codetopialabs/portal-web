import type { CommunityMember } from "@/services/user.service";

export async function fetchMemberProfile(username: string): Promise<CommunityMember | null> {
  const baseUrl = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/+$/, "");
  const url = `${baseUrl}/users/members/${encodeURIComponent(username)}/`;
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

import type { CommunityMember } from "@/services/user.service";

/**
 * A member's public profile, or null when there's no such member. Any other
 * failure (the API down, rate-limited, erroring) throws instead, so the page
 * can say "try again" rather than claim the member doesn't exist.
 *
 * Successful answers are cached for a minute. Every visitor's request leaves
 * from this server, so without it they'd all share one address's rate limit
 * on the API. Failures are never cached. The page refetches in the browser,
 * so a member's own edits still show straight away.
 */
export async function fetchMemberProfile(username: string): Promise<CommunityMember | null> {
  const baseUrl = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/+$/, "");
  const url = `${baseUrl}/users/members/${encodeURIComponent(username)}/`;
  let res: Response;
  try {
    res = await fetch(url, { next: { revalidate: 60 } });
  } catch (error) {
    console.error(`[member profile] fetch threw for "${username}" (${url}):`, error);
    throw new Error(`Couldn't reach the API for "${username}"`);
  }
  // A missing member is an ordinary answer, shown as the not-found page.
  if (res.status === 404) return null;
  if (!res.ok) {
    console.error(
      `[member profile] ${res.status} ${res.statusText} fetching "${username}" from ${url}`
    );
    throw new Error(`The API answered ${res.status} for "${username}"`);
  }
  const json = await res.json();
  return json.data as CommunityMember;
}

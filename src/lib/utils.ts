import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function resolveImageUrl(url: string | null | undefined): string | null {
  const normalizedUrl = url?.trim();
  return normalizedUrl ? normalizedUrl : null;
}

export function getAvatarUrl(url: string | null | undefined, name: string): string {
  const imageUrl = resolveImageUrl(url);
  if (imageUrl) return imageUrl;
  return `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${encodeURIComponent(name)}&size=128`;
}

export function getCoverUrl(url: string | null | undefined, name: string): string {
  const imageUrl = resolveImageUrl(url);
  if (imageUrl) return imageUrl;
  return `https://api.dicebear.com/9.x/shapes/svg?seed=${encodeURIComponent(name)}&backgroundColor=000000,ffffff&shape1Color=e5e7eb`;
}

/**
 * A published recognition's page. Recognitions are curated in the portal but
 * *read* on the public community site, so this points off-portal.
 */
export function getWallOfImpactUrl(slug: string): string {
  const base = (
    process.env.NEXT_PUBLIC_COMMUNITY_SITE_URL ?? "https://community.codetopia.org"
  ).replace(/\/+$/, "");
  return `${base}/wall-of-impact/${slug}`;
}

/**
 * A certificate's public verification page -- also read on the public
 * community site rather than in the portal, same reasoning as
 * getWallOfImpactUrl.
 */
export function getCertificateVerifyUrl(verificationCode: string): string {
  const base = (
    process.env.NEXT_PUBLIC_COMMUNITY_SITE_URL ?? "https://community.codetopia.org"
  ).replace(/\/+$/, "");
  return `${base}/verify?code=${encodeURIComponent(verificationCode)}`;
}

/**
 * Converts a string to title case (e.g. "FRONTEND DEVELOPER" → "Frontend Developer").
 * Always applies — any casing the user types is normalised on blur/submit.
 */
export function toTitleCase(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;
  return trimmed.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Strips protocol, domain, leading "@", and any path/query/fragment after
 * the handle from a pasted profile URL/handle, leaving just the bare
 * handle — e.g. "https://github.com/octocat/repositories?tab=overview" and
 * "@octocat" both become "octocat". A handle can never legitimately contain
 * "/", "?", or "#", so anything from the first one onward is dropped rather
 * than just trimming a single trailing slash.
 */
export function sanitizeHandle(value: string): string {
  const withoutDomain = value
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/^(www\.)?[a-z0-9-]+(\.[a-z0-9-]+)+\//i, "")
    .replace(/^@/, "");
  return withoutDomain.split(/[/?#]/)[0];
}

const DOMAIN_LIKE = /^(www\.)?[a-z0-9-]+(\.[a-z0-9-]+)+(\/|$)/i;

/**
 * Resolves a social-profile field into a complete URL, accepting whichever
 * shape the user typed: a bare handle ("octocat"), a domain/path with no
 * protocol ("linkedin.com/in/octocat"), or a full pasted URL
 * ("https://linkedin.com/in/octocat"). `prefix` is the platform's canonical
 * "https://domain/path-segment" used only when the input is a bare handle.
 */
export function resolveSocialUrl(rawInput: string, prefix: string): string {
  const trimmed = rawInput.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (DOMAIN_LIKE.test(trimmed)) return `https://${trimmed}`;
  return `${prefix}${trimmed.replace(/^@/, "")}`;
}

const MIN_AGE = 13;
const MAX_AGE = 120;

function formatLocalISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Bounds for a date-of-birth `<input type="date">`, so the native picker can't select an invalid age. */
export function getDateOfBirthBounds(): { min: string; max: string } {
  const today = new Date();
  const maxDate = new Date(today.getFullYear() - MIN_AGE, today.getMonth(), today.getDate());
  const minDate = new Date(today.getFullYear() - MAX_AGE, today.getMonth(), today.getDate());
  return { min: formatLocalISODate(minDate), max: formatLocalISODate(maxDate) };
}

/** react-hook-form `validate` for a date-of-birth field: rejects future dates and ages outside 13-120. */
export function validateDateOfBirth(value: string): string | true {
  if (!value) return true;
  const dob = new Date(value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (dob >= today) return "Birthday can't be today or in the future.";
  const age =
    today.getFullYear() -
    dob.getFullYear() -
    (today < new Date(today.getFullYear(), dob.getMonth(), dob.getDate()) ? 1 : 0);
  if (age < MIN_AGE) return `You must be at least ${MIN_AGE} years old.`;
  if (age > MAX_AGE) return "Please enter a valid date of birth.";
  return true;
}

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

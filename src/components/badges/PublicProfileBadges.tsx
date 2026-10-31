"use client";

import { Award, Crown, Trophy, Users, X } from "lucide-react";
import Image from "next/image";
import { Dialog } from "radix-ui";
import { useState } from "react";
import { ProfileSection } from "@/components/profile/ProfileSection";
import { useMemberBadges } from "@/hooks/useBadges";
import { withCloudinaryTransform } from "@/lib/utils";
import type { BadgeAward } from "@/types/badges.types";

function holderLabel(count: number): string {
  if (count <= 1) return "First to earn";
  if (count <= 5) return `${count} holders`;
  return `${count} holders`;
}

// Badge art is mostly black line drawings, so it always sits on a light
// plate, which keeps it visible in dark mode too.
function BadgeArt({ award, size }: { award: BadgeAward; size: "sm" | "lg" }) {
  const plate = size === "lg" ? "h-32 w-32 p-5" : "h-20 w-20 p-3.5";
  return (
    <div className={`flex shrink-0 items-center justify-center bg-white dark:bg-zinc-300 ${plate}`}>
      {award.badge.imageUrl ? (
        <div className="relative h-full w-full">
          {/* Uploads come with different amounts of empty margin; trimming
              it lets every badge fill the same box. */}
          <Image
            src={withCloudinaryTransform(award.badge.imageUrl, "e_trim")}
            alt=""
            fill
            sizes={size === "lg" ? "88px" : "52px"}
            className="object-contain"
          />
        </div>
      ) : (
        <Award aria-hidden className="h-1/2 w-1/2 text-zinc-500" />
      )}
    </div>
  );
}

// One badge's details, over the page. Not portalled, so it sits inside the
// profile's theme wrapper and follows light and dark.
export function BadgeDetails({ award, onClose }: { award: BadgeAward; onClose: () => void }) {
  const count = award.badge.awardCount ?? 0;
  const HolderIcon = count <= 1 ? Crown : count <= 5 ? Trophy : Users;

  return (
    <Dialog.Root open onOpenChange={(open) => !open && onClose()}>
      <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 animate-in fade-in-0" />
      <Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 bg-white text-zinc-900 ring-1 ring-black/10 outline-none animate-in fade-in-0 zoom-in-95 dark:bg-[#151515] dark:text-zinc-100 dark:ring-white/10">
        <div className="flex justify-center bg-[#f2f2f2] py-8 dark:bg-[#1c1c1c]">
          <BadgeArt award={award} size="lg" />
        </div>

        <div className="px-6 pt-5 pb-6">
          <p className="font-mono text-xs text-zinc-500">
            {award.featuredRank !== null ? "Featured badge" : "Badge"}
          </p>
          <Dialog.Title className="mt-1 font-sans text-2xl font-semibold tracking-tight text-zinc-950 dark:text-white">
            {award.badge.name}
          </Dialog.Title>
          <Dialog.Description className="mt-2 font-mono text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            {award.badge.description}
          </Dialog.Description>

          {award.reason && (
            <p className="mt-4 border-l-2 border-zinc-300 pl-3 font-mono text-sm leading-6 text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
              {award.reason}
            </p>
          )}

          <div className="mt-5 flex items-center gap-4 border-t border-black/10 pt-4 font-mono text-xs text-zinc-500 dark:border-white/10">
            <span className="inline-flex items-center gap-1.5">
              <HolderIcon aria-hidden className="h-3.5 w-3.5" />
              {holderLabel(count)}
            </span>
            <span>
              Earned{" "}
              {new Date(award.awardedAt).toLocaleDateString("en", {
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
        </div>

        <Dialog.Close
          aria-label="Close"
          className="absolute top-3 right-3 p-1.5 text-zinc-500 outline-offset-2 transition-colors hover:text-zinc-950 focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-zinc-950 dark:hover:text-white dark:focus-visible:outline-white"
        >
          <X aria-hidden className="h-4 w-4" />
        </Dialog.Close>
      </Dialog.Content>
    </Dialog.Root>
  );
}

export function PublicProfileBadges({ username }: { username: string }) {
  const { data: awards = [], isLoading } = useMemberBadges(username);
  const [selected, setSelected] = useState<BadgeAward | null>(null);
  // Featured badges first, in the member's order, then the rest.
  const earned = awards
    .filter((award) => !award.isRevoked)
    .sort(
      (a, b) =>
        (a.featuredRank ?? Number.MAX_SAFE_INTEGER) - (b.featuredRank ?? Number.MAX_SAFE_INTEGER)
    );
  if (isLoading || !earned.length) return null;

  return (
    <ProfileSection title="Badges">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {earned.map((award) => (
          <button
            key={award.id}
            type="button"
            onClick={() => setSelected(award)}
            className="flex flex-col items-center gap-3 rounded-lg bg-[#f2f2f2] px-3 py-5 text-center transition-colors duration-200 hover:bg-[#e8e8e8] dark:bg-[#1c1c1c] dark:hover:bg-[#242424]"
          >
            <BadgeArt award={award} size="sm" />
            <span className="font-mono text-sm text-zinc-700 dark:text-zinc-300">
              {award.badge.name}
            </span>
          </button>
        ))}
      </div>

      {selected && <BadgeDetails award={selected} onClose={() => setSelected(null)} />}
    </ProfileSection>
  );
}

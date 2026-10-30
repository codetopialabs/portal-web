"use client";

import { Award, Crown, Trophy, Users, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { ProfileSection } from "@/components/profile/ProfileSection";
import { useMemberBadges } from "@/hooks/useBadges";
import type { BadgeAward } from "@/types/badges.types";

function holderLabel(count: number): string {
  if (count <= 1) return "First to earn";
  if (count <= 5) return `${count} holders`;
  return `${count} holders`;
}

function BadgeDetails({ award, onClose }: { award: BadgeAward; onClose: () => void }) {
  const count = award.badge.awardCount ?? 0;

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: backdrop overlay closes dialog on click — keyboard users use the Escape key handler on the inner dialog
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-zinc-950/60 backdrop-blur-[2px] p-4 animate-[fade-in_0.15s_ease-out]"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm overflow-hidden border border-zinc-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#151515] animate-[fade-in_0.2s_ease-out]"
        role="dialog"
        aria-modal="true"
        aria-label={`${award.badge.name} badge details`}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
      >
        {/* Badge hero — dark background to make artwork pop */}
        <div className="relative flex justify-center bg-zinc-950 px-6 py-8">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 grid h-7 w-7 place-items-center text-zinc-500 transition-colors hover:text-white"
            aria-label="Close badge details"
          >
            <X className="h-3.5 w-3.5" />
          </button>
          <div className="flex h-24 w-24 items-center justify-center rounded-full border border-white/10 bg-white/5">
            {award.badge.imageUrl ? (
              <div className="relative h-16 w-16 drop-shadow-[0_0_8px_rgba(255,255,255,0.1)]">
                <Image
                  src={award.badge.imageUrl}
                  alt={award.badge.name}
                  fill
                  className="object-contain"
                />
              </div>
            ) : (
              <Award className="h-10 w-10 text-zinc-500" />
            )}
          </div>
        </div>

        {/* Info */}
        <div className="px-5 py-4">
          <p className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-400">
            {award.featuredRank !== null ? "Featured badge" : "Badge earned"}
          </p>
          <h3 className="mt-1 font-sans text-lg font-black uppercase tracking-wide text-zinc-950 dark:text-white">
            {award.badge.name}
          </h3>
          <p className="mt-1.5 font-mono text-[11px] leading-5 text-zinc-500 dark:text-zinc-400">
            {award.badge.description}
          </p>

          {award.reason && (
            <p className="mt-3 border-l-2 border-zinc-950 pl-3 dark:border-white font-mono text-[10px] leading-5 text-zinc-500">
              {award.reason}
            </p>
          )}

          {/* Metrics */}
          <div className="mt-4 flex items-center gap-3 border-t border-zinc-200 pt-3 font-mono dark:border-white/10 text-[10px]">
            <span className="inline-flex items-center gap-1 text-zinc-500">
              {count <= 1 ? (
                <Crown className="h-3 w-3 text-zinc-500" />
              ) : count <= 5 ? (
                <Trophy className="h-3 w-3 text-zinc-500" />
              ) : (
                <Users className="h-3 w-3 text-zinc-400" />
              )}
              {holderLabel(count)}
            </span>
            <span className="text-zinc-300">|</span>
            <span className="text-zinc-400">
              Earned{" "}
              {new Date(award.awardedAt).toLocaleDateString("en", {
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
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
            {award.badge.imageUrl ? (
              <div className="relative h-14 w-14">
                <Image
                  src={award.badge.imageUrl}
                  alt=""
                  fill
                  sizes="56px"
                  className="object-contain"
                />
              </div>
            ) : (
              <Award className="h-10 w-10 text-zinc-500" />
            )}
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

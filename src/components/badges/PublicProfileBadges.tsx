"use client";

import { Award, Crown, Trophy, Users, X } from "lucide-react";
import { useState } from "react";
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
        className="w-full max-w-sm overflow-hidden border border-zinc-200 bg-white shadow-2xl animate-[fade-in_0.2s_ease-out]"
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
              <img
                src={award.badge.imageUrl}
                alt={award.badge.name}
                className="h-16 w-16 object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.1)]"
              />
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
          <h3 className="mt-1 font-sans text-lg font-black uppercase tracking-wide text-zinc-950">
            {award.badge.name}
          </h3>
          <p className="mt-1.5 font-mono text-[11px] leading-5 text-zinc-500">
            {award.badge.description}
          </p>

          {award.reason && (
            <p className="mt-3 border-l-2 border-zinc-950 pl-3 font-mono text-[10px] leading-5 text-zinc-500">
              {award.reason}
            </p>
          )}

          {/* Metrics */}
          <div className="mt-4 flex items-center gap-3 border-t border-zinc-200 pt-3 font-mono text-[10px]">
            <span className="inline-flex items-center gap-1 text-zinc-500">
              {count <= 1 ? (
                <Crown className="h-3 w-3 text-amber-500" />
              ) : count <= 5 ? (
                <Trophy className="h-3 w-3 text-amber-500" />
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

function AllBadgesGrid({
  awards,
  onSelect,
}: {
  awards: BadgeAward[];
  onSelect: (award: BadgeAward) => void;
}) {
  return (
    <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-6">
      {awards.map((award) => (
        <button
          key={award.id}
          type="button"
          onClick={() => onSelect(award)}
          title={award.badge.name}
          className="group flex flex-col items-center gap-1.5 border border-zinc-200 bg-white p-2.5 text-center transition-all duration-200 hover:border-zinc-950 hover:shadow-[2px_2px_0_0_rgba(0,0,0,0.04)]"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-950">
            {award.badge.imageUrl ? (
              <img
                src={award.badge.imageUrl}
                alt={award.badge.name}
                className="h-7 w-7 object-contain"
              />
            ) : (
              <Award className="h-5 w-5 text-zinc-500" />
            )}
          </div>
          <p className="line-clamp-2 font-mono text-[9px] font-bold uppercase leading-tight tracking-wide text-zinc-700 group-hover:text-zinc-950">
            {award.badge.name}
          </p>
        </button>
      ))}
    </div>
  );
}

export function PublicProfileBadges({ username }: { username: string }) {
  const { data: awards = [], isLoading } = useMemberBadges(username);
  const [selected, setSelected] = useState<BadgeAward | null>(null);
  const earned = awards.filter((award) => !award.isRevoked);
  const featured = [...earned]
    .filter((award) => award.featuredRank !== null)
    .sort((a, b) => (a.featuredRank ?? 0) - (b.featuredRank ?? 0));
  if (isLoading || !earned.length) return null;

  return (
    <>
      {featured.length > 0 && (
        <section className="border-t border-zinc-200 pt-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                Recognition
              </p>
              <h2 className="mt-1 font-sans text-sm font-black uppercase tracking-widest text-zinc-950">
                Featured badges
              </h2>
            </div>
            <span className="font-mono text-[10px] text-zinc-400">{featured.length} selected</span>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2.5">
            {featured.map((award) => {
              const count = award.badge.awardCount ?? 0;
              return (
                <button
                  key={award.id}
                  type="button"
                  onClick={() => setSelected(award)}
                  className="group relative min-w-0 overflow-hidden border border-zinc-200 bg-white text-left transition-all duration-200 hover:border-zinc-950 hover:shadow-[2px_2px_0_0_rgba(0,0,0,0.04)]"
                >
                  {/* Badge artwork — dark hero strip */}
                  <div className="flex justify-center bg-zinc-950 px-3 py-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/5">
                      {award.badge.imageUrl ? (
                        <img
                          src={award.badge.imageUrl}
                          alt={award.badge.name}
                          className="h-10 w-10 object-contain drop-shadow-[0_0_6px_rgba(255,255,255,0.08)]"
                        />
                      ) : (
                        <Award className="h-6 w-6 text-zinc-500" />
                      )}
                    </div>
                  </div>
                  {/* Info */}
                  <div className="px-3 py-2.5">
                    <p className="truncate font-sans text-[11px] font-black uppercase tracking-wide text-zinc-950">
                      {award.badge.name}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1 font-mono text-[8px] uppercase tracking-wider text-zinc-400">
                      {count <= 1 ? (
                        <Crown className="h-2.5 w-2.5 text-amber-500" />
                      ) : count <= 5 ? (
                        <Trophy className="h-2.5 w-2.5 text-amber-500" />
                      ) : (
                        <Users className="h-2.5 w-2.5 text-zinc-400" />
                      )}
                      {holderLabel(count)}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      <section className="border-t border-zinc-200 pt-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
              Achievements
            </p>
            <h2 className="mt-1 font-sans text-sm font-black uppercase tracking-widest text-zinc-950">
              All badges
            </h2>
          </div>
          <span className="font-mono text-[10px] text-zinc-400">{earned.length} earned</span>
        </div>
        <AllBadgesGrid awards={earned} onSelect={setSelected} />
      </section>

      {selected && <BadgeDetails award={selected} onClose={() => setSelected(null)} />}
    </>
  );
}

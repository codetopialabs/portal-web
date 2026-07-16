"use client";

import { Award, Check, LockKeyhole, Sparkles, Star, X } from "lucide-react";
import { useState } from "react";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { DashboardShell } from "@/components/dashboard/Shell";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useFeatureBadges, useMyBadges } from "@/hooks/useBadges";
import type { BadgeAward } from "@/types/badges.types";

function BadgeImage({ award, size = "h-16 w-16" }: { award: BadgeAward; size?: string }) {
  return award.badge.imageUrl ? (
    <img src={award.badge.imageUrl} alt={award.badge.name} className={`${size} object-contain`} />
  ) : (
    <Award className={`${size} p-4 text-zinc-400`} />
  );
}

function BadgeCard({
  award,
  isFeatured,
  canFeature,
  onSelect,
}: {
  award: BadgeAward;
  isFeatured: boolean;
  canFeature: boolean;
  onSelect: () => void;
}) {
  const [open, setOpen] = useState(false);
  const awardedDate = new Date(award.awardedAt).toLocaleDateString("en", {
    month: "short",
    year: "numeric",
  });

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group relative flex flex-col overflow-hidden border border-zinc-200 bg-white p-5 text-left transition-all duration-200 hover:border-zinc-950 hover:shadow-[3px_3px_0_0_rgba(0,0,0,0.04)]"
      >
        {/* Shine sweep on hover */}
        <div className="pointer-events-none absolute inset-0 -translate-x-full skew-x-[-15deg] bg-gradient-to-r from-transparent via-zinc-950/[0.02] to-transparent opacity-0 group-hover:animate-[badge-card-shine_0.7s_ease-out_forwards] group-hover:opacity-100" />

        <div className="flex items-start justify-between gap-3">
          <div className="flex h-14 w-14 items-center justify-center border border-zinc-200 bg-zinc-50 transition-all duration-200 group-hover:border-zinc-300 group-hover:bg-white group-hover:shadow-sm">
            <BadgeImage award={award} size="h-10 w-10" />
          </div>
          {isFeatured ? (
            <span className="inline-flex items-center gap-1 bg-zinc-950 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-wider text-white">
              <Star className="h-3 w-3 fill-white text-white" /> Featured
            </span>
          ) : (
            <span className="font-mono text-[10px] text-zinc-400">{awardedDate}</span>
          )}
        </div>
        <div className="mt-6">
          <p className="font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-zinc-500">
            {award.source === "manual" ? "Community recognition" : "Milestone unlocked"}
          </p>
          <h2 className="mt-2 font-sans text-lg font-black uppercase tracking-wide text-zinc-950">
            {award.badge.name}
          </h2>
          <p className="mt-2 line-clamp-2 font-mono text-[11px] leading-5 text-zinc-500">
            {award.badge.description}
          </p>
        </div>
        <div className="mt-6 flex items-center justify-between border-t border-zinc-200 pt-3 font-mono text-[10px] font-bold text-zinc-500 transition-colors group-hover:text-zinc-950">
          <span>View details</span>
        </div>
      </button>
      {open && (
        // biome-ignore lint/a11y/noStaticElementInteractions: backdrop overlay closes dialog on click — keyboard users use the Escape key handler on the inner dialog
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-zinc-950/50 backdrop-blur-[2px] p-4 animate-[fade-in_0.15s_ease-out]"
          role="presentation"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-lg border border-zinc-200 bg-white shadow-2xl animate-[fade-in_0.2s_ease-out]"
            role="dialog"
            aria-modal="true"
            aria-label={`${award.badge.name} badge details`}
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
          >
            <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
              <div>
                <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                  Badge details
                </p>
                <p className="mt-1 font-mono text-[10px] text-zinc-500">
                  Your Codetopia achievement
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="grid h-8 w-8 place-items-center border border-zinc-200 text-zinc-500 transition-colors hover:border-zinc-950 hover:text-zinc-950"
                aria-label="Close badge details"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-start gap-5">
                <div className="grid h-24 w-24 shrink-0 place-items-center border border-zinc-200 bg-zinc-50">
                  <BadgeImage award={award} size="h-16 w-16" />
                </div>
                <div className="min-w-0 pt-1">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">
                    {award.source === "manual" ? "Community recognition" : "Milestone unlocked"}
                  </p>
                  <h2 className="mt-2 font-sans text-2xl font-black uppercase tracking-wide text-zinc-950">
                    {award.badge.name}
                  </h2>
                  <p className="mt-2 font-mono text-xs leading-5 text-zinc-500">
                    {award.badge.description}
                  </p>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-2 border border-zinc-200 font-mono text-[10px]">
                <div className="border-r border-zinc-200 px-4 py-3">
                  <p className="uppercase tracking-widest text-zinc-400">Earned</p>
                  <p className="mt-1 font-bold text-zinc-700">
                    {new Date(award.awardedAt).toLocaleDateString("en", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="px-4 py-3">
                  <p className="uppercase tracking-widest text-zinc-400">Profile</p>
                  <p className="mt-1 font-bold text-zinc-700">
                    {isFeatured ? <span className="text-amber-700">Featured</span> : "Not featured"}
                  </p>
                </div>
              </div>
              {award.reason && (
                <p className="mt-5 border-l-2 border-zinc-950 pl-3 font-mono text-[11px] leading-5 text-zinc-500">
                  {award.reason}
                </p>
              )}
            </div>
            <div className="border-t border-zinc-200 bg-zinc-50 px-6 py-4">
              <Button
                className="h-10 w-full rounded-none bg-zinc-950 font-mono text-xs font-bold text-white hover:bg-zinc-800"
                onClick={() => {
                  onSelect();
                  setOpen(false);
                }}
                disabled={!isFeatured && !canFeature}
              >
                {isFeatured ? (
                  <>
                    <Check className="h-4 w-4" /> Remove from profile
                  </>
                ) : (
                  <>
                    <Star className="h-4 w-4" /> Add to profile
                  </>
                )}
              </Button>
              {!isFeatured && !canFeature && (
                <p className="mt-2 text-center font-mono text-[10px] text-zinc-400">
                  Remove a featured badge before adding another.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function BadgesContent() {
  const { data: awards = [], isLoading } = useMyBadges();
  const feature = useFeatureBadges();
  const earned = awards.filter((award) => !award.isRevoked);
  const featured = [...earned]
    .filter((award) => award.featuredRank !== null)
    .sort((a, b) => (a.featuredRank ?? 0) - (b.featuredRank ?? 0));
  const toggle = (id: string) => {
    const ids = featured.map((award) => award.id);
    feature.mutate(
      ids.includes(id) ? ids.filter((awardId) => awardId !== id) : [...ids, id].slice(0, 3)
    );
  };

  return (
    <DashboardShell>
      <div className="mx-auto max-w-6xl space-y-8 pb-16">
        <header className="border-b border-zinc-200 pb-7">
          <div className="hidden" />
          <div className="hidden" />
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                <Sparkles className="inline h-3 w-3" /> Your achievements
              </p>
              <h1 className="mt-5 font-sans text-3xl font-black uppercase tracking-widest sm:text-4xl">
                Badge collection
              </h1>
              <p className="mt-3 max-w-xl font-mono text-xs leading-6 text-zinc-500">
                Celebrate the progress you have made in the Codetopia community. Choose up to three
                badges to make your public profile feel like yours.
              </p>
            </div>
            <div className="flex gap-3">
              <div className="rounded-none border border-zinc-200 bg-white px-5 py-3 text-center">
                <p className="text-2xl font-black">{earned.length}</p>
                <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-400">
                  earned
                </p>
              </div>
              <div className="rounded-none border border-zinc-200 bg-zinc-50 px-5 py-3 text-center">
                <p className="text-2xl font-black text-zinc-500">
                  {featured.length}
                  <span className="text-base">/3</span>
                </p>
                <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-400">
                  featured
                </p>
              </div>
            </div>
          </div>
        </header>

        <section className="rounded-none border border-zinc-200 bg-white p-5 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">
                Public profile
              </p>
              <h2 className="mt-1 font-sans text-xl font-black uppercase tracking-wide text-zinc-950">
                Your featured shelf
              </h2>
              <p className="mt-1 font-mono text-[11px] text-zinc-500">
                The badges other members see first.
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-none bg-zinc-50 px-3 py-1.5 font-mono text-[10px] font-bold text-zinc-600">
              <Star className="h-3 w-3 fill-amber-500 text-zinc-500" /> {featured.length} of 3
              selected
            </span>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[0, 1, 2].map((slot) => {
              const award = featured[slot];
              return (
                <div
                  key={slot}
                  className={`flex min-h-28 items-center gap-4 rounded-none border p-4 transition-all duration-200 ${award ? "border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-sm" : "border-dashed border-zinc-200 bg-zinc-50/70"}`}
                >
                  {award ? (
                    <>
                      <div className="grid h-16 w-16 shrink-0 place-items-center rounded-none bg-white">
                        <BadgeImage award={award} size="h-12 w-12" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-amber-600">
                          Featured {slot + 1}
                        </p>
                        <p className="mt-1 truncate font-bold text-zinc-950">{award.badge.name}</p>
                        <p className="mt-1 font-mono text-[10px] text-zinc-500">
                          Visible on profile
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="grid h-12 w-12 place-items-center rounded-none border border-zinc-200 bg-white font-mono text-sm text-zinc-400">
                        {slot + 1}
                      </div>
                      <p className="font-mono text-[11px] text-zinc-400">Choose a badge below</p>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <section>
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400">
                Your collection
              </p>
              <h2 className="mt-1 font-sans text-2xl font-black uppercase tracking-wide text-zinc-950">
                Earned badges <span className="text-zinc-400">({earned.length})</span>
              </h2>
            </div>
          </div>
          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-72 rounded-none" />
              ))}
            </div>
          ) : earned.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[...earned]
                .sort((a, b) => new Date(b.awardedAt).getTime() - new Date(a.awardedAt).getTime())
                .map((award) => (
                  <BadgeCard
                    key={award.id}
                    award={award}
                    isFeatured={award.featuredRank !== null}
                    onSelect={() => toggle(award.id)}
                    canFeature={featured.length < 3}
                  />
                ))}
            </div>
          ) : (
            <div className="rounded-none border border-dashed border-zinc-300 bg-white px-6 py-20 text-center">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-none bg-zinc-50 text-zinc-500">
                <LockKeyhole className="h-7 w-7" />
              </div>
              <h2 className="mt-5 text-xl font-black text-zinc-950">
                Your story is just getting started
              </h2>
              <p className="mx-auto mt-2 max-w-sm font-mono text-xs leading-6 text-zinc-500">
                Keep contributing, learning, and showing up. Your first badge will appear here when
                you reach a milestone.
              </p>
            </div>
          )}
        </section>
      </div>
    </DashboardShell>
  );
}

export default function BadgesPage() {
  return (
    <RouteGuard permission="authenticated">
      <BadgesContent />
    </RouteGuard>
  );
}

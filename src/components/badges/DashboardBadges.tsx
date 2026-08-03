"use client";

import { ArrowRight, Award, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyBadges } from "@/hooks/useBadges";

export function DashboardBadges() {
  const { data: awards = [], isLoading } = useMyBadges();
  const earned = awards.filter((award) => !award.isRevoked);
  const visible = [...earned]
    .sort((a, b) => {
      if (a.featuredRank && b.featuredRank) return a.featuredRank - b.featuredRank;
      if (a.featuredRank) return -1;
      if (b.featuredRank) return 1;
      return new Date(b.awardedAt).getTime() - new Date(a.awardedAt).getTime();
    })
    .slice(0, 4);
  const remaining = earned.length - visible.length;

  return (
    <section className="border border-zinc-200 bg-white">
      <div className="flex items-center justify-between gap-4 border-b border-zinc-200 px-5 py-4">
        <div>
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
            Recognition
          </p>
          <h2 className="mt-1 font-sans text-sm font-black uppercase tracking-widest text-zinc-950">
            Badges
          </h2>
        </div>
        <Link
          href="/badges"
          className="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold text-zinc-500 transition-colors hover:text-zinc-950"
        >
          View collection <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      {isLoading ? (
        <div className="grid gap-4 p-5 lg:grid-cols-[190px_1fr]">
          <Skeleton className="h-24 w-full rounded-none" />
          <div className="flex gap-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-24 w-24 rounded-none" />
            ))}
          </div>
        </div>
      ) : earned.length ? (
        <div className="grid gap-5 p-5 lg:grid-cols-[190px_1fr] lg:items-center">
          <div className="border-l-2 border-zinc-950 pl-4">
            <p className="font-sans text-3xl font-black text-zinc-950">{earned.length}</p>
            <p className="mt-1 font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              {earned.length === 1 ? "Badge earned" : "Badges earned"}
            </p>
            <p className="mt-2 font-mono text-[10px] leading-4 text-zinc-400">
              Your latest community milestones.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {visible.map((award) => (
              <Link
                key={award.id}
                href="/badges"
                className="group relative flex min-w-28 flex-1 items-center gap-3 overflow-hidden border border-zinc-200 p-3 transition-all duration-200 hover:border-zinc-950 hover:shadow-[2px_2px_0_0_rgba(0,0,0,0.05)] sm:max-w-44"
              >
                {/* Shine effect on hover */}
                <div className="pointer-events-none absolute inset-0 -translate-x-full skew-x-[-15deg] bg-gradient-to-r from-transparent via-zinc-950/[0.03] to-transparent opacity-0 transition-opacity duration-300 group-hover:animate-[badge-card-shine_0.6s_ease-out_forwards] group-hover:opacity-100" />

                <div className="relative flex h-11 w-11 shrink-0 items-center justify-center border border-zinc-200 bg-zinc-50 transition-colors group-hover:border-zinc-300 group-hover:bg-white">
                  {award.badge.imageUrl ? (
                    <div className="relative h-8 w-8">
                      <Image
                        src={award.badge.imageUrl}
                        alt={award.badge.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                  ) : (
                    <Award className="h-4 w-4 text-zinc-300" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-sans text-xs font-black text-zinc-950">
                    {award.badge.name}
                  </p>
                  <p className="mt-1 font-mono text-[9px] uppercase tracking-wider text-zinc-400">
                    {award.featuredRank ? (
                      <span className="text-amber-600">Featured</span>
                    ) : (
                      "Earned"
                    )}
                  </p>
                </div>
              </Link>
            ))}
            {remaining > 0 && (
              <Link
                href="/badges"
                className="flex min-w-24 flex-1 items-center justify-center border border-dashed border-zinc-300 px-3 font-mono text-xs font-bold text-zinc-500 transition-colors hover:border-zinc-950 hover:text-zinc-950 sm:max-w-32"
              >
                +{remaining} more
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-4 p-5">
          <div className="grid h-11 w-11 place-items-center border border-zinc-200 bg-zinc-50">
            <Sparkles className="h-5 w-5 text-zinc-400" />
          </div>
          <div>
            <p className="font-sans text-xs font-black uppercase tracking-widest text-zinc-700">
              Your collection starts here
            </p>
            <p className="mt-1 font-mono text-[10px] text-zinc-400">
              Badges appear as you reach community milestones.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

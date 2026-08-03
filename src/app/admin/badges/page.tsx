"use client";

import { Award, Plus, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminBadges } from "@/hooks/useBadges";
import { usePermission } from "@/hooks/usePermission";
import type { Badge } from "@/types/badges.types";

const STATUS_STYLES: Record<Badge["status"], { label: string; classes: string }> = {
  active: {
    label: "Active",
    classes: "border-emerald-300 bg-emerald-50 text-emerald-700",
  },
  draft: {
    label: "Draft",
    classes: "border-amber-300 bg-amber-50 text-amber-700",
  },
  archived: {
    label: "Archived",
    classes: "border-zinc-200 bg-zinc-50 text-zinc-500",
  },
};

function BadgeAdminContent() {
  const { data: badges = [], isLoading } = useAdminBadges();
  const canCreate = usePermission("badges.create");
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () =>
      badges.filter((badge) =>
        `${badge.name} ${badge.description}`.toLowerCase().includes(search.toLowerCase())
      ),
    [badges, search]
  );

  const stats = useMemo(
    () => ({
      total: badges.length,
      active: badges.filter((b) => b.status === "active").length,
      awards: badges.reduce((sum, b) => sum + b.awardCount, 0),
    }),
    [badges]
  );

  return (
    <div className="pb-20 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-5 border-b border-zinc-200 pb-6">
        <div>
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
            Recognition system
          </p>
          <h1 className="mt-1 font-sans text-3xl font-black uppercase tracking-widest text-zinc-950">
            Badges
          </h1>
          <p className="mt-2 max-w-xl font-mono text-xs leading-6 text-zinc-500">
            Design achievements, build precise award rules, and recognise member progress
            automatically.
          </p>
        </div>
        {canCreate && (
          <Button asChild className="h-9 rounded-none font-mono text-xs font-bold">
            <Link href="/admin/badges/new">
              <Plus className="h-4 w-4" /> Create badge
            </Link>
          </Button>
        )}
      </div>

      {/* Stats */}
      <section className="grid border border-zinc-200 bg-white sm:grid-cols-3">
        {[
          { label: "Total badges", value: stats.total },
          { label: "Active", value: stats.active },
          { label: "Awards issued", value: stats.awards },
        ].map((stat, index) => (
          <div
            key={stat.label}
            className={`p-5 ${index ? "border-t border-zinc-200 sm:border-l sm:border-t-0" : ""}`}
          >
            <p className="font-mono text-[10px] font-black uppercase tracking-widest text-zinc-400">
              {stat.label}
            </p>
            <p className="mt-2 font-sans text-3xl font-black text-zinc-950">
              {isLoading ? "—" : stat.value}
            </p>
          </div>
        ))}
      </section>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search badges…"
          className="h-9 rounded-none pl-9 font-mono text-xs"
        />
      </div>

      {/* List */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-40 w-full rounded-none" />
          ))}
        </div>
      ) : filtered.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((badge) => {
            const s = STATUS_STYLES[badge.status];
            return (
              <Link
                key={badge.id}
                href={`/admin/badges/${badge.slug}/edit`}
                className="group border border-zinc-200 bg-white p-5 transition-all hover:border-zinc-950"
              >
                <div className="flex items-start gap-4">
                  {/* Artwork */}
                  <div className="relative flex h-20 w-20 shrink-0 items-center justify-center bg-zinc-50 border border-zinc-100">
                    {badge.imageUrl ? (
                      <Image src={badge.imageUrl} alt="" fill className="object-contain p-2" />
                    ) : (
                      <Award className="h-8 w-8 text-zinc-200" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span
                      className={`inline-block border px-2 py-0.5 font-mono text-[9px] font-black uppercase tracking-widest ${s.classes}`}
                    >
                      {s.label}
                    </span>
                    <h2 className="mt-2 truncate font-sans text-base font-black text-zinc-950">
                      {badge.name}
                    </h2>
                    <p className="mt-1 line-clamp-2 font-mono text-[10px] leading-5 text-zinc-400">
                      {badge.description}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-4">
                  <span className="inline-flex items-center gap-1.5 font-mono text-[10px] text-zinc-400">
                    <Award className="h-3 w-3" /> {badge.awardCount} awarded
                  </span>
                  <span className="font-mono text-[10px] text-zinc-300">
                    Rule v{badge.criteriaVersion}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="border border-dashed border-zinc-200 py-24 text-center">
          <Award className="mx-auto h-8 w-8 text-zinc-200" />
          <h2 className="mt-4 font-sans text-base font-black uppercase tracking-widest text-zinc-950">
            No badges found
          </h2>
          <p className="mt-1 font-mono text-xs text-zinc-400">
            {search
              ? "Try a different search term."
              : "Create the first achievement for your community."}
          </p>
        </div>
      )}
    </div>
  );
}

export default function BadgesAdminPage() {
  return (
    <RouteGuard permission="badges.view">
      <BadgeAdminContent />
    </RouteGuard>
  );
}

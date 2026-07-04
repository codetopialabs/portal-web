"use client";

import { Search, Users2 } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminTeams } from "@/hooks/useTeams";

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(
    new Date(iso)
  );
}

function AdminTeamsContent() {
  const { data: teams, isLoading } = useAdminTeams();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const list = teams ?? [];
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (t) => t.name.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q)
    );
  }, [teams, search]);

  return (
    <div className="pb-20">
      <div className="mb-6">
        <p className="font-mono text-xs font-medium text-zinc-400">Admin Panel</p>
        <h1 className="font-sans text-4xl font-bold tracking-tight text-zinc-950">Teams</h1>
        <p className="mt-1 font-mono text-xs text-zinc-500">
          Every team platform-wide, regardless of whether you're a member.
        </p>
      </div>

      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search teams..."
          className="h-10 rounded-none border-zinc-200 pl-9 font-mono text-sm"
        />
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton placeholders
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 border border-dashed border-zinc-200 bg-zinc-50 py-16 text-center">
          <Users2 className="h-6 w-6 text-zinc-300" />
          <p className="font-mono text-xs text-zinc-400">
            {search ? "No teams match your search." : "No teams yet."}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-zinc-100 border border-zinc-200 bg-white">
          {filtered.map((team) => (
            <Link
              key={team.id}
              href={`/admin/teams/${team.slug}`}
              className="flex items-center justify-between gap-4 p-4 transition-colors hover:bg-zinc-50"
            >
              <div className="min-w-0">
                <p className="font-sans text-sm font-bold text-zinc-950">{team.name}</p>
                {team.description && (
                  <p className="mt-0.5 truncate font-mono text-xs text-zinc-500">
                    {team.description}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-4">
                <div className="text-right">
                  <p className="font-mono text-xs font-bold text-zinc-900">
                    {team.memberCount ?? 0}
                  </p>
                  <p className="font-mono text-[9px] uppercase tracking-wider text-zinc-400">
                    Members
                  </p>
                </div>
                <p className="font-mono text-[10px] text-zinc-400 w-20 text-right">
                  {formatDate(team.createdAt)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminTeamsPage() {
  return (
    <RouteGuard permission="admin.panel.access">
      <AdminTeamsContent />
    </RouteGuard>
  );
}

"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import type { CommunityMember } from "@/services/user.service";
import { MemberCard } from "./member-card";
import {
  EMPTY_FILTERS,
  filterMembers,
  getMemberFilterOptions,
  type MemberFilters,
} from "./member-directory-utils";
import { MemberFilterPopover } from "./member-filter-popover";

interface MemberDirectoryProps {
  members: CommunityMember[];
  isLoading: boolean;
  error: string | null;
  initialRoleFilter?: string;
  onRoleFilterChange: (role: string) => void;
}

export function MemberDirectory({
  members,
  isLoading,
  error,
  initialRoleFilter = "all",
  onRoleFilterChange,
}: MemberDirectoryProps) {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<MemberFilters>({
    ...EMPTY_FILTERS,
    role: initialRoleFilter || "all",
  });

  const options = useMemo(() => getMemberFilterOptions(members), [members]);
  const filteredMembers = useMemo(
    () => filterMembers(members, search, filters),
    [filters, members, search]
  );

  function updateFilters(nextFilters: MemberFilters) {
    setFilters(nextFilters);
    onRoleFilterChange(nextFilters.role);
  }

  function resetFilters() {
    setFilters(EMPTY_FILTERS);
    onRoleFilterChange("all");
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
          <Input
            placeholder="Search by name, role, or skill..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="h-11 rounded-none border-zinc-200 bg-white pl-9 font-mono text-sm transition-all focus-visible:border-zinc-900 focus-visible:ring-0"
          />
        </div>
        <MemberFilterPopover
          filters={filters}
          options={options}
          onChange={updateFilters}
          onReset={resetFilters}
        />
      </div>

      {error && (
        <div className="border border-zinc-200 bg-white px-4 py-3">
          <p className="font-mono text-sm text-zinc-500">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <MemberCardSkeletons />
        ) : (
          filteredMembers.map((member) => <MemberCard key={member.id} member={member} />)
        )}

        {!isLoading && filteredMembers.length === 0 && (
          <div className="border border-zinc-200 bg-white py-16 text-center sm:col-span-2 lg:col-span-3">
            <p className="font-mono text-sm text-zinc-500">No members match your search</p>
          </div>
        )}
      </div>
    </div>
  );
}

function MemberCardSkeletons() {
  const skeletonIds = [
    "member-card-skeleton-1",
    "member-card-skeleton-2",
    "member-card-skeleton-3",
    "member-card-skeleton-4",
    "member-card-skeleton-5",
    "member-card-skeleton-6",
  ];

  return skeletonIds.map((skeletonId) => (
    <div
      key={skeletonId}
      className="flex animate-pulse items-start gap-3 border border-zinc-200 bg-white p-4"
    >
      <div className="h-10 w-10 shrink-0 rounded-full bg-zinc-100" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="h-4 w-2/3 bg-zinc-100" />
          <div className="h-3 w-3 bg-zinc-100" />
        </div>
        <div className="h-3 w-1/2 bg-zinc-100" />
        <div className="h-3 w-3/4 bg-zinc-100" />
        <div className="flex gap-1 pt-1">
          <div className="h-5 w-16 bg-zinc-100" />
          <div className="h-5 w-20 bg-zinc-100" />
        </div>
      </div>
    </div>
  ));
}

"use client";

import { Search } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useCommunityMembers } from "@/hooks/useCommunityMembers";
import { getAvatarUrl } from "@/lib/utils";
import type { CommunityMember } from "@/services/user.service";

/** Search-and-select an existing portal member. Originally lived inline in
 * RecognitionForm; pulled out once Certificates needed the same picker
 * inside a per-row toggle, rather than duplicating the search/select logic. */
export function MemberPicker({
  selected,
  onSelect,
}: {
  selected: CommunityMember | null;
  onSelect: (member: CommunityMember | null) => void;
}) {
  const [search, setSearch] = useState("");
  const { data: members = [], isLoading } = useCommunityMembers(search.trim() || undefined, {
    excludeFlagged: true,
  });

  if (selected) {
    return (
      <div className="flex items-center gap-3 border border-zinc-200 bg-white px-3 py-2.5">
        {/* biome-ignore lint/performance/noImgElement: avatar URL from API */}
        <img
          src={getAvatarUrl(selected.profilePictureUrl, selected.fullName)}
          alt={selected.fullName}
          className="h-8 w-8 shrink-0 border border-zinc-200 object-cover"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate font-sans text-sm font-bold text-zinc-950">{selected.fullName}</p>
          <p className="truncate font-mono text-[11px] text-zinc-400">
            @{selected.username}
            {selected.primaryRole ? ` · ${selected.primaryRole}` : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onSelect(null)}
          className="shrink-0 font-mono text-[11px] text-zinc-400 hover:text-zinc-900"
        >
          Change
        </button>
      </div>
    );
  }

  return (
    <div className="border border-zinc-200 bg-white">
      <div className="relative border-b border-zinc-100">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search members by name or username…"
          className="h-9 rounded-none border-0 bg-transparent pl-9 font-mono text-xs shadow-none focus-visible:ring-0"
        />
      </div>
      <div className="max-h-56 overflow-y-auto">
        {isLoading ? (
          <div className="space-y-2 p-3">
            <Skeleton className="h-8 w-full rounded-none" />
            <Skeleton className="h-8 w-full rounded-none" />
          </div>
        ) : members.length === 0 ? (
          <p className="px-3 py-6 text-center font-mono text-[11px] text-zinc-400">
            No members match that search.
          </p>
        ) : (
          members.slice(0, 25).map((member) => (
            <button
              key={member.id}
              type="button"
              onClick={() => onSelect(member)}
              className="flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-zinc-50"
            >
              {/* biome-ignore lint/performance/noImgElement: avatar URL from API */}
              <img
                src={getAvatarUrl(member.profilePictureUrl, member.fullName)}
                alt={member.fullName}
                className="h-7 w-7 shrink-0 border border-zinc-200 object-cover"
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-sans text-xs font-bold text-zinc-950">
                  {member.fullName}
                </span>
                <span className="block truncate font-mono text-[10px] text-zinc-400">
                  @{member.username}
                  {member.primaryRole ? ` · ${member.primaryRole}` : ""}
                </span>
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

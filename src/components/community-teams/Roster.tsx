"use client";

import { Check, Pencil, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { FlagPill, StatusPill } from "@/components/community-teams/pills";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useTeamRoster, useUpdateRosterMember } from "@/hooks/useCommunityTeams";
import { MEMBER_LEVEL_LABELS, MEMBER_STATUS_LABELS } from "@/lib/profile-options";
import { cn, getAvatarUrl } from "@/lib/utils";
import type {
  CommunityTeam,
  MemberLevel,
  MemberStatus,
  RosterMember,
} from "@/services/community-teams.service";

// Teams v2: a team's roster with inline editing. Used by My Team (leads and
// deputies, level capped at Core) and by the admin team page (every field).
// Flags and ordering come from the backend; this only shows them.

const GRID = "lg:grid-cols-[2.2fr_1.2fr_1fr_1.4fr_1fr_1.1fr_0.8fr_1fr_auto]";
const HEADERS = [
  "Member",
  "Discord",
  "Level",
  "Role",
  "Status",
  "Last check-in",
  "Hours",
  "Flag",
  "",
];

const selectTrigger =
  "h-9 w-full rounded-none border-grey-200 bg-white px-2 font-mono text-xs text-text-primary focus-visible:border-grey-900 focus-visible:ring-0";
const selectContent =
  "rounded-none border border-grey-200 bg-white font-mono text-xs shadow-md z-50 p-1";
const selectItem =
  "rounded-none font-mono py-1.5 px-2 text-text-primary hover:bg-grey-50 cursor-pointer focus:bg-grey-50 focus:outline-none";

function formatDate(value: string | null): string {
  if (!value) return "Never";
  const date = new Date(`${value}T00:00:00`);
  return date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

function RosterRowEditor({
  member,
  slug,
  canAssignLead,
  onDone,
}: {
  member: RosterMember;
  slug: string;
  canAssignLead: boolean;
  onDone: () => void;
}) {
  const update = useUpdateRosterMember(slug);
  const [level, setLevel] = useState<MemberLevel>(member.level);
  const [roleTitle, setRoleTitle] = useState(member.roleTitle);
  const [status, setStatus] = useState<MemberStatus>(member.status);
  const [lastCheckIn, setLastCheckIn] = useState(member.lastCheckIn ?? "");

  // A lead promotes up to Core; only admins and the Community Lead set Lead.
  const levelOptions: MemberLevel[] = canAssignLead
    ? ["member", "contributor", "core", "lead", "alumni"]
    : ["member", "contributor", "core", "alumni"];
  const levelLocked = member.level === "lead" && !canAssignLead;

  async function save() {
    try {
      await update.mutateAsync({
        userId: member.userId,
        data: {
          ...(levelLocked ? {} : { level }),
          roleTitle: roleTitle.trim(),
          status,
          lastCheckIn: lastCheckIn || null,
        },
      });
      toast.success(`${member.fullName} updated.`);
      onDone();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save.");
    }
  }

  return (
    <div className="grid grid-cols-1 gap-3 border-l-2 border-grey-900 bg-grey-50/60 px-4 py-4 lg:grid-cols-[2.2fr_1.2fr_1fr_1.4fr_1fr_1.1fr_0.8fr_1fr_auto] lg:items-center lg:px-5">
      <div className="min-w-0">
        <p className="truncate font-sans text-sm font-bold text-text-primary">{member.fullName}</p>
        <p className="font-mono text-[10px] text-text-muted">@{member.username}</p>
      </div>
      <div className="font-mono text-xs text-text-tertiary">
        {member.discordUsername || "Not linked"}
      </div>
      <div>
        <Select
          value={level}
          onValueChange={(v) => setLevel(v as MemberLevel)}
          disabled={levelLocked}
        >
          <SelectTrigger className={selectTrigger} aria-label="Level">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className={selectContent}>
            {levelOptions.map((value) => (
              <SelectItem key={value} value={value} className={selectItem}>
                {MEMBER_LEVEL_LABELS[value]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Input
          value={roleTitle}
          onChange={(e) => setRoleTitle(e.target.value)}
          placeholder="e.g. Venue & Logistics"
          maxLength={140}
          aria-label="Role title"
          className="h-9 rounded-none border-grey-200 bg-white px-2 font-mono text-xs focus-visible:border-grey-900 focus-visible:ring-0"
        />
      </div>
      <div>
        <Select
          value={status || "none"}
          onValueChange={(v) => setStatus((v === "none" ? "" : v) as MemberStatus)}
        >
          <SelectTrigger className={selectTrigger} aria-label="Status">
            <SelectValue placeholder="Not set" />
          </SelectTrigger>
          <SelectContent className={selectContent}>
            <SelectItem value="none" className={selectItem}>
              Not set
            </SelectItem>
            {(["active", "paused", "inactive"] as const).map((value) => (
              <SelectItem key={value} value={value} className={selectItem}>
                {MEMBER_STATUS_LABELS[value]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Input
          type="date"
          value={lastCheckIn}
          onChange={(e) => setLastCheckIn(e.target.value)}
          max={new Date().toISOString().slice(0, 10)}
          aria-label="Last check-in"
          className="h-9 rounded-none border-grey-200 bg-white px-2 font-mono text-xs focus-visible:border-grey-900 focus-visible:ring-0"
        />
      </div>
      <div className="font-mono text-xs text-text-tertiary">
        {member.hoursPerMonth || "Not set"}
      </div>
      <div>
        <FlagPill flag={member.flag} />
      </div>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={save}
          disabled={update.isPending}
          className="inline-flex h-8 w-8 items-center justify-center bg-grey-900 text-white hover:bg-grey-800 disabled:opacity-50"
          aria-label="Save"
        >
          <Check className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={onDone}
          disabled={update.isPending}
          className="inline-flex h-8 w-8 items-center justify-center border border-grey-200 bg-white text-text-tertiary hover:border-grey-400"
          aria-label="Cancel"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function RosterRow({ member, onEdit }: { member: RosterMember; onEdit: () => void }) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-3 px-4 py-4 transition-colors hover:bg-grey-50/60 lg:items-center lg:px-5",
        GRID,
        member.flag === "stale" && "border-l-2 border-red-500",
        member.flag === "no_check_in" && "border-l-2 border-amber-400"
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className="relative h-9 w-9 shrink-0 overflow-hidden border border-grey-200 bg-grey-50">
          {/* biome-ignore lint/performance/noImgElement: dicebear fallback */}
          <img
            src={getAvatarUrl(member.profilePictureUrl, member.fullName || member.username)}
            alt={member.fullName || member.username}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="min-w-0">
          <p className="truncate font-sans text-sm font-bold text-text-primary">
            {member.fullName}
          </p>
          <p className="font-mono text-[10px] text-text-muted">@{member.username}</p>
        </div>
      </div>
      <div className="truncate font-mono text-xs text-text-tertiary">
        {member.discordUsername || <span className="text-text-muted">Not linked</span>}
      </div>
      <div className="font-mono text-xs text-text-primary">{MEMBER_LEVEL_LABELS[member.level]}</div>
      <div className="truncate font-mono text-xs text-text-primary">
        {member.roleTitle || <span className="text-text-muted">No role card</span>}
      </div>
      <div>
        <StatusPill status={member.status} />
      </div>
      <div className="font-mono text-xs text-text-tertiary">{formatDate(member.lastCheckIn)}</div>
      <div className="font-mono text-xs text-text-tertiary">
        {member.hoursPerMonth || "Not set"}
      </div>
      <div>
        <FlagPill flag={member.flag} />
      </div>
      <div>
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex h-8 w-8 items-center justify-center border border-grey-200 bg-white text-text-tertiary hover:border-grey-400 hover:text-text-primary"
          aria-label={`Edit ${member.fullName}`}
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

export function Roster({
  team,
  fullAccess,
}: {
  team: Pick<CommunityTeam, "slug" | "name">;
  /** Admins and the Community Lead: every level, including Lead. */
  fullAccess: boolean;
}) {
  const [statusFilter, setStatusFilter] = useState<MemberStatus>("");
  const [editing, setEditing] = useState<string | null>(null);
  const { data: members, isLoading, isError } = useTeamRoster(team.slug, statusFilter || undefined);
  const canAssignLead = fullAccess;

  const flagged = members?.filter((m) => m.flag).length ?? 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-mono text-xs text-text-tertiary">
          {members ? `${members.length} member${members.length === 1 ? "" : "s"}` : ""}
          {flagged > 0 && (
            <span className="ml-2 text-amber-700">
              {flagged} need{flagged === 1 ? "s" : ""} a check-in
            </span>
          )}
        </p>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] text-text-muted">Status</span>
          <Select
            value={statusFilter || "all"}
            onValueChange={(v) => setStatusFilter((v === "all" ? "" : v) as MemberStatus)}
          >
            <SelectTrigger className={cn(selectTrigger, "w-36")} aria-label="Filter by status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className={selectContent}>
              <SelectItem value="all" className={selectItem}>
                All
              </SelectItem>
              {(["active", "paused", "inactive"] as const).map((value) => (
                <SelectItem key={value} value={value} className={selectItem}>
                  {MEMBER_STATUS_LABELS[value]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading && (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-none" />
          ))}
        </div>
      )}

      {isError && (
        <div className="border border-red-200 bg-red-50 p-8 text-center">
          <p className="font-sans text-sm font-bold text-red-700">
            The roster could not be loaded.
          </p>
        </div>
      )}

      {members && members.length === 0 && (
        <div className="border border-dashed border-grey-300 bg-white p-12 text-center">
          <p className="font-sans text-base font-black text-text-primary">Nobody here yet</p>
          <p className="mt-1 font-mono text-xs text-text-tertiary">
            Members join your roster by choosing {team.name} as their primary team in their profile.
          </p>
        </div>
      )}

      {members && members.length > 0 && (
        <div className="overflow-hidden border border-grey-200 bg-white">
          <div
            className={cn(
              "hidden gap-4 border-b border-grey-200 bg-grey-50 px-5 py-3 lg:grid",
              GRID
            )}
          >
            {HEADERS.map((h) => (
              <span
                key={h || "actions"}
                className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted"
              >
                {h || <span className="sr-only">Actions</span>}
              </span>
            ))}
          </div>
          <div className="divide-y divide-grey-200">
            {members.map((member) =>
              editing === member.userId ? (
                <RosterRowEditor
                  key={member.userId}
                  member={member}
                  slug={team.slug}
                  canAssignLead={canAssignLead}
                  onDone={() => setEditing(null)}
                />
              ) : (
                <RosterRow
                  key={member.userId}
                  member={member}
                  onEdit={() => setEditing(member.userId)}
                />
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}

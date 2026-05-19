"use client";

import { Users } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { DashboardShell } from "@/components/dashboard/Shell";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminMembers, useRoles } from "@/hooks/useAdmin";
import type { MemberListParams } from "@/services/admin.service";

// ─── Skeleton loader ──────────────────────────────────────────────────────────

function MembersTableSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 6 }).map((_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: skeleton rows have no meaningful key
        <Skeleton key={i} className="h-14 w-full" />
      ))}
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

// ─── Page content ─────────────────────────────────────────────────────────────

function MembersPageContent() {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [verification, setVerification] = useState("all");

  const { data: roles, isLoading: rolesLoading } = useRoles();

  const params = useMemo<MemberListParams>(() => {
    const trimmed = search.trim();
    return {
      search: trimmed ? trimmed : undefined,
      role: role !== "all" ? role : undefined,
      isEmailVerified: verification === "all" ? undefined : verification === "verified",
    };
  }, [search, role, verification]);

  const { data: members, isLoading, isError } = useAdminMembers(params);

  return (
    <div className="max-w-6xl mx-auto pb-20">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Users className="w-5 h-5 text-zinc-400" />
          <h1 className="font-sans font-black uppercase tracking-widest text-xl text-zinc-900">
            Members
          </h1>
        </div>
        <p className="font-mono text-xs text-zinc-400">View and manage community members.</p>
      </div>

      {/* Filters */}
      <div className="bg-white border border-zinc-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr] gap-4">
          <div className="space-y-1">
            <span className="font-mono text-xs text-zinc-400 uppercase tracking-widest">
              Search
            </span>
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email"
              className="font-mono text-sm"
            />
          </div>

          <div className="space-y-1">
            <span className="font-mono text-xs text-zinc-400 uppercase tracking-widest">Role</span>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="w-full font-mono text-xs rounded-none border-zinc-200">
                <SelectValue placeholder="All roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All roles</SelectItem>
                {rolesLoading && (
                  <SelectItem value="loading" disabled>
                    Loading roles...
                  </SelectItem>
                )}
                {roles?.map((roleOption) => (
                  <SelectItem key={roleOption.id} value={roleOption.name}>
                    {roleOption.displayName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <span className="font-mono text-xs text-zinc-400 uppercase tracking-widest">
              Verification
            </span>
            <Select value={verification} onValueChange={setVerification}>
              <SelectTrigger className="w-full font-mono text-xs rounded-none border-zinc-200">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="unverified">Unverified</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Content */}
      {isLoading && <MembersTableSkeleton />}

      {isError && (
        <p className="font-mono text-xs text-red-500">
          Failed to load members. Please refresh the page.
        </p>
      )}

      {!isLoading && !isError && (!members || members.length === 0) && (
        <div className="bg-white border border-zinc-200 p-8 text-center">
          <p className="font-mono text-xs text-zinc-400">No members found.</p>
        </div>
      )}

      {!isLoading && !isError && members && members.length > 0 && (
        <div className="bg-white border border-zinc-200">
          {/* Table header */}
          <div className="grid grid-cols-[1.2fr_2fr_2.5fr_2fr_1.2fr_1.3fr_auto] gap-4 px-4 py-3 border-b border-zinc-200 bg-zinc-50">
            <span className="font-mono text-xs text-zinc-400 uppercase tracking-widest">
              Community ID
            </span>
            <span className="font-mono text-xs text-zinc-400 uppercase tracking-widest">Name</span>
            <span className="font-mono text-xs text-zinc-400 uppercase tracking-widest">Email</span>
            <span className="font-mono text-xs text-zinc-400 uppercase tracking-widest">Roles</span>
            <span className="font-mono text-xs text-zinc-400 uppercase tracking-widest">
              Verified
            </span>
            <span className="font-mono text-xs text-zinc-400 uppercase tracking-widest">
              Joined
            </span>
            <span className="sr-only">Actions</span>
          </div>

          {/* Table rows */}
          {members.map((member) => (
            <div
              key={member.id}
              className="grid grid-cols-[1.2fr_2fr_2.5fr_2fr_1.2fr_1.3fr_auto] gap-4 px-4 py-4 border-b border-zinc-100 last:border-b-0 items-center hover:bg-zinc-50 transition-colors"
            >
              <span className="font-mono text-xs text-zinc-700 truncate">{member.communityId}</span>
              <Link
                href={`/admin/members/${member.id}`}
                className="font-sans text-sm text-zinc-900 hover:underline truncate"
              >
                {member.fullName}
              </Link>
              <span className="font-mono text-xs text-zinc-500 truncate">{member.email}</span>
              <div className="flex flex-wrap gap-2">
                {member.roles.length === 0 && (
                  <span className="font-mono text-xs text-zinc-400">—</span>
                )}
                {member.roles.map((roleName) => (
                  <Badge key={roleName} variant="outline" className="text-[10px]">
                    {roleName}
                  </Badge>
                ))}
              </div>
              <Badge
                variant={member.isEmailVerified ? "secondary" : "outline"}
                className="text-[10px]"
              >
                {member.isEmailVerified ? "Verified" : "Unverified"}
              </Badge>
              <span className="font-mono text-xs text-zinc-500">{formatDate(member.joinedAt)}</span>
              <Link
                href={`/admin/members/${member.id}`}
                className="font-mono text-xs uppercase tracking-widest text-zinc-500 hover:text-zinc-900 transition-colors"
              >
                View
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MembersPage() {
  return (
    <RouteGuard permission="members.view">
      <DashboardShell>
        <MembersPageContent />
      </DashboardShell>
    </RouteGuard>
  );
}

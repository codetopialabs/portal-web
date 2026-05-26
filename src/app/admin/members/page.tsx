"use client";

import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Mail,
  MapPin,
  Search,
  UserCheck,
  Users,
  UserX,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { DashboardShell } from "@/components/dashboard/Shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { getAvatarUrl } from "@/lib/utils";
import type { MemberListParams } from "@/services/admin.service";
import { AdminMemberFilterPopover, type AdminMemberFilters } from "./admin-member-filter-popover";

function MembersTableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 6 }).map((_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: skeleton rows have no meaningful key
        <Skeleton key={i} className="h-20 w-full rounded-none" />
      ))}
    </div>
  );
}

function formatDate(value: string | null | undefined) {
  if (!value) return "Not recorded";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not recorded";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function StatusBadge({ active, verified }: { active: boolean; verified: boolean }) {
  if (!active) {
    return (
      <Badge className="h-6 rounded-none border-error-200 bg-error-50 px-2.5 text-[11px] font-bold text-error-700">
        <UserX className="h-3 w-3" />
        Suspended
      </Badge>
    );
  }

  if (verified) {
    return (
      <Badge className="h-6 rounded-none border-success-200 bg-success-50 px-2.5 text-[11px] font-bold text-success-700">
        <CheckCircle2 className="h-3 w-3" />
        Verified
      </Badge>
    );
  }

  return (
    <Badge className="h-6 rounded-none border-warning-200 bg-warning-50 px-2.5 text-[11px] font-bold text-warning-700">
      <UserCheck className="h-3 w-3" />
      Pending
    </Badge>
  );
}

function MembersPageContent() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<AdminMemberFilters>({
    role: "all",
    verification: "all",
  });
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { data: roles, isLoading: rolesLoading } = useRoles();

  const params = useMemo<MemberListParams>(() => {
    const trimmed = search.trim();
    return {
      search: trimmed ? trimmed : undefined,
      role: filters.role !== "all" ? filters.role : undefined,
      isEmailVerified:
        filters.verification === "all" ? undefined : filters.verification === "verified",
    };
  }, [search, filters.role, filters.verification]);

  const { data: members, isLoading, isError } = useAdminMembers(params);

  const filteredMembers = useMemo(() => {
    if (!members) return [];
    return members.filter((member) => {
      if (filters.role !== "all" && !member.roles.includes(filters.role)) return false;
      if (filters.verification === "verified" && !member.isEmailVerified) return false;
      if (filters.verification === "unverified" && member.isEmailVerified) return false;
      return true;
    });
  }, [members, filters.role, filters.verification]);

  const totalPages = Math.max(1, Math.ceil(filteredMembers.length / rowsPerPage));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, filteredMembers.length);
  const pageMembers = filteredMembers.slice(startIndex, endIndex);

  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 md:px-0">
      <div className="mb-8 border-b border-grey-200 pb-8">
        <div className="max-w-2xl">
          <div className="mb-3 flex items-center gap-3">
            <Users className="h-5 w-5 text-icon-tertiary" />
            <h1 className="font-sans text-3xl font-black uppercase tracking-tight text-text-primary">
              Members
            </h1>
          </div>
          <p className="font-mono text-sm leading-relaxed text-text-tertiary">
            Review community accounts, verification status, assigned roles, and member records.
          </p>
        </div>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="group relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-icon-muted transition-colors group-focus-within:text-icon-primary" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name, username, or email"
            className="h-11 rounded-none border-grey-200 bg-white pl-10 font-mono text-sm transition-all focus-visible:border-grey-900 focus-visible:ring-2 focus-visible:ring-grey-900/10"
          />
        </div>
        <AdminMemberFilterPopover
          filters={filters}
          roles={roles}
          rolesLoading={rolesLoading}
          onChange={(nextFilters) => {
            setFilters(nextFilters);
            setPage(1);
          }}
          onReset={() => {
            setFilters({ role: "all", verification: "all" });
            setPage(1);
          }}
        />
      </div>

      {isLoading && <MembersTableSkeleton />}

      {isError && (
        <div className="rounded-none border border-error-200 bg-error-50 p-10 text-center">
          <p className="font-sans text-base font-black text-error-700">
            Members could not be loaded.
          </p>
          <p className="mt-2 font-mono text-xs text-error-600">
            Please refresh the page and try again.
          </p>
        </div>
      )}

      {!isLoading && !isError && filteredMembers.length === 0 && (
        <div className="rounded-none border border-dashed border-grey-300 bg-white p-14 text-center">
          <p className="font-sans text-base font-black text-text-primary">No members found</p>
          <p className="mt-2 font-mono text-xs text-text-tertiary">
            Try a different search term or clear the current filters.
          </p>
        </div>
      )}

      {!isLoading && !isError && filteredMembers.length > 0 && (
        <div className="overflow-hidden rounded-none border border-grey-200 bg-white">
          <div className="hidden grid-cols-[2.5fr_1fr_1.4fr_1.3fr_auto] gap-4 border-b border-grey-200 bg-grey-50 px-5 py-3 sm:grid">
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted">
              Member
            </span>
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted">
              Status
            </span>
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted">
              Role
            </span>
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted">
              Joined
            </span>
            <span className="sr-only">Actions</span>
          </div>

          <div className="divide-y divide-grey-200">
            {pageMembers.map((member) => (
              <div
                key={member.id}
                className="grid grid-cols-1 gap-4 px-4 py-5 transition-colors hover:bg-grey-50/60 sm:grid-cols-[2.5fr_1fr_1.4fr_1.3fr_auto] sm:items-center sm:px-5"
              >
                <div className="flex min-w-0 items-start gap-4">
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-none border border-grey-200 bg-grey-50">
                    {/* biome-ignore lint/performance/noImgElement: dicebear image */}
                    <img
                      src={getAvatarUrl(
                        member.profilePictureUrl,
                        member.fullName || member.username
                      )}
                      alt={member.fullName || member.username}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <Link
                      href={`/admin/members/${member.username}`}
                      className="block truncate font-sans text-sm font-black uppercase tracking-tight text-text-primary hover:underline"
                    >
                      {member.fullName || member.username}
                    </Link>
                    <div className="mt-1 flex min-w-0 flex-col gap-1 font-mono text-xs text-text-tertiary sm:flex-row sm:items-center sm:gap-3">
                      <span className="flex min-w-0 items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 shrink-0 text-icon-muted" />
                        <span className="truncate">{member.email || "No email"}</span>
                      </span>
                      <span className="hidden h-1 w-1 rounded-full bg-grey-300 sm:block" />
                      <span className="truncate">@{member.username}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-1.5 font-mono text-[11px] text-text-muted lg:hidden">
                      <MapPin className="h-3.5 w-3.5" />
                      <span className="truncate">{member.location || "Location not set"}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <StatusBadge active={member.isActive} verified={member.isEmailVerified} />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {member.roles.length === 0 && (
                    <Badge
                      variant="outline"
                      className="h-6 rounded-none px-2.5 text-[11px] text-text-tertiary"
                    >
                      No role
                    </Badge>
                  )}
                  {member.roles.slice(0, 2).map((role) => (
                    <Badge
                      key={role}
                      variant="secondary"
                      className="h-6 rounded-none border-grey-200 px-2.5 text-[11px] font-bold text-text-secondary"
                    >
                      {role}
                    </Badge>
                  ))}
                  {member.roles.length > 2 && (
                    <Badge
                      variant="outline"
                      className="h-6 rounded-none px-2.5 text-[11px] text-text-tertiary"
                    >
                      +{member.roles.length - 2}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2 font-mono text-xs text-text-tertiary">
                  <CalendarDays className="h-3.5 w-3.5 text-icon-muted" />
                  <span>{formatDate(member.joinedAt || member.createdAt)}</span>
                </div>

                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-none px-3 font-mono text-xs"
                >
                  <Link href={`/admin/members/${member.username}`}>
                    <Eye className="h-3.5 w-3.5" />
                    View
                  </Link>
                </Button>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-4 border-t border-grey-200 bg-grey-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted">
                  Rows
                </span>
                <Select
                  value={String(rowsPerPage)}
                  onValueChange={(value) => {
                    setRowsPerPage(Number(value));
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="h-8 w-20 rounded-none border-grey-200 bg-white font-mono text-xs">
                    <SelectValue placeholder="Rows" />
                  </SelectTrigger>
                  <SelectContent className="rounded-none font-mono text-xs">
                    {[10, 20, 50].map((size) => (
                      <SelectItem key={size} value={String(size)}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <span className="font-mono text-xs text-text-tertiary">
                Showing {filteredMembers.length === 0 ? 0 : startIndex + 1}-{endIndex} of{" "}
                {filteredMembers.length}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="h-8 rounded-none font-mono text-xs"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Prev
              </Button>
              <div className="flex h-8 items-center rounded-none border border-grey-200 bg-white px-3 font-mono text-xs font-bold text-text-secondary">
                {currentPage} / {totalPages}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="h-8 rounded-none font-mono text-xs"
              >
                Next
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MembersPage() {
  return (
    <RouteGuard permission="users.view">
      <DashboardShell>
        <MembersPageContent />
      </DashboardShell>
    </RouteGuard>
  );
}

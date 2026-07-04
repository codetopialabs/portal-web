"use client";

import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  Mail,
  Search,
  UserX,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { RouteGuard } from "@/components/auth/RouteGuard";
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
import { useAdminMembers } from "@/hooks/useAdmin";
import { cn, getAvatarUrl } from "@/lib/utils";
import type { AdminMember } from "@/types/users.types";

type StatusFilter = "all" | "active" | "suspended" | "flagged" | "unverified" | "dormant";

const STATUS_TABS: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "suspended", label: "Suspended" },
  { key: "flagged", label: "Flagged" },
  { key: "unverified", label: "Unverified" },
  { key: "dormant", label: "Dormant" },
];

// Mirrors the backend's dormancy rule in AdminOverviewView: no login in 15+
// days, or never logged in and joined 15+ days ago.
const DORMANT_THRESHOLD_MS = 15 * 24 * 60 * 60 * 1000;

function isDormant(member: AdminMember): boolean {
  if (!member.isActive) return false;
  const reference = member.lastLoginAt ?? member.createdAt;
  if (!reference) return false;
  return Date.now() - new Date(reference).getTime() > DORMANT_THRESHOLD_MS;
}

function formatDate(value: string | null | undefined, fallback = "—") {
  if (!value) return fallback;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return fallback;
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(
    d
  );
}

function formatRelative(value: string | null | undefined) {
  if (!value) return "Never";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "Never";
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 2) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(value);
}

function StatusPill({ member }: { member: AdminMember }) {
  if (member.isFlagged) {
    const underReview = member.activeFlag?.profileUpdatedAfterFlag;
    if (underReview) {
      return (
        <span className="inline-flex items-center gap-1.5 border border-amber-500 bg-amber-500 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wide text-white">
          <Clock className="h-3 w-3" />
          Under review
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 border border-red-600 bg-red-600 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wide text-white">
        <AlertTriangle className="h-3 w-3" />
        Flagged
      </span>
    );
  }
  if (!member.isActive) {
    return (
      <span className="inline-flex items-center gap-1.5 border border-zinc-800 bg-zinc-800 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wide text-white">
        <UserX className="h-3 w-3" />
        Suspended
      </span>
    );
  }
  if (!member.isEmailVerified) {
    return (
      <span className="inline-flex items-center gap-1.5 border border-amber-500 bg-amber-500 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wide text-white">
        <Clock className="h-3 w-3" />
        Unverified
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 border border-emerald-600 bg-emerald-600 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wide text-white">
      <CheckCircle2 className="h-3 w-3" />
      Active
    </span>
  );
}

function MembersTableSkeleton() {
  return (
    <div className="space-y-px">
      {Array.from({ length: 6 }).map((_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: skeleton rows
        <Skeleton key={i} className="h-20 w-full rounded-none" />
      ))}
    </div>
  );
}

const VALID_STATUS_FILTERS: readonly string[] = [
  "all",
  "active",
  "suspended",
  "flagged",
  "unverified",
  "dormant",
];

function MembersPageContent() {
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get("status");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(
    initialStatus && VALID_STATUS_FILTERS.includes(initialStatus)
      ? (initialStatus as StatusFilter)
      : "all"
  );
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  const queryParams = useMemo(() => {
    const trimmed = search.trim();
    return {
      search: trimmed || undefined,
      isFlagged: statusFilter === "flagged" ? true : undefined,
      isActive:
        statusFilter === "suspended"
          ? false
          : statusFilter === "flagged"
            ? undefined
            : statusFilter === "all"
              ? undefined
              : true,
    };
  }, [search, statusFilter]);

  const { data: members, isLoading, isError } = useAdminMembers(queryParams);

  const filteredMembers = useMemo(() => {
    if (!members) return [];
    if (statusFilter === "flagged") return members.filter((m) => m.isFlagged);
    if (statusFilter === "suspended") return members.filter((m) => !m.isActive);
    if (statusFilter === "unverified")
      return members.filter((m) => m.isActive && !m.isEmailVerified);
    if (statusFilter === "dormant") return members.filter(isDormant);
    if (statusFilter === "active") return members.filter((m) => m.isActive && m.isEmailVerified);
    return members;
  }, [members, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredMembers.length / rowsPerPage));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, filteredMembers.length);
  const pageMembers = filteredMembers.slice(startIndex, endIndex);

  const countFor = (tab: StatusFilter) => {
    if (!members) return 0;
    if (tab === "all") return members.length;
    if (tab === "flagged") return members.filter((m) => m.isFlagged).length;
    if (tab === "suspended") return members.filter((m) => !m.isActive).length;
    if (tab === "unverified") return members.filter((m) => m.isActive && !m.isEmailVerified).length;
    if (tab === "dormant") return members.filter(isDormant).length;
    if (tab === "active") return members.filter((m) => m.isActive && m.isEmailVerified).length;
    return 0;
  };

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="mb-6">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted">
          Admin Panel
        </p>
        <h1 className="font-sans text-3xl font-black uppercase tracking-tight text-text-primary">
          Members
        </h1>
      </div>

      {/* Filter tabs */}
      <div className="mb-5 flex border-b border-grey-200">
        {STATUS_TABS.map((tab) => {
          const isActive = statusFilter === tab.key;
          const count = countFor(tab.key);
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => {
                setStatusFilter(tab.key);
                setPage(1);
              }}
              className={cn(
                "relative flex items-center gap-1.5 px-4 py-2.5 font-mono text-[10px] font-bold uppercase tracking-wide transition-colors",
                isActive
                  ? "text-text-primary after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-zinc-900"
                  : "text-text-muted hover:text-text-secondary"
              )}
            >
              {tab.label}
              {!isLoading && (
                <span
                  className={cn(
                    "flex h-4 min-w-4 items-center justify-center px-1 font-mono text-[9px] font-black",
                    isActive ? "bg-zinc-900 text-white" : "bg-grey-100 text-text-muted",
                    tab.key === "flagged" && count > 0 && !isActive ? "bg-red-600 text-white" : ""
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="mb-4 group relative max-w-sm">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-icon-muted transition-colors group-focus-within:text-icon-primary" />
        <Input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search by name, username, or email"
          className="h-10 rounded-none border-grey-200 bg-white pl-10 font-mono text-sm transition-all focus-visible:border-grey-900 focus-visible:ring-0"
        />
      </div>

      {/* Table */}
      {isLoading && <MembersTableSkeleton />}

      {isError && (
        <div className="border border-red-200 bg-red-50 p-10 text-center">
          <p className="font-sans text-base font-black text-red-700">
            Members could not be loaded.
          </p>
          <p className="mt-1 font-mono text-xs text-red-600">Please refresh and try again.</p>
        </div>
      )}

      {!isLoading && !isError && filteredMembers.length === 0 && (
        <div className="border border-dashed border-grey-300 bg-white p-14 text-center">
          <p className="font-sans text-base font-black text-text-primary">No members found</p>
          <p className="mt-1 font-mono text-xs text-text-tertiary">
            Try a different search or filter.
          </p>
        </div>
      )}

      {!isLoading && !isError && filteredMembers.length > 0 && (
        <div className="overflow-hidden border border-grey-200 bg-white">
          {/* Column headers */}
          <div className="hidden grid-cols-[2.5fr_1.2fr_1.2fr_1.2fr_1.2fr_auto] gap-4 border-b border-grey-200 bg-grey-50 px-5 py-3 lg:grid">
            {["Member", "Status", "Role", "Last Login", "Joined", ""].map((h) => (
              <span
                key={h}
                className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted"
              >
                {h || <span className="sr-only">Actions</span>}
              </span>
            ))}
          </div>

          <div className="divide-y divide-grey-200">
            {pageMembers.map((member) => (
              <div
                key={member.id}
                className={cn(
                  "grid grid-cols-1 gap-3 px-4 py-4 transition-colors hover:bg-grey-50/60 lg:grid-cols-[2.5fr_1.2fr_1.2fr_1.2fr_1.2fr_auto] lg:items-center lg:px-5",
                  member.isFlagged && "border-l-2 border-red-500"
                )}
              >
                {/* Member */}
                <div className="flex min-w-0 items-center gap-3">
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden border border-grey-200 bg-grey-50">
                    {/* biome-ignore lint/performance/noImgElement: dicebear */}
                    <img
                      src={getAvatarUrl(
                        member.profilePictureUrl,
                        member.fullName || member.username
                      )}
                      alt={member.fullName || member.username}
                      className="h-full w-full object-cover"
                    />
                    {member.isFlagged && (
                      <div className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center bg-red-600">
                        <AlertTriangle className="h-2.5 w-2.5 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <Link
                      href={`/admin/members/${member.username}`}
                      className="block truncate font-sans text-sm font-bold text-text-primary hover:underline"
                    >
                      {member.fullName || member.username}
                    </Link>
                    <div className="mt-0.5 flex items-center gap-1.5 font-mono text-[11px] text-text-tertiary">
                      <Mail className="h-3 w-3 shrink-0" />
                      <span className="truncate">{member.email}</span>
                    </div>
                    <div className="mt-0.5 font-mono text-[10px] text-text-muted">
                      @{member.username} · {member.communityId}
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div>
                  <StatusPill member={member} />
                </div>

                {/* Role */}
                <div className="flex flex-wrap gap-1">
                  {member.roles.length > 0 ? (
                    <>
                      {member.roles.slice(0, 1).map((r) => (
                        <span
                          key={r}
                          className="border border-grey-200 bg-white px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-text-secondary"
                        >
                          {r}
                        </span>
                      ))}
                      {member.roles.length > 1 && (
                        <span className="border border-grey-200 bg-white px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                          +{member.roles.length - 1}
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="font-mono text-xs text-text-tertiary">No role</span>
                  )}
                </div>

                {/* Last login */}
                <div className="flex items-center gap-1.5 font-mono text-[11px] text-text-tertiary">
                  <Clock className="h-3 w-3 shrink-0 text-icon-muted" />
                  {formatRelative(member.lastLoginAt)}
                </div>

                {/* Joined */}
                <div className="flex items-center gap-1.5 font-mono text-[11px] text-text-tertiary">
                  <CalendarDays className="h-3 w-3 shrink-0 text-icon-muted" />
                  {formatDate(member.joinedAt || member.createdAt)}
                </div>

                {/* Action */}
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

          {/* Pagination */}
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
                    <SelectValue />
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
                {filteredMembers.length === 0 ? 0 : startIndex + 1}–{endIndex} of{" "}
                {filteredMembers.length}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="h-8 rounded-none font-mono text-xs"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Prev
              </Button>
              <div className="flex h-8 items-center border border-grey-200 bg-white px-3 font-mono text-xs font-bold text-text-secondary">
                {currentPage} / {totalPages}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
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
      <Suspense>
        <MembersPageContent />
      </Suspense>
    </RouteGuard>
  );
}

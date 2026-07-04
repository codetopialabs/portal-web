"use client";

import {
  AlertTriangle,
  ArrowUpRight,
  LockKeyhole,
  Plus,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useDeleteRole, useRoles } from "@/hooks/useAdmin";
import { usePermission } from "@/hooks/usePermission";

type RoleFilter = "all" | "system" | "custom";

function RolesTableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: skeleton rows have no meaningful key
        <Skeleton key={i} className="h-28 w-full rounded-none" />
      ))}
    </div>
  );
}

function DeleteRoleButton({ slug, name }: { slug: string; name: string }) {
  const [confirming, setConfirming] = useState(false);
  const { mutate: deleteRole, isPending } = useDeleteRole();

  function handleDelete() {
    if (!confirming) {
      setConfirming(true);
      return;
    }

    deleteRole(slug, {
      onSuccess: () => {
        toast.success(`Role "${name}" deleted.`);
        setConfirming(false);
      },
      onError: () => {
        toast.error("Failed to delete role. Please try again.");
        setConfirming(false);
      },
    });
  }

  return (
    <Button
      type="button"
      variant={confirming ? "destructive" : "outline"}
      size="sm"
      onClick={handleDelete}
      disabled={isPending}
      className="h-8 rounded-none font-mono text-xs font-bold"
    >
      <Trash2 className="h-3.5 w-3.5" />
      {confirming ? "Confirm Delete" : "Delete"}
    </Button>
  );
}

function FilterTab({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`-mb-px flex items-center gap-2 border-b-2 px-1 pb-3 font-mono text-sm font-medium transition-colors ${
        active
          ? "border-grey-900 text-text-primary"
          : "border-transparent text-text-muted hover:text-text-primary"
      }`}
    >
      {label}
      <span
        className={`inline-flex h-4 min-w-4 items-center justify-center px-1 font-mono text-[10px] ${
          active ? "bg-grey-900 text-white" : "bg-grey-100 text-text-secondary"
        }`}
      >
        {count}
      </span>
    </button>
  );
}

function RoleRow({
  role,
  canDelete,
}: {
  role: {
    name: string;
    displayName: string;
    description?: string;
    rank: number;
    permissions: string[];
    memberCount: number;
    isSystem: boolean;
  };
  canDelete: boolean;
}) {
  const highRisk = role.permissions.some((p) =>
    ["users.delete", "users.suspend", "roles.delete"].includes(p)
  );
  const detailHref = `/admin/roles/${role.name}`;

  return (
    <div className="group relative border border-grey-200 bg-white transition-colors hover:border-grey-400 hover:bg-grey-50">
      {/* Full-card link — sits behind everything else */}
      <Link
        href={detailHref}
        className="absolute inset-0 z-0"
        aria-label={`Open ${role.displayName}`}
      />

      <div className="relative z-10 p-4 pointer-events-none">
        {/* Arrow indicator */}
        <ArrowUpRight className="absolute right-3 top-3 h-3.5 w-3.5 text-grey-300 transition-colors group-hover:text-text-secondary" />

        {/* Identity */}
        <div className="flex items-center gap-2 pr-6">
          <span className="truncate font-sans text-sm font-bold text-text-primary">
            {role.displayName}
          </span>
          {role.isSystem && (
            <LockKeyhole className="h-3 w-3 shrink-0 text-icon-muted" aria-label="System role" />
          )}
          {highRisk && (
            <AlertTriangle
              className="h-3 w-3 shrink-0 text-error-500"
              aria-label="Sensitive permissions"
            />
          )}
        </div>
        <p className="mt-0.5 font-mono text-[11px] text-text-muted">
          {role.name} · rank {role.rank}
        </p>

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-grey-100 pt-3">
          <p className="font-mono text-[11px] text-text-tertiary">
            <span className="font-bold text-text-secondary">{role.permissions.length}</span> perms ·{" "}
            <span className="font-bold text-text-secondary">{role.memberCount}</span> members
          </p>
          {/* Delete button needs pointer-events back and a higher z-index to sit above the card link */}
          <div className="pointer-events-auto relative z-20">
            {canDelete && !role.isSystem && <DeleteRoleButton slug={role.name} name={role.name} />}
          </div>
        </div>
      </div>
    </div>
  );
}

function RolesListContent() {
  const { data: roles, isLoading, isError } = useRoles();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<RoleFilter>("all");
  const canCreate = usePermission("roles.create");
  const canDelete = usePermission("roles.delete");

  const filteredRoles = useMemo(() => {
    if (!roles) return [];
    const query = search.trim().toLowerCase();

    return roles.filter((role) => {
      if (filter === "system" && !role.isSystem) return false;
      if (filter === "custom" && role.isSystem) return false;
      if (!query) return true;

      return (
        role.name.toLowerCase().includes(query) ||
        role.displayName.toLowerCase().includes(query) ||
        role.description?.toLowerCase().includes(query)
      );
    });
  }, [roles, search, filter]);

  const counts = useMemo(() => {
    const all = roles ?? [];
    return {
      all: all.length,
      system: all.filter((r) => r.isSystem).length,
      custom: all.filter((r) => !r.isSystem).length,
    };
  }, [roles]);

  if (isLoading) return <RolesTableSkeleton />;

  if (isError) {
    return (
      <div className="border border-error-200 bg-error-50 p-10 text-center">
        <ShieldAlert className="mx-auto mb-3 h-8 w-8 text-error-500" />
        <p className="font-sans text-base font-bold text-error-700">Roles could not be loaded</p>
        <p className="mt-2 font-mono text-xs text-error-600">Refresh the page and try again.</p>
      </div>
    );
  }

  if (!roles || roles.length === 0) {
    return (
      <div className="border border-grey-200 bg-white p-14 text-center">
        <Shield className="mx-auto mb-3 h-8 w-8 text-icon-muted" />
        <p className="font-sans text-base font-bold text-text-primary">No roles found</p>
        <p className="mt-2 font-mono text-xs text-text-tertiary">
          Create the first role to start assigning permissions.
        </p>
        {canCreate && (
          <Button
            asChild
            className="mt-8 h-10 rounded-none border border-grey-900 bg-grey-900 font-mono text-xs font-bold text-white transition-colors hover:bg-grey-800"
          >
            <Link href="/admin/roles/new">
              <Plus className="h-3.5 w-3.5" />
              Create first role
            </Link>
          </Button>
        )}
      </div>
    );
  }

  return (
    <div>
      {/* Toolbar: underline tabs (with counts) + search */}
      <div className="mb-5 flex flex-col gap-4 border-b border-grey-200 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-5">
          <FilterTab
            label="All"
            count={counts.all}
            active={filter === "all"}
            onClick={() => setFilter("all")}
          />
          <FilterTab
            label="Custom"
            count={counts.custom}
            active={filter === "custom"}
            onClick={() => setFilter("custom")}
          />
          <FilterTab
            label="System"
            count={counts.system}
            active={filter === "system"}
            onClick={() => setFilter("system")}
          />
        </div>
        <div className="relative pb-3 lg:w-72">
          <Search className="pointer-events-none absolute left-3 top-[38%] h-4 w-4 -translate-y-1/2 text-icon-muted" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search roles"
            className="h-9 rounded-none border-grey-200 bg-white pl-9 font-mono text-sm"
          />
        </div>
      </div>

      {/* Roles List */}
      {filteredRoles.length === 0 ? (
        <div className="border border-grey-200 bg-grey-50 p-10 text-center">
          <p className="font-sans text-base font-bold text-text-primary">No matching roles</p>
          <p className="mt-2 font-mono text-xs text-text-tertiary">
            Try another search term or filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredRoles.map((role) => (
            <RoleRow key={role.name} role={role} canDelete={canDelete} />
          ))}
        </div>
      )}
    </div>
  );
}

function RolesPageContent() {
  const canCreate = usePermission("roles.create");

  return (
    <div className="w-full pb-20">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <div className="mb-1 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-icon-tertiary" />
              <p className="font-mono text-xs font-medium text-text-muted">
                Admin · Access Control
              </p>
            </div>
            <h1 className="font-sans text-4xl font-bold tracking-tight text-text-primary">Roles</h1>
            <p className="mt-3 font-mono text-sm leading-relaxed text-text-tertiary">
              Manage permission bundles, review sensitive access, and configure which members can
              use admin tools.
            </p>
          </div>

          {canCreate && (
            <Button
              asChild
              className="h-11 shrink-0 rounded-none border border-grey-900 bg-grey-900 font-mono text-xs font-bold text-white transition-colors hover:bg-grey-800"
            >
              <Link href="/admin/roles/new">
                <Plus className="h-3.5 w-3.5" />
                Create role
              </Link>
            </Button>
          )}
        </div>
      </div>

      <RolesListContent />
    </div>
  );
}

export default function RolesPage() {
  return (
    <RouteGuard permission="roles.view">
      <RolesPageContent />
    </RouteGuard>
  );
}

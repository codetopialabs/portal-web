"use client";

import {
  AlertTriangle,
  ChevronRight,
  Filter,
  LockKeyhole,
  Plus,
  RotateCcw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { DashboardShell } from "@/components/dashboard/Shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

function roleTone(name: string, isSystem: boolean) {
  const lowered = name.toLowerCase();
  if (isSystem || lowered.includes("admin") || lowered.includes("super")) {
    return {
      icon: ShieldAlert,
      label: isSystem ? "System" : "High Access",
      badgeClass: "border-error-500 bg-error-50 text-error-700",
      iconWrapClass: "border-2 border-error-500 bg-error-50 text-error-600",
      accent: "border-l-error-500",
    };
  }
  if (lowered.includes("manager") || lowered.includes("mod")) {
    return {
      icon: ShieldCheck,
      label: "Operational",
      badgeClass: "border-info-500 bg-info-50 text-info-700",
      iconWrapClass: "border-2 border-info-500 bg-info-50 text-info-600",
      accent: "border-l-info-500",
    };
  }
  return {
    icon: Shield,
    label: "Community",
    badgeClass: "border-grey-300 bg-grey-100 text-text-secondary",
    iconWrapClass: "border-2 border-grey-300 bg-grey-50 text-text-tertiary",
    accent: "border-l-grey-300",
  };
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
      className="h-8 rounded-none font-mono text-xs font-bold transition-all hover:-translate-y-px active:translate-y-0"
    >
      <Trash2 className="h-3.5 w-3.5" />
      {confirming ? "Confirm Delete" : "Delete"}
    </Button>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
}) {
  return (
    <div className="group border-2 border-grey-900 bg-white p-5 shadow-[4px_4px_0px_0px_var(--color-grey-200)] transition-all duration-150 hover:-translate-x-px hover:-translate-y-px hover:shadow-[6px_6px_0px_0px_var(--color-grey-200)]">
      <div className="mb-4 flex items-center justify-between gap-2">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted">
          {label}
        </p>
        <Icon className="h-4 w-4 text-icon-tertiary" />
      </div>
      <p className="font-sans text-3xl font-black text-text-primary">{value}</p>
    </div>
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
  const tone = roleTone(role.name, role.isSystem);
  const RoleIcon = tone.icon;
  const highRisk = role.permissions.some((p) =>
    ["users.delete", "users.suspend", "roles.delete"].includes(p)
  );

  return (
    <div
      className={`group border-2 border-grey-900 bg-white border-l-4 ${tone.accent} p-5 shadow-[4px_4px_0px_0px_var(--color-grey-200)] transition-all duration-150 hover:-translate-x-px hover:-translate-y-px hover:shadow-[6px_6px_0px_0px_var(--color-grey-200)]`}
    >
      <div className="flex flex-col gap-5 md:flex-row md:items-center">
        {/* Role identity */}
        <div className="flex min-w-0 flex-1 items-start gap-4">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center ${tone.iconWrapClass}`}
          >
            <RoleIcon className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/admin/roles/${role.name}`}
                className="font-sans text-base font-black text-text-primary underline-offset-2 hover:underline"
              >
                {role.displayName}
              </Link>
              <span
                className={`inline-flex items-center border px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wide ${tone.badgeClass}`}
              >
                {tone.label}
              </span>
              {highRisk && (
                <span className="inline-flex items-center gap-1 border border-error-400 bg-error-50 px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wide text-error-700">
                  <AlertTriangle className="h-3 w-3" />
                  Sensitive
                </span>
              )}
              {role.isSystem && (
                <span className="inline-flex items-center gap-1 border border-grey-300 bg-grey-100 px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wide text-text-secondary">
                  <LockKeyhole className="h-3 w-3" />
                  Locked
                </span>
              )}
            </div>
            <p className="mt-1 font-mono text-[11px] text-text-muted">
              slug: {role.name} · rank {role.rank}
            </p>
            <p className="mt-2 line-clamp-2 font-mono text-xs leading-relaxed text-text-secondary">
              {role.description || "No description provided."}
            </p>
          </div>
        </div>

        {/* Metrics */}
        <div className="flex items-center gap-6 md:gap-8">
          <div className="text-center">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-text-muted">
              Permissions
            </p>
            <p className="mt-1 font-sans text-2xl font-black text-text-primary">
              {role.permissions.length}
            </p>
          </div>
          <div className="text-center">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-text-muted">
              Members
            </p>
            <p className="mt-1 font-sans text-2xl font-black text-text-primary">
              {role.memberCount}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row md:items-center">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="h-8 rounded-none border-grey-900 font-mono text-xs font-bold transition-all hover:-translate-y-px hover:bg-grey-900 hover:text-white active:translate-y-0"
          >
            <Link href={`/admin/roles/${role.name}`}>
              Details
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
          {canDelete && !role.isSystem && <DeleteRoleButton slug={role.name} name={role.name} />}
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

  const roleStats = useMemo(() => {
    const allRoles = roles ?? [];
    return [
      { label: "Total Roles", value: allRoles.length, icon: Shield },
      {
        label: "System",
        value: allRoles.filter((r) => r.isSystem).length,
        icon: LockKeyhole,
      },
      {
        label: "Custom",
        value: allRoles.filter((r) => !r.isSystem).length,
        icon: ShieldCheck,
      },
      {
        label: "Members Assigned",
        value: allRoles.reduce((total, r) => total + r.memberCount, 0),
        icon: Users,
      },
    ];
  }, [roles]);

  if (isLoading) return <RolesTableSkeleton />;

  if (isError) {
    return (
      <div className="border-2 border-error-500 bg-error-50 p-10 text-center shadow-[4px_4px_0px_0px_var(--color-error-200)]">
        <ShieldAlert className="mx-auto mb-3 h-8 w-8 text-error-500" />
        <p className="font-sans text-base font-black uppercase text-error-700">
          Roles could not be loaded
        </p>
        <p className="mt-2 font-mono text-xs text-error-600">Refresh the page and try again.</p>
      </div>
    );
  }

  if (!roles || roles.length === 0) {
    return (
      <div className="border-2 border-grey-900 bg-white p-14 text-center shadow-[4px_4px_0px_0px_var(--color-grey-200)]">
        <Shield className="mx-auto mb-3 h-8 w-8 text-icon-muted" />
        <p className="font-sans text-base font-black uppercase text-text-primary">No roles found</p>
        <p className="mt-2 font-mono text-xs text-text-tertiary">
          Create the first role to start assigning permissions.
        </p>
        {canCreate && (
          <Button
            asChild
            className="mt-8 h-10 rounded-none border-2 border-grey-900 bg-grey-900 font-mono text-xs font-bold text-white shadow-[4px_4px_0px_0px_var(--color-grey-300)] transition-all hover:-translate-y-px hover:shadow-[6px_6px_0px_0px_var(--color-grey-300)] active:translate-y-0"
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
    <div className="space-y-8">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {roleStats.map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} icon={stat.icon} />
        ))}
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-icon-muted" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search roles by name or description…"
            className="h-11 rounded-none border-2 border-grey-900 bg-white pl-10 font-mono text-sm shadow-[3px_3px_0px_0px_var(--color-grey-200)] focus-visible:ring-0 focus-visible:border-grey-900"
          />
        </div>
        <RoleFilterPopover filter={filter} onChange={setFilter} onReset={() => setFilter("all")} />
      </div>

      {/* Roles List */}
      {filteredRoles.length === 0 ? (
        <div className="border-2 border-grey-200 bg-grey-50 p-10 text-center">
          <p className="font-sans text-base font-black uppercase text-text-primary">
            No matching roles
          </p>
          <p className="mt-2 font-mono text-xs text-text-tertiary">
            Try another search term or filter.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRoles.map((role) => (
            <RoleRow key={role.name} role={role} canDelete={canDelete} />
          ))}
        </div>
      )}
    </div>
  );
}

function RoleFilterPopover({
  filter,
  onChange,
  onReset,
}: {
  filter: RoleFilter;
  onChange: (filter: RoleFilter) => void;
  onReset: () => void;
}) {
  const isFiltered = filter !== "all";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          className={`h-11 shrink-0 rounded-none border-2 px-5 font-mono text-sm font-bold shadow-[3px_3px_0px_0px_var(--color-grey-200)] transition-all hover:-translate-y-px hover:shadow-[5px_5px_0px_0px_var(--color-grey-200)] active:translate-y-0 ${isFiltered
              ? "border-grey-900 bg-grey-900 text-white"
              : "border-grey-900 bg-white text-grey-900 hover:bg-grey-50"
            }`}
        >
          <Filter className="mr-2 h-4 w-4" />
          {isFiltered ? `Filtered · ${filter}` : "Filter"}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="flex w-full flex-col rounded-none border-2 border-grey-900 bg-white p-0 shadow-[6px_6px_0px_0px_var(--color-grey-200)] sm:w-[320px]"
      >
        <div className="border-b-2 border-grey-900 p-4">
          <h3 className="font-sans text-sm font-black uppercase tracking-tight text-text-primary">
            Filter Roles
          </h3>
          <p className="mt-1 font-mono text-xs text-text-tertiary">
            Refine the role registry by type.
          </p>
        </div>

        <div className="space-y-2 p-4">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted">
            Role type
          </p>
          <Select value={filter} onValueChange={(v) => onChange(v as RoleFilter)}>
            <SelectTrigger className="h-10 w-full rounded-none border-2 border-grey-900 bg-white font-mono text-sm focus:ring-0">
              <SelectValue placeholder="All roles" />
            </SelectTrigger>
            <SelectContent className="rounded-none border-2 border-grey-900 font-mono text-sm shadow-[4px_4px_0px_0px_var(--color-grey-200)]">
              <SelectItem value="all">All roles</SelectItem>
              <SelectItem value="system">System roles only</SelectItem>
              <SelectItem value="custom">Custom roles only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex shrink-0 gap-3 border-t-2 border-grey-900 bg-grey-50 p-4">
          <Button
            type="button"
            variant="outline"
            onClick={onReset}
            className="h-10 flex-1 rounded-none border-2 border-grey-300 bg-white font-mono text-sm font-bold text-text-secondary transition-all hover:border-grey-900 hover:text-text-primary"
          >
            <RotateCcw className="mr-2 h-3.5 w-3.5" />
            Reset
          </Button>
          <PopoverClose asChild>
            <Button
              type="button"
              className="h-10 flex-1 rounded-none border-2 border-grey-900 bg-grey-900 font-mono text-sm font-bold text-white transition-all hover:bg-grey-800"
            >
              Apply
            </Button>
          </PopoverClose>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function RolesPageContent() {
  const canCreate = usePermission("roles.create");

  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 md:px-0">
      {/* Page Header */}
      <div className="mb-10 border-b-2 border-grey-900 pb-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <div className="mb-1 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-icon-tertiary" />
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted">
                Admin · Access Control
              </p>
            </div>
            <h1 className="font-sans text-4xl font-black uppercase tracking-tight text-text-primary">
              Roles
            </h1>
            <p className="mt-3 font-mono text-sm leading-relaxed text-text-tertiary">
              Manage permission bundles, review sensitive access, and configure which members can
              use admin tools.
            </p>
          </div>

          {canCreate && (
            <Button
              asChild
              className="h-11 shrink-0 rounded-none border-2 border-grey-900 bg-grey-900 font-mono text-xs font-bold text-white shadow-[4px_4px_0px_0px_var(--color-grey-300)] transition-all hover:-translate-y-px hover:shadow-[6px_6px_0px_0px_var(--color-grey-300)] active:translate-y-0"
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
      <DashboardShell>
        <RolesPageContent />
      </DashboardShell>
    </RouteGuard>
  );
}

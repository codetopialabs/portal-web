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
import { Badge } from "@/components/ui/badge";
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
        <Skeleton key={i} className="h-24 w-full rounded-none" />
      ))}
    </div>
  );
}

function roleTone(name: string, isSystem: boolean) {
  const lowered = name.toLowerCase();
  if (isSystem || lowered.includes("admin") || lowered.includes("super")) {
    return {
      icon: ShieldAlert,
      label: isSystem ? "System role" : "High access",
      className: "border-error-200 bg-error-50 text-error-700",
    };
  }
  if (lowered.includes("manager") || lowered.includes("mod")) {
    return {
      icon: ShieldCheck,
      label: "Operational",
      className: "border-info-200 bg-info-50 text-info-700",
    };
  }
  return {
    icon: Shield,
    label: "Community",
    className: "border-grey-200 bg-grey-50 text-text-secondary",
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
      className="h-8 rounded-none font-mono text-xs font-bold"
    >
      <Trash2 className="h-3.5 w-3.5" />
      {confirming ? "Confirm" : "Delete"}
    </Button>
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
      { label: "Total roles", value: allRoles.length, icon: Shield },
      {
        label: "System",
        value: allRoles.filter((role) => role.isSystem).length,
        icon: LockKeyhole,
      },
      {
        label: "Custom",
        value: allRoles.filter((role) => !role.isSystem).length,
        icon: ShieldCheck,
      },
      {
        label: "Members assigned",
        value: allRoles.reduce((total, role) => total + role.memberCount, 0),
        icon: Users,
      },
    ];
  }, [roles]);

  if (isLoading) return <RolesTableSkeleton />;

  if (isError) {
    return (
      <div className="border border-error-200 bg-error-50 p-8 text-center">
        <p className="font-sans text-base font-black text-error-700">Roles could not be loaded.</p>
        <p className="mt-2 font-mono text-xs text-error-600">Refresh the page and try again.</p>
      </div>
    );
  }

  if (!roles || roles.length === 0) {
    return (
      <div className="border border-grey-200 bg-white p-12 text-center">
        <p className="font-sans text-base font-black text-text-primary">No roles found</p>
        <p className="mt-2 font-mono text-xs text-text-tertiary">
          Create the first role to start assigning permissions.
        </p>
        {canCreate && (
          <Button asChild className="mt-6 rounded-none font-mono text-xs font-bold">
            <Link href="/admin/roles/new">
              <Plus className="h-3.5 w-3.5" />
              Create role
            </Link>
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {roleStats.map((stat) => {
          const StatIcon = stat.icon;
          return (
            <div key={stat.label} className="border border-grey-200 bg-white p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted">
                  {stat.label}
                </p>
                <StatIcon className="h-4 w-4 text-icon-tertiary" />
              </div>
              <p className="font-sans text-2xl font-black text-text-primary">{stat.value}</p>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-icon-muted" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search roles by name or description"
            className="h-11 rounded-none border-grey-200 bg-white pl-10 font-mono text-sm"
          />
        </div>
        <RoleFilterPopover filter={filter} onChange={setFilter} onReset={() => setFilter("all")} />
      </div>

      <div className="border border-grey-200 bg-white">
        <div className="hidden grid-cols-[minmax(0,1.7fr)_120px_120px_minmax(180px,auto)] gap-4 border-b border-grey-200 bg-grey-50 px-5 py-3 md:grid">
          <ColumnLabel>Role</ColumnLabel>
          <ColumnLabel>Permissions</ColumnLabel>
          <ColumnLabel>Members</ColumnLabel>
          <ColumnLabel>Actions</ColumnLabel>
        </div>

        <div className="divide-y divide-grey-200">
          {filteredRoles.length === 0 ? (
            <div className="p-10 text-center">
              <p className="font-sans text-base font-black text-text-primary">No matching roles</p>
              <p className="mt-2 font-mono text-xs text-text-tertiary">
                Try another search term or filter.
              </p>
            </div>
          ) : (
            filteredRoles.map((role) => {
              const tone = roleTone(role.name, role.isSystem);
              const RoleIcon = tone.icon;
              const highRisk = role.permissions.some((permission) =>
                ["users.delete", "users.suspend", "roles.delete"].includes(permission)
              );

              return (
                <div
                  key={role.name}
                  className="grid grid-cols-1 gap-4 px-5 py-5 transition-colors hover:bg-grey-50 md:grid-cols-[minmax(0,1.7fr)_120px_120px_minmax(180px,auto)] md:items-center"
                >
                  <div className="flex min-w-0 items-start gap-4">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center border ${tone.className}`}
                    >
                      <RoleIcon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/admin/roles/${role.name}`}
                          className="truncate font-sans text-base font-black text-text-primary hover:underline"
                        >
                          {role.displayName}
                        </Link>
                        <Badge variant="outline" className="h-5 rounded-none font-mono text-[10px]">
                          {tone.label}
                        </Badge>
                        {highRisk && (
                          <Badge className="h-5 rounded-none border-error-200 bg-error-50 font-mono text-[10px] text-error-700">
                            <AlertTriangle className="h-3 w-3" />
                            Sensitive
                          </Badge>
                        )}
                      </div>
                      <p className="mt-1 font-mono text-xs text-text-tertiary">
                        {role.name} · Rank {role.rank}
                      </p>
                      <p className="mt-2 line-clamp-2 font-mono text-xs leading-5 text-text-secondary">
                        {role.description || "No description provided."}
                      </p>
                    </div>
                  </div>

                  <MetricCell label="Permissions" value={role.permissions.length} />
                  <MetricCell label="Members" value={role.memberCount} />

                  <div className="flex flex-col gap-2 sm:flex-row md:justify-end">
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="h-8 rounded-none font-mono text-xs font-bold"
                    >
                      <Link href={`/admin/roles/${role.name}`}>
                        Details
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                    {canDelete && !role.isSystem && (
                      <DeleteRoleButton slug={role.name} name={role.name} />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
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
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          className="h-11 shrink-0 rounded-none border-grey-900 bg-grey-900 px-4 font-mono text-sm text-white hover:bg-grey-800"
        >
          <Filter className="mr-2 h-4 w-4" />
          Filters
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="flex w-full flex-col rounded-none border border-grey-200 bg-white p-0 sm:w-[340px]"
      >
        <div className="border-b border-grey-200 p-4">
          <h3 className="font-sans text-sm font-black uppercase tracking-tight text-text-primary">
            Filter Roles
          </h3>
          <p className="mt-1 font-mono text-xs text-text-tertiary">
            Refine the registry by role source.
          </p>
        </div>

        <div className="space-y-2 p-4">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted">
            Role type
          </p>
          <Select value={filter} onValueChange={(value) => onChange(value as RoleFilter)}>
            <SelectTrigger className="h-10 w-full rounded-none border-grey-200 bg-white font-mono text-sm focus:border-grey-900 focus:ring-2 focus:ring-grey-900/10">
              <SelectValue placeholder="All roles" />
            </SelectTrigger>
            <SelectContent className="rounded-none font-mono text-sm">
              <SelectItem value="all">All roles</SelectItem>
              <SelectItem value="system">System roles</SelectItem>
              <SelectItem value="custom">Custom roles</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex shrink-0 gap-3 border-t border-grey-200 bg-grey-50 p-4">
          <Button
            type="button"
            variant="outline"
            onClick={onReset}
            className="h-10 flex-1 rounded-none border-grey-200 bg-white font-mono text-sm font-semibold text-text-secondary transition-all hover:bg-grey-50"
          >
            <RotateCcw className="mr-2 h-3.5 w-3.5" />
            Reset
          </Button>
          <PopoverClose asChild>
            <Button
              type="button"
              className="h-10 flex-1 rounded-none bg-grey-900 font-mono text-sm font-semibold text-white transition-all hover:bg-grey-800"
            >
              View Results
            </Button>
          </PopoverClose>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function ColumnLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted">
      {children}
    </span>
  );
}

function MetricCell({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between border border-grey-200 px-3 py-2 md:block md:border-0 md:p-0 md:text-center">
      <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted md:hidden">
        {label}
      </span>
      <span className="font-sans text-xl font-black text-text-primary md:text-base">{value}</span>
    </div>
  );
}

function RolesPageContent() {
  const canCreate = usePermission("roles.create");

  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 md:px-0">
      <div className="mb-8 border-b border-grey-200 pb-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-icon-tertiary" />
              <h1 className="font-sans text-3xl font-black uppercase tracking-tight text-text-primary">
                Roles
              </h1>
            </div>
            <p className="font-mono text-sm leading-relaxed text-text-tertiary">
              Manage permission bundles, review sensitive access, and configure which members can
              use admin tools.
            </p>
          </div>

          {canCreate && (
            <Button asChild className="h-10 rounded-none font-mono text-xs font-bold">
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

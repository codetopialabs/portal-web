"use client";

import {
  AlertTriangle,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  LockKeyhole,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { DashboardShell } from "@/components/dashboard/Shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useRole as useAdminRole, useDeleteRole, usePermissionList } from "@/hooks/useAdmin";
import { usePermission } from "@/hooks/usePermission";
import { resolvePermission } from "@/lib/permissions";
import type { PermissionEntry } from "@/services/admin.service";

type PermissionGroup = {
  resource: string;
  directWildcards: string[];
  granted: PermissionEntry[];
  explicitCount: number;
};

function RoleDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-36 w-full rounded-none" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Skeleton className="h-96 w-full rounded-none" />
        <Skeleton className="h-72 w-full rounded-none" />
      </div>
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

function resourceLabel(resource: string) {
  if (resource === "*") return "All resources";
  return resource.replaceAll("_", " ");
}

function actionLabel(codename: string) {
  const action = codename.split(".")[1] ?? codename;
  return action.replaceAll("_", " ");
}

function buildPermissionGroups(
  rolePermissions: string[],
  allPermissions: PermissionEntry[]
): PermissionGroup[] {
  const explicit = new Set(rolePermissions);
  const groups = new Map<string, PermissionGroup>();

  for (const permission of allPermissions) {
    if (!resolvePermission(permission.codename, rolePermissions)) continue;

    const resource = permission.codename.split(".")[0] ?? permission.codename;
    if (!groups.has(resource)) {
      groups.set(resource, {
        resource,
        directWildcards: [],
        granted: [],
        explicitCount: 0,
      });
    }

    const group = groups.get(resource);
    if (!group) continue;
    group.granted.push(permission);
    if (explicit.has(permission.codename)) group.explicitCount += 1;
  }

  for (const wildcard of rolePermissions.filter((permission) => permission.endsWith(".*"))) {
    const resource = wildcard.split(".")[0] ?? wildcard;
    if (!groups.has(resource)) {
      groups.set(resource, {
        resource,
        directWildcards: [],
        granted: [],
        explicitCount: 0,
      });
    }
    groups.get(resource)?.directWildcards.push(wildcard);
  }

  return Array.from(groups.values()).sort((a, b) => a.resource.localeCompare(b.resource));
}

function RoleDetailContent({ slug }: { slug: string }) {
  const router = useRouter();
  const { data: role, isLoading, isError } = useAdminRole(slug);
  const { data: permissionList, isLoading: permissionsLoading } = usePermissionList();
  const { mutate: deleteRole, isPending: isDeleting } = useDeleteRole();
  const canEdit = usePermission("roles.edit");
  const canDelete = usePermission("roles.delete");
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmationInput, setConfirmationInput] = useState("");

  const permissionGroups = useMemo(() => {
    if (!role || !permissionList) return [];
    return buildPermissionGroups(role.permissions, permissionList);
  }, [role, permissionList]);

  if (isLoading || permissionsLoading) return <RoleDetailSkeleton />;

  if (isError || !role) {
    return (
      <div className="border border-error-200 bg-error-50 p-8 text-center">
        <p className="font-sans text-base font-black text-error-700">
          Role details could not be loaded.
        </p>
        <p className="mt-2 font-mono text-xs text-error-600">
          The requested role does not exist or access was denied.
        </p>
      </div>
    );
  }

  const tone = roleTone(role.name, role.isSystem);
  const RoleIcon = tone.icon;
  const hasGlobalWildcard = role.permissions.includes("*");
  const wildcardCount = role.permissions.filter((permission) => permission.includes("*")).length;
  const destructiveCount = role.permissions.filter((permission) =>
    ["users.delete", "users.suspend", "roles.delete"].includes(permission)
  ).length;

  function toggleGroup(resource: string) {
    setOpenGroup((current) => (current === resource ? null : resource));
  }

  function handleDeleteRole() {
    if (!role) return;
    if (confirmationInput !== role.name) {
      toast.error("Role name does not match.");
      return;
    }

    deleteRole(role.name, {
      onSuccess: () => {
        toast.success(`Role "${role.name}" deleted.`);
        router.push("/admin/roles");
      },
      onError: () => toast.error("Failed to delete role. Please try again."),
    });
  }

  return (
    <div className="space-y-6">
      <header className="border border-grey-200 bg-white">
        <div className="flex flex-col gap-5 p-5 md:flex-row md:items-start md:justify-between">
          <div className="flex min-w-0 gap-4">
            <div
              className={`flex h-20 w-20 shrink-0 items-center justify-center border ${tone.className}`}
            >
              <RoleIcon className="h-10 w-10" />
            </div>
            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <h1 className="font-sans text-3xl font-black leading-tight text-text-primary">
                  {role.displayName}
                </h1>
                <Badge variant="outline" className="h-6 rounded-none font-mono text-[10px]">
                  {tone.label}
                </Badge>
                {hasGlobalWildcard && (
                  <Badge className="h-6 rounded-none border-error-200 bg-error-50 font-mono text-[10px] text-error-700">
                    <LockKeyhole className="h-3 w-3" />
                    Unrestricted
                  </Badge>
                )}
              </div>
              <p className="font-mono text-sm text-text-tertiary">{role.name}</p>
              <p className="mt-3 max-w-2xl font-mono text-xs leading-6 text-text-secondary">
                {role.description || "No description provided."}
              </p>
            </div>
          </div>

          {canEdit && (
            <Button asChild className="h-10 rounded-none font-mono text-xs font-bold">
              <Link href={`/admin/roles/${role.name}/edit`}>Edit role</Link>
            </Button>
          )}
        </div>

        <div className="grid grid-cols-2 border-t border-grey-200 md:grid-cols-4">
          <HeaderStat label="Rank" value={String(role.rank)} />
          <HeaderStat label="Members" value={String(role.memberCount)} />
          <HeaderStat label="Permissions" value={String(role.permissions.length)} />
          <HeaderStat label="Wildcards" value={String(wildcardCount)} />
        </div>
      </header>

      {hasGlobalWildcard && (
        <div className="border border-error-200 bg-error-50 p-4">
          <div className="flex items-start gap-3">
            <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-error-700" />
            <div>
              <p className="font-sans text-sm font-black text-error-800">
                This role includes global wildcard access.
              </p>
              <p className="mt-1 font-mono text-xs leading-6 text-error-700">
                `*` expands to every standard permission shown below. Destructive permissions still
                require explicit grants under the platform permission rules.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <main className="space-y-6">
          <section className="border border-grey-200 bg-white">
            <div className="border-b border-grey-200 bg-grey-50 px-5 py-3">
              <h2 className="font-sans text-sm font-black uppercase tracking-widest text-text-primary">
                Permissions by resource
              </h2>
              <p className="mt-1 font-mono text-xs text-text-tertiary">
                Open each resource to see the actions this role allows.
              </p>
            </div>

            {permissionGroups.length === 0 ? (
              <div className="p-10 text-center">
                <p className="font-sans text-base font-black text-text-primary">
                  No permissions granted
                </p>
                <p className="mt-2 font-mono text-xs text-text-tertiary">
                  This role has no active permission nodes.
                </p>
              </div>
            ) : (
              <div className="max-h-[620px] divide-y divide-grey-200 overflow-y-auto">
                {permissionGroups.map((group) => {
                  const open = openGroup === group.resource;
                  const resourceWildcard = role.permissions.includes(`${group.resource}.*`);

                  return (
                    <div key={group.resource}>
                      <button
                        type="button"
                        onClick={() => toggleGroup(group.resource)}
                        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-grey-50"
                      >
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-sans text-base font-black capitalize text-text-primary">
                              {resourceLabel(group.resource)}
                            </p>
                            {resourceWildcard && (
                              <Badge className="h-5 rounded-none border-info-200 bg-info-50 font-mono text-[10px] text-info-700">
                                Full resource access
                              </Badge>
                            )}
                          </div>
                          <p className="mt-1 font-mono text-xs text-text-tertiary">
                            {group.granted.length} allowed action
                            {group.granted.length === 1 ? "" : "s"}
                            {group.explicitCount > 0 ? ` · ${group.explicitCount} explicit` : ""}
                          </p>
                        </div>
                        <ChevronRight
                          className={`h-4 w-4 shrink-0 text-icon-tertiary transition-transform ${
                            open ? "rotate-90" : ""
                          }`}
                        />
                      </button>

                      {open && (
                        <div className="border-t border-grey-200 bg-white px-5 py-4">
                          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                            {group.granted.map((permission) => {
                              const explicit = role.permissions.includes(permission.codename);
                              return (
                                <div
                                  key={permission.codename}
                                  className="border border-grey-200 bg-grey-50 p-3"
                                >
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                      <p className="font-mono text-xs font-bold text-text-primary">
                                        {actionLabel(permission.codename)}
                                      </p>
                                      <p className="mt-1 font-mono text-[11px] text-text-muted">
                                        {permission.codename}
                                      </p>
                                    </div>
                                    {permission.isDestructive ? (
                                      <Badge className="h-5 rounded-none border-error-200 bg-error-50 font-mono text-[10px] text-error-700">
                                        destructive
                                      </Badge>
                                    ) : explicit ? (
                                      <Badge
                                        variant="outline"
                                        className="h-5 rounded-none font-mono text-[10px]"
                                      >
                                        explicit
                                      </Badge>
                                    ) : (
                                      <Badge
                                        variant="outline"
                                        className="h-5 rounded-none font-mono text-[10px]"
                                      >
                                        wildcard
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="mt-3 font-mono text-xs leading-5 text-text-secondary">
                                    {permission.description}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </main>

        <aside className="space-y-6">
          <section className="border border-grey-200 bg-white">
            <div className="border-b border-grey-200 bg-grey-50 px-5 py-3">
              <h2 className="font-sans text-sm font-black uppercase tracking-widest text-text-primary">
                Role summary
              </h2>
            </div>
            <div className="divide-y divide-grey-200">
              <SideFact label="Identifier" value={role.name} />
              <SideFact label="Rank" value={String(role.rank)} />
              <SideFact label="Members assigned" value={String(role.memberCount)} />
              <SideFact label="Destructive grants" value={String(destructiveCount)} />
            </div>
            <Link
              href="/admin/members"
              className="flex items-center justify-between border-t border-grey-200 px-5 py-3 font-mono text-xs font-bold text-text-secondary transition-colors hover:bg-grey-50 hover:text-text-primary"
            >
              View assigned members
              <ArrowRight className="h-4 w-4" />
            </Link>
          </section>

          {role.isSystem && (
            <section className="border border-error-200 bg-error-50 p-5">
              <div className="mb-3 flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-error-700" />
                <h3 className="font-sans text-sm font-black text-error-800">System role</h3>
              </div>
              <p className="font-mono text-xs leading-6 text-error-700">
                This role is part of the platform’s core access model. Changes can affect admin
                availability and member access.
              </p>
            </section>
          )}

          {destructiveCount > 0 && (
            <section className="border border-error-200 bg-white p-5">
              <div className="mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-error-700" />
                <h3 className="font-sans text-sm font-black text-error-800">Destructive access</h3>
              </div>
              <p className="font-mono text-xs leading-6 text-text-secondary">
                This role explicitly includes one or more destructive permissions. Wildcards do not
                grant these actions.
              </p>
            </section>
          )}
        </aside>
      </div>

      {canDelete && !role.isSystem && (
        <section className="border border-error-300 bg-error-50">
          <div className="border-b border-error-300 px-5 py-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-error-700" />
              <h2 className="font-sans text-sm font-black uppercase tracking-widest text-error-700">
                Danger zone
              </h2>
            </div>
          </div>
          <div className="flex flex-col gap-4 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-sans text-sm font-black text-error-800">Delete this role</p>
              <p className="mt-1 font-mono text-xs leading-5 text-error-700">
                Permanently remove this role. Members assigned to it will lose the role immediately.
              </p>
            </div>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                setConfirmationInput("");
                setConfirmDelete(true);
              }}
              disabled={isDeleting}
              className="h-9 rounded-none font-mono text-xs font-bold"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete role
            </Button>
          </div>
        </section>
      )}

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent className="max-w-md rounded-none border-grey-900 bg-white">
          <DialogHeader>
            <DialogTitle className="font-sans text-xl font-black uppercase tracking-tight text-error-700">
              Delete role
            </DialogTitle>
            <DialogDescription className="pt-2 font-mono text-xs leading-6 text-text-secondary">
              This will permanently delete{" "}
              <span className="font-bold text-text-primary">{role.displayName}</span>. Members
              assigned to this role will lose it immediately.
            </DialogDescription>
            <div className="border border-error-200 bg-error-50 px-3 py-2 font-mono text-xs font-bold text-error-700">
              This action cannot be undone.
            </div>
          </DialogHeader>

          <div className="space-y-2 py-2">
            <p className="font-mono text-xs text-text-tertiary">
              Type <span className="font-bold text-text-primary">{role.name}</span> to confirm.
            </p>
            <Input
              value={confirmationInput}
              onChange={(event) => setConfirmationInput(event.target.value)}
              placeholder="Type role name"
              className="h-10 rounded-none border-grey-300 font-mono text-sm"
              onKeyDown={(event) => {
                if (event.key === "Enter" && confirmationInput === role.name && !isDeleting) {
                  handleDeleteRole();
                }
              }}
            />
          </div>

          <DialogFooter className="mt-2 gap-2 rounded-none border-grey-200 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmDelete(false)}
              className="h-10 rounded-none font-mono text-xs font-bold"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteRole}
              disabled={confirmationInput !== role.name || isDeleting}
              className="h-10 rounded-none font-mono text-xs font-bold"
            >
              {isDeleting ? "Deleting..." : "Delete role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function HeaderStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-grey-200 p-4 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0">
      <p className="font-sans text-2xl font-black text-text-primary">{value}</p>
      <p className="mt-1 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted">
        {label}
      </p>
    </div>
  );
}

function SideFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-3">
      <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-text-muted">
        {label}
      </p>
      <p className="truncate text-right font-mono text-xs text-text-secondary">{value}</p>
    </div>
  );
}

function RoleDetailPageContent({ slug }: { slug: string }) {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 md:px-0">
      <div className="mb-6">
        <Link
          href="/admin/roles"
          className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-widest text-text-muted transition-colors hover:text-text-primary"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Roles
        </Link>
      </div>

      <RoleDetailContent slug={slug} />
    </div>
  );
}

export default function RoleDetailPage() {
  const { slug } = useParams<{ slug: string }>();

  return (
    <RouteGuard permission="roles.view">
      <DashboardShell>
        <RoleDetailPageContent slug={slug} />
      </DashboardShell>
    </RouteGuard>
  );
}

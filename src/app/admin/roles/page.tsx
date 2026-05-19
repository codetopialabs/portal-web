"use client";

import { ShieldCheck, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { DashboardShell } from "@/components/dashboard/Shell";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useDeleteRole, useRoles } from "@/hooks/useAdmin";
import { usePermission } from "@/hooks/usePermission";

// ─── Skeleton loader ──────────────────────────────────────────────────────────

function RolesTableSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: skeleton rows have no meaningful key
        <Skeleton key={i} className="h-14 w-full" />
      ))}
    </div>
  );
}

// ─── Delete confirmation ──────────────────────────────────────────────────────

function DeleteRoleButton({ id, name }: { id: number; name: string }) {
  const [confirming, setConfirming] = useState(false);
  const { mutate: deleteRole, isPending } = useDeleteRole();

  function handleDelete() {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    deleteRole(String(id), {
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
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      className={`font-mono text-xs uppercase tracking-widest px-3 py-1.5 border transition-colors disabled:opacity-50 disabled:pointer-events-none ${
        confirming
          ? "border-red-300 text-red-600 hover:bg-red-50"
          : "border-zinc-200 text-zinc-500 hover:border-red-300 hover:text-red-600 hover:bg-red-50"
      }`}
    >
      <Trash2 className="w-3 h-3 inline-block mr-1" />
      {confirming ? "Confirm?" : "Delete"}
    </button>
  );
}

// ─── Roles list content ───────────────────────────────────────────────────────

function RolesListContent() {
  const { data: roles, isLoading, isError } = useRoles();
  const canCreate = usePermission("roles.create");
  const canDelete = usePermission("roles.delete");

  if (isLoading) {
    return <RolesTableSkeleton />;
  }

  if (isError) {
    return (
      <p className="font-mono text-xs text-red-500">
        Failed to load roles. Please refresh the page.
      </p>
    );
  }

  if (!roles || roles.length === 0) {
    return (
      <div className="bg-white border border-zinc-200 p-8 text-center">
        <p className="font-mono text-xs text-zinc-400">No roles found.</p>
        {canCreate && (
          <Link
            href="/admin/roles/new"
            className="inline-block mt-4 font-mono text-xs uppercase tracking-widest text-zinc-900 border border-zinc-200 px-4 py-2 hover:bg-zinc-50 transition-colors"
          >
            Create First Role
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white border border-zinc-200">
      {/* Table header */}
      <div className="grid grid-cols-[2fr_2fr_3fr_1fr_1fr_auto] gap-4 px-4 py-3 border-b border-zinc-200 bg-zinc-50">
        <span className="font-mono text-xs text-zinc-400 uppercase tracking-widest">Name</span>
        <span className="font-mono text-xs text-zinc-400 uppercase tracking-widest">
          Display Name
        </span>
        <span className="font-mono text-xs text-zinc-400 uppercase tracking-widest">
          Description
        </span>
        <span className="font-mono text-xs text-zinc-400 uppercase tracking-widest">
          Permissions
        </span>
        <span className="font-mono text-xs text-zinc-400 uppercase tracking-widest">Members</span>
        <span className="font-mono text-xs text-zinc-400 uppercase tracking-widest sr-only">
          Actions
        </span>
      </div>

      {/* Table rows */}
      {roles.map((role) => (
        <div
          key={role.id}
          className="grid grid-cols-[2fr_2fr_3fr_1fr_1fr_auto] gap-4 px-4 py-4 border-b border-zinc-100 last:border-b-0 items-center hover:bg-zinc-50 transition-colors"
        >
          {/* Name (slug) */}
          <div className="flex items-center gap-2 min-w-0">
            <Link
              href={`/admin/roles/${role.id}`}
              className="font-mono text-xs text-zinc-900 hover:underline truncate"
            >
              {role.name}
            </Link>
            {role.isSystem && (
              <Badge variant="secondary" className="shrink-0 text-[10px]">
                System
              </Badge>
            )}
          </div>

          {/* Display name */}
          <span className="font-sans text-sm text-zinc-700 truncate">{role.displayName}</span>

          {/* Description */}
          <span className="font-mono text-xs text-zinc-400 truncate">
            {role.description || "—"}
          </span>

          {/* Permission count */}
          <span className="font-mono text-xs text-zinc-700">{role.permissions.length}</span>

          {/* Member count */}
          <span className="font-mono text-xs text-zinc-700">{role.memberCount}</span>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Link
              href={`/admin/roles/${role.id}`}
              className="font-mono text-xs uppercase tracking-widest text-zinc-500 hover:text-zinc-900 transition-colors"
            >
              View
            </Link>
            {canDelete && !role.isSystem && <DeleteRoleButton id={role.id} name={role.name} />}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function RolesPageContent() {
  const canCreate = usePermission("roles.create");

  return (
    <div className="max-w-6xl mx-auto pb-20">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheck className="w-5 h-5 text-zinc-400" />
            <h1 className="font-sans font-black uppercase tracking-widest text-xl text-zinc-900">
              Roles
            </h1>
          </div>
          <p className="font-mono text-xs text-zinc-400">
            Manage community roles and their permissions.
          </p>
        </div>

        {canCreate && (
          <Link
            href="/admin/roles/new"
            className="font-mono text-xs uppercase tracking-widest text-white bg-zinc-900 border border-zinc-900 px-4 py-2 hover:bg-zinc-700 transition-colors"
          >
            + New Role
          </Link>
        )}
      </div>

      {/* Roles list */}
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

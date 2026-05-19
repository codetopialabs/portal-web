"use client";

import { ChevronLeft, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { DashboardShell } from "@/components/dashboard/Shell";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useCreateRole, usePermissionList } from "@/hooks/useAdmin";
import type { PermissionEntry } from "@/services/admin.service";

// ─── Permission picker ────────────────────────────────────────────────────────

function groupPermissions(permissions: PermissionEntry[]): Record<string, PermissionEntry[]> {
  const groups: Record<string, PermissionEntry[]> = {};
  for (const perm of permissions) {
    const resource = perm.codename.split(".")[0] ?? perm.codename;
    if (!groups[resource]) {
      groups[resource] = [];
    }
    groups[resource].push(perm);
  }
  return groups;
}

function PermissionPicker({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (permissions: string[]) => void;
}) {
  const { data: permissions, isLoading, isError } = usePermissionList();

  function toggle(codename: string) {
    if (selected.includes(codename)) {
      onChange(selected.filter((p) => p !== codename));
    } else {
      onChange([...selected, codename]);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: skeleton rows
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  if (isError || !permissions) {
    return (
      <p className="font-mono text-xs text-red-500">
        Failed to load permissions. Please refresh the page.
      </p>
    );
  }

  const groups = groupPermissions(permissions);
  const sortedGroups = Object.keys(groups).sort();

  return (
    <div className="space-y-4">
      {sortedGroups.map((group) => (
        <div key={group} className="bg-white border border-zinc-200">
          <div className="px-4 py-2 border-b border-zinc-100 bg-zinc-50">
            <span className="font-mono text-xs uppercase tracking-widest text-zinc-500">
              {group}.*
            </span>
          </div>
          <div className="divide-y divide-zinc-100">
            {groups[group].map((perm) => (
              <label
                key={perm.codename}
                className="flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-zinc-50 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(perm.codename)}
                  onChange={() => toggle(perm.codename)}
                  className="mt-0.5 h-4 w-4 border-zinc-300 accent-zinc-900"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-zinc-900">{perm.codename}</span>
                    {perm.isDestructive && (
                      <Badge variant="destructive" className="text-[10px]">
                        Destructive
                      </Badge>
                    )}
                  </div>
                  <p className="font-mono text-xs text-zinc-400 mt-0.5">{perm.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Form ─────────────────────────────────────────────────────────────────────

const SLUG_REGEX = /^[a-z0-9_]+$/;

function NewRoleForm() {
  const router = useRouter();
  const { mutate: createRole, isPending } = useCreateRole();

  const [name, setName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [description, setDescription] = useState("");
  const [permissions, setPermissions] = useState<string[]>([]);

  const [errors, setErrors] = useState<{
    name?: string;
    displayName?: string;
    form?: string;
  }>({});

  function validate(): boolean {
    const next: typeof errors = {};

    if (!name.trim()) {
      next.name = "Name is required.";
    } else if (!SLUG_REGEX.test(name)) {
      next.name = "Name must be lowercase letters, numbers, and underscores only.";
    }

    if (!displayName.trim()) {
      next.displayName = "Display name is required.";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    createRole(
      {
        name: name.trim(),
        displayName: displayName.trim(),
        description: description.trim(),
        permissions,
      },
      {
        onSuccess: () => {
          toast.success("Role created successfully.");
          router.push("/admin/roles");
        },
        onError: (err: unknown) => {
          // Handle 400 — name already exists
          const status = (err as { response?: { status?: number } })?.response?.status;
          if (status === 400) {
            setErrors((prev) => ({
              ...prev,
              name: "A role with this name already exists.",
            }));
          } else {
            setErrors((prev) => ({
              ...prev,
              form: "Failed to create role. Please try again.",
            }));
          }
        },
      }
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Role details */}
      <div className="bg-white border border-zinc-200">
        <div className="px-6 py-4 border-b border-zinc-200">
          <h2 className="font-sans font-black uppercase tracking-widest text-sm text-zinc-900">
            Role Details
          </h2>
        </div>
        <div className="px-6 py-6 space-y-5">
          {/* Name */}
          <div className="space-y-1.5">
            <Label
              htmlFor="name"
              className="font-mono text-xs text-zinc-400 uppercase tracking-widest"
            >
              Name (slug)
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
              }}
              placeholder="e.g. community_manager"
              className="font-mono text-sm"
              aria-invalid={!!errors.name}
            />
            {errors.name && <p className="font-mono text-xs text-red-500">{errors.name}</p>}
            <p className="font-mono text-xs text-zinc-400">
              Lowercase letters, numbers, and underscores only. Cannot be changed after creation.
            </p>
          </div>

          {/* Display name */}
          <div className="space-y-1.5">
            <Label
              htmlFor="displayName"
              className="font-mono text-xs text-zinc-400 uppercase tracking-widest"
            >
              Display Name
            </Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => {
                setDisplayName(e.target.value);
                if (errors.displayName) setErrors((prev) => ({ ...prev, displayName: undefined }));
              }}
              placeholder="e.g. Community Manager"
              className="font-sans text-sm"
              aria-invalid={!!errors.displayName}
            />
            {errors.displayName && (
              <p className="font-mono text-xs text-red-500">{errors.displayName}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label
              htmlFor="description"
              className="font-mono text-xs text-zinc-400 uppercase tracking-widest"
            >
              Description
            </Label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Briefly describe what this role is for."
              rows={3}
              className="w-full border border-zinc-200 bg-white px-3 py-2 font-mono text-xs text-zinc-700 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent resize-none"
            />
          </div>
        </div>
      </div>

      {/* Permissions */}
      <div>
        <div className="mb-4">
          <h2 className="font-sans font-black uppercase tracking-widest text-sm text-zinc-900">
            Permissions
          </h2>
          <p className="font-mono text-xs text-zinc-400 mt-1">
            Select the permissions this role grants. Destructive permissions must be explicitly
            listed.
          </p>
        </div>
        <PermissionPicker selected={permissions} onChange={setPermissions} />
      </div>

      {/* Form-level error */}
      {errors.form && <p className="font-mono text-xs text-red-500">{errors.form}</p>}

      {/* Actions */}
      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={isPending}
          className="font-mono text-xs uppercase tracking-widest text-white bg-zinc-900 border border-zinc-900 px-6 py-2.5 hover:bg-zinc-700 transition-colors disabled:opacity-50 disabled:pointer-events-none"
        >
          {isPending ? "Creating…" : "Create Role"}
        </button>
        <Link
          href="/admin/roles"
          className="font-mono text-xs uppercase tracking-widest text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function NewRolePageContent() {
  return (
    <div className="max-w-3xl mx-auto pb-20">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6">
        <Link
          href="/admin/roles"
          className="font-mono text-xs text-zinc-400 hover:text-zinc-900 transition-colors flex items-center gap-1"
        >
          <ChevronLeft className="w-3 h-3" />
          Roles
        </Link>
      </div>

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <ShieldCheck className="w-5 h-5 text-zinc-400" />
        <h1 className="font-sans font-black uppercase tracking-widest text-xl text-zinc-900">
          New Role
        </h1>
      </div>

      <NewRoleForm />
    </div>
  );
}

export default function NewRolePage() {
  return (
    <RouteGuard permission="roles.create">
      <DashboardShell>
        <NewRolePageContent />
      </DashboardShell>
    </RouteGuard>
  );
}

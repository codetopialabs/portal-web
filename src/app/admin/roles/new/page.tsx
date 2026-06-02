"use client";

import { AlertTriangle, ChevronLeft, ShieldCheck, ShieldPlus, Sparkles } from "lucide-react";
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
import type { PermissionEntry } from "@/types/permissions.types";

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
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: skeleton items
          <Skeleton key={i} className="h-40 w-full rounded-none" />
        ))}
      </div>
    );
  }

  if (isError || !permissions) {
    return (
      <div className="p-8 bg-red-50 border border-red-100 text-center">
        <p className="font-mono text-xs text-red-600 font-black uppercase tracking-widest">
          ERROR: PERMISSION_LIST_UNAVAILABLE
        </p>
      </div>
    );
  }

  const groups = groupPermissions(permissions);
  const sortedGroups = Object.keys(groups).sort();

  return (
    <div className="space-y-6">
      {sortedGroups.map((group) => (
        <div key={group} className="bg-white border border-zinc-200">
          <div className="px-5 py-3 border-b border-zinc-200 bg-zinc-50/50">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-900 font-bold">
              {group}.* ARCHIVE
            </span>
          </div>
          <div className="divide-y divide-zinc-100">
            {groups[group].map((perm) => (
              <label
                key={perm.codename}
                className="flex items-start gap-4 px-5 py-4 cursor-pointer hover:bg-zinc-50/50 transition-colors group"
              >
                <div className="relative flex items-center h-5">
                  <input
                    type="checkbox"
                    checked={selected.includes(perm.codename)}
                    onChange={() => toggle(perm.codename)}
                    className="h-4 w-4 rounded-none border-zinc-300 text-zinc-900 focus:ring-zinc-900 accent-zinc-900"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-zinc-900 font-black uppercase tracking-tight">
                      {perm.codename}
                    </span>
                    {perm.isDestructive && (
                      <Badge className="rounded-none text-[8px] bg-red-100 text-red-700 hover:bg-red-100 border-none font-black uppercase tracking-[0.1em] px-1.5 h-4">
                        DESTRUCTIVE_OP
                      </Badge>
                    )}
                  </div>
                  <p className="font-mono text-[10px] text-zinc-400 mt-1 uppercase tracking-wider leading-relaxed">
                    {perm.description}
                  </p>
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
  const [rank, setRank] = useState("");
  const [permissions, setPermissions] = useState<string[]>([]);

  const [errors, setErrors] = useState<{
    name?: string;
    displayName?: string;
    rank?: string;
    form?: string;
  }>({});

  function validate(): boolean {
    const next: typeof errors = {};

    if (!name.trim()) {
      next.name = "Identifier is required.";
    } else if (!SLUG_REGEX.test(name)) {
      next.name = "Identifier must be lowercase letters, numbers, and underscores only.";
    }

    if (!displayName.trim()) {
      next.displayName = "Display name is required.";
    }

    const rankValue = Number(rank);
    if (!rank.trim()) {
      next.rank = "Rank is required.";
    } else if (Number.isNaN(rankValue) || rankValue < 1 || rankValue > 99) {
      next.rank = "Rank must be a number between 1 and 99.";
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
        rank: Number(rank),
        permissions,
      },
      {
        onSuccess: () => {
          toast.success("Role created successfully.");
          router.push("/admin/roles");
        },
        onError: (err: unknown) => {
          const status = (err as { response?: { status?: number } })?.response?.status;
          if (status === 400) {
            setErrors((prev) => ({
              ...prev,
              name: "Ident conflict: Role already exists.",
            }));
          } else {
            setErrors((prev) => ({
              ...prev,
              form: "CORE_PROCESS_FAILURE: FAILED TO PERSIST ROLE",
            }));
          }
        },
      }
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-12">
      {/* Role details */}
      <div className="bg-white border border-zinc-200">
        <div className="px-6 py-4 border-b border-zinc-200 bg-zinc-50/50">
          <h2 className="font-sans font-black uppercase tracking-widest text-xs text-zinc-900">
            Authority Archetype Definition
          </h2>
        </div>
        <div className="px-6 py-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Name */}
            <div className="space-y-2">
              <Label
                htmlFor="name"
                className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest font-bold"
              >
                Reference_Ident (Slug)
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                }}
                placeholder="authority_id"
                className="font-mono text-sm rounded-none border-zinc-200 bg-zinc-50 focus:bg-white focus:border-zinc-900 transition-all uppercase"
                aria-invalid={!!errors.name}
              />
              {errors.name ? (
                <p className="font-mono text-[10px] text-red-500 uppercase">{errors.name}</p>
              ) : (
                <p className="font-mono text-[10px] text-zinc-400 uppercase tracking-tight">
                  lowercase_only / numbers / underscores
                </p>
              )}
            </div>

            {/* Rank */}
            <div className="space-y-2">
              <Label
                htmlFor="rank"
                className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest font-bold"
              >
                Hierarchy_Priority (Rank)
              </Label>
              <Input
                id="rank"
                type="number"
                min={1}
                max={99}
                value={rank}
                onChange={(e) => {
                  setRank(e.target.value);
                  if (errors.rank) setErrors((prev) => ({ ...prev, rank: undefined }));
                }}
                placeholder="10"
                className="font-mono text-sm rounded-none border-zinc-200 bg-zinc-50 focus:bg-white focus:border-zinc-900 transition-all"
                aria-invalid={!!errors.rank}
              />
              {errors.rank ? (
                <p className="font-mono text-[10px] text-red-500 uppercase">{errors.rank}</p>
              ) : (
                <p className="font-mono text-[10px] text-zinc-400 uppercase tracking-tight">
                  range [01-99] / lower = higher authority
                </p>
              )}
            </div>
          </div>

          {/* Display name */}
          <div className="space-y-2">
            <Label
              htmlFor="displayName"
              className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest font-bold"
            >
              Public_Title
            </Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => {
                setDisplayName(e.target.value);
                if (errors.displayName) setErrors((prev) => ({ ...prev, displayName: undefined }));
              }}
              placeholder="Official Role Title"
              className="font-sans text-sm font-black uppercase tracking-tight rounded-none border-zinc-200 bg-zinc-50 focus:bg-white focus:border-zinc-900 transition-all"
              aria-invalid={!!errors.displayName}
            />
            {errors.displayName && (
              <p className="font-mono text-[10px] text-red-500 uppercase">{errors.displayName}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label
              htmlFor="description"
              className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest font-bold"
            >
              Operational_Scope_Description
            </Label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the responsibilities and scope of this role..."
              rows={3}
              className="w-full border border-zinc-200 bg-zinc-50 px-4 py-3 font-mono text-xs text-zinc-700 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 focus:bg-white rounded-none transition-all resize-none shadow-inner"
            />
          </div>
        </div>
      </div>

      {/* Permissions */}
      <div>
        <div className="mb-6 flex items-end justify-between border-b border-zinc-900 pb-2">
          <div>
            <h2 className="font-sans font-black uppercase tracking-widest text-sm text-zinc-900">
              Authority Grid Nodes
            </h2>
            <p className="font-mono text-[10px] text-zinc-400 mt-1 uppercase tracking-widest">
              Assign permission vectors to this authority archetype.
            </p>
          </div>
          <p className="font-mono text-[10px] text-zinc-900 font-black uppercase tracking-widest">
            {permissions.length} nodes active
          </p>
        </div>
        <PermissionPicker selected={permissions} onChange={setPermissions} />
      </div>

      {/* Form-level error */}
      {errors.form && (
        <div className="p-4 bg-red-50 border border-red-200 flex items-center gap-3">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          <p className="font-mono text-[10px] text-red-600 font-bold uppercase tracking-widest">
            {errors.form}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col md:flex-row items-center gap-6 pt-6 border-t border-zinc-100">
        <button
          type="submit"
          disabled={isPending}
          className="w-full md:w-auto font-mono text-[11px] font-black uppercase tracking-[0.2em] text-white bg-zinc-900 border border-zinc-900 px-10 py-4 hover:bg-zinc-800 transition-all shadow-xl disabled:opacity-50"
        >
          {isPending ? "BUFFERING_SYNCING…" : "INIT_ARCHETYPE"}
        </button>
        <Link
          href="/admin/roles"
          className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-zinc-900 transition-colors"
        >
          CANCEL_OPERATION
        </Link>
      </div>
    </form>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function NewRolePageContent() {
  return (
    <div className="max-w-3xl mx-auto pb-20 px-4 md:px-0">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-8">
        <Link
          href="/admin/roles"
          className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-zinc-900 transition-colors flex items-center gap-1.5"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          BACK_TO_MATRICES
        </Link>
      </div>

      {/* Header */}
      <div className="flex items-center gap-4 mb-12">
        <div className="h-12 w-12 flex items-center justify-center border border-zinc-900 bg-zinc-900 text-white shadow-lg">
          <ShieldPlus className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-sans font-black uppercase tracking-tight text-3xl text-zinc-900">
            Archetype Creation
          </h1>
          <p className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest mt-1">
            Constructing a new authority matrix record
          </p>
        </div>
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

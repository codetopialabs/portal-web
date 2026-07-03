"use client";

import { AlertTriangle, ChevronLeft, Plus, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { PermissionSelectSheet } from "@/components/admin/PermissionSelectSheet";
import { ScopeChips } from "@/components/admin/ScopeChips";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useRole as useAdminRole, usePermissionList, useUpdateRole } from "@/hooks/useAdmin";
import { buildPermissionVocab, compressScopes } from "@/lib/scopes";

function RoleEditForm({ slug }: { slug: string }) {
  const router = useRouter();
  const { data: role, isLoading, isError } = useAdminRole(slug);
  const { mutate: updateRole, isPending } = useUpdateRole();
  const { data: allPermissions } = usePermissionList();

  const [initialized, setInitialized] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [description, setDescription] = useState("");
  const [rank, setRank] = useState("");
  const [permissions, setPermissions] = useState<string[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [errors, setErrors] = useState<{ displayName?: string; rank?: string; form?: string }>({});

  const vocab = useMemo(() => buildPermissionVocab(allPermissions ?? []), [allPermissions]);
  const compressed = useMemo(() => compressScopes(permissions, vocab), [permissions, vocab]);

  useEffect(() => {
    if (role && !initialized) {
      setDisplayName(role.displayName ?? "");
      setDescription(role.description ?? "");
      setRank(String(role.rank ?? ""));
      setPermissions(role.permissions ?? []);
      setInitialized(true);
    }
  }, [role, initialized]);

  function validate(): boolean {
    const next: typeof errors = {};
    if (!displayName.trim()) next.displayName = "Display name is required.";
    const rankValue = Number(rank);
    if (!rank.trim()) next.rank = "Rank is required.";
    else if (Number.isNaN(rankValue) || rankValue < 1 || rankValue > 99)
      next.rank = "Rank must be between 1 and 99.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    updateRole(
      {
        slug,
        data: {
          displayName: displayName.trim(),
          description: description.trim(),
          rank: Number(rank),
          permissions,
        },
      },
      {
        onSuccess: (updatedRole) => {
          toast.success("Role updated.");
          router.push(`/admin/roles/${updatedRole.name}`);
        },
        onError: (error) =>
          setErrors((prev) => ({
            ...prev,
            form:
              error instanceof Error
                ? error.message
                : "Failed to update the role. Please try again.",
          })),
      }
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full rounded-none" />
        <Skeleton className="h-40 w-full rounded-none" />
      </div>
    );
  }

  if (isError || !role) {
    return (
      <div className="border border-error-200 bg-error-50 p-8 text-center">
        <p className="font-sans text-base font-black text-error-700">Role could not be loaded.</p>
      </div>
    );
  }

  if (role.isSystem) {
    return (
      <div className="border border-warning-200 bg-warning-50 p-8">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning-700" />
          <div>
            <p className="font-sans text-base font-black text-warning-800">
              System roles are locked
            </p>
            <p className="mt-2 font-mono text-xs leading-6 text-warning-700">
              The {role.displayName} role is part of the platform's core access model. Its
              permissions are managed by the backend seed/configuration so member access stays
              consistent.
            </p>
            <Button asChild className="mt-5 h-10 rounded-none font-mono text-xs font-bold">
              <Link href={`/admin/roles/${role.name}`}>Back to role</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="border border-grey-200 bg-white">
        <div className="border-b border-grey-200 bg-grey-50 px-5 py-3">
          <h2 className="font-sans text-sm font-black uppercase tracking-widest text-text-primary">
            Role details
          </h2>
        </div>
        <div className="space-y-6 p-5">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label
                htmlFor="name"
                className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted"
              >
                Identifier (slug)
              </Label>
              <Input
                id="name"
                value={role.name}
                readOnly
                className="h-10 cursor-not-allowed rounded-none border-grey-200 bg-grey-50 font-mono text-sm text-text-muted"
              />
              <p className="font-mono text-[10px] text-text-muted">Identifier can't be changed.</p>
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="rank"
                className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted"
              >
                Rank
              </Label>
              <Input
                id="rank"
                type="number"
                min={1}
                max={99}
                value={rank}
                onChange={(e) => {
                  setRank(e.target.value);
                  if (errors.rank) setErrors((p) => ({ ...p, rank: undefined }));
                }}
                className="h-10 rounded-none border-grey-300 font-mono text-sm"
                aria-invalid={!!errors.rank}
              />
              <p
                className={`font-mono text-[10px] ${errors.rank ? "text-error-600" : "text-text-muted"}`}
              >
                {errors.rank ?? "1–99 · higher rank = more authority"}
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="displayName"
              className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted"
            >
              Display name
            </Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => {
                setDisplayName(e.target.value);
                if (errors.displayName) setErrors((p) => ({ ...p, displayName: undefined }));
              }}
              className="h-10 rounded-none border-grey-300 font-mono text-sm"
              aria-invalid={!!errors.displayName}
            />
            {errors.displayName && (
              <p className="font-mono text-[10px] text-error-600">{errors.displayName}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="description"
              className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted"
            >
              Description
            </Label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full resize-y rounded-none border border-grey-300 bg-white p-3 font-mono text-sm text-text-primary outline-none focus:border-grey-900"
            />
          </div>
        </div>
      </section>

      <section className="border border-grey-200 bg-white">
        <div className="flex items-center justify-between gap-4 border-b border-grey-200 bg-grey-50 px-5 py-3">
          <h2 className="font-sans text-sm font-black uppercase tracking-widest text-text-primary">
            Permissions
          </h2>
          <span className="font-mono text-xs text-text-tertiary">
            {permissions.length} selected
          </span>
        </div>
        <div className="space-y-4 p-5">
          {permissions.length === 0 ? (
            <p className="font-mono text-sm text-text-tertiary">No permissions selected.</p>
          ) : (
            <ScopeChips scopes={compressed} max={40} />
          )}
          <Button
            type="button"
            variant="outline"
            onClick={() => setPickerOpen(true)}
            className="h-10 rounded-none font-mono text-xs font-bold"
          >
            <Plus className="mr-2 h-4 w-4" />
            Edit permissions
          </Button>
        </div>
      </section>

      {errors.form && (
        <div className="flex items-center gap-3 border border-error-200 bg-error-50 p-4">
          <AlertTriangle className="h-4 w-4 shrink-0 text-error-600" />
          <p className="font-mono text-xs font-bold text-error-700">{errors.form}</p>
        </div>
      )}

      <div className="flex items-center gap-3">
        <Button
          type="submit"
          disabled={isPending}
          className="h-11 rounded-none font-mono text-xs font-bold"
        >
          {isPending ? "Saving..." : "Save changes"}
        </Button>
        <Link
          href={`/admin/roles/${role.name}`}
          className="font-mono text-xs font-bold uppercase tracking-widest text-text-muted transition-colors hover:text-text-primary"
        >
          Discard
        </Link>
      </div>

      <PermissionSelectSheet
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        selected={permissions}
        onChange={setPermissions}
        title="Role permissions"
        description="Choose the scopes this role grants. Destructive permissions must be selected explicitly."
      />
    </form>
  );
}

function EditRolePageContent({ slug }: { slug: string }) {
  return (
    <div className="mx-auto max-w-3xl pb-20">
      <div className="mb-6">
        <Link
          href={`/admin/roles/${slug}`}
          className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-widest text-text-muted transition-colors hover:text-text-primary"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Role
        </Link>
      </div>
      <header className="mb-6 flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center border border-grey-200 bg-white">
          <ShieldCheck className="h-5 w-5 text-icon-tertiary" />
        </div>
        <div>
          <h1 className="font-sans text-2xl font-black uppercase tracking-tight text-text-primary">
            Edit role
          </h1>
          <p className="mt-1 font-mono text-xs text-text-tertiary">
            Update this role's details and permissions.
          </p>
        </div>
      </header>
      <RoleEditForm slug={slug} />
    </div>
  );
}

export default function EditRolePage() {
  const { slug } = useParams<{ slug: string }>();
  return (
    <RouteGuard permission="roles.edit">
      <EditRolePageContent slug={slug} />
    </RouteGuard>
  );
}

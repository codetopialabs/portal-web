"use client";

import { AlertTriangle, ChevronLeft, Plus, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PermissionSelectSheet } from "@/components/admin/PermissionSelectSheet";
import { ScopeChips } from "@/components/admin/ScopeChips";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateRole, usePermissionList } from "@/hooks/useAdmin";
import { buildPermissionVocab, compressScopes } from "@/lib/scopes";

const SLUG_REGEX = /^[a-z0-9_]+$/;

function NewRoleForm() {
  const router = useRouter();
  const { mutate: createRole, isPending } = useCreateRole();
  const { data: allPermissions } = usePermissionList();

  const [name, setName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [description, setDescription] = useState("");
  const [rank, setRank] = useState("");
  const [permissions, setPermissions] = useState<string[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    displayName?: string;
    rank?: string;
    form?: string;
  }>({});

  const vocab = useMemo(() => buildPermissionVocab(allPermissions ?? []), [allPermissions]);
  const compressed = useMemo(() => compressScopes(permissions, vocab), [permissions, vocab]);

  function validate(): boolean {
    const next: typeof errors = {};
    if (!name.trim()) next.name = "Identifier is required.";
    else if (!SLUG_REGEX.test(name))
      next.name = "Use lowercase letters, numbers, and underscores only.";
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
          toast.success("Role created.");
          router.push("/admin/roles");
        },
        onError: (err: unknown) => {
          const status = (err as { response?: { status?: number } })?.response?.status;
          setErrors((prev) =>
            status === 400
              ? { ...prev, name: "A role with this identifier already exists." }
              : { ...prev, form: "Failed to create the role. Please try again." }
          );
        },
      }
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Details */}
      <section className="border border-grey-200 bg-white">
        <div className="border-b border-grey-200 bg-grey-50 px-5 py-3">
          <h2 className="font-sans text-base font-bold text-text-primary">Role details</h2>
        </div>
        <div className="space-y-6 p-5">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="font-mono text-xs font-medium text-text-muted">
                Identifier (slug)
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((p) => ({ ...p, name: undefined }));
                }}
                placeholder="content_editor"
                className="h-10 rounded-none border-grey-300 font-mono text-sm"
                aria-invalid={!!errors.name}
              />
              <p
                className={`font-mono text-[10px] ${errors.name ? "text-error-600" : "text-text-muted"}`}
              >
                {errors.name ?? "lowercase letters, numbers, underscores"}
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="rank" className="font-mono text-xs font-medium text-text-muted">
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
                placeholder="10"
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
            <Label htmlFor="displayName" className="font-mono text-xs font-medium text-text-muted">
              Display name
            </Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => {
                setDisplayName(e.target.value);
                if (errors.displayName) setErrors((p) => ({ ...p, displayName: undefined }));
              }}
              placeholder="Content Editor"
              className="h-10 rounded-none border-grey-300 font-mono text-sm"
              aria-invalid={!!errors.displayName}
            />
            {errors.displayName && (
              <p className="font-mono text-[10px] text-error-600">{errors.displayName}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description" className="font-mono text-xs font-medium text-text-muted">
              Description
            </Label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What this role is for and who should have it."
              rows={3}
              className="w-full resize-y rounded-none border border-grey-300 bg-white p-3 font-mono text-sm text-text-primary outline-none focus:border-grey-900"
            />
          </div>
        </div>
      </section>

      {/* Permissions */}
      <section className="border border-grey-200 bg-white">
        <div className="flex items-center justify-between gap-4 border-b border-grey-200 bg-grey-50 px-5 py-3">
          <h2 className="font-sans text-base font-bold text-text-primary">Permissions</h2>
          <span className="font-mono text-xs text-text-tertiary">
            {permissions.length} selected
          </span>
        </div>
        <div className="space-y-4 p-5">
          {permissions.length === 0 ? (
            <p className="font-mono text-sm text-text-tertiary">
              No permissions yet. Add the scopes this role should grant.
            </p>
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
            {permissions.length === 0 ? "Select permissions" : "Edit permissions"}
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
          {isPending ? "Creating..." : "Create role"}
        </Button>
        <Link
          href="/admin/roles"
          className="font-mono text-xs font-medium text-text-muted transition-colors hover:text-text-primary"
        >
          Cancel
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

function NewRolePageContent() {
  return (
    <div className="mx-auto max-w-3xl pb-20">
      <div className="mb-6">
        <Link
          href="/admin/roles"
          className="inline-flex items-center gap-1.5 font-mono text-xs font-medium text-text-muted transition-colors hover:text-text-primary"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Roles
        </Link>
      </div>
      <header className="mb-6 flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center border border-grey-200 bg-white">
          <ShieldCheck className="h-5 w-5 text-icon-tertiary" />
        </div>
        <div>
          <h1 className="font-sans text-3xl font-bold tracking-tight text-text-primary">
            Create role
          </h1>
          <p className="mt-1 font-mono text-xs text-text-tertiary">
            Define a permission bundle you can assign to members.
          </p>
        </div>
      </header>
      <NewRoleForm />
    </div>
  );
}

export default function NewRolePage() {
  return (
    <RouteGuard permission="roles.create">
      <NewRolePageContent />
    </RouteGuard>
  );
}

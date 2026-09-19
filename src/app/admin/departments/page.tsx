"use client";

import { Layers, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCreateDepartment,
  useDeleteDepartment,
  useDepartments,
  useUpdateDepartment,
} from "@/hooks/useDepartments";
import type { Department } from "@/services/departments.service";

// Discord role IDs are long numbers. Anything else is almost always the
// role *name* pasted by mistake, which the backend also rejects.
const SNOWFLAKE_REGEX = /^\d{15,32}$/;

function DepartmentDialog({
  open,
  onOpenChange,
  department,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Undefined means "create". */
  department?: Department;
}) {
  const { mutate: createDepartment, isPending: creating } = useCreateDepartment();
  const { mutate: updateDepartment, isPending: updating } = useUpdateDepartment();
  const isPending = creating || updating;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [discordRoleId, setDiscordRoleId] = useState("");
  const [order, setOrder] = useState("0");
  const [errors, setErrors] = useState<{ name?: string; discordRoleId?: string; order?: string }>(
    {}
  );

  useEffect(() => {
    if (open) {
      setName(department?.name ?? "");
      setDescription(department?.description ?? "");
      setDiscordRoleId(department?.discordRoleId ?? "");
      setOrder(String(department?.order ?? 0));
      setErrors({});
    }
  }, [open, department]);

  function validate(): boolean {
    const next: typeof errors = {};
    if (!name.trim()) next.name = "Name is required.";
    const roleId = discordRoleId.trim();
    if (roleId && !SNOWFLAKE_REGEX.test(roleId))
      next.discordRoleId = "Paste the role ID, a long number, not the role name.";
    const orderValue = Number(order);
    if (order.trim() === "" || Number.isNaN(orderValue) || orderValue < 0)
      next.order = "Order must be 0 or more.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    const data = {
      name: name.trim(),
      description: description.trim(),
      discordRoleId: discordRoleId.trim(),
      order: Number(order),
    };
    const options = {
      onSuccess: () => {
        toast.success(department ? "Department updated." : "Department created.");
        onOpenChange(false);
      },
      onError: (err: unknown) => {
        const status = (err as { status?: number })?.status;
        if (status === 400) setErrors((p) => ({ ...p, name: "That name is already taken." }));
      },
    };
    if (department) updateDepartment({ slug: department.slug, data }, options);
    else createDepartment(data, options);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-none border-grey-200 bg-white">
        <DialogHeader>
          <DialogTitle className="font-sans text-xl font-bold text-text-primary">
            {department ? "Edit department" : "New department"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="dept-name" className="font-mono text-xs font-medium text-text-muted">
              Name
            </Label>
            <Input
              id="dept-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((p) => ({ ...p, name: undefined }));
              }}
              placeholder="Comms, Branding & Marketing"
              className="h-10 rounded-none border-grey-300 font-mono text-sm"
              aria-invalid={!!errors.name}
            />
            {errors.name && <p className="font-mono text-[10px] text-error-600">{errors.name}</p>}
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="dept-description"
              className="font-mono text-xs font-medium text-text-muted"
            >
              What this department covers{" "}
              <span className="font-mono text-[10px] normal-case tracking-normal text-text-muted">
                (optional)
              </span>
            </Label>
            <textarea
              id="dept-description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Writing, design and social. Everything the community says out loud."
              className="block w-full resize-none rounded-none border border-grey-300 bg-white px-3 py-2 font-mono text-sm text-text-primary outline-none placeholder:text-text-muted focus:border-grey-400 focus:ring-0"
            />
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="dept-discord-role"
              className="font-mono text-xs font-medium text-text-muted"
            >
              Discord role ID{" "}
              <span className="font-mono text-[10px] normal-case tracking-normal text-text-muted">
                (optional)
              </span>
            </Label>
            <Input
              id="dept-discord-role"
              value={discordRoleId}
              onChange={(e) => {
                setDiscordRoleId(e.target.value);
                if (errors.discordRoleId) setErrors((p) => ({ ...p, discordRoleId: undefined }));
              }}
              placeholder="123456789012345678"
              inputMode="numeric"
              className="h-10 rounded-none border-grey-300 font-mono text-sm"
              aria-invalid={!!errors.discordRoleId}
            />
            <p
              className={`font-mono text-[10px] ${errors.discordRoleId ? "text-error-600" : "text-text-muted"}`}
            >
              {errors.discordRoleId ??
                "Set the role's permissions in Discord. Joining any team here grants it."}
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="dept-order" className="font-mono text-xs font-medium text-text-muted">
              Display order
            </Label>
            <Input
              id="dept-order"
              value={order}
              onChange={(e) => {
                setOrder(e.target.value);
                if (errors.order) setErrors((p) => ({ ...p, order: undefined }));
              }}
              inputMode="numeric"
              className="h-10 w-24 rounded-none border-grey-300 font-mono text-sm"
              aria-invalid={!!errors.order}
            />
            <p
              className={`font-mono text-[10px] ${errors.order ? "text-error-600" : "text-text-muted"}`}
            >
              {errors.order ?? "Lower comes first on the public teams page."}
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-10 rounded-none font-mono text-sm"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="h-10 rounded-none bg-grey-900 font-mono text-sm font-medium hover:bg-grey-800"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  Saving...
                </>
              ) : department ? (
                "Save changes"
              ) : (
                "Create department"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DepartmentRow({ department, onEdit }: { department: Department; onEdit: () => void }) {
  const { mutate: deleteDepartment, isPending } = useDeleteDepartment();
  const hasTeams = department.teamCount > 0;

  return (
    <div className="flex items-start justify-between gap-4 p-4">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-sans text-sm font-bold text-zinc-950">{department.name}</p>
          <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-400">
            #{department.order}
          </span>
        </div>
        {department.description && (
          <p className="mt-0.5 font-mono text-xs leading-5 text-zinc-500">
            {department.description}
          </p>
        )}
        <p className="mt-1.5 font-mono text-[11px] text-zinc-400">
          {department.teamCount} team{department.teamCount === 1 ? "" : "s"} ·{" "}
          {department.discordRoleId ? (
            <>
              Discord role <span className="text-zinc-600">{department.discordRoleId}</span>
            </>
          ) : (
            <span className="text-amber-700">No Discord role yet</span>
          )}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onEdit}
          className="h-8 rounded-none font-mono text-xs"
        >
          <Pencil className="mr-1.5 h-3 w-3" />
          Edit
        </Button>
        <ConfirmModal
          title={`Delete ${department.name}?`}
          description={
            hasTeams
              ? "This department still has teams. Move them to another department first."
              : "This cannot be undone. Teams are unaffected because there are none here."
          }
          confirmText="Delete"
          isLoading={isPending}
          onConfirm={() => {
            if (hasTeams) return;
            deleteDepartment(department.slug, {
              onSuccess: () => toast.success(`${department.name} deleted.`),
            });
          }}
        >
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={hasTeams}
            title={hasTeams ? "Move its teams first" : undefined}
            className="h-8 rounded-none font-mono text-xs text-error-600 hover:text-error-700"
          >
            <Trash2 className="mr-1.5 h-3 w-3" />
            Delete
          </Button>
        </ConfirmModal>
      </div>
    </div>
  );
}

function DepartmentsContent() {
  const { data: departments, isLoading } = useDepartments();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Department | undefined>(undefined);

  function openCreate() {
    setEditing(undefined);
    setDialogOpen(true);
  }

  function openEdit(department: Department) {
    setEditing(department);
    setDialogOpen(true);
  }

  return (
    <div className="pb-20">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs font-medium text-zinc-400">Admin Panel</p>
          <h1 className="font-sans text-4xl font-bold tracking-tight text-zinc-950">Departments</h1>
          <p className="mt-1 max-w-xl font-mono text-xs leading-5 text-zinc-500">
            Teams sit under departments. Each department has one Discord channel, unlocked by the
            role whose ID you paste here. Set the role's permissions in Discord, not here.
          </p>
        </div>
        <Button
          type="button"
          onClick={openCreate}
          className="h-10 rounded-none bg-grey-900 font-mono text-xs font-bold hover:bg-grey-800"
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          New department
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton placeholders
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : !departments || departments.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 border border-dashed border-zinc-200 bg-zinc-50 py-16 text-center">
          <Layers className="h-6 w-6 text-zinc-300" />
          <p className="font-mono text-xs text-zinc-400">
            No departments yet. Create one, then assign teams to it from each team's admin page.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-zinc-100 border border-zinc-200 bg-white">
          {departments.map((department) => (
            <DepartmentRow
              key={department.id}
              department={department}
              onEdit={() => openEdit(department)}
            />
          ))}
        </div>
      )}

      <DepartmentDialog open={dialogOpen} onOpenChange={setDialogOpen} department={editing} />
    </div>
  );
}

export default function AdminDepartmentsPage() {
  return (
    <RouteGuard permission="admin.panel.access">
      <DepartmentsContent />
    </RouteGuard>
  );
}

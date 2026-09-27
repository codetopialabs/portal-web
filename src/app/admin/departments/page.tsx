"use client";

import { ArrowUpRight, Layers, Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { DepartmentDialog } from "@/components/admin/DepartmentDialog";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { HealthPill } from "@/components/community-teams/pills";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Skeleton } from "@/components/ui/skeleton";
import { useTeamHealth } from "@/hooks/useCommunityTeams";
import { useDeleteDepartment, useDepartments } from "@/hooks/useDepartments";
import { useFeature } from "@/hooks/useFeatures";
import type { TeamHealth } from "@/services/community-teams.service";
import type { Department } from "@/services/departments.service";

function DepartmentRow({
  department,
  health,
  onEdit,
}: {
  department: Department;
  /** Teams v2 health for this team, when the flag is on and it has loaded. */
  health?: TeamHealth;
  onEdit: () => void;
}) {
  const { mutate: deleteDepartment, isPending } = useDeleteDepartment();
  const teamsV2 = useFeature("teamsV2");
  const hasTeams = department.teamCount > 0;

  return (
    <div className="flex items-start justify-between gap-4 p-4">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          {teamsV2 ? (
            <Link
              href={`/admin/departments/${department.slug}`}
              className="font-sans text-sm font-bold text-zinc-950 hover:underline"
            >
              {department.name}
            </Link>
          ) : (
            <p className="font-sans text-sm font-bold text-zinc-950">{department.name}</p>
          )}
          <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-400">
            #{department.order}
          </span>
          {health && <HealthPill health={health} />}
        </div>
        {teamsV2 && (
          <p className="mt-1 font-mono text-[11px] text-zinc-500">
            Lead:{" "}
            <span className={department.lead ? "text-zinc-800" : "text-red-600"}>
              {department.lead?.fullName ?? "Open"}
            </span>
            {" · "}Deputy:{" "}
            <span className="text-zinc-800">{department.deputy?.fullName ?? "Not named"}</span>
            {" · "}Needs {department.minActiveMembers} active
          </p>
        )}
        {department.description && (
          <p className="mt-0.5 font-mono text-xs leading-5 text-zinc-500">
            {department.description}
          </p>
        )}
        <p className="mt-1.5 font-mono text-[11px] text-zinc-400">
          {department.teamCount} {teamsV2 ? "project" : "team"}
          {department.teamCount === 1 ? "" : "s"} ·{" "}
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
        {teamsV2 && (
          <Button
            asChild
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 rounded-none font-mono text-xs"
          >
            <Link href={`/admin/departments/${department.slug}`}>
              <ArrowUpRight className="mr-1.5 h-3 w-3" />
              Open
            </Link>
          </Button>
        )}
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
              ? `This ${teamsV2 ? "team" : "department"} still has ${teamsV2 ? "projects" : "teams"}. Move them elsewhere first.`
              : `This cannot be undone. ${teamsV2 ? "Members with this as their primary team are left unassigned." : "Teams are unaffected because there are none here."}`
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
  const teamsV2 = useFeature("teamsV2");
  const { data: healthRows } = useTeamHealth();
  const healthBySlug = new Map((healthRows ?? []).map((row) => [row.slug, row.health]));
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
          <h1 className="font-sans text-4xl font-bold tracking-tight text-zinc-950">
            {teamsV2 ? "Teams" : "Departments"}
          </h1>
          <p className="mt-1 max-w-xl font-mono text-xs leading-5 text-zinc-500">
            {teamsV2
              ? "The community's teams, each with a lead, a deputy and a core team. Open a team to see its roster. Projects sit under teams and share the team's Discord channel."
              : "Teams sit under departments. Each department has one Discord channel, unlocked by the role whose ID you paste here. Set the role's permissions in Discord, not here."}
          </p>
        </div>
        {/* The six teams are fixed by the operating plan. A seventh needs a
            charter and the Leads Council, and is added in Django admin. */}
        {!teamsV2 && (
          <Button
            type="button"
            onClick={openCreate}
            className="h-10 rounded-none bg-grey-900 font-mono text-xs font-bold hover:bg-grey-800"
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            New department
          </Button>
        )}
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
            {teamsV2
              ? "No teams yet. Run the Teams v2 migrations to seed the six teams."
              : "No departments yet. Create one, then assign teams to it from each team's admin page."}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-zinc-100 border border-zinc-200 bg-white">
          {departments.map((department) => (
            <DepartmentRow
              key={department.id}
              department={department}
              health={healthBySlug.get(department.slug)}
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

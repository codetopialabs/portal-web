"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { MemberPicker } from "@/components/community-teams/MemberPicker";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpdateLeadership } from "@/hooks/useCommunityTeams";
import { useCreateDepartment, useUpdateDepartment } from "@/hooks/useDepartments";
import { useFeature } from "@/hooks/useFeatures";
import type { PersonSummary } from "@/services/community-teams.service";
import type { Department } from "@/services/departments.service";

// Create or edit a department. With Teams v2 on, a department is one of the
// community's teams, and the dialog also sets its lead, deputy and minimum
// active members through the community-teams endpoint.

// Discord role IDs are long numbers. Anything else is almost always the
// role *name* pasted by mistake, which the backend also rejects.
const SNOWFLAKE_REGEX = /^\d{15,32}$/;

export function DepartmentDialog({
  open,
  onOpenChange,
  department,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Undefined means "create". */
  department?: Department;
}) {
  const { mutateAsync: createDepartment, isPending: creating } = useCreateDepartment();
  const { mutateAsync: updateDepartment, isPending: updating } = useUpdateDepartment();
  const { mutateAsync: updateLeadership, isPending: updatingLeadership } = useUpdateLeadership();
  const teamsV2 = useFeature("teamsV2");
  const isPending = creating || updating || updatingLeadership;
  const noun = teamsV2 ? "team" : "department";

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [discordRoleId, setDiscordRoleId] = useState("");
  const [order, setOrder] = useState("0");
  // Teams v2 leadership, saved through the community-teams endpoint.
  const [lead, setLead] = useState<PersonSummary | null>(null);
  const [deputy, setDeputy] = useState<PersonSummary | null>(null);
  const [minActive, setMinActive] = useState("2");
  const [errors, setErrors] = useState<{
    name?: string;
    discordRoleId?: string;
    order?: string;
    minActive?: string;
    deputy?: string;
  }>({});

  useEffect(() => {
    if (open) {
      setName(department?.name ?? "");
      setDescription(department?.description ?? "");
      setDiscordRoleId(department?.discordRoleId ?? "");
      setOrder(String(department?.order ?? 0));
      setLead(department?.lead ?? null);
      setDeputy(department?.deputy ?? null);
      setMinActive(String(department?.minActiveMembers ?? 2));
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
    if (teamsV2) {
      const minValue = Number(minActive);
      if (minActive.trim() === "" || !Number.isInteger(minValue) || minValue < 0)
        next.minActive = "Minimum must be a whole number, 0 or more.";
      if (lead && deputy && lead.id === deputy.id)
        next.deputy = "The deputy must be a different person from the lead.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function leadershipChanged(): boolean {
    if (!teamsV2) return false;
    if (!department) return !!lead || !!deputy || Number(minActive) !== 2;
    return (
      (department.lead?.id ?? null) !== (lead?.id ?? null) ||
      (department.deputy?.id ?? null) !== (deputy?.id ?? null) ||
      department.minActiveMembers !== Number(minActive)
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    const data = {
      name: name.trim(),
      description: description.trim(),
      discordRoleId: discordRoleId.trim(),
      order: Number(order),
    };
    try {
      const saved = department
        ? await updateDepartment({ slug: department.slug, data })
        : await createDepartment(data);
      if (leadershipChanged()) {
        await updateLeadership({
          slug: saved.slug,
          data: {
            lead: lead?.id ?? null,
            deputy: deputy?.id ?? null,
            minActiveMembers: Number(minActive),
          },
        });
      }
      toast.success(department ? `${saved.name} updated.` : `${saved.name} created.`);
      onOpenChange(false);
    } catch (err) {
      const status = (err as { status?: number })?.status;
      if (status === 400 && !leadershipChanged()) {
        setErrors((p) => ({ ...p, name: "That name is already taken." }));
      } else {
        toast.error(err instanceof Error ? err.message : "Could not save.");
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-none border-grey-200 bg-white">
        <DialogHeader>
          <DialogTitle className="font-sans text-xl font-bold text-text-primary">
            {department ? `Edit ${noun}` : `New ${noun}`}
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
              placeholder={teamsV2 ? "Events" : "Comms, Branding & Marketing"}
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
              What this {noun} covers{" "}
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

          {teamsV2 && (
            <>
              <div className="space-y-1.5">
                <Label
                  htmlFor="dept-lead"
                  className="font-mono text-xs font-medium text-text-muted"
                >
                  Lead{" "}
                  <span className="font-mono text-[10px] normal-case tracking-normal text-text-muted">
                    (optional until confirmed)
                  </span>
                </Label>
                <MemberPicker
                  id="dept-lead"
                  value={lead}
                  onChange={(person) => {
                    setLead(person);
                    if (person && deputy?.id === person.id) setDeputy(null);
                  }}
                  excludeId={deputy?.id}
                  placeholder="Who owns this team"
                />
                <p className="font-mono text-[10px] text-text-muted">
                  Shown as NO LEAD on Team Health until someone is named.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="dept-deputy"
                  className="font-mono text-xs font-medium text-text-muted"
                >
                  Deputy{" "}
                  <span className="font-mono text-[10px] normal-case tracking-normal text-text-muted">
                    (optional)
                  </span>
                </Label>
                <MemberPicker
                  id="dept-deputy"
                  value={deputy}
                  onChange={(person) => {
                    setDeputy(person);
                    if (errors.deputy) setErrors((p) => ({ ...p, deputy: undefined }));
                  }}
                  excludeId={lead?.id}
                  placeholder="Who covers when the lead is away"
                />
                {errors.deputy && (
                  <p className="font-mono text-[10px] text-error-600">{errors.deputy}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="dept-min" className="font-mono text-xs font-medium text-text-muted">
                  Minimum active members
                </Label>
                <Input
                  id="dept-min"
                  value={minActive}
                  onChange={(e) => {
                    setMinActive(e.target.value);
                    if (errors.minActive) setErrors((p) => ({ ...p, minActive: undefined }));
                  }}
                  inputMode="numeric"
                  className="h-10 w-24 rounded-none border-grey-300 font-mono text-sm"
                  aria-invalid={!!errors.minActive}
                />
                <p
                  className={`font-mono text-[10px] ${errors.minActive ? "text-error-600" : "text-text-muted"}`}
                >
                  {errors.minActive ??
                    "Fewer Active members than this and the team is UNDERSTAFFED."}
                </p>
              </div>
            </>
          )}

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
                `Create ${noun}`
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

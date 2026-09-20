"use client";

import { Layers, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDepartments } from "@/hooks/useDepartments";
import { useAdminUpdateTeam } from "@/hooks/useTeams";
import type { Team } from "@/services/teams.service";

const NONE = "__none__";
const WHAT_COUNTS_MAX = 200;
const SNOWFLAKE_REGEX = /^\d{15,32}$/;

/**
 * The admin-only settings that place a team on the public directory and
 * wire it to Discord: department, the "what counts" line, the handbook
 * link, and the team's own Discord role on top of the department's.
 */
export function TeamDirectorySettings({ team }: { team: Team }) {
  const { data: departments, isLoading: departmentsLoading } = useDepartments();
  const { mutate: updateTeam, isPending } = useAdminUpdateTeam(team.slug);

  const [departmentId, setDepartmentId] = useState<string>(team.department?.id ?? NONE);
  const [whatCounts, setWhatCounts] = useState(team.whatCounts ?? "");
  const [handbookUrl, setHandbookUrl] = useState(team.handbookUrl ?? "");
  const [discordRoleId, setDiscordRoleId] = useState(team.discordRoleId ?? "");
  const [errors, setErrors] = useState<{ handbookUrl?: string; discordRoleId?: string }>({});

  useEffect(() => {
    setDepartmentId(team.department?.id ?? NONE);
    setWhatCounts(team.whatCounts ?? "");
    setHandbookUrl(team.handbookUrl ?? "");
    setDiscordRoleId(team.discordRoleId ?? "");
  }, [team]);

  function validate(): boolean {
    const next: typeof errors = {};
    const url = handbookUrl.trim();
    if (url && !/^https?:\/\//i.test(url)) next.handbookUrl = "Must start with http:// or https://";
    const roleId = discordRoleId.trim();
    if (roleId && !SNOWFLAKE_REGEX.test(roleId))
      next.discordRoleId = "Paste the role ID, a long number, not the role name.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    updateTeam({
      department: departmentId === NONE ? null : departmentId,
      whatCounts: whatCounts.trim(),
      handbookUrl: handbookUrl.trim(),
      discordRoleId: discordRoleId.trim(),
    });
  }

  return (
    <div className="border border-zinc-200 bg-white">
      <div className="flex items-center gap-2.5 border-b border-zinc-100 px-5 py-3">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center bg-zinc-950 text-white">
          <Layers className="h-3.5 w-3.5" />
        </div>
        <p className="font-sans text-sm font-black uppercase tracking-widest text-zinc-900">
          Directory &amp; Discord
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 p-5">
        <div className="space-y-1.5">
          <Label htmlFor="team-department" className="font-mono text-xs font-medium text-zinc-500">
            Department
          </Label>
          <Select value={departmentId} onValueChange={setDepartmentId}>
            <SelectTrigger
              id="team-department"
              className="h-10 w-full rounded-none border-zinc-200 bg-white font-mono text-sm"
            >
              <SelectValue placeholder="No department" />
            </SelectTrigger>
            <SelectContent className="rounded-none font-mono text-sm">
              <SelectItem value={NONE}>No department</SelectItem>
              {departmentsLoading ? (
                <SelectItem value="loading" disabled>
                  Loading...
                </SelectItem>
              ) : (
                (departments ?? []).map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          <p className="font-mono text-[10px] text-zinc-400">
            Groups the team on the public page and grants the department's Discord role on join.{" "}
            <Link href="/admin/departments" className="underline hover:text-zinc-700">
              Manage departments
            </Link>
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="team-what-counts" className="font-mono text-xs font-medium text-zinc-500">
            What counts as a contribution here
          </Label>
          <Input
            id="team-what-counts"
            value={whatCounts}
            maxLength={WHAT_COUNTS_MAX}
            onChange={(e) => setWhatCounts(e.target.value)}
            placeholder="A published post on the community blog."
            className="h-10 rounded-none border-zinc-200 font-mono text-sm"
          />
          <p className="font-mono text-[10px] text-zinc-400">
            One line, shown on the public page. Leads can edit this too. {whatCounts.length}/
            {WHAT_COUNTS_MAX}
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="team-handbook" className="font-mono text-xs font-medium text-zinc-500">
            "How this team works" link
          </Label>
          <Input
            id="team-handbook"
            value={handbookUrl}
            onChange={(e) => {
              setHandbookUrl(e.target.value);
              if (errors.handbookUrl) setErrors((p) => ({ ...p, handbookUrl: undefined }));
            }}
            placeholder="https://community.codetopia.org/howtos/Teams/..."
            className="h-10 rounded-none border-zinc-200 font-mono text-sm"
            aria-invalid={!!errors.handbookUrl}
          />
          {errors.handbookUrl && (
            <p className="font-mono text-[10px] text-error-600">{errors.handbookUrl}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor="team-discord-role"
            className="font-mono text-xs font-medium text-zinc-500"
          >
            Team's own Discord role ID{" "}
            <span className="font-mono text-[10px] normal-case tracking-normal text-zinc-400">
              (optional)
            </span>
          </Label>
          <Input
            id="team-discord-role"
            value={discordRoleId}
            onChange={(e) => {
              setDiscordRoleId(e.target.value);
              if (errors.discordRoleId) setErrors((p) => ({ ...p, discordRoleId: undefined }));
            }}
            placeholder="123456789012345678"
            inputMode="numeric"
            className="h-10 rounded-none border-zinc-200 font-mono text-sm"
            aria-invalid={!!errors.discordRoleId}
          />
          <p
            className={`font-mono text-[10px] ${errors.discordRoleId ? "text-error-600" : "text-zinc-400"}`}
          >
            {errors.discordRoleId ??
              "Granted on top of the department's role. Only for a team that wants one of its own."}
          </p>
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isPending}
            className="h-10 rounded-none bg-grey-900 font-mono text-xs font-bold hover:bg-grey-800"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                Saving...
              </>
            ) : (
              "Save"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

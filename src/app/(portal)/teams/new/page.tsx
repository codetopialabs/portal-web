"use client";

import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { DashboardShell } from "@/components/dashboard/Shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateTeam } from "@/hooks/useTeams";

export default function CreateTeamPage() {
  return (
    <RouteGuard permission="teams.create">
      <CreateTeamContent />
    </RouteGuard>
  );
}

function CreateTeamContent() {
  const router = useRouter();
  const { mutateAsync: createTeam, isPending } = useCreateTeam();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const [errors, setErrors] = useState<Partial<typeof formData>>({});

  function validate(): boolean {
    const next: Partial<typeof formData> = {};
    if (!formData.name.trim()) next.name = "Team name is required.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const team = await createTeam({
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
    });

    router.push(`/teams/${team.slug}`);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  return (
    <DashboardShell>
      <div className="w-full max-w-2xl pb-20">
        {/* Back nav */}
        <Link
          href="/teams"
          className="inline-flex items-center gap-2 font-mono text-xs font-medium text-text-muted transition-colors hover:text-text-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Teams
        </Link>

        {/* Header */}
        <div className="mt-6 border-b border-grey-200 pb-6">
          <p className="font-mono text-xs font-medium text-text-muted">Workspace</p>
          <h1 className="mt-2 font-sans text-4xl font-bold tracking-tight text-text-primary">
            Create a Team
          </h1>
          <p className="mt-2 font-mono text-sm leading-6 text-text-tertiary">
            You will be assigned as Team Lead automatically. Members can be invited after creation.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {/* Team Name */}
          <div className="space-y-1.5">
            <Label htmlFor="name" className="font-mono text-sm font-semibold text-text-secondary">
              Team Name
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Developer Squad"
              className="h-10 font-mono text-sm rounded-none"
            />
            {errors.name && <p className="font-mono text-xs text-red-500">{errors.name}</p>}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label
              htmlFor="description"
              className="font-mono text-sm font-semibold text-text-secondary"
            >
              Description{" "}
              <span className="font-mono text-[10px] normal-case tracking-normal text-text-muted">
                (optional)
              </span>
            </Label>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              placeholder="What is the focus of this team?"
              className="block w-full resize-none border border-grey-200 bg-white px-3 py-2 font-mono text-sm text-text-primary outline-none rounded-none placeholder:text-text-muted focus:border-grey-300 focus:ring-0 transition-colors"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-grey-100 pt-6">
            <Link
              href="/teams"
              className="font-mono text-sm font-medium text-text-muted transition-colors hover:text-text-primary"
            >
              Cancel
            </Link>
            <Button
              type="submit"
              disabled={isPending}
              className="h-10 bg-grey-900 px-6 font-mono text-sm font-medium hover:bg-grey-800 rounded-none"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Team"
              )}
            </Button>
          </div>
        </form>
      </div>
    </DashboardShell>
  );
}

"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
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
import { useUpdateTeam } from "@/hooks/useTeams";
import type { Team } from "@/services/teams.service";

export function EditTeamDialog({
  team,
  open,
  onOpenChange,
}: {
  team: Team;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { mutate: updateTeam, isPending } = useUpdateTeam(team.slug);

  const [name, setName] = useState(team.name);
  const [description, setDescription] = useState(team.description ?? "");
  const [isPrivate, setIsPrivate] = useState(team.isPrivate);
  const [nameError, setNameError] = useState("");

  // Re-sync the form whenever a fresh team (or a re-open) comes in, so a
  // dismissed-then-reopened dialog doesn't show stale edits.
  useEffect(() => {
    if (open) {
      setName(team.name);
      setDescription(team.description ?? "");
      setIsPrivate(team.isPrivate);
      setNameError("");
    }
  }, [open, team]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setNameError("Team name is required.");
      return;
    }

    updateTeam(
      { name: name.trim(), description: description.trim(), isPrivate },
      { onSuccess: () => onOpenChange(false) }
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-none border-grey-200 bg-white">
        <DialogHeader>
          <DialogTitle className="font-sans text-xl font-bold text-text-primary">
            Edit team
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          <div className="space-y-1.5">
            <Label
              htmlFor="edit-name"
              className="font-mono text-sm font-semibold text-text-secondary"
            >
              Team Name
            </Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (nameError) setNameError("");
              }}
              className="h-10 rounded-none font-mono text-sm"
            />
            {nameError && <p className="font-mono text-xs text-red-500">{nameError}</p>}
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="edit-description"
              className="font-mono text-sm font-semibold text-text-secondary"
            >
              Description{" "}
              <span className="font-mono text-[10px] normal-case tracking-normal text-text-muted">
                (optional)
              </span>
            </Label>
            <textarea
              id="edit-description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="block w-full resize-none rounded-none border border-grey-200 bg-white px-3 py-2 font-mono text-sm text-text-primary outline-none placeholder:text-text-muted focus:border-grey-300 focus:ring-0"
            />
          </div>

          <div className="flex items-start gap-2.5">
            <input
              id="edit-isPrivate"
              type="checkbox"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 rounded-none border-grey-300 text-grey-900 focus:ring-0"
            />
            <Label htmlFor="edit-isPrivate" className="font-mono text-sm text-text-secondary">
              Private team
              <span className="mt-0.5 block font-mono text-xs font-normal text-text-muted">
                Hidden from Browse Teams. Members can only join by invite.
              </span>
            </Label>
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
              ) : (
                "Save changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

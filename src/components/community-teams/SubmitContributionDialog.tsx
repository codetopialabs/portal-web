"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCommunityTeams, useSubmitContribution } from "@/hooks/useCommunityTeams";

// Teams v2: a member records work they did for a team. The work itself
// stays where it was made; the member pastes a link and makes it public.

interface SubmitContributionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Preselect a team, e.g. the member's primary team. */
  defaultTeam?: string;
}

const labelStyles = "font-mono text-xs font-medium text-text-muted";
const inputStyles = "h-10 rounded-none border-grey-300 font-mono text-sm";

export function SubmitContributionDialog({
  open,
  onOpenChange,
  defaultTeam,
}: SubmitContributionDialogProps) {
  const { data: teams = [] } = useCommunityTeams();
  const { mutateAsync: submit, isPending } = useSubmitContribution();

  const [team, setTeam] = useState(defaultTeam ?? "");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");
  const [doneOn, setDoneOn] = useState(new Date().toISOString().slice(0, 10));
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      setTeam(defaultTeam ?? "");
      setTitle("");
      setDescription("");
      setLink("");
      setDoneOn(new Date().toISOString().slice(0, 10));
      setErrors({});
    }
  }, [open, defaultTeam]);

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!team) next.team = "Pick the team this was for.";
    if (!title.trim()) next.title = "Give it a short title.";
    if (!description.trim()) next.description = "Say what you did, in a few lines.";
    if (!/^https?:\/\/\S+$/i.test(link.trim()))
      next.link = "Paste a full link starting with https://";
    if (!doneOn) next.doneOn = "When was it done?";
    else if (doneOn > new Date().toISOString().slice(0, 10))
      next.doneOn = "That date is in the future.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    try {
      await submit({
        team,
        title: title.trim(),
        description: description.trim(),
        link: link.trim(),
        doneOn,
      });
      toast.success("Submitted. Your team lead will review it.");
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not submit.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-none border-grey-200 bg-white">
        <DialogHeader>
          <DialogTitle className="font-sans text-xl font-bold text-text-primary">
            Submit a contribution
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="contribution-team" className={labelStyles}>
              Team
            </Label>
            <Select value={team || "none"} onValueChange={(v) => setTeam(v === "none" ? "" : v)}>
              <SelectTrigger
                id="contribution-team"
                className="h-10 w-full rounded-none border-grey-300 bg-white px-3 font-mono text-sm data-placeholder:text-text-muted"
              >
                <SelectValue placeholder="Which team was this for?" />
              </SelectTrigger>
              <SelectContent className="rounded-none border border-grey-200 bg-white font-mono text-sm shadow-md z-50 p-1">
                <SelectItem
                  value="none"
                  className="rounded-none font-mono py-2 px-3 text-text-muted"
                >
                  Which team was this for?
                </SelectItem>
                {teams.map((t) => (
                  <SelectItem
                    key={t.slug}
                    value={t.slug}
                    className="rounded-none font-mono py-2 px-3"
                  >
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.team && <p className="font-mono text-[10px] text-error-600">{errors.team}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="contribution-title" className={labelStyles}>
              Title
            </Label>
            <Input
              id="contribution-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={140}
              placeholder="Designed the October meetup flyer"
              className={inputStyles}
              aria-invalid={!!errors.title}
            />
            {errors.title && <p className="font-mono text-[10px] text-error-600">{errors.title}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="contribution-description" className={labelStyles}>
              What you did
            </Label>
            <textarea
              id="contribution-description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={2000}
              placeholder="Two variants, picked the blue one with the lead, posted on Instagram and the Discord announcements channel."
              className="block w-full resize-none rounded-none border border-grey-300 bg-white px-3 py-2 font-mono text-sm text-text-primary outline-none placeholder:text-text-muted focus:border-grey-400 focus:ring-0"
            />
            {errors.description && (
              <p className="font-mono text-[10px] text-error-600">{errors.description}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="contribution-link" className={labelStyles}>
              Link to the work
            </Label>
            <Input
              id="contribution-link"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://www.canva.com/design/..."
              inputMode="url"
              className={inputStyles}
              aria-invalid={!!errors.link}
            />
            <p
              className={`font-mono text-[10px] ${errors.link ? "text-error-600" : "text-text-muted"}`}
            >
              {errors.link ??
                "Make sure anyone with the link can view it. Your lead will open it to review, and once approved it shows on your public profile."}
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="contribution-date" className={labelStyles}>
              Date done
            </Label>
            <Input
              id="contribution-date"
              type="date"
              value={doneOn}
              onChange={(e) => setDoneOn(e.target.value)}
              max={new Date().toISOString().slice(0, 10)}
              className={`${inputStyles} w-44`}
              aria-invalid={!!errors.doneOn}
            />
            {errors.doneOn && (
              <p className="font-mono text-[10px] text-error-600">{errors.doneOn}</p>
            )}
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
                  Submitting...
                </>
              ) : (
                "Submit for review"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

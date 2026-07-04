"use client";

import {
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  useDeleteCareerProgression,
  useMyCareerProgressions,
  useSubmitCareerProgression,
  useUpdateCareerProgression,
} from "@/hooks/useCareerProgressions";
import type { CareerProgression, CareerProgressionStatus } from "@/types/career-progressions.types";

// ── Styles ────────────────────────────────────────────────────────────────────

const inputStyles =
  "h-11 rounded-none border-zinc-200 bg-white px-3 font-mono text-sm placeholder:text-zinc-300 focus-visible:ring-0 focus-visible:border-zinc-900";
const labelStyles = "font-mono text-xs uppercase tracking-widest text-zinc-400 font-bold";

// ── Status meta ───────────────────────────────────────────────────────────────

const STATUS_META: Record<
  CareerProgressionStatus,
  { label: string; icon: typeof Clock3; className: string }
> = {
  pending: {
    label: "Pending review",
    icon: Clock3,
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  approved: {
    label: "Approved",
    icon: CheckCircle2,
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  rejected: {
    label: "Changes needed",
    icon: XCircle,
    className: "border-red-200 bg-red-50 text-red-700",
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDateRange(startDate: string, endDate: string | null): string {
  const fmt = (d: string) =>
    new Intl.DateTimeFormat("en", { month: "short", year: "numeric" }).format(new Date(d));
  return `${fmt(startDate)} – ${endDate ? fmt(endDate) : "Present"}`;
}

function getDuration(startDate: string, endDate: string | null): string {
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();
  const totalMonths =
    (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  if (totalMonths < 1) return "< 1 mo";
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  const parts: string[] = [];
  if (years > 0) parts.push(`${years} yr${years > 1 ? "s" : ""}`);
  if (months > 0) parts.push(`${months} mo${months > 1 ? "s" : ""}`);
  return parts.join(" ");
}

function StatusPill({ status }: { status: CareerProgressionStatus }) {
  const meta = STATUS_META[status];
  const Icon = meta.icon;
  return (
    <span
      className={`inline-flex h-7 items-center gap-1.5 border px-2.5 font-mono text-[10px] font-black uppercase tracking-widest ${meta.className}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {meta.label}
    </span>
  );
}

// ── Form values ───────────────────────────────────────────────────────────────

interface FormValues {
  title: string;
  organization: string;
  startDate: string;
  endDate: string;
  description: string;
}

// ── Sheet form (add + edit) ───────────────────────────────────────────────────

function ProgressionSheet({
  open,
  editing,
  onClose,
}: {
  open: boolean;
  editing: CareerProgression | null;
  onClose: () => void;
}) {
  const submitMutation = useSubmitCareerProgression();
  const updateMutation = useUpdateCareerProgression();
  const isPending = submitMutation.isPending || updateMutation.isPending;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { title: "", organization: "", startDate: "", endDate: "", description: "" },
  });

  // Populate form when editing
  useEffect(() => {
    if (editing) {
      reset({
        title: editing.title,
        organization: editing.organization ?? "",
        startDate: editing.startDate,
        endDate: editing.endDate ?? "",
        description: editing.description ?? "",
      });
    } else {
      reset({ title: "", organization: "", startDate: "", endDate: "", description: "" });
    }
  }, [editing, reset]);

  const endDateValue = watch("endDate");

  async function onSubmit(data: FormValues) {
    const payload = {
      title: data.title.trim(),
      organization: data.organization.trim(),
      startDate: data.startDate,
      endDate: data.endDate.trim() || null,
      description: data.description.trim(),
    };
    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, data: payload });
        toast.success("Entry updated — back in review queue.");
      } else {
        await submitMutation.mutateAsync(payload);
        toast.success("Career progression submitted for review.");
      }
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save entry.");
    }
  }

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-full overflow-y-auto rounded-none border-l border-zinc-200 bg-white sm:max-w-md p-6">
        <SheetHeader className="mb-6 p-0">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-zinc-950 text-white">
              <BriefcaseBusiness className="h-4 w-4" />
            </div>
            <SheetTitle className="font-sans text-base font-black uppercase tracking-widest text-zinc-950">
              {editing ? "Edit Entry" : "Add Entry"}
            </SheetTitle>
          </div>
          {editing && (
            <p className="font-mono text-xs text-amber-600">
              Editing will reset this entry to pending review.
            </p>
          )}
          {!editing && (
            <p className="font-mono text-xs text-zinc-400">
              Submitted entries appear publicly after review.
            </p>
          )}
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className={labelStyles}>
              Role / Milestone <span className="text-red-400">*</span>
            </Label>
            <Input
              id="title"
              placeholder="e.g. Frontend Intern, First freelance client"
              className={inputStyles}
              {...register("title", { required: "This field is required." })}
            />
            {errors.title && (
              <p className="font-mono text-xs text-red-500">{errors.title.message}</p>
            )}
          </div>

          {/* Organization */}
          <div className="space-y-2">
            <Label htmlFor="organization" className={labelStyles}>
              Company / Community
              <span className="ml-1 normal-case text-zinc-300">— optional</span>
            </Label>
            <Input
              id="organization"
              placeholder="e.g. Google, Codetopia"
              className={inputStyles}
              {...register("organization")}
            />
          </div>

          {/* Date range */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="startDate" className={labelStyles}>
                Start <span className="text-red-400">*</span>
              </Label>
              <Input
                id="startDate"
                type="date"
                className={inputStyles}
                {...register("startDate", { required: "Start date is required." })}
              />
              {errors.startDate && (
                <p className="font-mono text-xs text-red-500">{errors.startDate.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate" className={labelStyles}>
                End
                <span className="ml-1 normal-case text-zinc-300">— optional</span>
              </Label>
              <Input
                id="endDate"
                type="date"
                className={inputStyles}
                {...register("endDate", {
                  validate: (val) => {
                    if (!val) return true;
                    const start = watch("startDate");
                    if (start && val < start) return "Must be after start.";
                    return true;
                  },
                })}
              />
              {errors.endDate && (
                <p className="font-mono text-xs text-red-500">{errors.endDate.message}</p>
              )}
              {!endDateValue && (
                <p className="font-mono text-[10px] text-zinc-400">Blank = Present</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className={labelStyles}>
              What happened?
              <span className="ml-1 normal-case text-zinc-300">— optional</span>
            </Label>
            <textarea
              id="description"
              placeholder="Share what changed, what you learned, and why it matters."
              className="min-h-28 w-full resize-none rounded-none border border-zinc-200 bg-white px-3 py-2.5 font-mono text-sm placeholder:text-zinc-300 focus:border-zinc-900 focus:outline-none"
              {...register("description")}
            />
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="h-11 w-full rounded-none bg-zinc-950 font-mono text-xs font-black uppercase tracking-widest text-white hover:bg-zinc-800"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {editing ? "Saving" : "Submitting"}
              </>
            ) : editing ? (
              "Save Changes"
            ) : (
              "Submit for Review"
            )}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}

// ── Card ──────────────────────────────────────────────────────────────────────

function ProgressionCard({
  item,
  onEdit,
}: {
  item: CareerProgression;
  onEdit: (item: CareerProgression) => void;
}) {
  const deleteMutation = useDeleteCareerProgression();
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    try {
      await deleteMutation.mutateAsync(item.id);
      toast.success("Entry deleted.");
    } catch {
      toast.error("Could not delete entry.");
    }
    setConfirmDelete(false);
  }

  return (
    <article className="p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="font-sans text-base font-black uppercase tracking-tight text-zinc-950">
            {item.title}
          </h3>
          {item.organization && (
            <p className="mt-0.5 font-mono text-xs font-bold text-zinc-500">{item.organization}</p>
          )}
          <p className="mt-1 font-mono text-xs text-zinc-400">
            {formatDateRange(item.startDate, item.endDate)}
            <span className="ml-2 text-zinc-300">·</span>
            <span className="ml-2">{getDuration(item.startDate, item.endDate)}</span>
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <StatusPill status={item.status} />
          <button
            type="button"
            onClick={() => onEdit(item)}
            title="Edit entry"
            className="flex h-7 w-7 items-center justify-center border border-zinc-200 text-zinc-400 hover:border-zinc-900 hover:text-zinc-900"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            title={confirmDelete ? "Click again to confirm delete" : "Delete entry"}
            className={`flex h-7 items-center gap-1 border px-2 font-mono text-[10px] font-bold uppercase tracking-widest transition-colors ${confirmDelete
                ? "border-red-300 bg-red-50 text-red-700 hover:bg-red-100"
                : "border-zinc-200 text-zinc-400 hover:border-red-300 hover:text-red-600"
              }`}
          >
            {deleteMutation.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
            {confirmDelete && <span>Confirm</span>}
          </button>
        </div>
      </div>

      {item.description && (
        <p className="mt-3 whitespace-pre-wrap font-sans text-sm leading-6 text-zinc-600">
          {item.description}
        </p>
      )}

      {item.status === "rejected" ? (
        <div className="mt-4 border-t border-red-100 pt-4 space-y-3">
          {item.reviewNote && (
            <div className="border-l-2 border-red-400 pl-3">
              <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-red-500 mb-1">
                Reviewer feedback
              </p>
              <p className="font-mono text-xs leading-5 text-zinc-600">{item.reviewNote}</p>
            </div>
          )}
          <button
            type="button"
            onClick={() => onEdit(item)}
            className="inline-flex h-9 items-center gap-2 border border-zinc-900 bg-zinc-950 px-4 font-mono text-[10px] font-black uppercase tracking-widest text-white hover:bg-zinc-800 transition-colors"
          >
            <Pencil className="h-3 w-3" />
            Edit &amp; Resubmit
          </button>
        </div>
      ) : item.reviewNote ? (
        <p className="mt-4 border-l-2 border-zinc-900 pl-3 font-mono text-xs leading-5 text-zinc-500">
          {item.reviewNote}
        </p>
      ) : null}
    </article>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SettingsCareerPage() {
  const { data: progressions = [], isLoading } = useMyCareerProgressions();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CareerProgression | null>(null);

  function openAdd() {
    setEditingItem(null);
    setSheetOpen(true);
  }

  function openEdit(item: CareerProgression) {
    setEditingItem(item);
    setSheetOpen(true);
  }

  function closeSheet() {
    setSheetOpen(false);
    setEditingItem(null);
  }

  return (
    <>
      <ProgressionSheet open={sheetOpen} editing={editingItem} onClose={closeSheet} />

      <div className="space-y-6">
        {/* ── Header ── */}
        <div className="flex items-end justify-between border-b border-zinc-200 pb-5">
          <div>
            <h2 className="font-sans text-base font-black uppercase tracking-widest text-zinc-950">
              Career Progression
            </h2>
            <p className="mt-1 font-mono text-xs text-zinc-400">
              Approved entries appear on your public profile.
            </p>
          </div>
          <Button
            type="button"
            onClick={openAdd}
            className="h-10 rounded-none bg-zinc-950 font-mono text-xs font-black uppercase tracking-widest text-white hover:bg-zinc-800"
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Add Entry
          </Button>
        </div>

        {/* ── List ── */}
        {isLoading ? (
          <div className="border border-zinc-200 bg-white p-8 font-mono text-sm text-zinc-400">
            Loading progression history...
          </div>
        ) : progressions.length === 0 ? (
          <div className="border border-dashed border-zinc-300 bg-white p-12 text-center">
            <BriefcaseBusiness className="mx-auto mb-3 h-8 w-8 text-zinc-300" />
            <p className="font-sans font-black uppercase tracking-widest text-zinc-900">
              No entries yet
            </p>
            <p className="mt-2 font-mono text-xs text-zinc-400">
              Add your first milestone using the button above.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100 border border-zinc-200 bg-white">
            {progressions.map((item) => (
              <ProgressionCard key={item.id} item={item} onEdit={openEdit} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

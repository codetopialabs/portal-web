"use client";

import { BriefcaseBusiness, CheckCircle2, Clock3, Loader2, XCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMyCareerProgressions, useSubmitCareerProgression } from "@/hooks/useCareerProgressions";
import type { CareerProgression, CareerProgressionStatus } from "@/types/career-progressions.types";

const inputStyles =
  "h-11 rounded-none border-zinc-200 bg-white px-3 font-mono text-sm placeholder:text-zinc-300 focus-visible:ring-0 focus-visible:border-zinc-900";
const labelStyles = "font-mono text-xs uppercase tracking-widest text-zinc-400 font-bold";

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

interface FormValues {
  title: string;
  organization: string;
  startDate: string;
  endDate: string;
  description: string;
}

function formatDateRange(startDate: string, endDate: string | null): string {
  const fmt = (d: string) =>
    new Intl.DateTimeFormat("en", { month: "short", year: "numeric" }).format(new Date(d));
  const start = fmt(startDate);
  const end = endDate ? fmt(endDate) : "Present";
  return `${start} – ${end}`;
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

function ProgressionCard({ item }: { item: CareerProgression }) {
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
        <StatusPill status={item.status} />
      </div>
      {item.description && (
        <p className="mt-3 whitespace-pre-wrap font-sans text-sm leading-6 text-zinc-600">
          {item.description}
        </p>
      )}
      {item.reviewNote && (
        <p className="mt-4 border-l-2 border-zinc-900 pl-3 font-mono text-xs leading-5 text-zinc-500">
          {item.reviewNote}
        </p>
      )}
    </article>
  );
}

export default function SettingsCareerPage() {
  const { data: progressions = [], isLoading } = useMyCareerProgressions();
  const submitProgression = useSubmitCareerProgression();
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { title: "", organization: "", startDate: "", endDate: "", description: "" },
  });

  const endDateValue = watch("endDate");

  async function onSubmit(data: FormValues) {
    try {
      await submitProgression.mutateAsync({
        title: data.title.trim(),
        organization: data.organization.trim(),
        startDate: data.startDate,
        endDate: data.endDate.trim() || null,
        description: data.description.trim(),
      });
      toast.success("Career progression submitted for review.");
      reset();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not submit progression.");
    }
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[420px_1fr]">
      {/* ── Add form ── */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="border border-zinc-200 bg-white p-6 space-y-5"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center bg-zinc-950 text-white">
            <BriefcaseBusiness className="h-4 w-4" />
          </div>
          <div>
            <h2 className="font-sans text-base font-black uppercase tracking-widest text-zinc-950">
              Add Entry
            </h2>
            <p className="font-mono text-xs text-zinc-400">
              Submitted entries appear publicly after review.
            </p>
          </div>
        </div>

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
          {errors.title && <p className="font-mono text-xs text-red-500">{errors.title.message}</p>}
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
              <span className="ml-1 normal-case text-zinc-300">— blank = Present</span>
            </Label>
            <Input
              id="endDate"
              type="date"
              className={inputStyles}
              {...register("endDate", {
                validate: (val) => {
                  if (!val) return true;
                  const start = watch("startDate");
                  if (start && val < start) return "End date must be after start date.";
                  return true;
                },
              })}
            />
            {errors.endDate && (
              <p className="font-mono text-xs text-red-500">{errors.endDate.message}</p>
            )}
            {!endDateValue && (
              <p className="font-mono text-[10px] text-zinc-400">Will show as "Present"</p>
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
          disabled={submitProgression.isPending}
          className="h-11 w-full rounded-none bg-zinc-950 font-mono text-xs font-black uppercase tracking-widest text-white hover:bg-zinc-800"
        >
          {submitProgression.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting
            </>
          ) : (
            "Submit for Review"
          )}
        </Button>
      </form>

      {/* ── History ── */}
      <section className="space-y-4">
        <div className="flex items-end justify-between border-b border-zinc-200 pb-4">
          <div>
            <h2 className="font-sans text-base font-black uppercase tracking-widest text-zinc-950">
              Progression History
            </h2>
            <p className="mt-1 font-mono text-xs text-zinc-400">
              Track review status and public profile visibility.
            </p>
          </div>
          <span className="font-mono text-xs text-zinc-400">{progressions.length} total</span>
        </div>

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
              Add your first milestone using the form.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100 border border-zinc-200 bg-white">
            {progressions.map((item) => (
              <ProgressionCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

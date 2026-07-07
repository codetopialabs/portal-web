"use client";

import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  FileUp,
  Loader2,
  Paperclip,
  Send,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { DashboardShell } from "@/components/dashboard/Shell";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCurrentReflection,
  useSubmitReflection,
  useUploadReflectionAttachment,
} from "@/hooks/useReflections";
import { cn } from "@/lib/utils";
import type { ReflectionQuestionSnapshot } from "@/types/reflections.types";

function formatPeriod(period: string) {
  const d = new Date(period);
  if (Number.isNaN(d.getTime())) return period;
  return new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(d);
}

function formatDate(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(
    d
  );
}

function questionNeedsText(question: ReflectionQuestionSnapshot) {
  return question.type !== "file";
}

function SubmitSkeleton() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <Skeleton className="mb-4 h-5 w-40 rounded-none" />
      <Skeleton className="mb-8 h-12 w-80 rounded-none" />
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-44 w-full rounded-none" />
        ))}
      </div>
    </div>
  );
}

function EmptyState({
  title,
  body,
  actionLabel = "Back to reflections",
}: {
  title: string;
  body: string;
  actionLabel?: string;
}) {
  return (
    <div className="mx-auto w-full max-w-3xl border border-dashed border-grey-300 bg-white px-6 py-12 text-center">
      <CheckCircle2 className="mx-auto h-9 w-9 text-icon-tertiary" />
      <h1 className="mt-4 font-sans text-2xl font-bold text-text-primary">{title}</h1>
      <p className="mx-auto mt-2 max-w-md font-mono text-xs leading-6 text-text-muted">{body}</p>
      <Button asChild className="mt-6 rounded-none font-mono text-xs font-bold">
        <Link href="/reflections">{actionLabel}</Link>
      </Button>
    </div>
  );
}

function ReflectionSubmitContent() {
  const router = useRouter();
  const { data, isLoading } = useCurrentReflection();
  const submit = useSubmitReflection();
  const upload = useUploadReflectionAttachment();

  const questions = useMemo(() => data?.cycle?.questions ?? [], [data?.cycle?.questions]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [attachments, setAttachments] = useState<Record<string, string[]>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadingQuestionId, setUploadingQuestionId] = useState<string | null>(null);

  const mergedAnswers = useMemo(
    () => ({ ...(data?.answers ?? {}), ...answers }),
    [answers, data?.answers]
  );
  const mergedAttachments = useMemo(
    () => ({ ...(data?.attachments ?? {}), ...attachments }),
    [attachments, data?.attachments]
  );

  if (isLoading) return <SubmitSkeleton />;

  if (!data?.isOpen || !data.cycle) {
    return (
      <EmptyState
        title="No reflection open"
        body="There is no active reflection window right now. When the next cycle opens, this page will show the questions for that month."
      />
    );
  }

  if (data.status !== "not_started" && data.status !== "changes_requested") {
    return (
      <EmptyState
        title="Reflection received"
        body="Your reflection for this cycle has already been submitted. You can review its status from your reflections page."
        actionLabel="View reflections"
      />
    );
  }

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    for (const question of questions) {
      const isRequired = question.isRequired ?? true;
      const answer = (mergedAnswers[question.id] ?? "").trim();
      const files = mergedAttachments[question.id] ?? [];
      if (isRequired && questionNeedsText(question) && !answer) {
        nextErrors[question.id] = "This answer is required.";
      }
      if (isRequired && question.type === "file" && files.length === 0) {
        nextErrors[question.id] = "Please attach a file.";
      }
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleUpload = async (questionId: string, files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadingQuestionId(questionId);
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        urls.push(await upload.mutateAsync(file));
      }
      setAttachments((current) => ({
        ...current,
        [questionId]: [...(mergedAttachments[questionId] ?? []), ...urls],
      }));
      setErrors((current) => ({ ...current, [questionId]: "" }));
      toast.success(files.length === 1 ? "Attachment uploaded." : "Attachments uploaded.");
    } catch {
      toast.error("Attachment upload failed.");
    } finally {
      setUploadingQuestionId(null);
    }
  };

  const removeAttachment = (questionId: string, url: string) => {
    setAttachments((current) => ({
      ...current,
      [questionId]: (mergedAttachments[questionId] ?? []).filter((item) => item !== url),
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) return;

    submit.mutate(
      { answers: mergedAnswers, attachments: mergedAttachments },
      {
        onSuccess: () => {
          toast.success("Reflection submitted.");
          router.push("/reflections");
        },
        onError: () => toast.error("Failed to submit reflection."),
      }
    );
  };

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="mb-6">
        <Button asChild variant="ghost" className="mb-4 rounded-none px-0 font-mono text-xs">
          <Link href="/reflections">
            <ArrowLeft className="h-4 w-4" />
            Back to reflections
          </Link>
        </Button>

        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-xs font-medium text-text-muted">Monthly reflection</p>
            <h1 className="mt-1 font-sans text-4xl font-bold tracking-tight text-text-primary">
              {formatPeriod(data.cycle.period)}
            </h1>
          </div>
          <div className="shrink-0 border border-grey-200 bg-white px-3 py-2 text-right">
            <p className="flex items-center justify-end gap-1 font-mono text-xs font-medium text-text-muted">
              <CalendarClock className="h-3.5 w-3.5" />
              Due
            </p>
            <p className="mt-1 font-mono text-xs font-bold text-text-primary">
              {formatDate(data.cycle.dueOn)}
            </p>
          </div>
        </div>

        {data.status === "changes_requested" && data.reviewerNotes && (
          <div className="mt-5 border-l-4 border-red-500 bg-red-50 px-4 py-3">
            <p className="font-mono text-xs font-semibold text-red-700">Changes requested</p>
            {/* Legacy flat note */}
            {data.reviewerNotes["_legacy"] && (
              <p className="mt-1 font-mono text-xs leading-6 text-red-700">
                {data.reviewerNotes["_legacy"]}
              </p>
            )}
            {/* Per-question notes summary */}
            {Object.entries(data.reviewerNotes)
              .filter(([key]) => key !== "_legacy")
              .some(([, v]) => v?.trim()) && (
                <p className="mt-1 font-mono text-xs text-red-600">
                  See individual feedback notes on each question below.
                </p>
              )}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {questions.map((question, index) => {
          const files = mergedAttachments[question.id] ?? [];
          const error = errors[question.id];
          const isUploading = uploadingQuestionId === question.id;

          return (
            <section key={question.id} className="border border-grey-200 bg-white p-5">
              <div className="mb-4 flex items-start gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center border border-grey-300 font-mono text-xs font-black text-text-secondary">
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <Label
                    htmlFor={`reflection-${question.id}`}
                    className="font-sans text-base font-bold text-text-primary"
                  >
                    {question.prompt}
                    {(question.isRequired ?? true) && (
                      <span className="font-mono text-red-500">*</span>
                    )}
                  </Label>
                  {question.helpText && (
                    <p className="mt-1 font-mono text-xs leading-5 text-text-muted">
                      {question.helpText}
                    </p>
                  )}
                </div>
              </div>

              {questionNeedsText(question) && (
                <textarea
                  id={`reflection-${question.id}`}
                  value={mergedAnswers[question.id] ?? ""}
                  onChange={(event) => {
                    setAnswers((current) => ({
                      ...current,
                      [question.id]: event.target.value,
                    }));
                    if (error) setErrors((current) => ({ ...current, [question.id]: "" }));
                  }}
                  disabled={submit.isPending}
                  rows={question.type === "short_text" ? 3 : 7}
                  className={cn(
                    "w-full resize-y rounded-none border border-input bg-transparent px-3 py-2 font-mono text-sm leading-6 text-text-primary outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50",
                    error && "border-red-500 focus-visible:border-red-500"
                  )}
                  placeholder="Write your answer..."
                />
              )}

              {/* Per-question reviewer feedback */}
              {data.status === "changes_requested" &&
                data.reviewerNotes?.[question.id]?.trim() && (
                  <div className="mt-2 border-l-4 border-red-400 bg-red-50 px-4 py-2.5">
                    <p className="font-mono text-[10px] font-bold uppercase tracking-wide text-red-600">
                      Reviewer feedback
                    </p>
                    <p className="mt-1 font-mono text-xs leading-5 text-red-700">
                      {data.reviewerNotes[question.id]}
                    </p>
                  </div>
                )}

              <div className={cn(questionNeedsText(question) && "mt-3")}>
                <label
                  htmlFor={`attachment-${question.id}`}
                  className={cn(
                    "inline-flex h-9 cursor-pointer items-center justify-center gap-2 border border-grey-300 bg-white px-3 font-mono text-xs font-bold text-text-secondary transition-colors hover:bg-grey-50",
                    (submit.isPending || isUploading) && "pointer-events-none opacity-50"
                  )}
                >
                  {isUploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <FileUp className="h-4 w-4" />
                  )}
                  {isUploading
                    ? "Uploading"
                    : question.type === "file"
                      ? "Attach file"
                      : "Add attachment"}
                </label>
                <input
                  id={`attachment-${question.id}`}
                  type="file"
                  multiple
                  className="sr-only"
                  disabled={submit.isPending || isUploading}
                  onChange={(event) => handleUpload(question.id, event.target.files)}
                />
              </div>

              {files.length > 0 && (
                <div className="mt-3 flex flex-col gap-2">
                  {files.map((url) => (
                    <div
                      key={url}
                      className="flex items-center justify-between gap-3 border border-grey-200 bg-grey-50 px-3 py-2"
                    >
                      <a
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex min-w-0 items-center gap-2 font-mono text-xs text-text-secondary underline-offset-4 hover:underline"
                      >
                        <Paperclip className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{url.split("/").pop() ?? "Attachment"}</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => removeAttachment(question.id, url)}
                        disabled={submit.isPending}
                        className="font-mono text-xs font-medium text-red-600 disabled:opacity-50"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {error && <p className="mt-2 font-mono text-xs text-red-500">{error}</p>}
            </section>
          );
        })}

        <div className="sticky bottom-0 flex justify-end border-t border-grey-200 bg-[#f9fafb] py-4">
          <Button
            type="submit"
            disabled={submit.isPending || uploadingQuestionId !== null}
            className="h-10 rounded-none font-mono text-xs font-bold"
          >
            {submit.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send />}
            Submit reflection
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function ReflectionSubmitPage() {
  return (
    <RouteGuard permission="reflections.submit">
      <DashboardShell>
        <ReflectionSubmitContent />
      </DashboardShell>
    </RouteGuard>
  );
}

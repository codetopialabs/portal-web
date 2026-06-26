"use client";

import {
  CalendarClock,
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
  MessageSquareWarning,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { DashboardShell } from "@/components/dashboard/Shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCurrentReflection,
  useSubmitReflection,
  useUploadReflectionAttachment,
} from "@/hooks/useReflections";
import type { ReflectionQuestionSnapshot } from "@/types/reflections.types";

function attachmentName(url: string) {
  try {
    const path = new URL(url).pathname;
    return decodeURIComponent(path.split("/").pop() || "attachment");
  } catch {
    return "attachment";
  }
}

function FileAnswer({
  id,
  value,
  onChange,
}: {
  id: string;
  value: string;
  onChange: (url: string) => void;
}) {
  const { mutate: upload, isPending } = useUploadReflectionAttachment();
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    upload(file, {
      onSuccess: (url) => {
        onChange(url);
        toast.success("File uploaded.");
      },
      onError: () => toast.error("Upload failed. Please try again."),
    });
  }

  return (
    <div>
      <input ref={inputRef} id={id} type="file" className="hidden" onChange={handleFile} />
      {value ? (
        <div className="flex items-center justify-between gap-3 border border-grey-300 bg-grey-50 px-3 py-2.5">
          <a
            href={value}
            target="_blank"
            rel="noreferrer"
            className="flex min-w-0 items-center gap-2 font-mono text-xs text-text-primary hover:underline"
          >
            <FileText className="h-4 w-4 shrink-0 text-icon-tertiary" />
            <span className="truncate">{attachmentName(value)}</span>
          </a>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="font-mono text-[11px] font-bold text-text-muted transition-colors hover:text-text-primary"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={() => onChange("")}
              aria-label="Remove file"
              className="text-error-600 transition-colors hover:text-error-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isPending}
          className="flex w-full items-center justify-center gap-2 border border-dashed border-grey-300 bg-white px-4 py-4 font-mono text-xs font-bold text-text-secondary transition-colors hover:border-grey-900 hover:bg-grey-50 disabled:opacity-60"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          {isPending ? "Uploading..." : "Upload a file"}
        </button>
      )}
    </div>
  );
}

function formatDate(value?: string | null) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("en", { month: "long", day: "numeric" }).format(d);
}

function StateCard({
  icon: Icon,
  title,
  body,
  tone = "neutral",
}: {
  icon: React.ElementType;
  title: string;
  body: string;
  tone?: "neutral" | "green";
}) {
  const border = tone === "green" ? "border-success-200" : "border-grey-200";
  const badge =
    tone === "green"
      ? "border-success-200 bg-success-50 text-success-600"
      : "border-grey-200 bg-grey-50 text-icon-tertiary";
  return (
    <div className={`border ${border} bg-white p-8 text-center`}>
      <div className={`mx-auto mb-5 flex h-14 w-14 items-center justify-center border ${badge}`}>
        <Icon className="h-7 w-7" />
      </div>
      <h2 className="font-sans text-xl font-black uppercase tracking-tight text-text-primary">
        {title}
      </h2>
      <p className="mx-auto mt-3 max-w-md font-mono text-xs leading-6 text-text-tertiary">{body}</p>
    </div>
  );
}

function ReflectionForm({
  questions,
  initialAnswers,
  dueOn,
  period,
  daysRemaining,
  reviewerNotes,
}: {
  questions: ReflectionQuestionSnapshot[];
  initialAnswers: Record<string, string>;
  dueOn?: string;
  period?: string;
  daysRemaining?: number;
  reviewerNotes?: string;
}) {
  const { mutate: submit, isPending } = useSubmitReflection();
  const [answers, setAnswers] = useState<Record<string, string>>(initialAnswers);

  useEffect(() => {
    setAnswers(initialAnswers);
  }, [initialAnswers]);

  const answeredCount = useMemo(
    () => questions.filter((q) => (answers[q.id] || "").trim()).length,
    [questions, answers]
  );
  const progress = questions.length ? Math.round((answeredCount / questions.length) * 100) : 0;

  function setAnswer(id: string, value: string) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }

  function handleSubmit() {
    const missing = questions.filter((q) => q.isRequired && !(answers[q.id] || "").trim());
    if (missing.length > 0) {
      toast.error("Please answer all required questions.");
      return;
    }
    submit(answers, {
      onSuccess: () => toast.success("Reflection submitted. Thank you!"),
      onError: () => toast.error("Failed to submit. Please try again."),
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="border border-grey-200 bg-white p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-icon-tertiary" />
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted">
                {period ? `${formatMonth(period)} · Monthly check-in` : "Monthly check-in"}
              </p>
            </div>
            <h1 className="font-sans text-3xl font-black uppercase tracking-tight text-text-primary">
              Your reflection
            </h1>
            <p className="mt-2 font-mono text-xs text-text-tertiary">
              Share what you learned this month. It only takes a few minutes.
            </p>
          </div>
          {dueOn && (
            <span className="inline-flex h-8 shrink-0 items-center gap-2 self-start border border-grey-200 bg-grey-50 px-3 font-mono text-xs font-bold text-text-secondary">
              <CalendarClock className="h-3.5 w-3.5" />
              Due {formatDate(dueOn)}
              {typeof daysRemaining === "number" && ` · ${daysRemaining}d left`}
            </span>
          )}
        </div>

        {/* Progress */}
        <div className="mt-5">
          <div className="mb-1.5 flex items-center justify-between font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted">
            <span>Progress</span>
            <span>
              {answeredCount}/{questions.length}
            </span>
          </div>
          <div className="h-1.5 w-full bg-grey-100">
            <div className="h-full bg-grey-900 transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </header>

      {reviewerNotes && (
        <div className="border border-warning-200 bg-warning-50 p-4">
          <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-widest text-warning-700">
            <MessageSquareWarning className="h-4 w-4" />
            Changes requested
          </div>
          <p className="mt-2 font-mono text-xs leading-6 text-warning-700">{reviewerNotes}</p>
        </div>
      )}

      {/* Questions */}
      {questions.length === 0 ? (
        <div className="border border-grey-200 bg-white p-8 text-center font-mono text-sm text-text-tertiary">
          No questions have been configured for this reflection yet.
        </div>
      ) : (
        questions.map((q, index) => (
          <section key={q.id} className="border border-grey-200 bg-white">
            <div className="flex items-center justify-between gap-3 border-b border-grey-200 bg-grey-50 px-5 py-3">
              <label
                htmlFor={`reflection-q-${q.id}`}
                className="font-mono text-sm font-bold text-text-primary"
              >
                {index + 1}. {q.prompt}
                {q.isRequired && <span className="ml-1 text-error-600">*</span>}
              </label>
              {(answers[q.id] || "").trim() && (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-success-600" />
              )}
            </div>
            <div className="p-5">
              {q.helpText && <p className="mb-2 font-mono text-xs text-text-muted">{q.helpText}</p>}
              {q.type === "file" ? (
                <FileAnswer
                  id={`reflection-q-${q.id}`}
                  value={answers[q.id] || ""}
                  onChange={(url) => setAnswer(q.id, url)}
                />
              ) : q.type === "short_text" ? (
                <Input
                  id={`reflection-q-${q.id}`}
                  value={answers[q.id] || ""}
                  onChange={(e) => setAnswer(q.id, e.target.value)}
                  className="h-10 rounded-none border-grey-300 font-mono text-sm"
                />
              ) : (
                <textarea
                  id={`reflection-q-${q.id}`}
                  value={answers[q.id] || ""}
                  onChange={(e) => setAnswer(q.id, e.target.value)}
                  rows={4}
                  className="w-full resize-y rounded-none border border-grey-300 bg-white p-3 font-mono text-sm text-text-primary outline-none focus:border-grey-900"
                />
              )}
            </div>
          </section>
        ))
      )}

      {/* Submit bar */}
      <div className="flex items-center justify-between gap-4 border border-grey-200 bg-white p-4">
        <p className="font-mono text-xs text-text-tertiary">
          {answeredCount === questions.length
            ? "All questions answered."
            : `${questions.length - answeredCount} question(s) left.`}
        </p>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={isPending || questions.length === 0}
          className="h-10 rounded-none font-mono text-xs font-bold"
        >
          {isPending ? "Submitting..." : "Submit reflection"}
        </Button>
      </div>
    </div>
  );
}

function formatMonth(period: string) {
  const d = new Date(period);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(d);
}

function ReflectionsContent() {
  const { data, isLoading } = useCurrentReflection();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full rounded-none" />
        <Skeleton className="h-40 w-full rounded-none" />
        <Skeleton className="h-40 w-full rounded-none" />
      </div>
    );
  }

  if (!data?.isOpen) {
    return (
      <StateCard
        icon={Clock}
        title="No reflection due right now"
        body="Monthly reflections open on the 25th. We'll prompt you here and by email when the next one is ready."
      />
    );
  }

  const canEdit = data.status === "not_started" || data.status === "changes_requested";

  if (canEdit) {
    return (
      <ReflectionForm
        questions={data.cycle?.questions ?? []}
        initialAnswers={data.answers ?? {}}
        dueOn={data.cycle?.dueOn}
        period={data.cycle?.period}
        daysRemaining={data.daysRemaining}
        reviewerNotes={data.status === "changes_requested" ? data.reviewerNotes : undefined}
      />
    );
  }

  if (data.status === "approved") {
    return (
      <StateCard
        icon={CheckCircle2}
        tone="green"
        title="Reflection approved"
        body="Thanks for reflecting this month — your submission has been reviewed and approved."
      />
    );
  }

  return (
    <StateCard
      icon={CheckCircle2}
      title="Reflection submitted"
      body="Your reflection is in and awaiting review. We'll let you know if anything needs a second look."
    />
  );
}

export default function ReflectionsPage() {
  return (
    <RouteGuard permission="reflections.submit">
      <DashboardShell>
        <div className="mx-auto max-w-3xl pb-20">
          <ReflectionsContent />
        </div>
      </DashboardShell>
    </RouteGuard>
  );
}

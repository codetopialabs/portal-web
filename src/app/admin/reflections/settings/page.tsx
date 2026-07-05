"use client";

import { CalendarClock, ClipboardCheck, Play, Plus, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { usePermission } from "@/hooks/usePermission";
import {
  useCreateReflectionQuestion,
  useDeleteReflectionQuestion,
  useReflectionQuestions,
  useReflectionSettings,
  useTriggerReflectionCycle,
  useUpdateReflectionQuestion,
  useUpdateReflectionSettings,
} from "@/hooks/useReflections";

const ORDINAL: Record<number, string> = {
  1: "1st",
  2: "2nd",
  3: "3rd",
  4: "4th",
  5: "5th",
  6: "6th",
  7: "7th",
  8: "8th",
  9: "9th",
  10: "10th",
  11: "11th",
  12: "12th",
  13: "13th",
  14: "14th",
  15: "15th",
  16: "16th",
  17: "17th",
  18: "18th",
  19: "19th",
  20: "20th",
  21: "21st",
  22: "22nd",
  23: "23rd",
  24: "24th",
  25: "25th",
  26: "26th",
  27: "27th",
  28: "28th",
};

/* ── Section wrapper ─────────────────────────────────────────────────────── */

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-grey-200 bg-white">
      <div className="border-b border-grey-200 bg-grey-50 px-5 py-3">
        <h2 className="font-sans text-base font-bold text-text-primary">{title}</h2>
        {description && (
          <p className="mt-0.5 font-mono text-[11px] text-text-muted">{description}</p>
        )}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

/* ── Schedule section ────────────────────────────────────────────────────── */

function ScheduleSection() {
  const { data: settings, isLoading } = useReflectionSettings();
  const { mutate: update, isPending } = useUpdateReflectionSettings();

  const [openDay, setOpenDay] = useState<number>(25);
  const [windowDays, setWindowDays] = useState<number>(7);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (settings) {
      setOpenDay(settings.openDay);
      setWindowDays(settings.windowDays);
      setDirty(false);
    }
  }, [settings]);

  function save() {
    update(
      { openDay, windowDays },
      {
        onSuccess: () => {
          toast.success("Schedule saved.");
          setDirty(false);
        },
        onError: () => toast.error("Failed to save schedule."),
      }
    );
  }

  if (isLoading) return <Skeleton className="h-24 w-full rounded-none" />;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Day picker */}
        <div className="space-y-2">
          <p className="font-mono text-xs font-medium text-text-muted">Opens on — day of month</p>
          <div className="flex flex-wrap gap-1.5">
            {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => {
                  setOpenDay(d);
                  setDirty(true);
                }}
                className={`h-9 w-9 font-mono text-xs font-bold transition-colors ${
                  openDay === d
                    ? "bg-grey-900 text-white"
                    : "border border-grey-200 bg-white text-text-secondary hover:border-grey-900 hover:text-text-primary"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
          <p className="font-mono text-[10px] text-text-muted">Capped at 28 to avoid Feb issues.</p>
        </div>

        {/* Window input */}
        <div className="space-y-2">
          <p className="font-mono text-xs font-medium text-text-muted">Grace window — days open</p>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={1}
              max={30}
              value={windowDays}
              onChange={(e) => {
                const v = Math.min(30, Math.max(1, Number(e.target.value) || 1));
                setWindowDays(v);
                setDirty(true);
              }}
              className="h-12 w-24 rounded-none border border-grey-300 bg-white px-4 font-mono text-2xl font-bold text-text-primary outline-none focus:border-grey-900 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
            <span className="font-mono text-sm text-text-muted">days</span>
          </div>
          <p className="font-mono text-[10px] text-text-muted">Between 1 and 30.</p>
        </div>
      </div>

      {settings && (
        <p className="border border-grey-100 bg-grey-50 px-4 py-2.5 font-mono text-xs text-text-secondary">
          Currently: reflections open on the{" "}
          <span className="font-bold text-text-primary">{ORDINAL[settings.openDay]}</span> of each
          month and stay open for{" "}
          <span className="font-bold text-text-primary">{settings.windowDays} days</span>.
        </p>
      )}

      <Button
        type="button"
        onClick={save}
        disabled={isPending || !dirty}
        className="h-10 rounded-none font-mono text-xs font-bold gap-2"
      >
        <Save className="h-4 w-4" />
        Save schedule
      </Button>
    </div>
  );
}

/* ── Manual trigger section ──────────────────────────────────────────────── */

function TriggerSection() {
  const { mutate: trigger, isPending } = useTriggerReflectionCycle();
  const [confirmed, setConfirmed] = useState(false);
  const [result, setResult] = useState<{ period: string; opensOn: string; dueOn: string } | null>(
    null
  );

  function handleTrigger() {
    trigger(undefined, {
      onSuccess: (data) => {
        toast.success(data.detail);
        setResult(data);
        setConfirmed(false);
      },
      onError: () => toast.error("Failed to trigger cycle."),
    });
  }

  function formatDate(v: string) {
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return v;
    return new Intl.DateTimeFormat("en", { month: "long", day: "numeric", year: "numeric" }).format(
      d
    );
  }

  function formatPeriod(v: string) {
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return v;
    return new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(d);
  }

  return (
    <div className="space-y-4">
      <p className="font-mono text-xs leading-6 text-text-secondary">
        This opens a reflection cycle for the current month starting{" "}
        <span className="font-bold text-text-primary">right now</span>, regardless of the schedule.
        Use this to kick off a cycle early, or re-open one that was missed. If a cycle for this
        month already exists, its window will be updated to start today.
      </p>

      {result && (
        <div className="border border-success-200 bg-success-50 px-4 py-3">
          <p className="font-mono text-xs font-bold text-success-700">
            Cycle opened — {formatPeriod(result.period)}
          </p>
          <p className="mt-0.5 font-mono text-[11px] text-success-600">
            Open {formatDate(result.opensOn)} → {formatDate(result.dueOn)}
          </p>
        </div>
      )}

      {!confirmed ? (
        <Button
          type="button"
          variant="outline"
          onClick={() => setConfirmed(true)}
          className="h-10 rounded-none border-grey-300 font-mono text-xs font-bold gap-2"
        >
          <Play className="h-4 w-4" />
          Trigger cycle for this month
        </Button>
      ) : (
        <div className="flex items-center gap-3">
          <p className="font-mono text-xs font-bold text-warning-700">Are you sure?</p>
          <Button
            type="button"
            onClick={handleTrigger}
            disabled={isPending}
            className="h-9 rounded-none font-mono text-xs font-bold gap-2"
          >
            <Play className="h-4 w-4" />
            Yes, open it now
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setConfirmed(false)}
            className="h-9 rounded-none font-mono text-xs"
          >
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}

/* ── Questions section ───────────────────────────────────────────────────── */

function QuestionsSection() {
  const { data: questions, isLoading } = useReflectionQuestions();
  const { mutate: createQuestion, isPending: isCreating } = useCreateReflectionQuestion();
  const { mutate: updateQuestion } = useUpdateReflectionQuestion();
  const { mutate: deleteQuestion } = useDeleteReflectionQuestion();
  const canManage = usePermission("reflections.manage");

  const [prompt, setPrompt] = useState("");
  const [helpText, setHelpText] = useState("");

  function handleCreate() {
    if (!prompt.trim()) return;
    createQuestion(
      {
        prompt: prompt.trim(),
        helpText: helpText.trim(),
        type: "long_text",
        order: (questions?.length ?? 0) + 1,
      },
      {
        onSuccess: () => {
          toast.success("Question added.");
          setPrompt("");
          setHelpText("");
        },
        onError: () => toast.error("Failed to add question."),
      }
    );
  }

  function toggleActive(id: string, isActive: boolean) {
    updateQuestion({ id, data: { isActive } }, { onError: () => toast.error("Failed to update.") });
  }

  function remove(id: string) {
    deleteQuestion(id, {
      onSuccess: () => toast.success("Question removed."),
      onError: () => toast.error("Failed to remove."),
    });
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-14 w-full rounded-none" />
        <Skeleton className="h-14 w-full rounded-none" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="font-mono text-[11px] text-text-muted">
        Changes apply to the <span className="font-bold text-text-primary">next</span> cycle —
        questions are snapshotted when a cycle opens, so past reflections keep their original
        wording.
      </p>

      {!questions || questions.length === 0 ? (
        <p className="py-6 text-center font-mono text-sm text-text-tertiary">
          No questions configured yet.
        </p>
      ) : (
        <div className="divide-y divide-grey-200 border border-grey-200">
          {questions.map((q, index) => (
            <div key={q.id} className="flex items-start gap-3 px-4 py-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center bg-grey-100 font-mono text-[11px] font-bold text-text-secondary">
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-mono text-sm font-bold text-text-primary">{q.prompt}</p>
                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                  <span className="border border-grey-200 bg-grey-50 px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wide text-text-secondary">
                    Text + attachments
                  </span>
                  <span
                    className={`border px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wide ${q.isRequired ? "border-grey-300 bg-grey-100 text-text-secondary" : "border-grey-200 bg-white text-text-muted"}`}
                  >
                    {q.isRequired ? "Required" : "Optional"}
                  </span>
                  {!q.isActive && (
                    <span className="border border-warning-200 bg-warning-50 px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wide text-warning-700">
                      Inactive
                    </span>
                  )}
                </div>
                {q.helpText && (
                  <p className="mt-1 font-mono text-xs text-text-muted">{q.helpText}</p>
                )}
              </div>
              {canManage && (
                <div className="flex shrink-0 items-center gap-3">
                  <label className="flex cursor-pointer items-center gap-1.5 font-mono text-[11px] text-text-secondary">
                    <input
                      type="checkbox"
                      checked={q.isActive}
                      onChange={(e) => toggleActive(q.id, e.target.checked)}
                      className="h-3.5 w-3.5"
                    />
                    Active
                  </label>
                  <button
                    type="button"
                    onClick={() => remove(q.id)}
                    aria-label="Delete"
                    className="text-error-600 transition-colors hover:text-error-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {canManage && (
        <div className="space-y-3 border border-dashed border-grey-300 p-4">
          <p className="font-mono text-xs font-medium text-text-muted">Add a question</p>
          <Input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. What did you learn this month?"
            className="h-10 rounded-none border-grey-300 font-mono text-sm"
          />
          <Input
            value={helpText}
            onChange={(e) => setHelpText(e.target.value)}
            placeholder="Help text (optional)"
            className="h-10 rounded-none border-grey-300 font-mono text-sm"
          />
          <Button
            type="button"
            onClick={handleCreate}
            disabled={isCreating || !prompt.trim()}
            className="h-10 rounded-none font-mono text-xs font-bold gap-2"
          >
            <Plus className="h-4 w-4" />
            Add question
          </Button>
        </div>
      )}
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────────────────── */

function ReflectionSettingsContent() {
  return (
    <div className="w-full max-w-3xl pb-20">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 font-mono text-xs text-text-muted">
        <ClipboardCheck className="h-3.5 w-3.5" />
        <Link href="/admin/reflections" className="hover:text-text-primary transition-colors">
          Reflections
        </Link>
        <span>/</span>
        <span className="text-text-primary">Settings</span>
      </div>

      <header className="mb-8">
        <div className="mb-1 flex items-center gap-2">
          <CalendarClock className="h-4 w-4 text-icon-tertiary" />
          <p className="font-mono text-xs font-medium text-text-muted">Admin · Reflections</p>
        </div>
        <h1 className="font-sans text-4xl font-bold tracking-tight text-text-primary">Settings</h1>
      </header>

      <div className="flex flex-col gap-6">
        <Section
          title="Schedule"
          description="Control when the monthly reflection window opens and how long it stays open."
        >
          <ScheduleSection />
        </Section>

        <Section
          title="Manual trigger"
          description="Open a reflection cycle immediately, outside the normal schedule."
        >
          <TriggerSection />
        </Section>

        <Section
          title="Questions"
          description="Questions members answer each month. Edits apply to the next cycle only."
        >
          <QuestionsSection />
        </Section>
      </div>
    </div>
  );
}

export default function ReflectionSettingsPage() {
  return (
    <RouteGuard permission="reflections.manage">
      <ReflectionSettingsContent />
    </RouteGuard>
  );
}

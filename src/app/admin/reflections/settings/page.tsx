"use client";

import {
  AlertTriangle,
  BookOpen,
  CalendarClock,
  Check,
  ClipboardCheck,
  Play,
  Save,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useConfirmReflectionQuestions,
  useReflectionQuestions,
  useReflectionSettings,
  useTriggerReflectionCycle,
  useUpcomingCycle,
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
    <div className="border border-zinc-200 bg-white">
      <div className="border-b border-zinc-200 bg-zinc-50 px-5 py-3">
        <h2 className="font-sans text-base font-bold text-zinc-900">{title}</h2>
        {description && <p className="mt-0.5 font-mono text-[11px] text-zinc-400">{description}</p>}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

/* ── Helpers ─────────────────────────────────────────────────────────────── */

function formatPeriod(v: string) {
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v;
  return new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(d);
}

function formatDate(v: string) {
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v;
  return new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(d);
}

/* ── Confirm questions section ───────────────────────────────────────────── */

function ConfirmQuestionsSection() {
  const { data: upcoming, isLoading } = useUpcomingCycle();
  const { mutate: confirm, isPending } = useConfirmReflectionQuestions();
  const { data: questions } = useReflectionQuestions();

  if (isLoading) return <Skeleton className="h-24 w-full rounded-none" />;
  if (!upcoming) return null;

  if (upcoming.questionsConfirmed) {
    return (
      <div className="flex items-center gap-3 border border-emerald-200 bg-emerald-50 px-4 py-3">
        <Check className="h-4 w-4 shrink-0 text-emerald-600" />
        <div>
          <p className="font-mono text-xs font-bold text-emerald-700">
            Questions confirmed for {formatPeriod(upcoming.period)}
          </p>
          <p className="font-mono text-[10px] text-emerald-600">
            The cycle will open on {formatDate(upcoming.opensOn)}. Members can submit once it opens.
          </p>
        </div>
      </div>
    );
  }

  const activeQuestions = (questions ?? []).filter((q) => q.isActive);

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 border border-amber-200 bg-amber-50 px-4 py-3">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
        <div>
          <p className="font-mono text-xs font-bold text-amber-700">
            Questions not yet confirmed for {formatPeriod(upcoming.period)}
          </p>
          <p className="font-mono text-[10px] text-amber-600 mt-0.5">
            The {formatPeriod(upcoming.period)} cycle won't open to members until you confirm the
            question set. Scheduled to open on <strong>{formatDate(upcoming.opensOn)}</strong>.
          </p>
        </div>
      </div>

      {activeQuestions.length === 0 ? (
        <div className="space-y-3">
          <p className="font-mono text-xs text-red-500">
            No active questions — you need at least one before you can confirm.
          </p>
          <Button
            asChild
            variant="outline"
            className="h-9 rounded-none border-zinc-300 font-mono text-xs font-bold gap-2"
          >
            <Link href="/admin/reflections/questions">
              <BookOpen className="h-4 w-4" />
              Go to Question Bank
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="font-mono text-[10px] text-zinc-400">
            {activeQuestions.length} active question{activeQuestions.length !== 1 ? "s" : ""} will
            be used:
          </p>
          <div className="divide-y divide-zinc-100 border border-zinc-200 bg-white">
            {activeQuestions.map((q, i) => (
              <div key={q.id} className="px-4 py-2.5">
                <p className="font-mono text-xs font-bold text-zinc-900">
                  {i + 1}. {q.prompt}
                </p>
                {q.helpText && <p className="font-mono text-[11px] text-zinc-400">{q.helpText}</p>}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              onClick={() =>
                confirm(undefined, {
                  onSuccess: (data) => toast.success(data.detail),
                  onError: () => toast.error("Failed to confirm questions."),
                })
              }
              disabled={isPending}
              className="h-10 rounded-none font-mono text-xs font-bold gap-2"
            >
              <Check className="h-4 w-4" />
              Confirm for {formatPeriod(upcoming.period)}
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-10 rounded-none border-zinc-300 font-mono text-xs font-bold gap-2"
            >
              <Link href="/admin/reflections/questions">
                <BookOpen className="h-4 w-4" />
                Edit questions
              </Link>
            </Button>
          </div>
        </div>
      )}
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
          <p className="font-mono text-xs font-medium text-zinc-400">Opens on — day of month</p>
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
                    ? "bg-zinc-900 text-white"
                    : "border border-zinc-200 bg-white text-zinc-500 hover:border-zinc-900 hover:text-zinc-900"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
          <p className="font-mono text-[10px] text-zinc-400">Capped at 28 to avoid Feb issues.</p>
        </div>

        {/* Window input */}
        <div className="space-y-2">
          <p className="font-mono text-xs font-medium text-zinc-400">Grace window — days open</p>
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
              className="h-12 w-24 rounded-none border border-zinc-300 bg-white px-4 font-mono text-2xl font-bold text-zinc-900 outline-none focus:border-zinc-900 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
            <span className="font-mono text-sm text-zinc-400">days</span>
          </div>
          <p className="font-mono text-[10px] text-zinc-400">Between 1 and 30.</p>
        </div>
      </div>

      {settings && (
        <p className="border border-zinc-100 bg-zinc-50 px-4 py-2.5 font-mono text-xs text-zinc-500">
          Currently: reflections open on the{" "}
          <span className="font-bold text-zinc-900">{ORDINAL[settings.openDay]}</span> of each month
          and stay open for{" "}
          <span className="font-bold text-zinc-900">{settings.windowDays} days</span>.
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
  const [result, setResult] = useState<{
    period: string;
    opensOn: string;
    dueOn: string;
  } | null>(null);

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

  return (
    <div className="space-y-4">
      <p className="font-mono text-xs leading-6 text-zinc-500">
        Opens a reflection cycle for the current month starting{" "}
        <span className="font-bold text-zinc-900">right now</span>, regardless of the schedule. If a
        cycle for this month already exists, its window will be updated to start today.
      </p>

      {result && (
        <div className="border border-emerald-200 bg-emerald-50 px-4 py-3">
          <p className="font-mono text-xs font-bold text-emerald-700">
            Cycle opened — {formatPeriod(result.period)}
          </p>
          <p className="mt-0.5 font-mono text-[11px] text-emerald-600">
            Open {formatDate(result.opensOn)} → {formatDate(result.dueOn)}
          </p>
        </div>
      )}

      {!confirmed ? (
        <Button
          type="button"
          variant="outline"
          onClick={() => setConfirmed(true)}
          className="h-10 rounded-none border-zinc-300 font-mono text-xs font-bold gap-2"
        >
          <Play className="h-4 w-4" />
          Trigger cycle for this month
        </Button>
      ) : (
        <div className="flex items-center gap-3">
          <p className="font-mono text-xs font-bold text-amber-700">Are you sure?</p>
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

/* ── Page ────────────────────────────────────────────────────────────────── */

function ReflectionSettingsContent() {
  return (
    <div className="w-full max-w-3xl pb-20">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 font-mono text-xs text-zinc-400">
        <ClipboardCheck className="h-3.5 w-3.5" />
        <Link href="/admin/reflections" className="transition-colors hover:text-zinc-900">
          Reflections
        </Link>
        <span>/</span>
        <span className="text-zinc-900">Settings</span>
      </div>

      <header className="mb-8">
        <div className="mb-1 flex items-center gap-2">
          <CalendarClock className="h-4 w-4 text-zinc-400" />
          <p className="font-mono text-xs font-medium text-zinc-400">Admin · Reflections</p>
        </div>
        <h1 className="font-sans text-4xl font-black uppercase tracking-widest text-zinc-900">
          Cycle Settings
        </h1>
        <p className="mt-3 font-mono text-sm text-zinc-400">
          Control the reflection schedule, confirm this month's questions, and manually trigger
          cycles.
        </p>
      </header>

      {/* Quick link to Question Bank */}
      <Link
        href="/admin/reflections/questions"
        className="mb-6 flex items-center justify-between border border-zinc-200 bg-white px-5 py-4 transition-colors hover:bg-zinc-50 group"
      >
        <div className="flex items-center gap-3">
          <BookOpen className="h-5 w-5 text-zinc-400 group-hover:text-zinc-700 transition-colors" />
          <div>
            <p className="font-sans text-sm font-bold text-zinc-900">Question Bank</p>
            <p className="font-mono text-[11px] text-zinc-400">
              Manage questions, browse history, reuse past sets
            </p>
          </div>
        </div>
        <span className="font-mono text-xs font-bold text-zinc-400 group-hover:text-zinc-900 transition-colors">
          Open →
        </span>
      </Link>

      <div className="flex flex-col gap-6">
        <Section
          title="Confirm this month's questions"
          description="The cycle won't open to members until you confirm the question set."
        >
          <ConfirmQuestionsSection />
        </Section>

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

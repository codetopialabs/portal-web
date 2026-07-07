"use client";

import {
  BookOpen,
  Check,
  ChevronDown,
  ChevronRight,
  GripVertical,
  Plus,
  RotateCcw,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
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
  useReflections,
  useUpdateReflectionQuestion,
} from "@/hooks/useReflections";
import type {
  ReflectionQuestion,
  ReflectionQuestionSnapshot,
  ReflectionQuestionType,
} from "@/types/reflections.types";

/* ── Helpers ─────────────────────────────────────────────────────────────── */

function formatPeriod(v: string) {
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v;
  return new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(d);
}

const TYPE_LABELS: Record<ReflectionQuestionType, string> = {
  short_text: "Short text",
  long_text: "Long text",
  file: "File upload",
};

/* ── Add question form ───────────────────────────────────────────────────── */

function AddQuestionForm({
  prefill,
  onDone,
}: {
  prefill?: { prompt: string; helpText?: string };
  onDone?: () => void;
}) {
  const { data: questions } = useReflectionQuestions();
  const { mutate: createQuestion, isPending } = useCreateReflectionQuestion();

  const [prompt, setPrompt] = useState(prefill?.prompt ?? "");
  const [helpText, setHelpText] = useState(prefill?.helpText ?? "");
  const [type, setType] = useState<ReflectionQuestionType>("long_text");

  function handleCreate() {
    if (!prompt.trim()) return;
    createQuestion(
      {
        prompt: prompt.trim(),
        helpText: helpText.trim(),
        type,
        order: (questions?.length ?? 0) + 1,
      },
      {
        onSuccess: () => {
          toast.success("Question added to active set.");
          setPrompt("");
          setHelpText("");
          onDone?.();
        },
        onError: () => toast.error("Failed to add question."),
      }
    );
  }

  return (
    <div className="space-y-3">
      <div>
        <p className="mb-1.5 font-mono text-[11px] text-zinc-400">Question prompt</p>
        <Input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. What did you learn this month?"
          className="h-10 rounded-none border-zinc-300 font-mono text-sm"
        />
      </div>
      <div>
        <p className="mb-1.5 font-mono text-[11px] text-zinc-400">Help text (optional)</p>
        <Input
          value={helpText}
          onChange={(e) => setHelpText(e.target.value)}
          placeholder="Guidance shown below the question"
          className="h-10 rounded-none border-zinc-300 font-mono text-sm"
        />
      </div>
      <div className="flex items-center gap-3">
        <select
          value={type}
          onChange={(e) => setType(e.target.value as ReflectionQuestionType)}
          className="h-10 rounded-none border border-zinc-300 bg-white px-3 font-mono text-xs text-zinc-700 outline-none focus:border-zinc-900"
        >
          <option value="long_text">Long text</option>
          <option value="short_text">Short text</option>
          <option value="file">File upload</option>
        </select>
        <Button
          type="button"
          onClick={handleCreate}
          disabled={isPending || !prompt.trim()}
          className="h-10 rounded-none font-mono text-xs font-bold gap-2"
        >
          <Plus className="h-4 w-4" />
          Add to active set
        </Button>
        {onDone && (
          <Button
            type="button"
            variant="outline"
            onClick={onDone}
            className="h-10 rounded-none border-zinc-300 font-mono text-xs"
          >
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
}

/* ── Active question row ─────────────────────────────────────────────────── */

function ActiveQuestionRow({
  question,
  index,
  canManage,
}: {
  question: ReflectionQuestion;
  index: number;
  canManage: boolean;
}) {
  const { mutate: update } = useUpdateReflectionQuestion();
  const { mutate: remove } = useDeleteReflectionQuestion();

  function toggleActive(isActive: boolean) {
    update(
      { id: question.id, data: { isActive } },
      { onError: () => toast.error("Failed to update.") }
    );
  }

  function handleDelete() {
    remove(question.id, {
      onSuccess: () => toast.success("Question removed."),
      onError: () => toast.error("Failed to remove question."),
    });
  }

  return (
    <div className="flex items-start gap-3 px-5 py-4">
      {canManage && <GripVertical className="mt-0.5 h-4 w-4 shrink-0 cursor-grab text-zinc-300" />}
      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center bg-zinc-100 font-mono text-[11px] font-bold text-zinc-500">
        {index + 1}
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-mono text-sm font-bold text-zinc-900">{question.prompt}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <span className="border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wide text-zinc-500">
            {TYPE_LABELS[question.type] ?? question.type}
          </span>
          <span
            className={`border px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wide ${
              question.isRequired
                ? "border-zinc-300 bg-zinc-100 text-zinc-500"
                : "border-zinc-200 bg-white text-zinc-400"
            }`}
          >
            {question.isRequired ? "Required" : "Optional"}
          </span>
          {!question.isActive && (
            <span className="border border-amber-200 bg-amber-50 px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wide text-amber-700">
              Inactive
            </span>
          )}
        </div>
        {question.helpText && (
          <p className="mt-1.5 font-mono text-xs text-zinc-400">{question.helpText}</p>
        )}
      </div>
      {canManage && (
        <div className="flex shrink-0 items-center gap-3">
          <label className="flex cursor-pointer items-center gap-1.5 font-mono text-[11px] text-zinc-500">
            <input
              type="checkbox"
              checked={question.isActive}
              onChange={(e) => toggleActive(e.target.checked)}
              className="h-3.5 w-3.5"
            />
            Active
          </label>
          <button
            type="button"
            onClick={handleDelete}
            aria-label="Delete question"
            className="text-zinc-300 transition-colors hover:text-red-500"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Active question set ─────────────────────────────────────────────────── */

function ActiveQuestionSet({ canManage }: { canManage: boolean }) {
  const { data: questions, isLoading } = useReflectionQuestions();
  const [showForm, setShowForm] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-16 w-full rounded-none" />
        <Skeleton className="h-16 w-full rounded-none" />
      </div>
    );
  }

  const activeCount = (questions ?? []).filter((q) => q.isActive).length;
  const totalCount = questions?.length ?? 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[11px] text-zinc-400">
          {activeCount} of {totalCount} question{totalCount !== 1 ? "s" : ""} active — these will be
          used in the next confirmed cycle
        </p>
        {canManage && (
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowForm(!showForm)}
            className="h-8 rounded-none border-zinc-300 font-mono text-xs font-bold gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            New question
          </Button>
        )}
      </div>

      {showForm && canManage && (
        <div className="border border-dashed border-zinc-300 bg-zinc-50/50 p-5">
          <p className="mb-3 font-mono text-xs font-bold text-zinc-700">New question</p>
          <AddQuestionForm onDone={() => setShowForm(false)} />
        </div>
      )}

      {!questions || questions.length === 0 ? (
        <div className="border border-dashed border-zinc-200 bg-white p-10 text-center">
          <BookOpen className="mx-auto mb-3 h-6 w-6 text-zinc-300" />
          <p className="font-sans text-sm font-black uppercase tracking-widest text-zinc-900">
            No questions yet
          </p>
          <p className="mt-1.5 font-mono text-xs text-zinc-400">
            Add a new question or reuse one from a past cycle below.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-zinc-100 border border-zinc-200 bg-white">
          {questions.map((q, i) => (
            <ActiveQuestionRow key={q.id} question={q} index={i} canManage={canManage} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Past cycle question card ────────────────────────────────────────────── */

function PastCycleCard({
  period,
  questions,
  canManage,
}: {
  period: string;
  questions: ReflectionQuestionSnapshot[];
  canManage: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [reusingId, setReusingId] = useState<string | null>(null);

  return (
    <div className="border border-zinc-200 bg-white">
      {/* Header */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-5 py-4 transition-colors hover:bg-zinc-50"
      >
        <div className="flex items-center gap-3">
          <span className="font-sans text-sm font-bold text-zinc-900">{formatPeriod(period)}</span>
          <span className="border border-zinc-200 bg-zinc-50 px-2 py-0.5 font-mono text-[10px] font-bold text-zinc-500">
            {questions.length} question{questions.length !== 1 ? "s" : ""}
          </span>
        </div>
        {open ? (
          <ChevronDown className="h-4 w-4 text-zinc-400" />
        ) : (
          <ChevronRight className="h-4 w-4 text-zinc-400" />
        )}
      </button>

      {/* Questions */}
      {open && (
        <div className="border-t border-zinc-100 divide-y divide-zinc-100">
          {questions.map((q) => (
            <div key={q.id} className="px-5 py-4">
              {reusingId === q.id ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <RotateCcw className="h-3.5 w-3.5 text-zinc-400" />
                    <p className="font-mono text-xs font-bold text-zinc-700">
                      Reuse this question — edit if needed
                    </p>
                  </div>
                  <AddQuestionForm
                    prefill={{ prompt: q.prompt, helpText: q.helpText }}
                    onDone={() => setReusingId(null)}
                  />
                </div>
              ) : (
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-sm font-bold text-zinc-900">{q.prompt}</p>
                    {q.helpText && (
                      <p className="mt-1 font-mono text-xs text-zinc-400">{q.helpText}</p>
                    )}
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      {q.type && (
                        <span className="border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wide text-zinc-400">
                          {TYPE_LABELS[q.type] ?? q.type}
                        </span>
                      )}
                      {q.isRequired && (
                        <span className="border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wide text-zinc-400">
                          Required
                        </span>
                      )}
                    </div>
                  </div>
                  {canManage && (
                    <button
                      type="button"
                      onClick={() => setReusingId(q.id)}
                      className="flex shrink-0 items-center gap-1.5 border border-zinc-200 bg-white px-3 py-1.5 font-mono text-xs font-bold text-zinc-600 transition-colors hover:border-zinc-900 hover:text-zinc-900"
                    >
                      <RotateCcw className="h-3 w-3" />
                      Reuse
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const PAGE_SIZE = 5;

/* ── Question history ────────────────────────────────────────────────────── */

function QuestionHistory({ canManage }: { canManage: boolean }) {
  const { data: reflections, isLoading } = useReflections();
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Derive unique past cycles from reflection records, newest first
  const pastCycles = (() => {
    if (!reflections) return [];
    const seen = new Map<string, ReflectionQuestionSnapshot[]>();
    for (const r of reflections) {
      if (!seen.has(r.period) && r.questions?.length > 0) {
        seen.set(r.period, r.questions);
      }
    }
    return [...seen.entries()]
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([period, questions]) => ({ period, questions }));
  })();

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-14 w-full rounded-none" />
        <Skeleton className="h-14 w-full rounded-none" />
        <Skeleton className="h-14 w-full rounded-none" />
      </div>
    );
  }

  if (pastCycles.length === 0) {
    return (
      <div className="border border-dashed border-zinc-200 bg-white p-10 text-center">
        <p className="font-mono text-xs text-zinc-400">
          No past cycles yet — question history will appear here once reflections are submitted.
        </p>
      </div>
    );
  }

  const visible = pastCycles.slice(0, visibleCount);
  const hasMore = visibleCount < pastCycles.length;

  return (
    <div className="space-y-2">
      {visible.map(({ period, questions }) => (
        <PastCycleCard key={period} period={period} questions={questions} canManage={canManage} />
      ))}
      {hasMore && (
        <button
          type="button"
          onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
          className="w-full border border-zinc-200 bg-white py-3 font-mono text-xs font-bold text-zinc-400 transition-colors hover:bg-zinc-50 hover:text-zinc-900"
        >
          Load more ({pastCycles.length - visibleCount} remaining)
        </button>
      )}
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────────────────── */

function QuestionBankContent() {
  const canManage = usePermission("reflections.manage");

  return (
    <div className="w-full max-w-3xl pb-20">
      <header className="mb-8">
        <div className="mb-1 flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-zinc-400" />
          <p className="font-mono text-xs font-medium text-zinc-400">
            <Link href="/admin/reflections" className="transition-colors hover:text-zinc-900">
              Reflections
            </Link>
            {" · "}
            Admin
          </p>
        </div>
        <h1 className="font-sans text-4xl font-black uppercase tracking-widest text-zinc-900">
          Question Bank
        </h1>
        <p className="mt-3 font-mono text-sm text-zinc-400">
          Manage the active question set for upcoming cycles. Browse past cycles to reuse questions
          or pull inspiration from previous months.
        </p>
      </header>

      {/* Active question set */}
      <div className="mb-10">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-sans text-lg font-black uppercase tracking-widest text-zinc-900">
              Active Set
            </h2>
            <p className="font-mono text-[11px] text-zinc-400">
              These questions will be used in the next cycle once confirmed
            </p>
          </div>
          <Link
            href="/admin/reflections/settings"
            className="flex items-center gap-1.5 border border-zinc-300 bg-white px-3 py-2 font-mono text-xs font-bold text-zinc-700 transition-colors hover:border-zinc-900 hover:text-zinc-900"
          >
            <Check className="h-3.5 w-3.5" />
            Confirm cycle
          </Link>
        </div>
        <ActiveQuestionSet canManage={canManage} />
      </div>

      {/* Question history */}
      <div>
        <div className="mb-4">
          <h2 className="font-sans text-lg font-black uppercase tracking-widest text-zinc-900">
            Past Cycles
          </h2>
          <p className="font-mono text-[11px] text-zinc-400">
            Questions used in previous reflection cycles — click a cycle to expand and reuse
            individual questions
          </p>
        </div>
        <QuestionHistory canManage={canManage} />
      </div>
    </div>
  );
}

export default function QuestionBankPage() {
  return (
    <RouteGuard permission="reflections.manage">
      <QuestionBankContent />
    </RouteGuard>
  );
}

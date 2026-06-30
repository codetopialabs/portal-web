"use client";

import { ChevronLeft, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { DashboardShell } from "@/components/dashboard/Shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { usePermission } from "@/hooks/usePermission";
import {
  useCreateReflectionQuestion,
  useDeleteReflectionQuestion,
  useReflectionQuestions,
  useUpdateReflectionQuestion,
} from "@/hooks/useReflections";
import type { ReflectionQuestionType } from "@/types/reflections.types";

const TYPE_LABELS: Record<ReflectionQuestionType, string> = {
  short_text: "Short text",
  long_text: "Long text",
  file: "File upload",
};

function ReflectionQuestionsContent() {
  const { data: questions, isLoading } = useReflectionQuestions();
  const { mutate: createQuestion, isPending: isCreating } = useCreateReflectionQuestion();
  const { mutate: updateQuestion } = useUpdateReflectionQuestion();
  const { mutate: deleteQuestion } = useDeleteReflectionQuestion();
  const canManage = usePermission("reflections.manage");

  const [prompt, setPrompt] = useState("");
  const [helpText, setHelpText] = useState("");
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
          toast.success("Question added.");
          setPrompt("");
          setHelpText("");
        },
        onError: () => toast.error("Failed to add question."),
      }
    );
  }

  function toggleActive(id: string, isActive: boolean) {
    updateQuestion(
      { id, data: { isActive } },
      { onError: () => toast.error("Failed to update question.") }
    );
  }

  function remove(id: string) {
    deleteQuestion(id, {
      onSuccess: () => toast.success("Question removed."),
      onError: () => toast.error("Failed to remove question."),
    });
  }

  return (
    <div className="mx-auto max-w-3xl px-4 pb-20 md:px-0">
      <div className="mb-6">
        <Link
          href="/admin/reflections"
          className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-widest text-text-muted transition-colors hover:text-text-primary"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Reflections
        </Link>
      </div>

      <header className="mb-6 border border-grey-200 bg-white p-5">
        <h1 className="font-sans text-2xl font-black text-text-primary">Reflection questions</h1>
        <p className="mt-1 font-mono text-xs leading-6 text-text-tertiary">
          Edit the questions members answer each month. Changes apply to the next cycle — questions
          are snapshotted when a cycle opens, so past reflections keep their original wording.
        </p>
      </header>

      <section className="mb-6 border border-grey-200 bg-white">
        <div className="border-b border-grey-200 bg-grey-50 px-5 py-3">
          <h2 className="font-sans text-sm font-black uppercase tracking-widest text-text-primary">
            Active questions
          </h2>
        </div>
        {isLoading ? (
          <div className="space-y-3 p-5">
            <Skeleton className="h-14 w-full rounded-none" />
            <Skeleton className="h-14 w-full rounded-none" />
          </div>
        ) : !questions || questions.length === 0 ? (
          <p className="p-8 text-center font-mono text-sm text-text-tertiary">
            No questions configured yet.
          </p>
        ) : (
          <div className="divide-y divide-grey-200">
            {questions.map((q, index) => (
              <div key={q.id} className="flex items-start gap-3 px-5 py-4">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center bg-grey-100 font-mono text-[11px] font-bold text-text-secondary">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-sm font-bold text-text-primary">{q.prompt}</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    <span className="border border-grey-200 bg-grey-50 px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wide text-text-secondary">
                      {TYPE_LABELS[q.type] ?? q.type}
                    </span>
                    <span
                      className={`border px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wide ${
                        q.isRequired
                          ? "border-grey-300 bg-grey-100 text-text-secondary"
                          : "border-grey-200 bg-white text-text-muted"
                      }`}
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
                    <p className="mt-1.5 font-mono text-xs text-text-muted">{q.helpText}</p>
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
                      aria-label="Delete question"
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
      </section>

      {canManage && (
        <section className="border border-grey-200 bg-white p-5">
          <h2 className="mb-4 font-sans text-sm font-black uppercase tracking-widest text-text-primary">
            Add a question
          </h2>
          <div className="space-y-4">
            <div>
              <p className="mb-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted">
                Prompt
              </p>
              <Input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. What did you learn this month?"
                className="h-10 rounded-none border-grey-300 font-mono text-sm"
              />
            </div>
            <div>
              <p className="mb-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted">
                Help text (optional)
              </p>
              <Input
                value={helpText}
                onChange={(e) => setHelpText(e.target.value)}
                className="h-10 rounded-none border-grey-300 font-mono text-sm"
              />
            </div>
            <div className="flex items-center gap-3">
              <select
                value={type}
                onChange={(e) => setType(e.target.value as ReflectionQuestionType)}
                className="h-10 rounded-none border border-grey-300 bg-white px-3 font-mono text-sm text-text-primary outline-none"
              >
                <option value="long_text">Long text</option>
                <option value="short_text">Short text</option>
                <option value="file">File upload</option>
              </select>
              <Button
                type="button"
                onClick={handleCreate}
                disabled={isCreating || !prompt.trim()}
                className="h-10 rounded-none font-mono text-xs font-bold"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add question
              </Button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default function ReflectionQuestionsPage() {
  return (
    <RouteGuard permission="reflections.manage">
      <DashboardShell>
        <ReflectionQuestionsContent />
      </DashboardShell>
    </RouteGuard>
  );
}

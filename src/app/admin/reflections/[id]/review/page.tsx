"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Check,
  ClipboardCheck,
  Clock,
  Download,
  FileText,
  MessageSquareWarning,
  StickyNote,
  X,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminMember } from "@/hooks/useAdmin";
import { usePermission } from "@/hooks/usePermission";
import { reflectionKeys, useReflections, useReviewReflection } from "@/hooks/useReflections";
import { getAvatarUrl } from "@/lib/utils";
import type { ReflectionQuestionSnapshot, ReflectionStatus } from "@/types/reflections.types";

/* ── Status pill ─────────────────────────────────────────────────────────── */

const STATUS_META: Record<ReflectionStatus, { label: string; className: string }> = {
  not_started: { label: "Not started", className: "border-grey-200 bg-grey-50 text-text-muted" },
  submitted: { label: "Submitted", className: "border-info-200 bg-info-50 text-info-700" },
  under_review: {
    label: "Under review",
    className: "border-warning-200 bg-warning-50 text-warning-700",
  },
  approved: { label: "Approved", className: "border-success-200 bg-success-50 text-success-700" },
  changes_requested: {
    label: "Changes requested",
    className: "border-error-200 bg-error-50 text-error-700",
  },
};

function StatusPill({ status }: { status: ReflectionStatus }) {
  const meta = STATUS_META[status];
  return (
    <span
      className={`inline-flex h-6 items-center border px-2.5 font-mono text-[11px] font-bold ${meta.className}`}
    >
      {meta.label}
    </span>
  );
}

function formatDate(value: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("en", { month: "long", day: "numeric", year: "numeric" }).format(
    d
  );
}

function formatPeriod(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(d);
}

function daysSince(value: string | null): number {
  if (!value) return 0;
  return Math.floor((Date.now() - new Date(value).getTime()) / 86_400_000);
}

/* ── Inline note for a single question ──────────────────────────────────── */

function QuestionNote({
  question,
  note,
  priorNote,
  onChange,
  disabled,
}: {
  question: ReflectionQuestionSnapshot;
  note: string;
  priorNote?: string;
  onChange: (val: string) => void;
  disabled: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const hasNote = note.trim().length > 0;

  return (
    <div className="mt-3 border-t border-grey-100 pt-3">
      {/* Prior note from previous review round */}
      {priorNote?.trim() && (
        <div className="mb-2 flex items-start gap-2 border border-warning-200 bg-warning-50 px-3 py-2">
          <MessageSquareWarning className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning-600" />
          <p className="font-mono text-xs leading-5 text-warning-700">
            <span className="font-bold">Prior feedback: </span>
            {priorNote}
          </p>
        </div>
      )}

      {editing ? (
        <div className="space-y-2">
          <textarea
            // biome-ignore lint/a11y/noAutofocus: reviewer is explicitly clicking "Add note"
            autoFocus
            value={note}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            rows={3}
            placeholder={`Note for: "${question.prompt}"`}
            className="w-full resize-y rounded-none border border-grey-300 bg-white p-3 font-mono text-xs leading-5 text-text-primary outline-none focus:border-grey-900 disabled:opacity-50"
          />
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              onClick={() => setEditing(false)}
              disabled={disabled}
              className="h-7 rounded-none font-mono text-[10px] font-bold"
            >
              Done
            </Button>
            {hasNote && (
              <button
                type="button"
                onClick={() => {
                  onChange("");
                  setEditing(false);
                }}
                disabled={disabled}
                className="flex items-center gap-1 font-mono text-[10px] text-error-600 hover:text-error-800 disabled:opacity-50"
              >
                <X className="h-3 w-3" />
                Clear note
              </button>
            )}
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setEditing(true)}
          disabled={disabled}
          className="flex items-center gap-1.5 font-mono text-[10px] text-text-muted transition-colors hover:text-text-primary disabled:opacity-40"
        >
          <StickyNote className="h-3.5 w-3.5" />
          {hasNote ? (
            <span className="text-warning-700 font-bold">Note added — click to edit</span>
          ) : (
            <span>Add note for this answer</span>
          )}
        </button>
      )}

      {/* Show condensed note when not editing */}
      {!editing && hasNote && (
        <p className="mt-1.5 rounded-none border-l-2 border-warning-400 pl-2 font-mono text-xs leading-5 text-warning-700">
          {note}
        </p>
      )}
    </div>
  );
}

/* ── Main content ────────────────────────────────────────────────────────── */

function ReviewPageContent({ id }: { id: string }) {
  const { data: allReflections = [], isLoading } = useReflections();
  const { mutate: review, isPending } = useReviewReflection();
  const canReview = usePermission("reflections.review");
  const router = useRouter();
  const queryClient = useQueryClient();

  const reflection = allReflections.find((r) => r.id === id) ?? null;
  const { data: memberDetail } = useAdminMember(reflection?.username ?? "");

  // Per-question notes keyed by question ID
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [notesInitialized, setNotesInitialized] = useState(false);

  // Initialize notes from prior reviewer_notes once reflection loads
  if (reflection && !notesInitialized) {
    const prior = reflection.reviewerNotes ?? {};
    setNotes(prior);
    setNotesInitialized(true);
  }

  function setNoteForQuestion(questionId: string, value: string) {
    setNotes((prev) => ({ ...prev, [questionId]: value }));
  }

  function act(action: "approve" | "request_changes") {
    if (!reflection) return;

    if (action === "request_changes") {
      const hasAnyNote = Object.values(notes).some((v) => v.trim().length > 0);
      if (!hasAnyNote) {
        toast.error("Add at least one note on a question before requesting changes.");
        return;
      }
    }

    // Only send non-empty notes
    const notesToSend: Record<string, string> = {};
    for (const [qid, note] of Object.entries(notes)) {
      if (note.trim()) notesToSend[qid] = note.trim();
    }

    review(
      { id: reflection.id, action, notes: notesToSend },
      {
        onSuccess: () => {
          toast.success(action === "approve" ? "Reflection approved." : "Changes requested.");
          queryClient.invalidateQueries({ queryKey: reflectionKeys.list() });
          router.push("/admin/reflections");
        },
        onError: () => toast.error("Failed to submit review."),
      }
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48 rounded-none" />
        <Skeleton className="h-64 w-full rounded-none" />
      </div>
    );
  }

  if (!reflection) {
    return (
      <div className="border border-dashed border-grey-300 bg-white p-14 text-center">
        <p className="font-sans text-base font-black text-text-primary">Reflection not found</p>
        <p className="mt-2 font-mono text-xs text-text-tertiary">
          It may have been deleted or the ID is incorrect.
        </p>
        <Button asChild variant="outline" className="mt-6 rounded-none font-mono text-xs">
          <Link href="/admin/reflections">← Back to reflections</Link>
        </Button>
      </div>
    );
  }

  const age = daysSince(reflection.submittedAt);
  const avatarUrl = getAvatarUrl(
    memberDetail?.profilePictureUrl ?? reflection.profilePictureUrl ?? null,
    reflection.fullName
  );
  const isApproved = reflection.status === "approved";

  // Legacy flat note (pre-migration)
  const legacyNote = reflection.reviewerNotes?._legacy;

  const annotatedCount = Object.values(notes).filter((v) => v.trim().length > 0).length;

  return (
    <div className="w-full pb-20">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 font-mono text-xs text-text-muted">
        <ClipboardCheck className="h-3.5 w-3.5" />
        <Link href="/admin/reflections" className="hover:text-text-primary transition-colors">
          Reflections
        </Link>
        <span>/</span>
        <Link
          href={`/admin/reflections/members/${reflection.username}`}
          className="hover:text-text-primary transition-colors"
        >
          @{reflection.username}
        </Link>
        <span>/</span>
        <span className="text-text-primary">{formatPeriod(reflection.period)}</span>
      </div>

      {/* Member header */}
      <div className="mb-6 flex items-center gap-4 border border-grey-200 bg-white p-5">
        {/* biome-ignore lint/performance/noImgElement: avatar URL from API, next/image domain config not set up yet */}
        <img
          src={avatarUrl}
          alt={reflection.fullName}
          className="h-14 w-14 object-cover shrink-0"
        />
        <div className="min-w-0 flex-1">
          <h1 className="font-sans text-2xl font-bold text-text-primary leading-none">
            {reflection.fullName}
          </h1>
          <p className="mt-1 font-mono text-xs text-text-muted">@{reflection.username}</p>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <StatusPill status={reflection.status} />
          <p className="font-mono text-[10px] text-text-muted">{formatPeriod(reflection.period)}</p>
        </div>
      </div>

      {/* Submission meta */}
      <div className="mb-6 flex flex-wrap items-center gap-4 border border-grey-200 bg-grey-50 px-5 py-3">
        <div className="flex items-center gap-2">
          <Clock className="h-3.5 w-3.5 text-icon-muted" />
          <span className="font-mono text-xs text-text-secondary">
            Submitted {formatDate(reflection.submittedAt)}
            {age > 0 && <span className="ml-1.5 text-text-muted">({age}d ago)</span>}
          </span>
        </div>
        {reflection.reviewedByUsername && (
          <div className="flex items-center gap-2">
            <Check className="h-3.5 w-3.5 text-icon-muted" />
            <span className="font-mono text-xs text-text-secondary">
              Reviewed by{" "}
              <Link
                href={`/admin/members/${reflection.reviewedByUsername}`}
                className="font-bold text-text-primary hover:underline"
              >
                {reflection.reviewedByFullName || reflection.reviewedByUsername}
              </Link>{" "}
              on {formatDate(reflection.reviewedAt)}
            </span>
          </div>
        )}
      </div>

      {/* Legacy flat note (pre-migration) */}
      {legacyNote?.trim() && (
        <div
          className={`mb-6 border p-4 ${isApproved ? "border-success-200 bg-success-50" : "border-warning-200 bg-warning-50"}`}
        >
          <div
            className={`mb-2 flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-widest ${isApproved ? "text-success-700" : "text-warning-700"}`}
          >
            <MessageSquareWarning className="h-3.5 w-3.5" />
            {isApproved ? "Reviewer note" : "Changes were requested"}
          </div>
          <p
            className={`font-mono text-sm leading-6 ${isApproved ? "text-success-700" : "text-warning-700"}`}
          >
            {legacyNote}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_300px]">
        {/* ── Left: Q&A with inline annotation ── */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted">
              Answers
            </p>
            {canReview && !isApproved && annotatedCount > 0 && (
              <span className="font-mono text-[10px] text-warning-700">
                {annotatedCount} note{annotatedCount !== 1 ? "s" : ""} added
              </span>
            )}
          </div>

          {reflection.questions.length === 0 ? (
            <p className="font-mono text-sm text-text-tertiary">
              No questions recorded for this cycle.
            </p>
          ) : (
            reflection.questions.map((q, i) => {
              const answer = reflection.answers[q.id]?.trim() || "";
              const currentNote = notes[q.id] ?? "";
              // Show prior note from a previous review round if status is changes_requested
              // and there was already a note for this question when we loaded
              const priorNote =
                reflection.status === "changes_requested"
                  ? (reflection.reviewerNotes?.[q.id] ?? "")
                  : "";

              return (
                <div key={q.id} className="overflow-hidden border border-grey-200">
                  {/* Question header */}
                  <div className="border-b border-grey-200 bg-grey-50 px-4 py-2.5">
                    <p className="font-mono text-xs font-bold text-text-primary">
                      {i + 1}. {q.prompt}
                      {q.isRequired && <span className="ml-1 text-error-500">*</span>}
                    </p>
                    {q.helpText && (
                      <p className="mt-0.5 font-mono text-[11px] text-text-muted">{q.helpText}</p>
                    )}
                  </div>

                  {/* Answer + attachments */}
                  <div className="space-y-3 px-4 py-4">
                    <p className="whitespace-pre-wrap font-mono text-sm leading-6 text-text-secondary">
                      {answer || (
                        <span className="italic text-text-tertiary">No answer provided.</span>
                      )}
                    </p>
                    {(reflection.attachments?.[q.id] ?? []).length > 0 && (
                      <div className="flex flex-col gap-1.5 pt-1">
                        {(reflection.attachments[q.id] ?? []).map((url) => (
                          <a
                            key={url}
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex w-fit items-center gap-2 border border-grey-300 bg-grey-50 px-3 py-2 font-mono text-xs font-bold text-text-primary transition-colors hover:bg-grey-100"
                          >
                            <FileText className="h-4 w-4 text-icon-tertiary" />
                            {(() => {
                              try {
                                return decodeURIComponent(
                                  new URL(url).pathname.split("/").pop() || "attachment"
                                );
                              } catch {
                                return "attachment";
                              }
                            })()}
                            <Download className="h-3.5 w-3.5" />
                          </a>
                        ))}
                      </div>
                    )}

                    {/* Inline note input — only for reviewers, only on unresolved reflections */}
                    {canReview && !isApproved && (
                      <QuestionNote
                        question={q}
                        note={currentNote}
                        priorNote={priorNote !== currentNote ? undefined : priorNote}
                        onChange={(val) => setNoteForQuestion(q.id, val)}
                        disabled={isPending}
                      />
                    )}

                    {/* Read-only display of existing note when approved or can't review */}
                    {(isApproved || !canReview) && reflection.reviewerNotes?.[q.id]?.trim() && (
                      <div className="mt-2 border-t border-grey-100 pt-3">
                        <div className="flex items-start gap-2">
                          <StickyNote className="mt-0.5 h-3.5 w-3.5 shrink-0 text-text-muted" />
                          <p className="font-mono text-xs leading-5 text-text-secondary">
                            {reflection.reviewerNotes[q.id]}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ── Right: sticky action panel ── */}
        <div className="flex flex-col gap-4 lg:sticky lg:top-6 lg:self-start">
          {/* Member history link */}
          <Link
            href={`/admin/reflections/members/${reflection.username}`}
            className="flex items-center justify-between border border-grey-200 bg-white px-4 py-3 font-mono text-xs text-text-secondary transition-colors hover:bg-grey-50"
          >
            <span className="font-bold">View full history</span>
            <span>@{reflection.username} →</span>
          </Link>

          {/* Review actions */}
          {canReview && !isApproved ? (
            <div className="border border-grey-200 bg-white">
              <div className="border-b border-grey-200 bg-grey-50 px-4 py-3">
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted">
                  Review decision
                </p>
              </div>
              <div className="p-4 space-y-3">
                <p className="font-mono text-[10px] leading-5 text-text-muted">
                  Use the <span className="font-bold text-text-primary">Add note</span> link under
                  each answer to annotate. At least one note is required to request changes.
                </p>

                {annotatedCount > 0 && (
                  <div className="border border-warning-200 bg-warning-50 px-3 py-2">
                    <p className="font-mono text-[10px] font-bold text-warning-700">
                      {annotatedCount} question{annotatedCount !== 1 ? "s" : ""} annotated
                    </p>
                  </div>
                )}

                <div className="flex flex-col gap-2 pt-1">
                  <Button
                    type="button"
                    onClick={() => act("approve")}
                    disabled={isPending}
                    className="h-11 w-full rounded-none font-mono text-xs font-bold gap-2"
                  >
                    <Check className="h-4 w-4" />
                    Approve reflection
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => act("request_changes")}
                    disabled={isPending || annotatedCount === 0}
                    className="h-11 w-full rounded-none border-error-200 font-mono text-xs font-bold text-error-700 hover:bg-error-50 gap-2 disabled:opacity-40"
                  >
                    <MessageSquareWarning className="h-4 w-4" />
                    Request changes
                    {annotatedCount > 0 && (
                      <span className="ml-auto flex h-4 w-4 items-center justify-center bg-error-100 font-mono text-[9px] font-black text-error-700">
                        {annotatedCount}
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ) : isApproved ? (
            <div className="border border-success-200 bg-success-50 px-4 py-3">
              <div className="flex items-center gap-2 font-mono text-xs font-bold text-success-700">
                <Check className="h-4 w-4" />
                This reflection has been approved.
              </div>
            </div>
          ) : null}

          <Button
            asChild
            variant="outline"
            className="h-10 w-full rounded-none font-mono text-xs font-bold"
          >
            <Link href="/admin/reflections">
              <ArrowLeft className="h-4 w-4" />
              Back to reflections
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function ReviewPage() {
  const params = useParams<{ id: string }>();
  return (
    <RouteGuard permission="reflections.view_any">
      <ReviewPageContent id={params.id} />
    </RouteGuard>
  );
}

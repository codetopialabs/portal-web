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
import type { ReflectionStatus } from "@/types/reflections.types";

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

function ReviewPageContent({ id }: { id: string }) {
  const { data: allReflections = [], isLoading } = useReflections();
  const { mutate: review, isPending } = useReviewReflection();
  const canReview = usePermission("reflections.review");
  const router = useRouter();
  const queryClient = useQueryClient();

  const reflection = allReflections.find((r) => r.id === id) ?? null;

  // Also try fetching the member detail to get avatar
  const { data: memberDetail } = useAdminMember(reflection?.username ?? "");

  const [notes, setNotes] = useState(reflection?.reviewerNotes ?? "");

  // Sync notes when reflection loads
  if (reflection && notes === "" && reflection.reviewerNotes) {
    setNotes(reflection.reviewerNotes);
  }

  function act(action: "approve" | "request_changes") {
    if (!reflection) return;
    if (action === "request_changes" && !notes.trim()) {
      toast.error("Add a note describing what needs to change.");
      return;
    }
    review(
      { id: reflection.id, action, notes },
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
  const avatarUrl = getAvatarUrl(memberDetail?.profilePictureUrl ?? null, reflection.fullName);
  const isApproved = reflection.status === "approved";

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

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        {/* ── Left: content ── */}
        <div className="flex flex-col gap-6">
          {/* Member header */}
          <div className="flex items-center gap-4 border border-grey-200 bg-white p-5">
            {/* biome-ignore lint/performance/noImgElement: avatar URL from API, next/image domain config not set up yet */}
            <img
              src={avatarUrl}
              alt={reflection.fullName}
              className="h-14 w-14 object-cover shrink-0"
            />
            <div className="min-w-0 flex-1">
              <h1 className="font-sans text-2xl font-black uppercase tracking-tight text-text-primary leading-none">
                {reflection.fullName}
              </h1>
              <p className="mt-1 font-mono text-xs text-text-muted">@{reflection.username}</p>
            </div>
            <div className="flex flex-col items-end gap-2 shrink-0">
              <StatusPill status={reflection.status} />
              <p className="font-mono text-[10px] text-text-muted">
                {formatPeriod(reflection.period)}
              </p>
            </div>
          </div>

          {/* Submission meta */}
          <div className="flex flex-wrap items-center gap-4 border border-grey-200 bg-grey-50 px-5 py-3">
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

          {/* Prior reviewer note */}
          {reflection.reviewerNotes?.trim() && (
            <div
              className={`border p-4 ${isApproved ? "border-success-200 bg-success-50" : "border-warning-200 bg-warning-50"}`}
            >
              <div
                className={`mb-2 flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-widest ${isApproved ? "text-success-700" : "text-warning-700"}`}
              >
                <MessageSquareWarning className="h-3.5 w-3.5" />
                {isApproved ? "Reviewer note" : "Changes were requested"}
                {reflection.reviewedByUsername && (
                  <>
                    {" · "}
                    <Link
                      href={`/admin/members/${reflection.reviewedByUsername}`}
                      className="hover:underline"
                    >
                      {reflection.reviewedByFullName || reflection.reviewedByUsername}
                    </Link>
                  </>
                )}
              </div>
              <p
                className={`font-mono text-sm leading-6 ${isApproved ? "text-success-700" : "text-warning-700"}`}
              >
                {reflection.reviewerNotes}
              </p>
            </div>
          )}

          {/* Q&A */}
          <div className="flex flex-col gap-3">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted">
              Answers
            </p>
            {reflection.questions.length === 0 ? (
              <p className="font-mono text-sm text-text-tertiary">
                No questions recorded for this cycle.
              </p>
            ) : (
              reflection.questions.map((q, i) => {
                const answer = reflection.answers[q.id]?.trim() || "";
                return (
                  <div key={q.id} className="overflow-hidden border border-grey-200">
                    <div className="border-b border-grey-200 bg-grey-50 px-4 py-2.5">
                      <p className="font-mono text-xs font-bold text-text-primary">
                        {i + 1}. {q.prompt}
                        {q.isRequired && <span className="ml-1 text-error-500">*</span>}
                      </p>
                      {q.helpText && (
                        <p className="mt-0.5 font-mono text-[11px] text-text-muted">{q.helpText}</p>
                      )}
                    </div>
                    <div className="space-y-3 px-4 py-4">
                      <p className="whitespace-pre-wrap font-mono text-sm leading-6 text-text-secondary">
                        {answer || (
                          <span className="text-text-tertiary italic">No answer provided.</span>
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
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── Right: sticky review panel ── */}
        <div className="flex flex-col gap-4 lg:sticky lg:top-6 lg:self-start">
          {/* Member history link */}
          <Link
            href={`/admin/reflections/members/${reflection.username}`}
            className="flex items-center justify-between border border-grey-200 bg-white px-4 py-3 font-mono text-xs text-text-secondary transition-colors hover:bg-grey-50"
          >
            <span className="font-bold">View full history</span>
            <span>@{reflection.username} →</span>
          </Link>

          {/* Review panel */}
          {canReview && !isApproved ? (
            <div className="border border-grey-200 bg-white">
              <div className="border-b border-grey-200 bg-grey-50 px-4 py-3">
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted">
                  Review decision
                </p>
              </div>
              <div className="p-4 space-y-3">
                <p className="font-mono text-[10px] text-text-muted">
                  Feedback note{" "}
                  <span className="text-error-500">(required to request changes)</span>
                </p>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  placeholder="What should the member revise or clarify?"
                  className="w-full resize-y rounded-none border border-grey-300 bg-white p-3 font-mono text-sm text-text-primary outline-none focus:border-grey-900"
                />
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
                    disabled={isPending}
                    className="h-11 w-full rounded-none border-error-200 font-mono text-xs font-bold text-error-700 hover:bg-error-50 gap-2"
                  >
                    <MessageSquareWarning className="h-4 w-4" />
                    Request changes
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

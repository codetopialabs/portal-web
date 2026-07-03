"use client";

import { ArrowLeft, Check, ClipboardCheck, Clock } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminMember } from "@/hooks/useAdmin";
import { useReflectionsByMember } from "@/hooks/useReflections";
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
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(
    d
  );
}

function formatPeriod(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(d);
}

function MemberHistoryContent({ username }: { username: string }) {
  // Member profile lookup requires `users.view`, a broader permission than
  // this page needs (`reflections.view_any`). Treat it as optional
  // enrichment for the avatar/role, same as the review-detail page does,
  // rather than gating the whole page on it.
  const { data: member, isLoading: isMemberLoading } = useAdminMember(username);
  const { data: reflections = [], isLoading: isReflectionsLoading } =
    useReflectionsByMember(username);

  // Sort newest first
  const sorted = [...reflections].sort((a, b) => b.period.localeCompare(a.period));

  const approvedCount = reflections.filter((r) => r.status === "approved").length;
  const totalSubmitted = reflections.filter((r) => r.submittedAt).length;

  if (isMemberLoading && isReflectionsLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full rounded-none" />
        <Skeleton className="h-48 w-full rounded-none" />
      </div>
    );
  }

  const fullName = member?.fullName ?? sorted[0]?.fullName ?? username;
  const avatarUrl = getAvatarUrl(member?.profilePictureUrl ?? null, fullName);

  return (
    <div className="w-full pb-20">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 font-mono text-xs text-text-muted">
        <ClipboardCheck className="h-3.5 w-3.5" />
        <Link href="/admin/reflections" className="hover:text-text-primary transition-colors">
          Reflections
        </Link>
        <span>/</span>
        <span className="text-text-primary">@{username}</span>
      </div>

      {/* Member card */}
      <div className="mb-8 flex items-center gap-5 border border-grey-200 bg-white p-6">
        {/* biome-ignore lint/performance/noImgElement: avatar URL from API, next/image domain config not set up yet */}
        <img src={avatarUrl} alt={fullName} className="h-16 w-16 object-cover shrink-0" />
        <div className="min-w-0 flex-1">
          <h1 className="font-sans text-3xl font-black uppercase tracking-tight text-text-primary leading-none">
            {fullName}
          </h1>
          <p className="mt-1 font-mono text-xs text-text-muted">@{username}</p>
          {member?.primaryRole && (
            <p className="mt-1 font-mono text-xs text-text-secondary">{member.primaryRole}</p>
          )}
        </div>
        <div className="hidden sm:flex flex-col items-end gap-1 shrink-0 text-right">
          <p className="font-mono text-[10px] text-text-muted uppercase tracking-widest">
            Total submitted
          </p>
          <p className="font-sans text-2xl font-black text-text-primary">{totalSubmitted}</p>
          <p className="font-mono text-[10px] text-text-muted">{approvedCount} approved</p>
        </div>
      </div>

      {/* History */}
      <p className="mb-4 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted">
        Reflection History
      </p>

      {isReflectionsLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: skeleton loader — static count, order never changes
            <Skeleton key={i} className="h-20 w-full rounded-none" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div className="border border-dashed border-grey-300 bg-white p-14 text-center">
          <p className="font-sans text-base font-black text-text-primary">No reflections yet</p>
          <p className="mt-2 font-mono text-xs text-text-tertiary">
            @{username} hasn't submitted any reflections.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden border border-grey-200 bg-white">
          <div className="hidden grid-cols-[1.5fr_1fr_1fr_1fr_auto] gap-4 border-b border-grey-200 bg-grey-50 px-5 py-3 lg:grid">
            {["Period", "Submitted", "Reviewed", "Status", "actions"].map((h) => (
              <span
                key={h}
                className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted"
              >
                {h === "actions" ? "" : h}
              </span>
            ))}
          </div>
          <div className="divide-y divide-grey-200">
            {sorted.map((r) => (
              <Link
                key={r.id}
                href={`/admin/reflections/${r.id}/review`}
                className="grid w-full grid-cols-1 gap-2 px-5 py-4 text-left transition-colors hover:bg-grey-50 lg:grid-cols-[1.5fr_1fr_1fr_1fr_auto] lg:items-center"
              >
                <div>
                  <p className="font-sans text-sm font-black uppercase tracking-tight text-text-primary">
                    {formatPeriod(r.period)}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 font-mono text-xs text-text-tertiary">
                  <Clock className="h-3.5 w-3.5 text-icon-muted shrink-0" />
                  {formatDate(r.submittedAt)}
                </div>
                <div className="font-mono text-xs text-text-tertiary">
                  {r.reviewedAt ? (
                    <>
                      <div className="flex items-center gap-1.5">
                        <Check className="h-3.5 w-3.5 text-icon-muted shrink-0" />
                        {formatDate(r.reviewedAt)}
                      </div>
                      {r.reviewedByUsername && (
                        <p className="mt-0.5 truncate text-[10px] text-text-muted">
                          {r.reviewedByFullName || r.reviewedByUsername}
                        </p>
                      )}
                    </>
                  ) : (
                    "—"
                  )}
                </div>
                <div>
                  <StatusPill status={r.status} />
                </div>
                <span className="font-mono text-xs font-bold text-text-secondary lg:text-right">
                  View →
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6">
        <Button asChild variant="outline" className="h-10 rounded-none font-mono text-xs font-bold">
          <Link href="/admin/reflections">
            <ArrowLeft className="h-4 w-4" />
            Back to reflections
          </Link>
        </Button>
      </div>
    </div>
  );
}

export default function MemberReflectionsPage() {
  const params = useParams<{ username: string }>();
  return (
    <RouteGuard permission="reflections.view_any">
      <MemberHistoryContent username={params.username} />
    </RouteGuard>
  );
}

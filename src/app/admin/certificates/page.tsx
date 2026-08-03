"use client";

import {
  Ban,
  CheckCircle2,
  FileEdit,
  Loader2,
  Pencil,
  Plus,
  ScrollText,
  Search,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAdminCertificates,
  useDeleteCertificate,
  usePublishCertificate,
  useRevokeCertificate,
} from "@/hooks/useCertificates";
import { usePermission } from "@/hooks/usePermission";
import type { Certificate, CertificateStatus } from "@/types/certificates.types";

const STATUS_META: Record<CertificateStatus, { label: string; pill: string }> = {
  pending: { label: "Pending", pill: "border-amber-300 bg-amber-50 text-amber-700" },
  active: { label: "Active", pill: "border-zinc-900 bg-zinc-900 text-white" },
  revoked: { label: "Revoked", pill: "border-zinc-300 bg-zinc-100 text-zinc-600" },
};

const FILTERS = [
  { value: "pending" as const, label: "Pending" },
  { value: "active" as const, label: "Active" },
  { value: "revoked" as const, label: "Revoked" },
  { value: "" as const, label: "All" },
];

function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(
    new Date(iso)
  );
}

function StatusPill({ status }: { status: CertificateStatus }) {
  const meta = STATUS_META[status];
  return (
    <span
      className={`inline-flex h-6 items-center border px-2.5 font-mono text-[10px] font-black uppercase tracking-widest ${meta.pill}`}
    >
      {meta.label}
    </span>
  );
}

function CertificateCard({ item }: { item: Certificate }) {
  const canCurate = usePermission("certificates.create");
  const canPublish = usePermission("certificates.publish");
  const canRevoke = usePermission("certificates.revoke");

  const publish = usePublishCertificate();
  const revoke = useRevokeCertificate();
  const remove = useDeleteCertificate();

  const [revoking, setRevoking] = useState(false);
  const [reason, setReason] = useState("");

  async function handlePublish() {
    try {
      await publish.mutateAsync(item.id);
      toast.success("Published. The recipient has been emailed their certificate.");
    } catch {
      // Axios interceptor already surfaces the error toast.
    }
  }

  async function handleRevoke() {
    if (!reason.trim()) return;
    try {
      await revoke.mutateAsync({ id: item.id, reason: reason.trim() });
      toast.success("Revoked. The recipient has been told why.");
      setRevoking(false);
      setReason("");
    } catch {
      // Axios interceptor already surfaces the error toast.
    }
  }

  async function handleDelete() {
    try {
      await remove.mutateAsync(item.id);
      toast.success("Certificate deleted.");
    } catch {
      // Axios interceptor already surfaces the error toast.
    }
  }

  return (
    <article className="border border-zinc-200 bg-white">
      <div className="flex items-center gap-4 px-5 py-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
            <h3 className="font-sans text-sm font-bold leading-snug text-zinc-950">{item.title}</h3>
            <StatusPill status={item.status} />
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className="font-mono text-[11px] font-medium text-zinc-500">
              {item.recipientName}
              {item.username && ` · @${item.username}`}
            </span>
            <span className="text-zinc-300">·</span>
            <span className="font-mono text-[11px] text-zinc-400">{item.issuedDate}</span>
          </div>
        </div>
      </div>

      {/* The code -- this is what gets copied to the design team, so it needs
          to be legible and easy to grab, not buried in a detail view. */}
      <div className="mx-5 mb-3 flex items-center justify-between border border-dashed border-zinc-200 px-3 py-2.5">
        <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">
          Verification code
        </span>
        <span className="font-mono text-sm font-bold text-zinc-900">{item.verificationCode}</span>
      </div>

      {item.status === "pending" && !item.artworkUrl && (
        <div className="mx-5 mb-3 font-mono text-[11px] text-amber-700">
          Waiting on artwork before this can be published.
        </div>
      )}

      {item.status === "revoked" && item.revocationReason && (
        <div className="mx-5 mb-3 border-l-2 border-zinc-200 pl-3">
          <p className="mb-0.5 font-mono text-[10px] font-black uppercase tracking-widest text-zinc-400">
            Revoked by @{item.revokedByUsername}
            {item.revokedAt && ` · ${formatDateTime(item.revokedAt)}`}
          </p>
          <p className="font-mono text-xs leading-5 text-zinc-500">{item.revocationReason}</p>
        </div>
      )}

      <div className="border-t border-zinc-100 px-5 py-3">
        {revoking && (
          <div className="mb-3">
            <textarea
              // biome-ignore lint/a11y/noAutofocus: intentional for UX
              autoFocus
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why is this being revoked? (required — the recipient is emailed this)"
              className="min-h-[60px] w-full resize-none border border-zinc-200 bg-white px-3 py-2 font-mono text-xs placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none"
            />
          </div>
        )}

        <div className="flex flex-wrap items-center justify-end gap-2">
          {revoking && (
            <button
              type="button"
              onClick={() => {
                setRevoking(false);
                setReason("");
              }}
              className="font-mono text-xs text-zinc-400 hover:text-zinc-700"
            >
              Cancel
            </button>
          )}

          {canCurate && item.status === "pending" && (
            <ConfirmModal
              title="Delete this certificate?"
              description="It hasn't been published, so nothing changes for the recipient. This can't be undone."
              confirmText="Delete"
              onConfirm={handleDelete}
              isLoading={remove.isPending}
            >
              <Button
                type="button"
                variant="outline"
                className="h-7 rounded-none border-zinc-200 font-mono text-xs font-medium text-zinc-500 hover:border-red-300 hover:text-red-600"
              >
                <Trash2 className="h-3 w-3" />
                Delete
              </Button>
            </ConfirmModal>
          )}

          {canCurate && (
            <Button
              asChild
              type="button"
              variant="outline"
              className="h-7 rounded-none border-zinc-200 font-mono text-xs font-medium text-zinc-600"
            >
              <Link href={`/admin/certificates/${item.id}/edit`}>
                <Pencil className="h-3 w-3" />
                Edit
              </Link>
            </Button>
          )}

          {canRevoke && item.status === "active" && (
            <Button
              type="button"
              variant="outline"
              disabled={revoke.isPending || (revoking && !reason.trim())}
              onClick={() => (revoking ? handleRevoke() : setRevoking(true))}
              className="h-7 rounded-none border-zinc-200 font-mono text-xs font-medium text-zinc-500 hover:border-red-300 hover:text-red-600 disabled:opacity-40"
            >
              {revoke.isPending ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Ban className="h-3 w-3" />
              )}
              {revoking ? "Confirm Revoke" : "Revoke"}
            </Button>
          )}

          {canPublish && item.status === "pending" && (
            <Button
              type="button"
              disabled={publish.isPending || !item.artworkUrl}
              onClick={handlePublish}
              title={item.artworkUrl ? undefined : "Upload artwork before publishing"}
              className="h-7 rounded-none bg-zinc-950 font-mono text-xs font-medium text-white hover:bg-zinc-800 disabled:opacity-40"
            >
              {publish.isPending ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <CheckCircle2 className="h-3 w-3" />
              )}
              Publish
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}

function AdminCertificatesContent() {
  const [status, setStatus] = useState<CertificateStatus | "">("pending");
  const [search, setSearch] = useState("");
  const canCreate = usePermission("certificates.create");
  const params = useMemo(() => ({ status, search: search.trim() || undefined }), [status, search]);
  const { data: certificates = [], isLoading } = useAdminCertificates(params);

  return (
    <div className="mx-auto w-full max-w-5xl pb-10">
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <ScrollText className="h-3.5 w-3.5 text-zinc-400" />
            <p className="font-mono text-xs font-medium text-zinc-400">Admin · Community</p>
          </div>
          <h1 className="font-sans text-4xl font-bold tracking-tight text-zinc-950">
            Certificates
          </h1>
          <p className="mt-1.5 font-mono text-xs text-zinc-400">
            Reserved here with a code up front, published once artwork is uploaded.
          </p>
        </div>

        {canCreate && (
          <Button
            asChild
            className="h-9 rounded-none bg-zinc-950 font-mono text-xs font-medium text-white hover:bg-zinc-800"
          >
            <Link href="/admin/certificates/new">
              <Plus className="h-3.5 w-3.5" />
              Issue Certificates
            </Link>
          </Button>
        )}
      </header>

      <div className="mb-6 flex flex-col gap-4 border-b border-zinc-200 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex">
          {FILTERS.map(({ value, label }) => {
            const isActive = status === value;
            return (
              <button
                key={value || "all"}
                type="button"
                onClick={() => setStatus(value)}
                className={`relative px-4 py-2.5 font-mono text-sm font-medium transition-colors ${
                  isActive
                    ? "text-zinc-950 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-zinc-950"
                    : "text-zinc-400 hover:text-zinc-700"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div className="relative w-full pb-px sm:w-56">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search…"
            className="h-8 rounded-none border-zinc-200 bg-transparent pl-9 font-mono text-xs shadow-none"
          />
        </div>
      </div>

      {!isLoading && certificates.length > 0 && (
        <p className="mb-4 font-mono text-[11px] text-zinc-400">
          {certificates.length} certificate{certificates.length !== 1 ? "s" : ""}
        </p>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 w-full rounded-none" />
          ))}
        </div>
      ) : certificates.length === 0 ? (
        <div className="border border-dashed border-zinc-200 bg-white py-16 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center border border-zinc-200">
            <FileEdit className="h-5 w-5 text-zinc-300" />
          </div>
          <p className="font-sans text-sm font-bold text-zinc-900">Nothing here</p>
          <p className="mt-1.5 font-mono text-xs text-zinc-400">
            No certificates match this filter.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {certificates.map((item) => (
            <CertificateCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminCertificatesPage() {
  return (
    <RouteGuard permission="certificates.view">
      <AdminCertificatesContent />
    </RouteGuard>
  );
}

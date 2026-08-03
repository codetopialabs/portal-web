"use client";

import { LayoutTemplate, Pencil, Plus, Search, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAdminCertificateTemplates,
  useDeleteCertificateTemplate,
} from "@/hooks/useCertificateTemplates";
import { usePermission } from "@/hooks/usePermission";
import type {
  CertificateTemplate,
  CertificateTemplateStatus,
} from "@/types/certificateTemplates.types";

const STATUS_META: Record<CertificateTemplateStatus, { label: string; pill: string }> = {
  draft: { label: "Draft", pill: "border-amber-300 bg-amber-50 text-amber-700" },
  active: { label: "Active", pill: "border-zinc-900 bg-zinc-900 text-white" },
  archived: { label: "Archived", pill: "border-zinc-200 bg-zinc-50 text-zinc-500" },
};

const FILTERS = [
  { value: "active" as const, label: "Active" },
  { value: "draft" as const, label: "Draft" },
  { value: "archived" as const, label: "Archived" },
  { value: "" as const, label: "All" },
];

function StatusPill({ status }: { status: CertificateTemplateStatus }) {
  const meta = STATUS_META[status];
  return (
    <span
      className={`inline-flex h-6 items-center border px-2.5 font-mono text-[10px] font-black uppercase tracking-widest ${meta.pill}`}
    >
      {meta.label}
    </span>
  );
}

function TemplateCard({ item }: { item: CertificateTemplate }) {
  const canEdit = usePermission("certificate_templates.edit");
  const canDelete = usePermission("certificate_templates.delete");
  const remove = useDeleteCertificateTemplate();
  const willArchive = item.certificateCount > 0;

  async function handleDelete() {
    try {
      await remove.mutateAsync(item.id);
      toast.success(willArchive ? "Archived — it had certificates issued from it." : "Deleted.");
    } catch {
      // Axios interceptor already surfaces the error toast.
    }
  }

  return (
    <article className="border border-zinc-200 bg-white">
      <div className="flex items-center gap-4 px-5 py-4">
        <div className="relative flex h-16 w-16 shrink-0 items-center justify-center border border-zinc-100 bg-zinc-50">
          {item.imageUrl ? (
            <Image src={item.imageUrl} alt="" fill className="object-cover" />
          ) : (
            <LayoutTemplate className="h-6 w-6 text-zinc-200" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
            <h3 className="font-sans text-sm font-bold leading-snug text-zinc-950">{item.name}</h3>
            <StatusPill status={item.status} />
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
            {item.certificateType && (
              <>
                <span className="font-mono text-[11px] text-zinc-500">{item.certificateType}</span>
                <span className="text-zinc-300">·</span>
              </>
            )}
            <span className="font-mono text-[11px] text-zinc-400">
              {item.certificateCount} certificate{item.certificateCount !== 1 ? "s" : ""} issued
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-zinc-100 px-5 py-3">
        {canDelete && (
          <ConfirmModal
            title={willArchive ? "Archive this template?" : "Delete this template?"}
            description={
              willArchive
                ? "Certificates already issued from it keep working — it's just archived out of the picker, not erased."
                : "It has no certificates issued from it yet, so this removes it completely. This can't be undone."
            }
            confirmText={willArchive ? "Archive" : "Delete"}
            onConfirm={handleDelete}
            isLoading={remove.isPending}
          >
            <Button
              type="button"
              variant="outline"
              className="h-7 rounded-none border-zinc-200 font-mono text-xs font-medium text-zinc-500 hover:border-red-300 hover:text-red-600"
            >
              <Trash2 className="h-3 w-3" />
              {willArchive ? "Archive" : "Delete"}
            </Button>
          </ConfirmModal>
        )}
        {canEdit && (
          <Button
            asChild
            type="button"
            variant="outline"
            className="h-7 rounded-none border-zinc-200 font-mono text-xs font-medium text-zinc-600"
          >
            <Link href={`/admin/certificate-templates/${item.id}/edit`}>
              <Pencil className="h-3 w-3" />
              Edit
            </Link>
          </Button>
        )}
      </div>
    </article>
  );
}

function AdminCertificateTemplatesContent() {
  const [status, setStatus] = useState<CertificateTemplateStatus | "">("active");
  const [search, setSearch] = useState("");
  const canCreate = usePermission("certificate_templates.create");
  const { data: templates = [], isLoading } = useAdminCertificateTemplates(status);

  const filtered = useMemo(
    () =>
      templates.filter((t) =>
        `${t.name} ${t.certificateType}`.toLowerCase().includes(search.toLowerCase())
      ),
    [templates, search]
  );

  return (
    <div className="mx-auto w-full max-w-5xl pb-10">
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <LayoutTemplate className="h-3.5 w-3.5 text-zinc-400" />
            <p className="font-mono text-xs font-medium text-zinc-400">Admin · Certificates</p>
          </div>
          <h1 className="font-sans text-4xl font-bold tracking-tight text-zinc-950">
            Certificate Templates
          </h1>
          <p className="mt-1.5 font-mono text-xs text-zinc-400">
            Mark the name and code positions once — issuing against a template auto-generates the
            artwork instantly.
          </p>
        </div>

        {canCreate && (
          <Button
            asChild
            className="h-9 rounded-none bg-zinc-950 font-mono text-xs font-medium text-white hover:bg-zinc-800"
          >
            <Link href="/admin/certificate-templates/new">
              <Plus className="h-3.5 w-3.5" />
              New Template
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

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-none" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="border border-dashed border-zinc-200 bg-white py-16 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center border border-zinc-200">
            <LayoutTemplate className="h-5 w-5 text-zinc-300" />
          </div>
          <p className="font-sans text-sm font-bold text-zinc-900">Nothing here</p>
          <p className="mt-1.5 font-mono text-xs text-zinc-400">No templates match this filter.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <TemplateCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminCertificateTemplatesPage() {
  return (
    <RouteGuard permission="certificate_templates.view">
      <AdminCertificateTemplatesContent />
    </RouteGuard>
  );
}

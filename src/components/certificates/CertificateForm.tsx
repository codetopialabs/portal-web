"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  ImagePlus,
  Loader2,
  Plus,
  RefreshCw,
  Save,
  ScrollText,
  SlidersHorizontal,
  X,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { MarkerCanvas } from "@/components/certificateTemplates/MarkerEditor";
import { MemberPicker } from "@/components/members/MemberPicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  certificateKeys,
  useCreateCertificates,
  useUpdateCertificate,
} from "@/hooks/useCertificates";
import {
  useAdminCertificateTemplates,
  useCertificateTemplate,
} from "@/hooks/useCertificateTemplates";
import { CertificatesService } from "@/services/certificates.service";
import { CertificateTemplatesService } from "@/services/certificateTemplates.service";
import type { CommunityMember } from "@/services/user.service";
import {
  type Certificate,
  type CertificateRecipientInput,
  SUGGESTED_CERTIFICATE_TYPES,
} from "@/types/certificates.types";
import type {
  CertificateTemplate,
  TemplateTextPositions,
} from "@/types/certificateTemplates.types";

const labelCls = "font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-400";
const inputCls =
  "h-9 w-full rounded-none border-zinc-200 bg-white px-3 font-mono text-xs text-zinc-700 shadow-none outline-none focus:border-zinc-950";
const textareaCls =
  "w-full resize-none border border-zinc-200 bg-white p-3 font-mono text-xs text-zinc-700 outline-none focus:border-zinc-950";

const MAX_ARTWORK_BYTES = 10 * 1024 * 1024;

function isPdf(fileOrUrl: File | string): boolean {
  if (typeof fileOrUrl === "string") return fileOrUrl.toLowerCase().endsWith(".pdf");
  return fileOrUrl.type === "application/pdf";
}

// No real code exists until the batch is actually reserved -- previews
// before that point can only show the format, not a real value.
function placeholderCode(issuedDate: string): string {
  const year = issuedDate ? new Date(issuedDate).getFullYear() : new Date().getFullYear();
  return `CT-${String(year).slice(-2)}-XXXX-XXXX-XXXX`;
}

async function generateArtworkFor(
  certificate: Certificate,
  template: CertificateTemplate
): Promise<string> {
  const blob = await CertificateTemplatesService.renderPreview({
    imageUrl: template.imageUrl,
    imageWidth: template.imageWidth,
    imageHeight: template.imageHeight,
    // A per-recipient placement tweak made during issuance is saved onto the
    // certificate itself -- reusing it here means a later "Regenerate from
    // template" keeps the same adjustment instead of reverting to default.
    markers: certificate.textPositions ?? template.textPositions,
    name: certificate.recipientName,
    code: certificate.verificationCode,
  });
  const artworkUrl = await CertificatesService.uploadArtwork(blob);
  // Uploading to Cloudinary alone doesn't attach it to the certificate --
  // without this PATCH the certificate's own artwork_url stays empty, so
  // the admin list keeps showing "waiting on artwork" even though the file
  // already exists.
  await CertificatesService.update(certificate.id, { artworkUrl });
  return artworkUrl;
}

// ─── Recipient row (create mode only) ──────────────────────────────────────

interface RecipientRowState {
  id: string;
  kind: "member" | "manual";
  member: CommunityMember | null;
  name: string;
  email: string;
  /** Per-recipient override of the template's placement -- null means "use
   * the template's default", since a long name and a short one don't
   * always suit the same shared position/size. */
  textPositions: TemplateTextPositions | null;
}

function newRecipientRow(): RecipientRowState {
  return {
    id: crypto.randomUUID(),
    kind: "member",
    member: null,
    name: "",
    email: "",
    textPositions: null,
  };
}

function rowDisplayName(row: RecipientRowState): string {
  return row.kind === "member" ? (row.member?.fullName ?? "") : row.name;
}

// ─── Per-recipient template preview -- debounced on name edits, since an
// unusually long name overflowing its marker box is the exact thing this
// preview exists to catch before anything is actually issued. ──────────────

function RecipientPreviewThumbnail({
  template,
  markers,
  name,
  code,
}: {
  template: CertificateTemplate;
  markers: TemplateTextPositions;
  name: string;
  code: string;
}) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!name.trim()) {
      setPreviewUrl(null);
      setError(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const blob = await CertificateTemplatesService.renderPreview({
          imageUrl: template.imageUrl,
          imageWidth: template.imageWidth,
          imageHeight: template.imageHeight,
          markers,
          name: name.trim(),
          code,
        });
        if (cancelled) return;
        setPreviewUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return URL.createObjectURL(blob);
        });
        setError(null);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Preview failed.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 500);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [template.imageUrl, template.imageWidth, template.imageHeight, markers, name, code]);

  return (
    <div className="mt-2 flex h-20 w-28 shrink-0 items-center justify-center overflow-hidden border border-zinc-200 bg-zinc-50">
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin text-zinc-300" />
      ) : error ? (
        <span className="px-1.5 text-center font-mono text-[9px] text-red-500">{error}</span>
      ) : previewUrl ? (
        // biome-ignore lint/performance/noImgElement: blob preview
        <img src={previewUrl} alt="" className="h-full w-full object-contain" />
      ) : (
        <span className="font-mono text-[9px] text-zinc-300">Preview</span>
      )}
    </div>
  );
}

// ─── Per-recipient placement adjuster -- a long name and a short one don't
// always suit the template's shared default, so this drags just this one
// recipient's markers, seeded from the template's own defaults (or whatever
// override was already made for this row). Font/style stay locked to the
// template -- changing those means editing the template itself, not one
// recipient's certificate. ──────────────────────────────────────────────────

function RecipientPlacementAdjuster({
  template,
  markers,
  onChange,
  onReset,
  hasOverride,
  previewCode,
}: {
  template: CertificateTemplate;
  markers: TemplateTextPositions;
  onChange: (markers: TemplateTextPositions) => void;
  onReset: () => void;
  hasOverride: boolean;
  previewCode: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const [selectedKey, setSelectedKey] = useState<keyof TemplateTextPositions>("name");

  return (
    <div className="mt-2">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="inline-flex items-center gap-1 font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-900"
        >
          <SlidersHorizontal className="h-3 w-3" />
          {expanded ? "Hide placement" : "Adjust placement"}
        </button>
        {hasOverride && (
          <button
            type="button"
            onClick={onReset}
            className="font-mono text-[10px] text-zinc-400 underline hover:text-zinc-700"
          >
            Reset to template default
          </button>
        )}
      </div>

      {expanded && (
        <div className="mt-2 space-y-3 border border-zinc-200 bg-zinc-50 p-3">
          <div className="inline-flex h-7 border border-zinc-200 bg-white p-0.5">
            {(["name", "code"] as const).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedKey(key)}
                className={`h-full px-3 font-mono text-[10px] font-black uppercase tracking-widest transition-colors ${
                  selectedKey === key
                    ? "bg-zinc-950 text-white"
                    : "text-zinc-400 hover:text-zinc-950"
                }`}
              >
                {key === "name" ? "Name" : "Code"}
              </button>
            ))}
          </div>

          <MarkerCanvas
            imageUrl={template.imageUrl}
            imageWidth={template.imageWidth}
            imageHeight={template.imageHeight}
            textPositions={markers}
            onChange={onChange}
            selectedKey={selectedKey}
            onSelectKey={setSelectedKey}
            previewText={{ name: "Full Name", code: previewCode }}
          />
        </div>
      )}
    </div>
  );
}

/** Existing member OR a plain name+email for someone with no portal account
 *  — the toggle nothing else in this codebase needed until certificates,
 *  since every prior picker (RecognitionForm, TeamMembersTab, BadgeForm's
 *  manual-award lookup) only ever addressed existing members. */
function RecipientRow({
  row,
  onChange,
  onRemove,
  canRemove,
  previewTemplate,
  previewCode,
}: {
  row: RecipientRowState;
  onChange: (next: RecipientRowState) => void;
  onRemove: () => void;
  canRemove: boolean;
  previewTemplate: CertificateTemplate | null;
  previewCode: string;
}) {
  const effectiveMarkers = previewTemplate
    ? (row.textPositions ?? previewTemplate.textPositions)
    : null;
  return (
    <div className="border border-zinc-200 bg-white p-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex border border-zinc-200">
          <button
            type="button"
            onClick={() => onChange({ ...row, kind: "member" })}
            className={`px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest transition-colors ${
              row.kind === "member" ? "bg-zinc-950 text-white" : "text-zinc-400 hover:text-zinc-700"
            }`}
          >
            Existing member
          </button>
          <button
            type="button"
            onClick={() => onChange({ ...row, kind: "manual" })}
            className={`px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest transition-colors ${
              row.kind === "manual" ? "bg-zinc-950 text-white" : "text-zinc-400 hover:text-zinc-700"
            }`}
          >
            No account
          </button>
        </div>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="text-zinc-300 transition-colors hover:text-red-600"
            aria-label="Remove recipient"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div className="flex items-start gap-3">
        <div className="flex-1">
          {row.kind === "member" ? (
            <MemberPicker
              selected={row.member}
              onSelect={(member) => onChange({ ...row, member })}
            />
          ) : (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <Input
                value={row.name}
                onChange={(e) => onChange({ ...row, name: e.target.value })}
                placeholder="Recipient name"
                className={inputCls}
              />
              <Input
                type="email"
                value={row.email}
                onChange={(e) => onChange({ ...row, email: e.target.value })}
                placeholder="Recipient email"
                className={inputCls}
              />
            </div>
          )}
        </div>
        {previewTemplate && effectiveMarkers && (
          <RecipientPreviewThumbnail
            template={previewTemplate}
            markers={effectiveMarkers}
            name={rowDisplayName(row)}
            code={previewCode}
          />
        )}
      </div>

      {previewTemplate && effectiveMarkers && (
        <RecipientPlacementAdjuster
          template={previewTemplate}
          markers={effectiveMarkers}
          onChange={(next) => onChange({ ...row, textPositions: next })}
          onReset={() => onChange({ ...row, textPositions: null })}
          hasOverride={row.textPositions !== null}
          previewCode={previewCode}
        />
      )}
    </div>
  );
}

function isRowComplete(row: RecipientRowState): boolean {
  if (row.kind === "member") return Boolean(row.member);
  return Boolean(row.name.trim()) && Boolean(row.email.trim());
}

function rowToInput(row: RecipientRowState): CertificateRecipientInput {
  const identity =
    row.kind === "member" && row.member
      ? { username: row.member.username }
      : { recipientName: row.name.trim(), recipientEmail: row.email.trim() };
  return { ...identity, textPositions: row.textPositions ?? undefined };
}

// ─── Artwork preview (image or PDF) ────────────────────────────────────────

function ArtworkPreview({ url, pendingFile }: { url: string; pendingFile: File | null }) {
  const source = pendingFile ?? url;
  if (!source) return <ImagePlus className="h-10 w-10 text-zinc-200" />;
  if (isPdf(source)) {
    return (
      <div className="flex flex-col items-center gap-1.5 text-zinc-400">
        <FileText className="h-10 w-10" />
        <span className="font-mono text-[10px]">PDF</span>
      </div>
    );
  }
  const src = pendingFile ? URL.createObjectURL(pendingFile) : url;
  return (
    // biome-ignore lint/performance/noImgElement: blob preview / remote Cloudinary URL
    <img src={src} alt="Certificate artwork preview" className="h-full w-full object-contain p-4" />
  );
}

// ─── Batch artwork-generation results -- shown after Reserve, only when a
// template was used, since that's the only path that generates artwork
// automatically and can therefore partially fail. ──────────────────────────

interface BatchResultRow {
  certificate: Certificate;
  status: "pending" | "success" | "error";
  error?: string;
}

function ArtworkResultsSummary({
  results,
  onRetry,
  onDone,
}: {
  results: BatchResultRow[];
  onRetry: (certificate: Certificate) => void;
  onDone: () => void;
}) {
  const succeeded = results.filter((r) => r.status === "success").length;
  const failed = results.filter((r) => r.status === "error").length;
  const pending = results.filter((r) => r.status === "pending").length;

  return (
    <section className="border border-zinc-200 bg-white">
      <div className="border-b border-zinc-100 px-5 py-3">
        <h2 className="font-mono text-[10px] font-black uppercase tracking-widest text-zinc-400">
          Generating artwork from template
        </h2>
        <p className="mt-0.5 font-mono text-[10px] text-zinc-400">
          {pending > 0
            ? `${succeeded + failed}/${results.length} done…`
            : `${succeeded} succeeded${failed ? `, ${failed} failed` : ""}.`}
        </p>
      </div>
      <div className="divide-y divide-zinc-100">
        {results.map((r) => (
          <div key={r.certificate.id} className="flex items-center justify-between gap-3 px-5 py-3">
            <div className="min-w-0">
              <p className="truncate font-sans text-sm font-bold text-zinc-950">
                {r.certificate.recipientName}
              </p>
              <p className="truncate font-mono text-[10px] text-zinc-400">
                {r.certificate.verificationCode}
                {r.status === "error" && r.error ? ` — ${r.error}` : ""}
              </p>
            </div>
            {r.status === "pending" && (
              <Loader2 className="h-4 w-4 shrink-0 animate-spin text-zinc-300" />
            )}
            {r.status === "success" && (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            )}
            {r.status === "error" && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onRetry(r.certificate)}
                className="h-7 shrink-0 rounded-none border-red-200 font-mono text-[10px] font-bold text-red-600 hover:bg-red-50"
              >
                <XCircle className="h-3 w-3" />
                Retry
              </Button>
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-end px-5 py-3">
        <Button
          type="button"
          disabled={pending > 0}
          onClick={onDone}
          className="h-9 rounded-none bg-zinc-950 font-mono text-xs font-medium text-white hover:bg-zinc-800 disabled:opacity-40"
        >
          Continue to Certificates
        </Button>
      </div>
    </section>
  );
}

// ─── Main form ──────────────────────────────────────────────────────────────

export function CertificateForm({ editing }: { editing?: Certificate }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEdit = Boolean(editing);
  const create = useCreateCertificates();
  const update = useUpdateCertificate();

  const [recipients, setRecipients] = useState<RecipientRowState[]>(() => [newRecipientRow()]);
  const [certificateType, setCertificateType] = useState(editing?.certificateType ?? "Program");
  const [title, setTitle] = useState(editing?.title ?? "");
  const [programDetails, setProgramDetails] = useState(editing?.programDetails ?? "");
  const [issuedDate, setIssuedDate] = useState(editing?.issuedDate ?? "");
  const [artworkUrl, setArtworkUrl] = useState(editing?.artworkUrl ?? "");
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  // Create mode: optional template pick. Only active templates are usable
  // to issue against -- draft/archived ones are excluded from this picker.
  const { data: activeTemplates = [] } = useAdminCertificateTemplates("active", {
    enabled: !isEdit,
  });
  const [templateId, setTemplateId] = useState("");
  const selectedTemplate = activeTemplates.find((t) => t.id === templateId) ?? null;
  const previewCode = placeholderCode(issuedDate);

  // Edit mode: fetch the full template config for "Regenerate from template"
  // -- the certificate itself only carries templateId/templateName for
  // display, not the marker config needed to actually re-render.
  const { data: regenTemplate } = useCertificateTemplate(editing?.templateId ?? undefined);

  const [batchResults, setBatchResults] = useState<BatchResultRow[]>([]);

  const isSaving = create.isPending || update.isPending || uploading;
  const hasCompleteRecipient = isEdit || recipients.some(isRowComplete);
  const canSave =
    Boolean(title.trim()) &&
    Boolean(certificateType.trim()) &&
    Boolean(issuedDate) &&
    hasCompleteRecipient;

  function updateRow(id: string, next: RecipientRowState) {
    setRecipients((prev) => prev.map((row) => (row.id === id ? next : row)));
  }

  function removeRow(id: string) {
    setRecipients((prev) => prev.filter((row) => row.id !== id));
  }

  function validateFile(file: File): boolean {
    if (file.size > MAX_ARTWORK_BYTES) {
      toast.error("Certificate artwork must be 10 MB or smaller.");
      return false;
    }
    if (!["image/png", "image/jpeg", "image/webp", "application/pdf"].includes(file.type)) {
      toast.error("Use a PNG, JPEG, WebP, or PDF file.");
      return false;
    }
    return true;
  }

  function selectFile(file?: File) {
    if (!file || !validateFile(file)) return;
    setPendingFile(file);
  }

  async function runArtworkGeneration(certificates: Certificate[], template: CertificateTemplate) {
    setBatchResults(certificates.map((certificate) => ({ certificate, status: "pending" })));
    const outcomes = await Promise.allSettled(
      certificates.map((certificate) => generateArtworkFor(certificate, template))
    );
    setBatchResults(
      certificates.map((certificate, i) => {
        const outcome = outcomes[i];
        return outcome.status === "fulfilled"
          ? { certificate, status: "success" as const }
          : {
              certificate,
              status: "error" as const,
              error:
                outcome.reason instanceof Error
                  ? outcome.reason.message
                  : "Failed to generate artwork.",
            };
      })
    );
    // generateArtworkFor already PATCHed each certificate directly (not
    // through the useUpdateCertificate hook, since this runs outside any
    // component) -- invalidate here so the certificates list reflects the
    // new artwork immediately instead of showing what was cached before.
    queryClient.invalidateQueries({ queryKey: certificateKeys.all });
  }

  async function retryRow(certificate: Certificate) {
    if (!selectedTemplate) return;
    setBatchResults((prev) =>
      prev.map((r) => (r.certificate.id === certificate.id ? { ...r, status: "pending" } : r))
    );
    try {
      await generateArtworkFor(certificate, selectedTemplate);
      setBatchResults((prev) =>
        prev.map((r) => (r.certificate.id === certificate.id ? { ...r, status: "success" } : r))
      );
      queryClient.invalidateQueries({ queryKey: certificateKeys.all });
    } catch (err) {
      setBatchResults((prev) =>
        prev.map((r) =>
          r.certificate.id === certificate.id
            ? {
                ...r,
                status: "error",
                error: err instanceof Error ? err.message : "Failed to generate artwork.",
              }
            : r
        )
      );
    }
  }

  async function handleRegenerate() {
    if (!editing || !regenTemplate) return;
    setRegenerating(true);
    try {
      const uploadedUrl = await generateArtworkFor(editing, regenTemplate);
      setArtworkUrl(uploadedUrl);
      queryClient.invalidateQueries({ queryKey: certificateKeys.all });
      toast.success("Artwork regenerated from template.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not regenerate artwork.");
    } finally {
      setRegenerating(false);
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!canSave) return;

    try {
      if (editing) {
        let finalArtworkUrl = artworkUrl;
        if (pendingFile) {
          setUploading(true);
          try {
            finalArtworkUrl = await CertificatesService.uploadArtwork(pendingFile);
            setArtworkUrl(finalArtworkUrl);
            setPendingFile(null);
          } catch {
            setUploading(false);
            return; // axios interceptor already showed the toast
          }
          setUploading(false);
        }
        await update.mutateAsync({
          id: editing.id,
          data: {
            certificateType: certificateType.trim(),
            title: title.trim(),
            programDetails: programDetails.trim(),
            issuedDate,
            artworkUrl: finalArtworkUrl,
          },
        });
        toast.success("Certificate updated.");
        router.push("/admin/certificates");
      } else {
        const complete = recipients.filter(isRowComplete);
        const created = await create.mutateAsync({
          certificateType: certificateType.trim(),
          title: title.trim(),
          programDetails: programDetails.trim(),
          issuedDate,
          recipients: complete.map(rowToInput),
          templateId: templateId || undefined,
        });

        if (selectedTemplate) {
          toast.success(
            `Reserved ${created.length} certificate${created.length === 1 ? "" : "s"}. Generating artwork…`
          );
          await runArtworkGeneration(created, selectedTemplate);
        } else {
          toast.success(
            `Reserved ${created.length} certificate${created.length === 1 ? "" : "s"}. Upload artwork before publishing.`
          );
          router.push("/admin/certificates");
        }
      }
    } catch {
      // Axios interceptor already surfaces the error toast.
    }
  }

  if (batchResults.length > 0) {
    return (
      <div className="mx-auto w-full max-w-3xl pb-10">
        <header className="mb-6">
          <div className="mb-1 flex items-center gap-2">
            <ScrollText className="h-3.5 w-3.5 text-zinc-400" />
            <p className="font-mono text-xs font-medium text-zinc-400">Admin · Community</p>
          </div>
          <h1 className="font-sans text-4xl font-bold tracking-tight text-zinc-950">
            Issue Certificates
          </h1>
        </header>
        <ArtworkResultsSummary
          results={batchResults}
          onRetry={retryRow}
          onDone={() => router.push("/admin/certificates")}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl pb-10">
      <Link
        href="/admin/certificates"
        className="mb-6 inline-flex items-center gap-2 font-mono text-xs text-zinc-400 transition-colors hover:text-zinc-900"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Certificates
      </Link>

      <header className="mb-6">
        <div className="mb-1 flex items-center gap-2">
          <ScrollText className="h-3.5 w-3.5 text-zinc-400" />
          <p className="font-mono text-xs font-medium text-zinc-400">Admin · Community</p>
        </div>
        <h1 className="font-sans text-4xl font-bold tracking-tight text-zinc-950">
          {isEdit ? "Edit Certificate" : "Issue Certificates"}
        </h1>
        <p className="mt-1.5 font-mono text-xs text-zinc-400">
          {isEdit
            ? "Upload the finished artwork here once the design team hands it back, then publish it from the list."
            : "Reserves a verification code for each recipient up front, before any artwork exists — hand the codes to the design team, then come back to upload. Or pick a template and skip that entirely."}
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Recipients */}
        <section className="border border-zinc-200 bg-white">
          <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-3">
            <h2 className="font-mono text-[10px] font-black uppercase tracking-widest text-zinc-400">
              Recipient{!isEdit && "s"}
            </h2>
            {!isEdit && (
              <button
                type="button"
                onClick={() => setRecipients((prev) => [...prev, newRecipientRow()])}
                className="inline-flex items-center gap-1 font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-900"
              >
                <Plus className="h-3 w-3" />
                Add recipient
              </button>
            )}
          </div>
          <div className="space-y-3 p-5">
            {isEdit ? (
              <div className="border border-zinc-200 px-3 py-2.5">
                <p className="truncate font-sans text-sm font-bold text-zinc-950">
                  {editing?.recipientName}
                </p>
                <p className="truncate font-mono text-[11px] text-zinc-400">
                  {editing?.username ? `@${editing.username} · ` : ""}
                  {editing?.recipientEmail} · can't be reassigned
                </p>
              </div>
            ) : (
              recipients.map((row) => (
                <RecipientRow
                  key={row.id}
                  row={row}
                  onChange={(next) => updateRow(row.id, next)}
                  onRemove={() => removeRow(row.id)}
                  canRemove={recipients.length > 1}
                  previewTemplate={selectedTemplate}
                  previewCode={previewCode}
                />
              ))
            )}
          </div>
        </section>

        {/* The certificate */}
        <section className="border border-zinc-200 bg-white">
          <div className="border-b border-zinc-100 px-5 py-3">
            <h2 className="font-mono text-[10px] font-black uppercase tracking-widest text-zinc-400">
              The certificate
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label className={labelCls}>Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Full-Stack Web Development Bootcamp — Cohort 4"
                className={inputCls}
              />
            </div>

            <div className="space-y-1.5">
              <Label className={labelCls}>Type</Label>
              <Input
                list="certificate-type-suggestions"
                value={certificateType}
                onChange={(e) => setCertificateType(e.target.value)}
                placeholder="Program"
                className={inputCls}
              />
              <datalist id="certificate-type-suggestions">
                {SUGGESTED_CERTIFICATE_TYPES.map((option) => (
                  <option key={option} value={option} />
                ))}
              </datalist>
              <p className="font-mono text-[10px] text-zinc-400">
                Pick a suggestion or type your own — it&rsquo;s free text, not a fixed list.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label className={labelCls}>Issued date</Label>
              <Input
                type="date"
                value={issuedDate}
                onChange={(e) => setIssuedDate(e.target.value)}
                className={inputCls}
              />
              <p className="font-mono text-[10px] text-zinc-400">
                The date printed on the certificate.
              </p>
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label className={labelCls}>Program details</Label>
              <textarea
                value={programDetails}
                onChange={(e) => setProgramDetails(e.target.value)}
                rows={3}
                placeholder="Dates, description, cohort — whatever's worth keeping on record."
                className={textareaCls}
              />
            </div>

            {/* Template pick -- create mode only. Unset preserves the manual
                upload-later flow exactly. */}
            {!isEdit && (
              <div className="space-y-1.5 sm:col-span-2">
                <Label className={labelCls}>Certificate template</Label>
                <select
                  value={templateId}
                  onChange={(e) => setTemplateId(e.target.value)}
                  className="h-9 w-full border border-zinc-200 bg-white px-3 font-mono text-xs text-zinc-700 outline-none focus:border-zinc-950"
                >
                  <option value="">None — upload artwork manually</option>
                  {activeTemplates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
                <p className="font-mono text-[10px] text-zinc-400">
                  {selectedTemplate
                    ? "Artwork is generated automatically for every recipient once you reserve."
                    : "Optional — pick a template to skip manual artwork upload entirely."}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Artwork — edit mode only, since nothing exists until a code has been reserved */}
        {isEdit && (
          <section className="border border-zinc-200 bg-white">
            <div className="border-b border-zinc-100 px-5 py-3">
              <h2 className="font-mono text-[10px] font-black uppercase tracking-widest text-zinc-400">
                Artwork
              </h2>
              <p className="mt-0.5 font-mono text-[10px] text-zinc-400">
                Verification code:{" "}
                <span className="font-bold text-zinc-600">{editing?.verificationCode}</span> — give
                this to the design team so it can be baked into the file.
              </p>
            </div>
            <div className="flex items-center gap-4 p-5">
              <div className="flex h-24 w-32 shrink-0 items-center justify-center border border-dashed border-zinc-200 bg-zinc-50">
                <ArtworkPreview url={artworkUrl} pendingFile={pendingFile} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="inline-flex w-fit cursor-pointer items-center gap-1.5 border border-zinc-200 px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-600 transition-colors hover:border-zinc-400">
                  {pendingFile || artworkUrl ? "Change artwork" : "Upload artwork"}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,application/pdf"
                    className="hidden"
                    onChange={(e) => selectFile(e.target.files?.[0])}
                  />
                </label>
                <p className="font-mono text-[10px] text-zinc-400">
                  PNG, JPEG, WebP, or PDF. Up to 10 MB.
                </p>
                {editing?.templateId && editing.status === "pending" && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!regenTemplate || regenerating}
                    onClick={handleRegenerate}
                    className="mt-1.5 h-8 w-fit rounded-none font-mono text-[10px] font-bold"
                  >
                    <RefreshCw className={`h-3 w-3 ${regenerating ? "animate-spin" : ""}`} />
                    {regenerating ? "Regenerating…" : `Regenerate from "${editing.templateName}"`}
                  </Button>
                )}
              </div>
            </div>
          </section>
        )}

        <div className="flex items-center justify-end gap-3">
          <Link
            href="/admin/certificates"
            className="font-mono text-xs text-zinc-400 transition-colors hover:text-zinc-900"
          >
            Cancel
          </Link>
          <Button
            type="submit"
            disabled={!canSave || isSaving}
            className="h-9 rounded-none bg-zinc-950 font-mono text-xs font-medium text-white hover:bg-zinc-800 disabled:opacity-40"
          >
            {isSaving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            {isEdit ? "Save Changes" : "Reserve Certificates"}
          </Button>
        </div>
      </form>
    </div>
  );
}

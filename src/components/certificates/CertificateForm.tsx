"use client";

import { ArrowLeft, FileText, ImagePlus, Loader2, Plus, Save, ScrollText, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { MemberPicker } from "@/components/members/MemberPicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateCertificates, useUpdateCertificate } from "@/hooks/useCertificates";
import { CertificatesService } from "@/services/certificates.service";
import type { CommunityMember } from "@/services/user.service";
import {
  type Certificate,
  type CertificateRecipientInput,
  SUGGESTED_CERTIFICATE_TYPES,
} from "@/types/certificates.types";

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

// ─── Recipient row (create mode only) ──────────────────────────────────────

interface RecipientRowState {
  id: string;
  kind: "member" | "manual";
  member: CommunityMember | null;
  name: string;
  email: string;
}

function newRecipientRow(): RecipientRowState {
  return { id: crypto.randomUUID(), kind: "member", member: null, name: "", email: "" };
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
}: {
  row: RecipientRowState;
  onChange: (next: RecipientRowState) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
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

      {row.kind === "member" ? (
        <MemberPicker selected={row.member} onSelect={(member) => onChange({ ...row, member })} />
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
  );
}

function isRowComplete(row: RecipientRowState): boolean {
  if (row.kind === "member") return Boolean(row.member);
  return Boolean(row.name.trim()) && Boolean(row.email.trim());
}

function rowToInput(row: RecipientRowState): CertificateRecipientInput {
  return row.kind === "member" && row.member
    ? { username: row.member.username }
    : { recipientName: row.name.trim(), recipientEmail: row.email.trim() };
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

// ─── Main form ──────────────────────────────────────────────────────────────

export function CertificateForm({ editing }: { editing?: Certificate }) {
  const router = useRouter();
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
      } else {
        const complete = recipients.filter(isRowComplete);
        const created = await create.mutateAsync({
          certificateType: certificateType.trim(),
          title: title.trim(),
          programDetails: programDetails.trim(),
          issuedDate,
          recipients: complete.map(rowToInput),
        });
        toast.success(
          `Reserved ${created.length} certificate${created.length === 1 ? "" : "s"}. Upload artwork before publishing.`
        );
      }
      router.push("/admin/certificates");
    } catch {
      // Axios interceptor already surfaces the error toast.
    }
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
            : "Reserves a verification code for each recipient up front, before any artwork exists — hand the codes to the design team, then come back to upload."}
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

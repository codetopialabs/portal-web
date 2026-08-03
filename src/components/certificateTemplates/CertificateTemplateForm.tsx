"use client";

import { AlertTriangle, ArrowLeft, Eye, ImagePlus, Save, Trash2, Upload } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { MarkerCanvas, MarkerStylePanel } from "@/components/certificateTemplates/MarkerEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useCreateCertificateTemplate,
  useDeleteCertificateTemplate,
  useUpdateCertificateTemplate,
} from "@/hooks/useCertificateTemplates";
import { usePermission } from "@/hooks/usePermission";
import { CertificateTemplatesService } from "@/services/certificateTemplates.service";
import {
  MAX_TEMPLATE_DIMENSION,
  type CertificateTemplate,
  type CertificateTemplateInput,
  type CertificateTemplateStatus,
  type TemplateMarker,
  type TemplateTextPositions,
} from "@/types/certificateTemplates.types";

// Deliberately long, so the true-render preview surfaces overflow before an
// admin ever issues against this template with a real (possibly long) name.
const TEST_PREVIEW_NAME = "Alessandra Konstantinopoulos-Whitmore";
const TEST_PREVIEW_CODE = "CT-26-XXXX-XXXX-XXXX";

const MARKER_LABEL: Record<keyof TemplateTextPositions, string> = {
  name: "Name",
  code: "Verification code",
};

function defaultMarker(overrides: Partial<TemplateMarker> = {}): TemplateMarker {
  return {
    x: 0.5,
    y: 0.5,
    align: "center",
    fontFamily: "Inter",
    fontWeight: 400,
    fontSizeRatio: 0.05,
    color: "#1a1a1a",
    maxWidthRatio: 0.6,
    ...overrides,
  };
}

function defaultTextPositions(): TemplateTextPositions {
  return {
    name: defaultMarker({ y: 0.55, fontSizeRatio: 0.05, fontWeight: 700 }),
    code: defaultMarker({ y: 0.85, fontSizeRatio: 0.02, fontFamily: "JetBrains Mono" }),
  };
}

function readImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => reject(new Error("Could not read image dimensions."));
    img.src = URL.createObjectURL(file);
  });
}

// ─── Main form ──────────────────────────────────────────────────────────────

export function CertificateTemplateForm({ template }: { template?: CertificateTemplate }) {
  const router = useRouter();
  const create = useCreateCertificateTemplate();
  const update = useUpdateCertificateTemplate();
  const deleteTemplate = useDeleteCertificateTemplate();
  const canDelete = usePermission("certificate_templates.delete");

  const [name, setName] = useState(template?.name ?? "");
  const [certificateType, setCertificateType] = useState(template?.certificateType ?? "");
  const [status, setStatus] = useState<CertificateTemplateStatus>(template?.status ?? "draft");
  const [imageUrl, setImageUrl] = useState(template?.imageUrl ?? "");
  const [imageWidth, setImageWidth] = useState(template?.imageWidth ?? 0);
  const [imageHeight, setImageHeight] = useState(template?.imageHeight ?? 0);
  const [imageUploading, setImageUploading] = useState(false);
  const [textPositions, setTextPositions] = useState<TemplateTextPositions>(
    template?.textPositions ?? defaultTextPositions()
  );
  const [selectedKey, setSelectedKey] = useState<keyof TemplateTextPositions>("name");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const hasImage = Boolean(imageUrl) && imageWidth > 0 && imageHeight > 0;
  const hasRequiredFields = Boolean(name.trim() && hasImage);

  // Uploaded immediately, not deferred until Save -- the true-render preview
  // fetches this URL server-side, so it needs to be a real, reachable
  // Cloudinary URL as soon as a marker can be placed, not a browser-only
  // blob: URL that would only resolve in this tab.
  const selectFile = async (file?: File) => {
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Template image must be 8 MB or smaller.");
      return;
    }
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      toast.error("Use a PNG, JPEG, or WebP image.");
      return;
    }
    setImageUploading(true);
    try {
      const { width, height } = await readImageDimensions(file);
      if (width > MAX_TEMPLATE_DIMENSION || height > MAX_TEMPLATE_DIMENSION) {
        toast.error(
          `Template image must be ${MAX_TEMPLATE_DIMENSION}px or smaller on each side (this one is ${width}x${height}).`
        );
        return;
      }
      const uploadedUrl = await CertificateTemplatesService.uploadImage(file);
      setImageWidth(width);
      setImageHeight(height);
      setImageUrl(uploadedUrl);
      setPreviewUrl(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not upload that image.");
    } finally {
      setImageUploading(false);
    }
  };

  const runTruePreview = async (): Promise<boolean> => {
    if (!hasImage) return false;
    setPreviewLoading(true);
    try {
      const blob = await CertificateTemplatesService.renderPreview({
        imageUrl,
        imageWidth,
        imageHeight,
        markers: textPositions,
        name: TEST_PREVIEW_NAME,
        code: TEST_PREVIEW_CODE,
      });
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return URL.createObjectURL(blob);
      });
      return true;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Preview render failed.");
      return false;
    } finally {
      setPreviewLoading(false);
    }
  };

  const submit = async () => {
    if (!hasRequiredFields) return toast.error("Add a name and a template image.");

    // Re-run the true render right before saving -- catches a marker
    // pointed off-canvas or a font/color mistake before the template goes
    // live, not after the first certificate is issued against it.
    const ok = await runTruePreview();
    if (!ok) return;

    const input: CertificateTemplateInput = {
      name: name.trim(),
      certificateType: certificateType.trim(),
      imageUrl,
      imageWidth,
      imageHeight,
      textPositions,
      status,
    };

    try {
      const saved = template
        ? await update.mutateAsync({ id: template.id, input })
        : await create.mutateAsync(input);
      toast.success(template ? "Template updated." : "Template created.");
      router.push(`/admin/certificate-templates/${saved.id}/edit`);
    } catch {
      /* axios interceptor already showed the toast */
    }
  };

  const handleDelete = async () => {
    if (!template) return;
    try {
      await deleteTemplate.mutateAsync(template.id);
      toast.success(
        template.certificateCount > 0
          ? "Archived — it had certificates issued from it."
          : "Deleted."
      );
      router.push("/admin/certificate-templates");
    } catch {
      /* axios interceptor already showed the toast */
    }
  };

  const isSaving = previewLoading || create.isPending || update.isPending;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/admin/certificate-templates"
            className="inline-flex items-center gap-1.5 font-mono text-xs text-zinc-400 hover:text-zinc-950 transition-colors"
          >
            <ArrowLeft className="h-3 w-3" />
            Certificate Templates
          </Link>
          <h1 className="mt-3 font-sans text-3xl font-black uppercase tracking-widest text-zinc-950">
            {template ? "Edit template" : "New template"}
          </h1>
          {template && (
            <p className="mt-1 font-mono text-xs text-zinc-400">
              <span className="font-bold">{template.certificateCount}</span> certificate
              {template.certificateCount !== 1 ? "s" : ""} issued from this template
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {template && canDelete && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 rounded-none font-mono text-xs font-bold text-red-600 border-red-200 hover:bg-red-50 hover:border-red-400"
              onClick={() => setConfirmDelete(true)}
              disabled={deleteTemplate.isPending}
            >
              <Trash2 className="h-3.5 w-3.5" />
              {template.certificateCount > 0 ? "Archive" : "Delete"}
            </Button>
          )}
          <Button
            onClick={submit}
            disabled={isSaving}
            className="h-9 rounded-none font-mono text-xs font-bold"
          >
            <Save className="h-3.5 w-3.5" />
            {isSaving ? "Saving…" : "Save template"}
          </Button>
        </div>
      </div>

      {confirmDelete && (
        <div className="flex items-start gap-4 border border-red-200 bg-red-50 p-5">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
          <div className="flex-1">
            <p className="font-mono text-xs font-bold text-red-700">
              {template && template.certificateCount > 0
                ? `This template has issued ${template.certificateCount} certificate${template.certificateCount === 1 ? "" : "s"}. It will be archived (not deleted), keeping those certificates' history intact.`
                : "This template has no certificates and will be permanently deleted."}
            </p>
            <div className="mt-3 flex gap-2">
              <Button
                type="button"
                size="sm"
                className="h-8 rounded-none font-mono text-xs font-bold bg-red-600 hover:bg-red-700"
                onClick={handleDelete}
                disabled={deleteTemplate.isPending}
              >
                {deleteTemplate.isPending ? "Removing…" : "Confirm"}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 rounded-none font-mono text-xs"
                onClick={() => setConfirmDelete(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px] items-start">
        {/* Left column -- upload + marker editor */}
        <div className="space-y-6">
          <section className="border border-zinc-200 bg-white">
            <div className="border-b border-zinc-100 px-5 py-3">
              <h2 className="font-mono text-[10px] font-black uppercase tracking-widest text-zinc-400">
                Template identity
              </h2>
            </div>
            <div className="grid gap-5 p-5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                  Name
                </Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Bootcamp Completion — 2026"
                  className="h-9 rounded-none font-mono text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                  Status
                </Label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as CertificateTemplateStatus)}
                  className="h-9 w-full border border-zinc-200 bg-white px-3 font-mono text-xs text-zinc-700 outline-none focus:border-zinc-950"
                >
                  <option value="draft">Draft — not yet usable</option>
                  <option value="active">Active — usable when issuing</option>
                  <option value="archived">Archived — retired</option>
                </select>
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                  Suggested certificate type
                </Label>
                <Input
                  value={certificateType}
                  onChange={(e) => setCertificateType(e.target.value)}
                  placeholder="e.g. Bootcamp — free text, just a hint for the issuing form"
                  className="h-9 rounded-none font-mono text-xs"
                />
              </div>
            </div>
          </section>

          <section className="border border-zinc-200 bg-white">
            <div className="flex items-center justify-between gap-4 border-b border-zinc-100 px-5 py-3">
              <div>
                <h2 className="font-mono text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  Marker placement
                </h2>
                <p className="mt-0.5 font-mono text-[10px] text-zinc-400">
                  Drag each crosshair to where that text should land.
                </p>
              </div>
              <div className="inline-flex h-8 border border-zinc-200 bg-white p-0.5">
                {(Object.keys(MARKER_LABEL) as Array<keyof TemplateTextPositions>).map((key) => (
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
                    {MARKER_LABEL[key]}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-5 space-y-5">
              {!hasImage ? (
                <label
                  className={`flex aspect-[4/3] flex-col items-center justify-center gap-2 border border-dashed border-zinc-300 bg-zinc-50 text-center ${imageUploading ? "cursor-wait opacity-60" : "cursor-pointer hover:border-zinc-400"}`}
                >
                  <ImagePlus className="h-8 w-8 text-zinc-300" />
                  <span className="font-mono text-xs font-bold text-zinc-500">
                    {imageUploading ? "Uploading…" : "Upload the blank template artwork"}
                  </span>
                  <span className="font-mono text-[10px] text-zinc-400">
                    PNG, JPEG, or WebP · 8 MB max
                  </span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="sr-only"
                    disabled={imageUploading}
                    onChange={(e) => selectFile(e.target.files?.[0])}
                  />
                </label>
              ) : (
                <>
                  <MarkerCanvas
                    imageUrl={imageUrl}
                    imageWidth={imageWidth}
                    imageHeight={imageHeight}
                    textPositions={textPositions}
                    onChange={setTextPositions}
                    selectedKey={selectedKey}
                    onSelectKey={setSelectedKey}
                    previewText={{ name: "Full Name", code: TEST_PREVIEW_CODE }}
                  />

                  <label
                    className={`flex h-9 w-fit items-center gap-2 border border-zinc-200 px-3 font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-600 ${imageUploading ? "cursor-wait opacity-60" : "cursor-pointer hover:border-zinc-400"}`}
                  >
                    <Upload className="h-3.5 w-3.5" />
                    {imageUploading ? "Uploading…" : "Replace image"}
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="sr-only"
                      disabled={imageUploading}
                      onChange={(e) => selectFile(e.target.files?.[0])}
                    />
                  </label>

                  <div className="border-t border-zinc-100 pt-5">
                    <p className="mb-3 font-mono text-[10px] font-black uppercase tracking-widest text-zinc-400">
                      Styling — {MARKER_LABEL[selectedKey]}
                    </p>
                    <MarkerStylePanel
                      marker={textPositions[selectedKey]}
                      onChange={(marker) =>
                        setTextPositions((prev) => ({ ...prev, [selectedKey]: marker }))
                      }
                    />
                  </div>
                </>
              )}
            </div>
          </section>
        </div>

        {/* Right column -- true render preview */}
        <aside className="space-y-5 lg:sticky lg:top-6">
          <section className="border border-zinc-200 bg-white">
            <div className="flex items-center justify-between gap-2 border-b border-zinc-100 px-5 py-3">
              <h2 className="font-mono text-[10px] font-black uppercase tracking-widest text-zinc-400">
                True preview
              </h2>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!hasImage || previewLoading}
                onClick={() => runTruePreview()}
                className="h-7 rounded-none font-mono text-[10px] font-bold"
              >
                <Eye className={`h-3 w-3 ${previewLoading ? "animate-pulse" : ""}`} />
                {previewLoading ? "Rendering…" : "Render"}
              </Button>
            </div>
            <div className="flex aspect-[4/3] items-center justify-center overflow-hidden border-b border-zinc-100 bg-zinc-50 p-3">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="True render preview"
                  className="h-full w-full object-contain"
                />
              ) : (
                <p className="px-4 text-center font-mono text-[10px] text-zinc-400">
                  Render to see the actual satori-composited output with a deliberately long test
                  name, catching overflow before it's real.
                </p>
              )}
            </div>
            <p className="p-4 font-mono text-[10px] leading-5 text-zinc-400">
              Uses a placeholder name/code — real per-recipient previews happen when issuing
              certificates against this template.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}

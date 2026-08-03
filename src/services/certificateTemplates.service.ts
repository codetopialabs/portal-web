import axiosInstance from "@/lib/axios";
import type { ApiResponse } from "@/types/api.types";
import type {
  CertificateTemplate,
  CertificateTemplateInput,
  CertificateTemplateStatus,
  TemplateTextPositions,
} from "@/types/certificateTemplates.types";

const BASE = "/certificates/templates";

interface UploadSignature {
  signature: string;
  timestamp: number;
  cloudName: string;
  apiKey: string;
  folder: string;
}

function toPayload(data: Partial<CertificateTemplateInput>) {
  return {
    ...(data.name !== undefined ? { name: data.name } : {}),
    ...(data.certificateType !== undefined ? { certificate_type: data.certificateType } : {}),
    ...(data.imageUrl !== undefined ? { image_url: data.imageUrl } : {}),
    ...(data.imageWidth !== undefined ? { image_width: data.imageWidth } : {}),
    ...(data.imageHeight !== undefined ? { image_height: data.imageHeight } : {}),
    // text_positions' marker keys (fontFamily, fontSizeRatio, ...) are
    // deliberately left camelCase -- the backend's JSON parser is configured
    // to skip this field so the opaque blob survives untouched.
    ...(data.textPositions !== undefined ? { text_positions: data.textPositions } : {}),
    ...(data.status !== undefined ? { status: data.status } : {}),
  };
}

export const CertificateTemplatesService = {
  async listAdmin(status?: CertificateTemplateStatus | ""): Promise<CertificateTemplate[]> {
    const res = await axiosInstance.get<ApiResponse<CertificateTemplate[]>>(`${BASE}/admin/`, {
      params: { status: status || undefined },
    });
    return res.data.data;
  },

  async get(id: string): Promise<CertificateTemplate> {
    const res = await axiosInstance.get<ApiResponse<CertificateTemplate>>(`${BASE}/admin/${id}/`);
    return res.data.data;
  },

  async create(input: CertificateTemplateInput): Promise<CertificateTemplate> {
    const res = await axiosInstance.post<ApiResponse<CertificateTemplate>>(
      `${BASE}/admin/`,
      toPayload(input)
    );
    return res.data.data;
  },

  async update(id: string, input: Partial<CertificateTemplateInput>): Promise<CertificateTemplate> {
    const res = await axiosInstance.patch<ApiResponse<CertificateTemplate>>(
      `${BASE}/admin/${id}/`,
      toPayload(input)
    );
    return res.data.data;
  },

  async remove(id: string): Promise<void> {
    await axiosInstance.delete(`${BASE}/admin/${id}/`);
  },

  /** Same signed-Cloudinary-upload flow as CertificatesService.uploadArtwork,
   * routed to its own folder via the "certificate_template" upload type. */
  async uploadImage(file: File): Promise<string> {
    const sigRes = await axiosInstance.get<ApiResponse<UploadSignature>>(
      "/auth/cloudinary-signature/?type=certificate_template"
    );
    const sig = sigRes.data.data;
    const form = new FormData();
    form.append("file", file);
    form.append("api_key", sig.apiKey);
    form.append("timestamp", String(sig.timestamp));
    form.append("signature", sig.signature);
    form.append("folder", sig.folder);
    const res = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`, {
      method: "POST",
      body: form,
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message ?? "Template image upload failed.");
    return json.secure_url as string;
  },

  /** Calls this app's own /api/certificates/render route (not the Django
   * backend) -- one code path serves both the live editor preview and the
   * final artwork render, so it's a plain fetch rather than axiosInstance. */
  async renderPreview(params: {
    imageUrl: string;
    imageWidth: number;
    imageHeight: number;
    markers: TemplateTextPositions;
    name: string;
    code: string;
  }): Promise<Blob> {
    const res = await fetch("/api/certificates/render", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      throw new Error(body?.detail ?? "Preview render failed.");
    }
    return res.blob();
  },
};

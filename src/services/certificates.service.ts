import axiosInstance from "@/lib/axios";
import type { ApiResponse } from "@/types/api.types";
import type {
  Certificate,
  CertificateBatchInput,
  CertificateEditInput,
  CertificateStatus,
} from "@/types/certificates.types";

const BASE = "/certificates";

interface UploadSignature {
  signature: string;
  timestamp: number;
  cloudName: string;
  apiKey: string;
  folder: string;
}

function toBatchPayload(data: CertificateBatchInput) {
  return {
    certificate_type: data.certificateType,
    title: data.title,
    program_details: data.programDetails ?? "",
    issued_date: data.issuedDate,
    recipients: data.recipients.map((recipient) =>
      "username" in recipient
        ? { username: recipient.username }
        : { recipient_name: recipient.recipientName, recipient_email: recipient.recipientEmail }
    ),
  };
}

function toEditPayload(data: CertificateEditInput) {
  return {
    ...(data.certificateType !== undefined ? { certificate_type: data.certificateType } : {}),
    ...(data.title !== undefined ? { title: data.title } : {}),
    ...(data.programDetails !== undefined ? { program_details: data.programDetails } : {}),
    ...(data.issuedDate !== undefined ? { issued_date: data.issuedDate } : {}),
    ...(data.artworkUrl !== undefined ? { artwork_url: data.artworkUrl } : {}),
  };
}

export const CertificatesService = {
  async listForAdmin(params?: {
    status?: CertificateStatus | "";
    certificateType?: string;
    search?: string;
  }): Promise<Certificate[]> {
    const res = await axiosInstance.get<ApiResponse<Certificate[]>>(`${BASE}/admin/`, {
      params: {
        status: params?.status,
        certificate_type: params?.certificateType,
        search: params?.search,
      },
    });
    return res.data.data;
  },

  async get(id: string): Promise<Certificate> {
    const res = await axiosInstance.get<ApiResponse<Certificate>>(`${BASE}/admin/${id}/`);
    return res.data.data;
  },

  /** Issues one certificate per recipient in a single call, one code each. */
  async batchCreate(data: CertificateBatchInput): Promise<Certificate[]> {
    const res = await axiosInstance.post<ApiResponse<Certificate[]>>(
      `${BASE}/admin/`,
      toBatchPayload(data)
    );
    return res.data.data;
  },

  async update(id: string, data: CertificateEditInput): Promise<Certificate> {
    const res = await axiosInstance.patch<ApiResponse<Certificate>>(
      `${BASE}/admin/${id}/`,
      toEditPayload(data)
    );
    return res.data.data;
  },

  async remove(id: string): Promise<void> {
    await axiosInstance.delete(`${BASE}/admin/${id}/`);
  },

  async publish(id: string): Promise<Certificate> {
    const res = await axiosInstance.post<ApiResponse<Certificate>>(
      `${BASE}/admin/${id}/publish/`,
      {}
    );
    return res.data.data;
  },

  async revoke(id: string, reason: string): Promise<Certificate> {
    const res = await axiosInstance.post<ApiResponse<Certificate>>(`${BASE}/admin/${id}/revoke/`, {
      reason,
    });
    return res.data.data;
  },

  /** Same signed-Cloudinary-upload flow as BadgesService.uploadArtwork --
   * the file goes straight to Cloudinary, only the resulting URL comes back
   * here to be PATCHed onto the certificate. */
  async uploadArtwork(file: File): Promise<string> {
    const sigRes = await axiosInstance.get<ApiResponse<UploadSignature>>(
      "/auth/cloudinary-signature/?type=certificate"
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
    if (!res.ok) throw new Error(json.error?.message ?? "Artwork upload failed.");
    return json.secure_url as string;
  },
};

import axiosInstance from "@/lib/axios";
import type { ApiResponse } from "@/types/api.types";
import type { Badge, BadgeAward, BadgeCriteriaCatalog, BadgeInput } from "@/types/badges.types";

const BASE = "/badges";

interface UploadSignature {
  signature: string;
  timestamp: number;
  cloudName: string;
  apiKey: string;
  folder: string;
}

export const BadgesService = {
  async listAdmin(): Promise<Badge[]> {
    const res = await axiosInstance.get<ApiResponse<Badge[]>>(`${BASE}/admin/`);
    return res.data.data;
  },
  async get(slug: string): Promise<Badge> {
    const res = await axiosInstance.get<ApiResponse<Badge>>(`${BASE}/admin/${slug}/`);
    return res.data.data;
  },
  async create(input: BadgeInput): Promise<Badge> {
    const res = await axiosInstance.post<ApiResponse<Badge>>(`${BASE}/admin/`, input);
    return res.data.data;
  },
  async update(slug: string, input: Partial<BadgeInput>): Promise<Badge> {
    const res = await axiosInstance.patch<ApiResponse<Badge>>(`${BASE}/admin/${slug}/`, input);
    return res.data.data;
  },
  async remove(slug: string): Promise<void> {
    await axiosInstance.delete(`${BASE}/admin/${slug}/`);
  },
  async criteriaCatalog(): Promise<BadgeCriteriaCatalog> {
    const res = await axiosInstance.get<ApiResponse<BadgeCriteriaCatalog>>(
      `${BASE}/admin/criteria/`,
      { silentError: true } // 403 is handled inline in BadgeForm
    );
    return res.data.data;
  },
  async preview(input: BadgeInput): Promise<{ count: number }> {
    const res = await axiosInstance.post<ApiResponse<{ count: number }>>(
      `${BASE}/admin/preview/`,
      input
    );
    return res.data.data;
  },
  async reconcile(slug: string): Promise<{ awarded: number }> {
    const res = await axiosInstance.post<ApiResponse<{ awarded: number }>>(
      `${BASE}/admin/${slug}/reconcile/`
    );
    return res.data.data;
  },
  async mine(): Promise<BadgeAward[]> {
    const res = await axiosInstance.get<ApiResponse<BadgeAward[]>>(`${BASE}/me/`);
    return res.data.data;
  },
  async member(username: string): Promise<BadgeAward[]> {
    const res = await axiosInstance.get<ApiResponse<BadgeAward[]>>(`${BASE}/members/${username}/`);
    return res.data.data;
  },
  async pending(): Promise<BadgeAward[]> {
    const res = await axiosInstance.get<ApiResponse<BadgeAward[]>>(`${BASE}/me/pending/`);
    return res.data.data;
  },
  async markSeen(awardIds: string[]): Promise<void> {
    await axiosInstance.post(`${BASE}/me/pending/`, { awardIds });
  },
  async feature(awardIds: string[]): Promise<BadgeAward[]> {
    const res = await axiosInstance.put<ApiResponse<BadgeAward[]>>(`${BASE}/me/featured/`, {
      awardIds,
    });
    return res.data.data;
  },
  async uploadArtwork(file: File): Promise<string> {
    const sigRes = await axiosInstance.get<ApiResponse<UploadSignature>>(
      "/auth/cloudinary-signature/?type=badge"
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
  async award(slug: string, userId: string, reason: string): Promise<void> {
    await axiosInstance.post(`${BASE}/admin/${slug}/award/`, { userId, reason });
  },
  async revoke(awardId: string, reason: string): Promise<void> {
    await axiosInstance.post(`${BASE}/admin/awards/${awardId}/revoke/`, { reason });
  },
};

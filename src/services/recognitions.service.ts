import axiosInstance from "@/lib/axios";
import type { ApiResponse } from "@/types/api.types";
import type {
  Recognition,
  RecognitionCategoryOption,
  RecognitionInput,
  RecognitionStatus,
} from "@/types/recognitions.types";

const BASE = "/recognitions";

function toPayload(data: RecognitionInput) {
  return {
    ...(data.username ? { username: data.username } : {}),
    category: data.category,
    award_name: data.awardName,
    period: data.period,
    period_start: data.periodStart || null,
    period_end: data.periodEnd || null,
    impact_summary: data.impactSummary,
    achievements: data.achievements,
    domain: data.domain ?? "",
    role_label: data.roleLabel ?? "",
    featured_rank: data.featuredRank ?? null,
  };
}

export const RecognitionsService = {
  async listForAdmin(params?: {
    status?: RecognitionStatus | "";
    category?: string;
    search?: string;
  }): Promise<Recognition[]> {
    const res = await axiosInstance.get<ApiResponse<Recognition[]>>(`${BASE}/admin/`, { params });
    return res.data.data;
  },

  async get(id: string): Promise<Recognition> {
    const res = await axiosInstance.get<ApiResponse<Recognition>>(`${BASE}/admin/${id}/`);
    return res.data.data;
  },

  async listCategories(): Promise<RecognitionCategoryOption[]> {
    const res = await axiosInstance.get<ApiResponse<{ categories: RecognitionCategoryOption[] }>>(
      `${BASE}/admin/categories/`
    );
    return res.data.data.categories;
  },

  async create(data: RecognitionInput): Promise<Recognition> {
    const res = await axiosInstance.post<ApiResponse<Recognition>>(
      `${BASE}/admin/`,
      toPayload(data)
    );
    return res.data.data;
  },

  async update(id: string, data: RecognitionInput): Promise<Recognition> {
    const res = await axiosInstance.patch<ApiResponse<Recognition>>(
      `${BASE}/admin/${id}/`,
      toPayload(data)
    );
    return res.data.data;
  },

  async remove(id: string): Promise<void> {
    await axiosInstance.delete(`${BASE}/admin/${id}/`);
  },

  async publish(id: string): Promise<Recognition> {
    const res = await axiosInstance.post<ApiResponse<Recognition>>(
      `${BASE}/admin/${id}/publish/`,
      {}
    );
    return res.data.data;
  },

  async revoke(id: string, reason: string): Promise<Recognition> {
    const res = await axiosInstance.post<ApiResponse<Recognition>>(`${BASE}/admin/${id}/revoke/`, {
      reason,
    });
    return res.data.data;
  },
};

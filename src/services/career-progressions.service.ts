import axiosInstance from "@/lib/axios";
import type { ApiResponse } from "@/types/api.types";
import type {
  CareerProgression,
  CareerProgressionInput,
  CareerProgressionStatus,
} from "@/types/career-progressions.types";

const BASE = "/career-progressions";

export const CareerProgressionsService = {
  async listMine(): Promise<CareerProgression[]> {
    const res = await axiosInstance.get<ApiResponse<CareerProgression[]>>(`${BASE}/me/`);
    return res.data.data;
  },

  async submit(data: CareerProgressionInput): Promise<CareerProgression> {
    const res = await axiosInstance.post<ApiResponse<CareerProgression>>(`${BASE}/me/`, {
      title: data.title,
      organization: data.organization ?? "",
      start_date: data.startDate,
      end_date: data.endDate ?? null,
      description: data.description ?? "",
    });
    return res.data.data;
  },

  async update(id: number, data: CareerProgressionInput): Promise<CareerProgression> {
    const res = await axiosInstance.patch<ApiResponse<CareerProgression>>(`${BASE}/me/${id}/`, {
      title: data.title,
      organization: data.organization ?? "",
      start_date: data.startDate,
      end_date: data.endDate ?? null,
      description: data.description ?? "",
    });
    return res.data.data;
  },

  async remove(id: number): Promise<void> {
    await axiosInstance.delete(`${BASE}/me/${id}/`);
  },

  async listForReview(params?: {
    status?: CareerProgressionStatus | "";
    search?: string;
  }): Promise<CareerProgression[]> {
    const res = await axiosInstance.get<ApiResponse<CareerProgression[]>>(`${BASE}/admin/`, {
      params,
    });
    return res.data.data;
  },

  async review(
    id: number,
    action: "approve" | "reject" | "revoke",
    reviewNote?: string
  ): Promise<CareerProgression> {
    const res = await axiosInstance.post<ApiResponse<CareerProgression>>(`${BASE}/admin/${id}/`, {
      action,
      review_note: reviewNote ?? "",
    });
    return res.data.data;
  },
};

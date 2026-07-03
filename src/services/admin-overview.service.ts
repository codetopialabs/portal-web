import axiosInstance from "@/lib/axios";
import type { AdminOverview } from "@/types/admin-overview.types";
import type { ApiResponse } from "@/types/api.types";

export const AdminOverviewService = {
  async getOverview(): Promise<AdminOverview> {
    const res = await axiosInstance.get<ApiResponse<AdminOverview>>("/admin/overview/");
    return res.data.data;
  },
};

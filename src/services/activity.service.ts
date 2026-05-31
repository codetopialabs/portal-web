import axiosInstance from "@/lib/axios";
import { AdminActivityEntry } from "@/types/activity.types";
import { ApiResponse } from "@/types/api.types";

const ACTIVITY_BASE = "/activity";

export const ActivityService = {
  async getAllActivity(
    limit = 20,
    offset = 0,
    userId?: string
  ): Promise<{ results: AdminActivityEntry[]; total: number; limit: number; offset: number }> {
    const res = await axiosInstance.get<
      ApiResponse<{
        results: AdminActivityEntry[];
        total: number;
        limit: number;
        offset: number;
      }>
    >(`${ACTIVITY_BASE}/all/`, {
      params: {
        limit,
        offset,
        ...(userId ? { user_id: userId } : {}),
      },
    });
    return res.data.data;
  },
};

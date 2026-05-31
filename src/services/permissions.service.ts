import axiosInstance from "@/lib/axios";
import { DESTRUCTIVE_PERMISSIONS } from "@/lib/permissions";
import { ApiResponse } from "@/types/api.types";
import { PermissionEntry } from "@/types/permissions.types";

const PERMISSIONS_BASE = "/permissions";

export const PermissionsService = {
  async getPermissions(): Promise<PermissionEntry[]> {
    const res = await axiosInstance.get<ApiResponse<Array<Omit<PermissionEntry, "isDestructive">>>>(
      `${PERMISSIONS_BASE}/`
    );
    return res.data.data.map((permission) => ({
      ...permission,
      isDestructive: DESTRUCTIVE_PERMISSIONS.has(permission.codename),
    }));
  },
};

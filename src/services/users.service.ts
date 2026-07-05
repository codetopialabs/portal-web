import axiosInstance from "@/lib/axios";
import type { ApiResponse } from "@/types/api.types";
import type {
  AdminMember,
  AdminMemberDetail,
  AdminUserSession,
  MemberListParams,
  UpdateMemberInput,
} from "@/types/users.types";

const USERS_BASE = "/users";

export const UsersService = {
  async getUsers(params?: MemberListParams): Promise<AdminMember[]> {
    const res = await axiosInstance.get<ApiResponse<AdminMember[]>>(`${USERS_BASE}/`, {
      params: {
        ...(params?.search ? { search: params.search } : {}),
        ...(params?.isActive !== undefined ? { is_active: params.isActive } : {}),
        ...(params?.isFlagged !== undefined ? { is_flagged: params.isFlagged } : {}),
      },
    });
    return res.data.data;
  },

  async getUser(identifier: string): Promise<AdminMemberDetail> {
    const res = await axiosInstance.get<ApiResponse<AdminMemberDetail>>(
      `${USERS_BASE}/${identifier}/`
    );
    return res.data.data;
  },

  async updateUser(identifier: string, data: UpdateMemberInput): Promise<AdminMemberDetail> {
    const payload: Record<string, unknown> = {};
    if (data.username !== undefined) payload.username = data.username;
    if (data.isEmailVerified !== undefined) payload.is_email_verified = data.isEmailVerified;
    if (data.isOnboarded !== undefined) payload.is_onboarded = data.isOnboarded;
    if (data.fullName !== undefined) payload.full_name = data.fullName;
    if (data.bio !== undefined) payload.bio = data.bio;
    if (data.location !== undefined) payload.location = data.location;
    if (data.memberStatus !== undefined) payload.member_status = data.memberStatus;
    if (data.currentRole !== undefined) payload.current_role = data.currentRole;

    const res = await axiosInstance.patch<ApiResponse<AdminMemberDetail>>(
      `${USERS_BASE}/${identifier}/`,
      payload
    );
    return res.data.data;
  },

  async suspendUser(id: string): Promise<AdminMemberDetail> {
    const res = await axiosInstance.post<ApiResponse<AdminMemberDetail>>(
      `${USERS_BASE}/${id}/suspend/`
    );
    return res.data.data;
  },

  async reactivateUser(id: string): Promise<AdminMemberDetail> {
    const res = await axiosInstance.post<ApiResponse<AdminMemberDetail>>(
      `${USERS_BASE}/${id}/reactivate/`
    );
    return res.data.data;
  },

  async deleteUser(id: string): Promise<void> {
    await axiosInstance.delete(`${USERS_BASE}/${id}/`);
  },

  async getUserSessions(userId: string): Promise<AdminUserSession[]> {
    const res = await axiosInstance.get<ApiResponse<AdminUserSession[]>>(
      `${USERS_BASE}/${userId}/sessions/`
    );
    return res.data.data;
  },

  async revokeUserSession(userId: string, sessionId: number): Promise<void> {
    await axiosInstance.post(`${USERS_BASE}/${userId}/sessions/${sessionId}/revoke/`);
  },

  async revokeAllUserSessions(userId: string): Promise<{ detail: string }> {
    const res = await axiosInstance.post<ApiResponse<{ detail: string }>>(
      `${USERS_BASE}/${userId}/sessions/revoke-all/`
    );
    return res.data.data;
  },

  async grantPermission(userId: string, permission: string): Promise<void> {
    await axiosInstance.post(`${USERS_BASE}/${userId}/permissions/`, { permission });
  },

  async revokePermission(userId: string, permission: string): Promise<void> {
    await axiosInstance.delete(`${USERS_BASE}/${userId}/permissions/`, {
      data: { permission },
    });
  },

  async flagUser(userId: string, reason: string): Promise<void> {
    await axiosInstance.post(`${USERS_BASE}/${userId}/flag/`, { reason });
  },

  async unflagUser(userId: string, resolutionNote?: string): Promise<void> {
    await axiosInstance.delete(`${USERS_BASE}/${userId}/flag/`, {
      data: { resolution_note: resolutionNote ?? "" },
    });
  },
};

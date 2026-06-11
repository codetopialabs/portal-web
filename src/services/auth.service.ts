import axiosInstance from "@/lib/axios";

export interface RegisterRequest {
  email: string;
  username: string;
  full_name: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  isOnboarded: boolean;
}

// API envelope: { data: T, errors: null | object, meta: object }
interface ApiResponse<T> {
  data: T;
  errors: unknown;
  meta: unknown;
}

export const AuthService = {
  async register(data: RegisterRequest): Promise<{ detail: string }> {
    const response = await axiosInstance.post<ApiResponse<{ detail: string }>>(
      "/auth/register/",
      data
    );
    return response.data.data;
  },

  async login(data: LoginRequest): Promise<TokenResponse> {
    const response = await axiosInstance.post<ApiResponse<TokenResponse>>("/auth/login/", data);
    return response.data.data;
  },

  async socialLogin(
    provider: "google" | "github",
    tokenOrCode: string,
    redirectUri?: string
  ): Promise<TokenResponse> {
    const payload =
      provider === "google"
        ? { token: tokenOrCode }
        : { code: tokenOrCode, redirect_uri: redirectUri };

    const response = await axiosInstance.post<ApiResponse<TokenResponse>>(
      `/auth/${provider}/`,
      payload
    );
    return response.data.data;
  },

  async logout(accessToken: string): Promise<void> {
    await axiosInstance.post("/auth/logout/", undefined, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  },

  async resendVerification(email: string): Promise<{ detail: string }> {
    const response = await axiosInstance.post<ApiResponse<{ detail: string }>>(
      "/auth/resend-verification/",
      { email }
    );
    return response.data.data;
  },

  async verifyEmail(token: string): Promise<{ detail: string }> {
    const response = await axiosInstance.get<ApiResponse<{ detail: string }>>(
      "/auth/verify-email/",
      { params: { token } }
    );
    return response.data.data;
  },

  async passwordReset(email: string): Promise<{ detail: string }> {
    const response = await axiosInstance.post<ApiResponse<{ detail: string }>>(
      "/auth/password-reset/",
      { email }
    );
    return response.data.data;
  },

  async confirmPasswordReset(token: string, password: string): Promise<{ detail: string }> {
    const response = await axiosInstance.post<ApiResponse<{ detail: string }>>(
      "/auth/password-reset/confirm/",
      { token, password }
    );
    return response.data.data;
  },

  async checkEmail(email: string): Promise<boolean> {
    const response = await axiosInstance.get<ApiResponse<{ available: boolean }>>(
      "/auth/check-email/",
      { params: { email: email.trim().toLowerCase() } }
    );
    return response.data.data.available;
  },

  async checkUsername(username: string): Promise<boolean> {
    const response = await axiosInstance.get<ApiResponse<{ available: boolean }>>(
      "/auth/check-username/",
      { params: { username: username.trim() } }
    );
    return response.data.data.available;
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await axiosInstance.post("/auth/change-password/", {
      current_password: currentPassword,
      new_password: newPassword,
    });
  },
};

// ─── Sessions ─────────────────────────────────────────────────────────────────

export interface UserSession {
  id: number;
  deviceName: string;
  ipAddress: string | null;
  userAgent: string;
  createdAt: string;
  lastSeenAt: string | null;
  isCurrent: boolean;
}

export interface ActivityLogEntry {
  id: number;
  eventType: string;
  eventLabel: string;
  detail: string;
  ipAddress: string | null;
  deviceName: string;
  createdAt: string;
}

export const SessionService = {
  async getSessions(): Promise<UserSession[]> {
    const response = await axiosInstance.get<ApiResponse<UserSession[]>>("/auth/sessions/");
    return response.data.data;
  },

  async revokeSession(id: number): Promise<void> {
    await axiosInstance.delete(`/auth/sessions/${id}/`);
  },

  async revokeAllOtherSessions(): Promise<void> {
    await axiosInstance.delete("/auth/sessions/");
  },

  async getActivity(
    limit = 20,
    offset = 0
  ): Promise<{ results: ActivityLogEntry[]; total: number }> {
    const response = await axiosInstance.get<{
      data: { results: ActivityLogEntry[]; total: number };
    }>("/activity/", { params: { limit, offset } });
    return response.data.data;
  },
};

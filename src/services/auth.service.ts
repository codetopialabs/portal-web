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
    const response = await axiosInstance.post<ApiResponse<{ detail: string }>>("/auth/register/", data);
    return response.data.data;
  },

  async login(data: LoginRequest): Promise<TokenResponse> {
    const response = await axiosInstance.post<ApiResponse<TokenResponse>>("/auth/login/", data);
    return response.data.data;
  },

  async logout(accessToken: string): Promise<void> {
    await axiosInstance.post("/auth/logout/", undefined, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  },

  async resendVerification(email: string): Promise<{ detail: string }> {
    const response = await axiosInstance.post<ApiResponse<{ detail: string }>>("/auth/resend-verification/", { email });
    return response.data.data;
  },

  async verifyEmail(token: string): Promise<{ detail: string }> {
    const response = await axiosInstance.get<ApiResponse<{ detail: string }>>("/auth/verify-email/", { params: { token } });
    return response.data.data;
  },

  async passwordReset(email: string): Promise<{ detail: string }> {
    const response = await axiosInstance.post<ApiResponse<{ detail: string }>>("/auth/password-reset/", { email });
    return response.data.data;
  },

  async confirmPasswordReset(token: string, password: string): Promise<{ detail: string }> {
    const response = await axiosInstance.post<ApiResponse<{ detail: string }>>("/auth/password-reset/confirm/", { token, password });
    return response.data.data;
  },

  async checkEmail(email: string): Promise<boolean> {
    const response = await axiosInstance.get<ApiResponse<{ available: boolean }>>("/auth/check-email/", { params: { email } });
    return response.data.data.available;
  },

  async checkUsername(username: string): Promise<boolean> {
    const response = await axiosInstance.get<ApiResponse<{ available: boolean }>>("/auth/check-username/", { params: { username } });
    return response.data.data.available;
  },
};

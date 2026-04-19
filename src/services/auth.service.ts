import axiosInstance from '@/lib/axios'

export interface RegisterRequest {
  email: string
  username: string
  full_name: string
  password: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface TokenResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
}

// API envelope: { data: T, errors: null | object, meta: object }
interface ApiResponse<T> {
  data: T
  errors: unknown
  meta: unknown
}

export const AuthService = {
  async register(data: RegisterRequest): Promise<TokenResponse> {
    const response = await axiosInstance.post<ApiResponse<TokenResponse>>('/auth/register/', data)
    return response.data.data
  },

  async login(data: LoginRequest): Promise<TokenResponse> {
    const response = await axiosInstance.post<ApiResponse<TokenResponse>>('/auth/login/', data)
    return response.data.data
  },

  async logout(accessToken: string): Promise<void> {
    await axiosInstance.post('/auth/logout/', undefined, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  },
}

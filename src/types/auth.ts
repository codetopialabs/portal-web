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

export interface UserSession {
  id: number;
  deviceName: string;
  ipAddress: string | null;
  userAgent: string;
  createdAt: string;
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

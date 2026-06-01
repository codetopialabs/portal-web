import axios, { type AxiosRequestConfig } from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { "Content-Type": "application/json" },
});

// ─── helpers ──────────────────────────────────────────────────────────────────

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.split("; ").find((r) => r.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split("=")[1]) : null;
}

function setCookie(name: string, value: string, maxAge: number) {
  // biome-ignore lint/suspicious/noDocumentCookie: legacy cookie storage for auth tokens
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function deleteCookie(name: string) {
  // biome-ignore lint/suspicious/noDocumentCookie: legacy cookie storage for auth tokens
  document.cookie = `${name}=; path=/; max-age=0`;
}

function clearAuthCookies() {
  deleteCookie("accessToken");
  deleteCookie("refreshToken");
  deleteCookie("isOnboarded");
}

// ─── request interceptor — attach access token ────────────────────────────────

axiosInstance.interceptors.request.use((config) => {
  const token = getCookie("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── silent token refresh ─────────────────────────────────────────────────────

let isRefreshing = false;
// Queue of { resolve, reject } for requests waiting on a refresh
let refreshQueue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = [];

function drainQueue(token: string) {
  refreshQueue.forEach((p) => {
    p.resolve(token);
  });
  refreshQueue = [];
}

function rejectQueue(err: unknown) {
  refreshQueue.forEach((p) => {
    p.reject(err);
  });
  refreshQueue = [];
}

async function attemptRefresh(): Promise<string> {
  const refreshToken = getCookie("refreshToken");
  if (!refreshToken) throw new Error("No refresh token");

  // Call the refresh endpoint directly (not through axiosInstance to avoid loops).
  // Hard 10 s timeout — if the server doesn't respond, fail fast and redirect to login
  // rather than leaving the user stuck on the loading screen indefinitely.
  const res = await axios.post(
    `${process.env.NEXT_PUBLIC_API_URL}/auth/token/refresh/`,
    { refresh_token: refreshToken },
    { headers: { "Content-Type": "application/json" }, timeout: 10_000 }
  );

  // Response envelope: { data: { accessToken, refreshToken, tokenType, expiresIn } }
  const data = res.data?.data;
  const accessTokenValue = data?.accessToken ?? data?.access_token;
  const refreshTokenValue = data?.refreshToken ?? data?.refresh_token;
  const expiresInValue = data?.expiresIn ?? data?.expires_in;

  if (!accessTokenValue || !refreshTokenValue) throw new Error("Invalid refresh response");

  // Persist new tokens
  setCookie("accessToken", accessTokenValue, expiresInValue ?? 900);
  setCookie("refreshToken", refreshTokenValue, 60 * 60 * 24 * 7);

  // Sync the auth store in-memory session without importing it here
  // (the store reads from cookies on next access, so this is sufficient)

  return accessTokenValue as string;
}

// ─── response interceptor — handle 401 ───────────────────────────────────────

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // Only attempt refresh on 401, and not on the refresh endpoint itself
    const is401 = error.response?.status === 401;
    const isRefreshEndpoint = originalRequest.url?.includes("/auth/token/refresh/");
    const isLoginEndpoint = originalRequest.url?.includes("/auth/login/");
    const alreadyRetried = originalRequest._retry;

    if (is401 && !isRefreshEndpoint && !isLoginEndpoint && !alreadyRetried) {
      originalRequest._retry = true;

      if (isRefreshing) {
        // Another refresh is in flight — queue this request
        return new Promise((resolve, reject) => {
          refreshQueue.push({
            resolve: (token) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              resolve(axiosInstance(originalRequest));
            },
            reject,
          });
        });
      }

      isRefreshing = true;

      try {
        const newToken = await attemptRefresh();
        isRefreshing = false;
        drainQueue(newToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        rejectQueue(refreshError);

        // Refresh failed — clear cookies, clear the in-memory stores,
        // then redirect to login with a session-expired flag so the login
        // page can show the right message.
        clearAuthCookies();

        // Clear Zustand stores without importing them at module level
        // (avoids circular dependency: store → axios → store).
        if (typeof window !== "undefined") {
          try {
            const { useAuthStore } = await import("@/store/auth.store");
            const { useUserStore } = await import("@/store/user.store");
            useAuthStore.getState().clearSession();
            useUserStore.getState().reset();
          } catch {
            // If dynamic import fails for any reason, the cookie clear above
            // is still sufficient — the user will land on /login cleanly.
          }
          window.location.href = "/login?reason=session_expired";
        }
        return Promise.reject(refreshError);
      }
    }

    // ─── normalise error messages ────────────────────────────────────────────

    if (!error.response) {
      return Promise.reject(
        new Error(
          error.code === "ECONNABORTED"
            ? "Request timed out. Please try again."
            : "Unable to reach the server. Please check your connection."
        )
      );
    }

    const data = error.response?.data;
    const errors = data?.errors;

    // ─── Extract error message ────────────────────────────────────────────────
    let errorMessage = error.message || "An unexpected error occurred";

    if (errors && typeof errors === "object") {
      errorMessage = errors.detail
        ? String(errors.detail)
        : (() => {
          const firstKey = Object.keys(errors)[0];
          const firstMsg = errors[firstKey];
          return String(Array.isArray(firstMsg) ? firstMsg[0] : firstMsg);
        })();
    }

    // ─── Toast notification ──────────────────────────────────────────────────
    // We only toast on the client side
    if (typeof window !== "undefined") {
      const is403 = error.response?.status === 403;
      const is401 = error.response?.status === 401;

      // We don't toast 401s because they are handled by refresh/redirect logic
      if (!is401) {
        const { toast } = require("sonner");
        toast.error(is403 ? "Permission Denied" : "Error", {
          description: errorMessage,
        });
      }
    }

    const err = new Error(errorMessage) as Error & { code?: string; status?: number };
    err.status = error.response?.status;
    if (errors?.code) err.code = errors.code;

    return Promise.reject(err);
  }
);

export default axiosInstance;

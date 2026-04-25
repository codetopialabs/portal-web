import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { "Content-Type": "application/json" },
});

axiosInstance.interceptors.request.use((config) => {
  if (typeof document !== "undefined") {
    const match = document.cookie.split("; ").find((r) => r.startsWith("accessToken="));
    const token = match?.split("=")[1];
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const data = error.response?.data;
    const errors = data?.errors;
    if (errors && typeof errors === "object") {
      const err = new Error(errors.detail ? String(errors.detail) : (() => {
        const firstKey = Object.keys(errors)[0];
        const firstMsg = errors[firstKey];
        return String(Array.isArray(firstMsg) ? firstMsg[0] : firstMsg);
      })()) as Error & { code?: string };
      if (errors.code) err.code = errors.code;
      return Promise.reject(err);
    }
    return Promise.reject(new Error(error.message || "An unexpected error occurred"));
  }
);

export default axiosInstance;

import axiosInstance from "@/lib/axios";
import type { ApiResponse } from "@/types/api.types";
import type {
  CurrentReflection,
  ReflectionQuestion,
  ReflectionQuestionInput,
  ReflectionRecord,
} from "@/types/reflections.types";

const BASE = "/reflections";

interface UploadSignature {
  signature: string;
  timestamp: number;
  cloudName: string;
  apiKey: string;
  folder: string;
}

export const ReflectionsService = {
  /** Upload a reflection attachment to Cloudinary via a signed request; returns the secure URL. */
  async uploadAttachment(file: File): Promise<string> {
    const sigRes = await axiosInstance.get<ApiResponse<UploadSignature>>(
      "/auth/cloudinary-signature/?type=reflection"
    );
    const sig = sigRes.data.data;
    const form = new FormData();
    form.append("file", file);
    form.append("api_key", sig.apiKey);
    form.append("timestamp", String(sig.timestamp));
    form.append("signature", sig.signature);
    form.append("folder", sig.folder);
    // `auto` lets Cloudinary accept images and raw documents (PDF, docx, etc.).
    const res = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/auto/upload`, {
      method: "POST",
      body: form,
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message ?? "Upload failed.");
    return json.secure_url as string;
  },
  async getCurrent(): Promise<CurrentReflection> {
    const res = await axiosInstance.get<ApiResponse<CurrentReflection>>(`${BASE}/current/`);
    return res.data.data;
  },

  async submit(
    answers: Record<string, string>,
    attachments: Record<string, string[]> = {}
  ): Promise<{ detail: string; status: string }> {
    const res = await axiosInstance.post<ApiResponse<{ detail: string; status: string }>>(
      `${BASE}/current/`,
      { answers, attachments }
    );
    return res.data.data;
  },

  async listOwn(): Promise<ReflectionRecord[]> {
    const res = await axiosInstance.get<ApiResponse<ReflectionRecord[]>>(`${BASE}/history/`);
    return res.data.data;
  },

  async list(params?: { period?: string; status?: string }): Promise<ReflectionRecord[]> {
    const res = await axiosInstance.get<ApiResponse<ReflectionRecord[]>>(`${BASE}/`, { params });
    return res.data.data;
  },

  async listByUser(username: string): Promise<ReflectionRecord[]> {
    const res = await axiosInstance.get<ApiResponse<ReflectionRecord[]>>(`${BASE}/`, {
      params: { username },
    });
    return res.data.data;
  },

  async get(id: string): Promise<ReflectionRecord> {
    const res = await axiosInstance.get<ApiResponse<ReflectionRecord>>(`${BASE}/${id}/`);
    return res.data.data;
  },

  async review(
    id: string,
    action: "approve" | "request_changes",
    notes?: string
  ): Promise<ReflectionRecord> {
    const res = await axiosInstance.post<ApiResponse<ReflectionRecord>>(`${BASE}/${id}/`, {
      action,
      notes: notes ?? "",
    });
    return res.data.data;
  },

  async getQuestions(): Promise<ReflectionQuestion[]> {
    const res = await axiosInstance.get<ApiResponse<ReflectionQuestion[]>>(`${BASE}/questions/`);
    return res.data.data;
  },

  async createQuestion(data: ReflectionQuestionInput): Promise<ReflectionQuestion> {
    const res = await axiosInstance.post<ApiResponse<ReflectionQuestion>>(`${BASE}/questions/`, {
      prompt: data.prompt,
      help_text: data.helpText ?? "",
      type: data.type,
      order: data.order ?? 0,
      is_required: data.isRequired ?? true,
      is_active: data.isActive ?? true,
    });
    return res.data.data;
  },

  async updateQuestion(
    id: string,
    data: Partial<ReflectionQuestionInput>
  ): Promise<ReflectionQuestion> {
    const payload: Record<string, unknown> = {};
    if (data.prompt !== undefined) payload.prompt = data.prompt;
    if (data.helpText !== undefined) payload.help_text = data.helpText;
    if (data.type !== undefined) payload.type = data.type;
    if (data.order !== undefined) payload.order = data.order;
    if (data.isRequired !== undefined) payload.is_required = data.isRequired;
    if (data.isActive !== undefined) payload.is_active = data.isActive;
    const res = await axiosInstance.patch<ApiResponse<ReflectionQuestion>>(
      `${BASE}/questions/${id}/`,
      payload
    );
    return res.data.data;
  },

  async deleteQuestion(id: string): Promise<void> {
    await axiosInstance.delete(`${BASE}/questions/${id}/`);
  },

  async getSettings(): Promise<{ openDay: number; windowDays: number }> {
    const res = await axiosInstance.get<ApiResponse<{ openDay: number; windowDays: number }>>(
      `${BASE}/settings/`
    );
    return res.data.data;
  },

  async updateSettings(
    data: Partial<{ openDay: number; windowDays: number }>
  ): Promise<{ openDay: number; windowDays: number }> {
    const payload: Record<string, number> = {};
    if (data.openDay !== undefined) payload.open_day = data.openDay;
    if (data.windowDays !== undefined) payload.window_days = data.windowDays;
    const res = await axiosInstance.patch<ApiResponse<{ openDay: number; windowDays: number }>>(
      `${BASE}/settings/`,
      payload
    );
    return res.data.data;
  },

  async triggerCycle(): Promise<{
    detail: string;
    period: string;
    opensOn: string;
    dueOn: string;
  }> {
    const res = await axiosInstance.post<
      ApiResponse<{ detail: string; period: string; opensOn: string; dueOn: string }>
    >(`${BASE}/settings/trigger/`);
    return res.data.data;
  },
};

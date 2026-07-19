import axiosInstance from "@/lib/axios";
import type { ApiResponse } from "@/types/api.types";
import type { EmailCampaign, SendEmailInput } from "@/types/emails.types";

const BASE = "/emails";

export const EmailsService = {
  async send(input: SendEmailInput): Promise<EmailCampaign> {
    const res = await axiosInstance.post<ApiResponse<EmailCampaign>>(`${BASE}/admin/send/`, input);
    return res.data.data;
  },
  async listCampaigns(): Promise<EmailCampaign[]> {
    const res = await axiosInstance.get<ApiResponse<EmailCampaign[]>>(`${BASE}/admin/`);
    return res.data.data;
  },
  // Returns both variants in one round trip, so a light/dark toggle in the
  // UI can be instant afterward instead of re-fetching on every click.
  async preview(subject: string, body: string): Promise<{ light: string; dark: string }> {
    const res = await axiosInstance.post<ApiResponse<{ light: string; dark: string }>>(
      `${BASE}/admin/preview/`,
      { subject, body }
    );
    return res.data.data;
  },
};

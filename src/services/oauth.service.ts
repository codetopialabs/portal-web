import axiosInstance from "@/lib/axios";
import type { ApiResponse } from "@/types/api.types";

export interface AuthorizeParams {
  clientId: string;
  redirectUri: string;
  state?: string;
  scope?: string;
  codeChallenge?: string;
  codeChallengeMethod?: string;
}

export const OAuthService = {
  /** Mint an authorization code for the logged-in user and return where to redirect. */
  async authorize(params: AuthorizeParams): Promise<string> {
    const res = await axiosInstance.post<ApiResponse<{ redirectTo: string }>>("/oauth/authorize/", {
      client_id: params.clientId,
      redirect_uri: params.redirectUri,
      state: params.state ?? "",
      scope: params.scope ?? "read",
      code_challenge: params.codeChallenge,
      code_challenge_method: params.codeChallengeMethod ?? "S256",
    });
    return res.data.data.redirectTo;
  },
};

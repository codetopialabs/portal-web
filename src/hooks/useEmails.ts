"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { EmailsService } from "@/services/emails.service";
import type { SendEmailInput } from "@/types/emails.types";

export const emailKeys = {
  campaigns: ["emails", "campaigns"] as const,
};

export function useEmailCampaigns() {
  return useQuery({
    queryKey: emailKeys.campaigns,
    queryFn: EmailsService.listCampaigns,
  });
}

export function useSendEmail() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: SendEmailInput) => EmailsService.send(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: emailKeys.campaigns }),
  });
}

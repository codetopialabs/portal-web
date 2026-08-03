"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CertificateTemplatesService } from "@/services/certificateTemplates.service";
import type {
  CertificateTemplateInput,
  CertificateTemplateStatus,
} from "@/types/certificateTemplates.types";

export const certificateTemplateKeys = {
  all: ["certificateTemplates"] as const,
  admin: (status?: CertificateTemplateStatus | "") =>
    ["certificateTemplates", "admin", status] as const,
  detail: (id: string) => ["certificateTemplates", "detail", id] as const,
};

export function useAdminCertificateTemplates(
  status?: CertificateTemplateStatus | "",
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: certificateTemplateKeys.admin(status),
    queryFn: () => CertificateTemplatesService.listAdmin(status),
    enabled: options?.enabled ?? true,
  });
}

export function useCertificateTemplate(id: string | undefined) {
  return useQuery({
    queryKey: certificateTemplateKeys.detail(id ?? ""),
    queryFn: () => CertificateTemplatesService.get(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateCertificateTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CertificateTemplateInput) => CertificateTemplatesService.create(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: certificateTemplateKeys.all }),
  });
}

export function useUpdateCertificateTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<CertificateTemplateInput> }) =>
      CertificateTemplatesService.update(id, input),
    onSuccess: (template) => {
      queryClient.invalidateQueries({ queryKey: certificateTemplateKeys.all });
      queryClient.setQueryData(certificateTemplateKeys.detail(template.id), template);
    },
  });
}

export function useDeleteCertificateTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => CertificateTemplatesService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: certificateTemplateKeys.all }),
  });
}

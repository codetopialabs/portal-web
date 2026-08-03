"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CertificatesService } from "@/services/certificates.service";
import type {
  CertificateBatchInput,
  CertificateEditInput,
  CertificateStatus,
} from "@/types/certificates.types";

type AdminListParams = {
  status?: CertificateStatus | "";
  certificateType?: string;
  search?: string;
};

export const certificateKeys = {
  all: ["certificates"] as const,
  mine: ["certificates", "mine"] as const,
  admin: (params?: AdminListParams) => ["certificates", "admin", params] as const,
  detail: (id: string) => ["certificates", "detail", id] as const,
};

export function useMyCertificates() {
  return useQuery({ queryKey: certificateKeys.mine, queryFn: CertificatesService.mine });
}

export function useAdminCertificates(params?: AdminListParams) {
  return useQuery({
    queryKey: certificateKeys.admin(params),
    queryFn: () => CertificatesService.listForAdmin(params),
  });
}

export function useCertificate(id: string | undefined) {
  return useQuery({
    queryKey: certificateKeys.detail(id ?? ""),
    queryFn: () => CertificatesService.get(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateCertificates() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CertificateBatchInput) => CertificatesService.batchCreate(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: certificateKeys.all }),
  });
}

export function useUpdateCertificate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CertificateEditInput }) =>
      CertificatesService.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: certificateKeys.all }),
  });
}

export function useDeleteCertificate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => CertificatesService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: certificateKeys.all }),
  });
}

export function usePublishCertificate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => CertificatesService.publish(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: certificateKeys.all }),
  });
}

export function useRevokeCertificate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      CertificatesService.revoke(id, reason),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: certificateKeys.all }),
  });
}

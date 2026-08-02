"use client";

import { useParams } from "next/navigation";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { CertificateForm } from "@/components/certificates/CertificateForm";
import { useCertificate } from "@/hooks/useCertificates";

function EditCertificateContent() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useCertificate(id);
  if (isLoading || !data)
    return <div className="h-[540px] animate-pulse border border-zinc-200 bg-zinc-50" />;
  return <CertificateForm editing={data} />;
}

export default function EditCertificatePage() {
  return (
    <RouteGuard permission="certificates.create">
      <EditCertificateContent />
    </RouteGuard>
  );
}

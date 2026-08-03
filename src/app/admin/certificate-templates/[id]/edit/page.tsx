"use client";

import { useParams } from "next/navigation";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { CertificateTemplateForm } from "@/components/certificateTemplates/CertificateTemplateForm";
import { useCertificateTemplate } from "@/hooks/useCertificateTemplates";

function EditCertificateTemplateContent() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useCertificateTemplate(id);
  if (isLoading || !data)
    return <div className="h-[540px] animate-pulse border border-zinc-200 bg-zinc-50" />;
  return <CertificateTemplateForm template={data} />;
}

export default function EditCertificateTemplatePage() {
  return (
    <RouteGuard permission="certificate_templates.edit">
      <EditCertificateTemplateContent />
    </RouteGuard>
  );
}

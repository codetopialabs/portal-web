import { RouteGuard } from "@/components/auth/RouteGuard";
import { CertificateTemplateForm } from "@/components/certificateTemplates/CertificateTemplateForm";

export default function NewCertificateTemplatePage() {
  return (
    <RouteGuard permission="certificate_templates.create">
      <CertificateTemplateForm />
    </RouteGuard>
  );
}

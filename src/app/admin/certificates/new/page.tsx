import { RouteGuard } from "@/components/auth/RouteGuard";
import { CertificateForm } from "@/components/certificates/CertificateForm";

export default function NewCertificatePage() {
  return (
    <RouteGuard permission="certificates.create">
      <CertificateForm />
    </RouteGuard>
  );
}

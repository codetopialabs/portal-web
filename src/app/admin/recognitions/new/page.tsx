import { RouteGuard } from "@/components/auth/RouteGuard";
import { RecognitionForm } from "@/components/recognitions/RecognitionForm";

export default function NewRecognitionPage() {
  return (
    <RouteGuard permission="recognitions.create">
      <RecognitionForm />
    </RouteGuard>
  );
}

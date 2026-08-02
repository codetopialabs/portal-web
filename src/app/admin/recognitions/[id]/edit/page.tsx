"use client";

import { useParams } from "next/navigation";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { RecognitionForm } from "@/components/recognitions/RecognitionForm";
import { useRecognition } from "@/hooks/useRecognitions";

function EditRecognitionContent() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useRecognition(id);
  if (isLoading || !data)
    return <div className="h-[540px] animate-pulse border border-zinc-200 bg-zinc-50" />;
  return <RecognitionForm editing={data} />;
}

export default function EditRecognitionPage() {
  return (
    <RouteGuard permission="recognitions.create">
      <EditRecognitionContent />
    </RouteGuard>
  );
}

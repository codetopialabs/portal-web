import { Clock } from "lucide-react";

interface ComingSoonPanelProps {
  title: string;
  description: string;
}

export function ComingSoonPanel({ title, description }: ComingSoonPanelProps) {
  return (
    <div className="flex flex-col items-center justify-center border border-zinc-200 bg-white py-24 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center border border-zinc-200 bg-zinc-50">
        <Clock className="h-5 w-5 text-zinc-300" />
      </div>
      <p className="mb-1 font-mono font-semibold text-sm text-zinc-900">{title}</p>
      <p className="mx-auto max-w-xs font-mono text-sm text-zinc-500">{description}</p>
    </div>
  );
}

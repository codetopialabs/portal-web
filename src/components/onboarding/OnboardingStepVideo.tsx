import { ArrowLeft, ArrowRight } from "lucide-react";

interface StepProps {
  onNext: () => void;
  onBack: () => void;
}

export function OnboardingStepVideo({ onNext, onBack }: StepProps) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 w-full max-w-3xl">
      <span className="text-[10px] uppercase tracking-[0.25em] text-zinc-400 font-mono font-bold mb-6 block">
        Intro Video
      </span>

      <h1 className="text-4xl sm:text-5xl font-bold text-zinc-900 mb-3 leading-[1.1]">
        Meet Codetopia
      </h1>
      <p className="font-mono text-zinc-500 text-sm leading-relaxed mb-8">
        Watch this short intro to get a feel for our community.
      </p>

      <div className="aspect-video w-full border border-zinc-200 bg-zinc-100 mb-8">
        <iframe
          src="https://www.youtube.com/embed/dQw4w9WgXcQ"
          title="Codetopia Intro Video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="border border-zinc-200 bg-white px-6 py-3 text-[11px] uppercase tracking-[0.2em] text-zinc-600 hover:bg-zinc-50 transition-colors font-mono flex items-center gap-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </button>
        <button
          type="button"
          onClick={onNext}
          className="bg-zinc-900 text-white px-8 py-3 text-[11px] uppercase tracking-[0.2em] hover:bg-zinc-700 transition-colors font-mono flex items-center gap-2"
        >
          Next <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

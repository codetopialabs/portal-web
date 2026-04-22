interface StepProps {
  onNext: () => void;
  onBack: () => void;
}

export function OnboardingStepVideo({ onNext, onBack }: StepProps) {
  return (
    <div className="flex flex-col items-center max-w-4xl">
      <h1 className="text-3xl font-bold font-mono uppercase tracking-widest text-zinc-900 mb-3 self-start">
        Meet Codetopia
      </h1>
      <p className="font-mono text-zinc-600 mb-6 self-start">
        Watch this short intro to get a feel for our community.
      </p>
      <div className="aspect-video w-full border border-zinc-200">
        <iframe
          src="https://www.youtube.com/embed/dQw4w9WgXcQ"
          title="Codetopia Intro Video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      </div>
      <div className="flex gap-3 mt-8 self-start">
        <button
          type="button"
          onClick={onBack}
          className="border border-zinc-200 px-6 py-3 text-sm uppercase tracking-widest text-zinc-600 hover:bg-zinc-50 transition-colors"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onNext}
          className="bg-zinc-900 text-white px-6 py-3 text-sm uppercase tracking-widest hover:bg-zinc-700 transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
}

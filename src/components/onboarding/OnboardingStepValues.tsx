import { ArrowLeft, ArrowRight } from "lucide-react";

interface StepProps {
  onNext: () => void;
  onBack: () => void;
}

const VALUES = [
  {
    name: "Inclusivity",
    description:
      "Everyone belongs here. We welcome people of all skill levels, backgrounds, and identities.",
  },
  {
    name: "Collaboration",
    description:
      "We build together. Collective effort drives greater outcomes than individual effort alone.",
  },
  {
    name: "Continuous Learning",
    description: "In technology there is always more to learn. Stay curious, stay humble.",
  },
  {
    name: "Practical Application",
    description: "We value hands-on experience and real-world problem solving over theory alone.",
  },
  {
    name: "Innovation",
    description: "We encourage creative thinking and bold ideas that push boundaries.",
  },
  {
    name: "Integrity",
    description:
      "We act with honesty, give proper credit, and take responsibility for our actions.",
  },
];

export function OnboardingStepValues({ onNext, onBack }: StepProps) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 w-full max-w-3xl">
      <span className="text-[10px] uppercase tracking-[0.25em] text-zinc-500 font-mono font-bold mb-6 block">
        Our Foundation
      </span>

      <h1 className="font-sans text-4xl sm:text-5xl font-bold text-zinc-900 mb-3 leading-[1.1]">
        Core Values
      </h1>
      <p className="font-mono text-zinc-500 text-sm leading-relaxed mb-8">
        These six values shape how we treat each other, how we build together, and how we grow.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
        {VALUES.map((value, i) => (
          <div
            key={value.name}
            className="flex flex-col gap-2 border border-zinc-200 bg-white p-4 hover:border-zinc-400 transition-colors"
          >
            <span className="text-sm font-mono text-zinc-500">
              {String(i + 1).padStart(2, "0")}
            </span>
            <p className="text-sm font-mono font-semibold text-zinc-900">{value.name}</p>
            <p className="text-sm font-mono text-zinc-500 leading-relaxed">{value.description}</p>
          </div>
        ))}
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

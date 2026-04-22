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
    description:
      "In technology there is always more to learn. Stay curious, stay humble.",
  },
  {
    name: "Practical Application",
    description:
      "We value hands-on experience and real-world problem solving over theory alone.",
  },
  {
    name: "Innovation",
    description:
      "We encourage creative thinking and bold ideas that push boundaries.",
  },
  {
    name: "Integrity",
    description:
      "We act with honesty, give proper credit, and take responsibility for our actions.",
  },
];

export function OnboardingStepValues({ onNext, onBack }: StepProps) {
  return (
    <div className="flex flex-col max-w-3xl">
      <p className="text-xs uppercase tracking-widest text-zinc-400 font-mono mb-3">
        Our Foundation
      </p>
      <h1 className="text-3xl font-bold font-mono uppercase tracking-widest text-zinc-900 mb-2">
        Core Values
      </h1>
      <p className="font-mono text-zinc-500 text-sm mb-8">
        These six values shape how we treat each other, how we build together, and how we grow.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {VALUES.map((value, i) => (
          <div key={i} className="flex flex-col gap-2 border border-zinc-100 p-4 hover:border-zinc-300 transition-colors">
            <span className="text-xs font-mono text-zinc-300">
              {String(i + 1).padStart(2, "0")}
            </span>
            <p className="text-sm font-mono font-bold uppercase tracking-widest text-zinc-900">
              {value.name}
            </p>
            <p className="text-xs font-mono text-zinc-500 leading-relaxed">
              {value.description}
            </p>
          </div>
        ))}
      </div>

      <div className="flex gap-3 mt-8">
        <button
          type="button"
          onClick={onBack}
          className="border border-zinc-200 px-6 py-3 text-sm uppercase tracking-widest text-zinc-600 hover:bg-zinc-50 transition-colors font-mono"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onNext}
          className="bg-zinc-900 text-white px-6 py-3 text-sm uppercase tracking-widest hover:bg-zinc-700 transition-colors font-mono"
        >
          Next
        </button>
      </div>
    </div>
  );
}

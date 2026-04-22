interface StepProps {
  onNext: () => void;
}

export function OnboardingStepWelcome({ onNext }: StepProps) {
  return (
    <div className="flex flex-col max-w-xl">
      <p className="text-xs uppercase tracking-widest text-zinc-400 font-mono mb-3">
        Welcome
      </p>
      <h1 className="text-3xl font-bold font-mono uppercase tracking-widest text-zinc-900 mb-6">
        A Utopia for Tech Enthusiasts
      </h1>

      <div className="space-y-5 font-mono text-zinc-600 leading-relaxed text-sm">
        <p>
          Codetopia Community is an inclusive and collaborative initiative of the mother company
          Codetopia. It was created to empower aspiring and practicing technologists. We believe
          technology is more than a tool — it is the foundation of innovation, creativity, and
          problem-solving.
        </p>
        <p>
          Whether you are writing your first line of code or exploring the edges of tech, the
          Codetopia Community is your home.
        </p>

        <div className="border-l-2 border-zinc-900 pl-4 py-1 space-y-2">
          <p className="text-xs uppercase tracking-widest text-zinc-400">Our Pledge</p>
          <p className="text-zinc-600">
            We pledge to make our community welcoming, safe, and equitable for all — regardless of
            race, ethnicity, age, disability, gender identity, sexual orientation, language,
            religion, national origin, socio-economic position, or any other status.
          </p>
        </div>
      </div>

      <div className="flex mt-8">
        <button
          type="button"
          onClick={onNext}
          className="bg-zinc-900 text-white px-6 py-3 text-sm uppercase tracking-widest hover:bg-zinc-700 transition-colors font-mono"
        >
          Get Started
        </button>
      </div>
    </div>
  );
}

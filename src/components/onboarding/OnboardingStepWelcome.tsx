import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import Image from "next/image";

interface StepProps {
  onNext: () => void;
  onBack: () => void;
}

export function OnboardingStepWelcome({ onNext, onBack }: StepProps) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 w-full max-w-3xl">
      <div className="mb-8">
        <Image
          src="/logos/codetopia-community.png"
          alt="Codetopia Community"
          width={180}
          height={45}
          className="h-12 w-auto object-contain object-left brightness-0"
          priority
        />
      </div>

      <span className="font-mono text-xs font-medium text-zinc-500 mb-6 block">Welcome</span>

      <h1 className="font-sans text-4xl sm:text-5xl font-bold text-zinc-900 mb-8 leading-[1.1]">
        A Utopia for
        <br />
        Tech Enthusiasts
      </h1>

      <div className="space-y-4 font-mono text-zinc-600 text-sm leading-relaxed pl-5 border-l-4 border-zinc-900 mb-8">
        <p>
          Codetopia Community is an inclusive and collaborative initiative of the mother company{" "}
          <a
            href="https://codetopia.org"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-zinc-900 underline underline-offset-2 hover:text-zinc-600 transition-colors inline-flex items-center gap-0.5"
          >
            Codetopia
            <ExternalLink className="w-3 h-3" />
          </a>
          . It was created to empower aspiring and practicing technologists. We believe technology
          is more than a tool: it is the foundation of innovation, creativity, and problem-solving.
        </p>
        <p>
          Whether you are writing your first line of code or exploring the edges of tech, the
          Codetopia Community is your home.
        </p>
      </div>

      <div className="bg-white border border-zinc-300 p-6 mb-10">
        <p className="font-mono text-xs font-medium text-zinc-500 mb-3">Our Pledge</p>
        <p className="font-mono text-zinc-600 text-sm leading-relaxed">
          We pledge to make our community welcoming, safe, and equitable for all, regardless of
          race, ethnicity, age, disability, gender identity, sexual orientation, language, religion,
          national origin, socio-economic position, or any other status.
        </p>
      </div>

      <div className="flex items-center gap-6">
        <button
          type="button"
          onClick={onBack}
          className="border border-zinc-200 bg-white px-6 py-3 text-sm font-medium text-zinc-600 hover:bg-zinc-50 transition-colors font-mono flex items-center gap-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </button>
        <button
          type="button"
          onClick={onNext}
          className="bg-zinc-900 text-white px-8 py-3.5 text-sm font-medium hover:bg-zinc-700 transition-colors font-mono flex items-center gap-2"
        >
          Get Started <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

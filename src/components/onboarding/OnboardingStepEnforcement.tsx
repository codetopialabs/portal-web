"use client";

import { ArrowLeft, Check, Mail, ShieldAlert } from "lucide-react";
import { useState } from "react";

interface StepProps {
  onNext: () => void;
  onBack: () => void;
}

const ENFORCEMENT_LADDER = [
  {
    level: "Warning",
    event: "A violation involving a single incident or series of minor incidents.",
    consequence: "A private, written warning from the Community Moderators.",
  },
  {
    level: "Temporarily Limited Activities",
    event:
      "A repeated violation that previously resulted in a warning, or the first incidence of a more serious violation.",
    consequence: "A private, written warning with a time-limited cooldown period.",
  },
  {
    level: "Temporary Suspension",
    event:
      "A pattern of repeated violations which the Community Moderators have tried to address with warnings, or a single serious violation.",
    consequence: "A private written warning with conditions for return from suspension.",
  },
  {
    level: "Permanent Ban",
    event:
      "A pattern of repeated violations that other steps have failed to resolve, or a violation so serious that there is no way to keep the community safe with this person as a member.",
    consequence:
      "Access to all Codetopia spaces, tools, and communication channels is permanently removed.",
  },
];

export function OnboardingStepEnforcement({ onNext, onBack }: StepProps) {
  const [acknowledged, setAcknowledged] = useState(false);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 w-full max-w-3xl">
      <span className="font-mono text-xs font-medium text-zinc-400 mb-6 block">
        Reporting & Enforcement
      </span>

      <h1 className="text-4xl sm:text-5xl font-bold text-zinc-900 mb-3 leading-[1.1]">
        Safety & Enforcement
      </h1>
      <p className="font-mono text-zinc-500 text-sm leading-relaxed mb-8">
        How to report issues and what happens when violations occur.
      </p>

      {/* Report an issue */}
      <div className="border border-zinc-200 bg-white p-5 mb-8 flex gap-4 items-start">
        <Mail className="w-4 h-4 text-zinc-400 shrink-0 mt-1" />
        <div>
          <p className="font-mono text-xs font-medium text-zinc-400 mb-2">Report an Issue</p>
          <p className="text-sm font-mono text-zinc-600 leading-relaxed mb-3">
            If you witness or experience a Code of Conduct violation, reach out to our Community
            Moderators privately:
          </p>
          <a
            href="mailto:codetopiancommunity@gmail.com"
            className="text-sm font-mono font-semibold text-zinc-900 underline underline-offset-4 hover:text-zinc-500 transition-colors"
          >
            codetopiancommunity@gmail.com
          </a>
          <p className="text-xs font-mono text-zinc-400 mt-3">
            All reports are taken seriously and handled with confidentiality.
          </p>
        </div>
      </div>

      {/* Enforcement Ladder */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-5">
          <ShieldAlert className="w-3.5 h-3.5 text-zinc-400" />
          <p className="font-mono text-xs font-medium text-zinc-400">Enforcement Ladder</p>
        </div>

        <div className="space-y-4">
          {ENFORCEMENT_LADDER.map((step, i) => (
            <div key={step.level} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-6 h-6 bg-zinc-900 text-white flex items-center justify-center text-[10px] font-mono font-bold shrink-0">
                  {i + 1}
                </div>
                {i < ENFORCEMENT_LADDER.length - 1 && (
                  <div className="w-px flex-1 bg-zinc-200 my-1 min-h-[1rem]" />
                )}
              </div>
              <div className="pb-4 flex flex-col gap-3">
                <p className="text-sm font-mono font-semibold text-zinc-900">{step.level}</p>
                <div>
                  <span className="font-mono text-xs font-medium text-zinc-400 block mb-1">
                    Event
                  </span>
                  <p className="text-sm font-mono text-zinc-600 leading-relaxed">{step.event}</p>
                </div>
                <div>
                  <span className="font-mono text-xs font-medium text-zinc-400 block mb-1">
                    Consequence
                  </span>
                  <p className="text-sm font-mono text-zinc-600 leading-relaxed">
                    {step.consequence}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Acknowledgement */}
      <label className="flex gap-3 items-start cursor-pointer border border-zinc-200 bg-white p-4 hover:bg-zinc-50 transition-colors mb-6">
        <input
          type="checkbox"
          checked={acknowledged}
          onChange={(e) => setAcknowledged(e.target.checked)}
          className="mt-0.5 w-4 h-4 accent-zinc-900 shrink-0"
        />
        <span className="text-sm font-mono text-zinc-600 leading-relaxed">
          I acknowledge that I have read and understood the reporting process and enforcement
          ladder. I understand that violations may result in consequences ranging from warnings to
          permanent removal.
        </span>
      </label>

      <div className="flex items-center gap-3">
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
          disabled={!acknowledged}
          className="bg-zinc-900 text-white px-8 py-3 text-sm font-medium hover:bg-zinc-700 transition-colors font-mono disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Check className="w-3.5 h-3.5" /> I Understand — Continue
        </button>
      </div>
    </div>
  );
}

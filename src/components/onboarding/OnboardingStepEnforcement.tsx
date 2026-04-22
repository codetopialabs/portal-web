"use client";

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
    event: "A repeated violation that previously resulted in a warning, or the first incidence of a more serious violation.",
    consequence: "A private, written warning with a time-limited cooldown period.",
  },
  {
    level: "Temporary Suspension",
    event: "A pattern of repeated violations which the Community Moderators have tried to address with warnings, or a single serious violation.",
    consequence: "A private written warning with conditions for return from suspension.",
  },
  {
    level: "Permanent Ban",
    event: "A pattern of repeated violations that other steps have failed to resolve, or a violation so serious that there is no way to keep the community safe with this person as a member.",
    consequence: "Access to all Codetopia spaces, tools, and communication channels is permanently removed.",
  },
];

export function OnboardingStepEnforcement({ onNext, onBack }: StepProps) {
  const [acknowledged, setAcknowledged] = useState(false);

  return (
    <div className="flex flex-col max-w-xl">
      <p className="text-xs uppercase tracking-widest text-zinc-400 font-mono mb-3">
        Reporting & Enforcement
      </p>
      <h1 className="text-3xl font-bold font-mono uppercase tracking-widest text-zinc-900 mb-2">
        Keeping Us Safe
      </h1>
      <p className="font-mono text-zinc-500 text-sm mb-8">
        How to report issues and what happens when violations occur.
      </p>

      {/* Reporting */}
      <div className="border border-zinc-200 p-5 mb-6 bg-zinc-50">
        <p className="text-xs uppercase tracking-widest text-zinc-400 font-mono mb-2">
          Report an Issue
        </p>
        <p className="text-sm font-mono text-zinc-600 leading-relaxed mb-3">
          If you witness or experience a Code of Conduct violation, please reach out to our
          Community Moderators privately:
        </p>
        <a
          href="mailto:codetopiancommunity@gmail.com"
          className="text-sm font-mono font-semibold text-zinc-900 underline hover:text-zinc-600 transition-colors"
        >
          codetopiacommunity@gmail.com
        </a>
        <p className="text-xs font-mono text-zinc-500 mt-3">
          All reports are taken seriously and handled with confidentiality.
        </p>
      </div>

      {/* Enforcement Ladder */}
      <div className="mb-8">
        <p className="text-xs uppercase tracking-widest text-zinc-400 font-mono mb-4">
          Enforcement Ladder
        </p>
        <div className="space-y-3">
          {ENFORCEMENT_LADDER.map((step, i) => (
            <div key={i} className="flex gap-4 border-l-2 border-zinc-200 pl-4 py-2">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-mono font-bold text-zinc-900">
                  {i + 1}. {step.level}
                </p>
                <p className="text-xs font-mono text-zinc-500 leading-relaxed">
                  <span className="text-zinc-400 uppercase tracking-widest">Event:</span>{" "}
                  {step.event}
                </p>
                <p className="text-xs font-mono text-zinc-500 leading-relaxed">
                  <span className="text-zinc-400 uppercase tracking-widest">Consequence:</span>{" "}
                  {step.consequence}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Acknowledgement checkbox */}
      <label className="flex gap-3 items-start cursor-pointer border border-zinc-200 p-4 hover:bg-zinc-50 transition-colors">
        <input
          type="checkbox"
          checked={acknowledged}
          onChange={(e) => setAcknowledged(e.target.checked)}
          className="mt-0.5 w-4 h-4 accent-zinc-900 shrink-0"
        />
        <span className="text-xs font-mono text-zinc-600 leading-relaxed">
          I acknowledge that I have read and understood the reporting process and enforcement
          ladder. I understand that violations may result in consequences ranging from warnings to
          permanent removal from the community.
        </span>
      </label>

      <div className="flex gap-3 mt-6">
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
          disabled={!acknowledged}
          className="bg-zinc-900 text-white px-6 py-3 text-sm uppercase tracking-widest hover:bg-zinc-700 transition-colors font-mono disabled:opacity-30 disabled:cursor-not-allowed"
        >
          I Understand — Continue
        </button>
      </div>
    </div>
  );
}

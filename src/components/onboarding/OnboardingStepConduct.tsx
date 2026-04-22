"use client";

import { useState } from "react";

interface StepProps {
  onNext: () => void;
  onBack: () => void;
}

const ENCOURAGED = [
  { label: "Be inclusive", detail: "Welcome people of all skill levels. Never gatekeep knowledge or make others feel inferior for what they do not yet know." },
  { label: "Be collaborative", detail: "Share knowledge freely. Lift others as you climb." },
  { label: "Be respectful", detail: "Engage with empathy and kindness. Respect different viewpoints and experiences." },
  { label: "Be constructive", detail: "Give feedback that helps people grow. Critique ideas, not people." },
  { label: "Be accountable", detail: "Take responsibility for your actions. Commit to repairing harm when it occurs." },
  { label: "Be a learner", detail: "Stay curious, stay humble, and embrace the fact that there is always more to learn." },
  { label: "Give credit", detail: "Always properly credit the sources, ideas, and work of others." },
];

const RESTRICTED = [
  { label: "Harassment", detail: "Violating explicitly expressed boundaries or engaging in unnecessary personal attention after any clear request to stop." },
  { label: "Character attacks", detail: "Making insulting, demeaning, or pejorative comments directed at a community member or group." },
  { label: "Discrimination or stereotyping", detail: "Characterizing anyone's personality or behaviour on the basis of immutable identities or traits." },
  { label: "Sexualization", detail: "Behaving in a way that would generally be considered inappropriately intimate in the context of the community." },
  { label: "Violating confidentiality", detail: "Sharing or acting on someone's personal or private information without their permission." },
  { label: "Endangerment", detail: "Causing, encouraging, or threatening violence or other harm toward any person or group." },
  { label: "Gatekeeping", detail: "Deliberately making others feel unwelcome or inadequate because of their skill level or background." },
  { label: "Elitism", detail: "Dismissing or belittling contributions, questions, or ideas because they are considered too basic or simple." },
  { label: "Plagiarism", detail: "Misrepresenting others' code, ideas, or work as your own." },
  { label: "Misleading identity", detail: "Impersonating someone else or pretending to be someone else to evade enforcement actions." },
  { label: "Unsolicited promotion", detail: "Sharing marketing or commercial content outside the norms of the community." },
];

export function OnboardingStepConduct({ onNext, onBack }: StepProps) {
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="flex flex-col max-w-2xl">
      <p className="text-xs uppercase tracking-widest text-zinc-400 font-mono mb-3">
        Code of Conduct
      </p>
      <h1 className="text-3xl font-bold font-mono uppercase tracking-widest text-zinc-900 mb-2">
        How We Behave
      </h1>
      <p className="font-mono text-zinc-500 text-sm mb-8">
        Read through our expected and prohibited behaviours before joining.
      </p>

      {/* Encouraged */}
      <div className="mb-6">
        <p className="text-xs uppercase tracking-widest text-zinc-400 font-mono mb-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
          Encouraged Behaviours
        </p>
        <div className="space-y-2">
          {ENCOURAGED.map((item, i) => (
            <div key={i} className="flex gap-3 text-sm font-mono">
              <span className="text-emerald-500 shrink-0 mt-0.5">✓</span>
              <div>
                <span className="font-semibold text-zinc-800">{item.label}</span>
                <span className="text-zinc-500"> — {item.detail}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Restricted */}
      <div className="mb-8">
        <p className="text-xs uppercase tracking-widest text-zinc-400 font-mono mb-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
          Restricted Behaviours
        </p>
        <div className="space-y-2">
          {RESTRICTED.map((item, i) => (
            <div key={i} className="flex gap-3 text-sm font-mono">
              <span className="text-red-400 shrink-0 mt-0.5">✕</span>
              <div>
                <span className="font-semibold text-zinc-800">{item.label}</span>
                <span className="text-zinc-500"> — {item.detail}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Agreement checkbox */}
      <label className="flex gap-3 items-start cursor-pointer border border-zinc-200 p-4 hover:bg-zinc-50 transition-colors">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-0.5 w-4 h-4 accent-zinc-900 shrink-0"
        />
        <span className="text-xs font-mono text-zinc-600 leading-relaxed">
          By checking this box, I confirm that I have read and understood the Codetopia Community
          Code of Conduct, and I agree to uphold these standards in all community spaces.
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
          disabled={!agreed}
          className="bg-zinc-900 text-white px-6 py-3 text-sm uppercase tracking-widest hover:bg-zinc-700 transition-colors font-mono disabled:opacity-30 disabled:cursor-not-allowed"
        >
          I Agree — Continue
        </button>
      </div>
    </div>
  );
}

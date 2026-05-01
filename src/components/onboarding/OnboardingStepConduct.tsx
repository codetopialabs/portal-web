"use client";

import { ArrowLeft, Check, Mail, ShieldAlert, X } from "lucide-react";
import { useState } from "react";
import { useOnboardingStore } from "@/store/onboarding.store";

type Tab = "encouraged" | "restricted" | "enforcement";

interface StepProps {
  onNext: () => void;
  onBack: () => void;
}

const ENCOURAGED = [
  {
    label: "Be inclusive",
    detail:
      "Welcome people of all skill levels. Never gatekeep knowledge or make others feel inferior for what they do not yet know.",
  },
  { label: "Be collaborative", detail: "Share knowledge freely. Lift others as you climb." },
  {
    label: "Be respectful",
    detail: "Engage with empathy and kindness. Respect different viewpoints and experiences.",
  },
  {
    label: "Be constructive",
    detail: "Give feedback that helps people grow. Critique ideas, not people.",
  },
  {
    label: "Be accountable",
    detail: "Take responsibility for your actions. Commit to repairing harm when it occurs.",
  },
  {
    label: "Be a learner",
    detail: "Stay curious, stay humble, and embrace the fact that there is always more to learn.",
  },
  {
    label: "Give credit",
    detail: "Always properly credit the sources, ideas, and work of others.",
  },
];

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

const RESTRICTED = [
  {
    label: "Harassment",
    detail:
      "Violating explicitly expressed boundaries or engaging in unnecessary personal attention after any clear request to stop.",
  },
  {
    label: "Character attacks",
    detail:
      "Making insulting, demeaning, or pejorative comments directed at a community member or group.",
  },
  {
    label: "Discrimination or stereotyping",
    detail:
      "Characterizing anyone's personality or behaviour on the basis of immutable identities or traits.",
  },
  {
    label: "Sexualization",
    detail:
      "Behaving in a way that would generally be considered inappropriately intimate in the context of the community.",
  },
  {
    label: "Violating confidentiality",
    detail:
      "Sharing or acting on someone's personal or private information without their permission.",
  },
  {
    label: "Endangerment",
    detail:
      "Causing, encouraging, or threatening violence or other harm toward any person or group.",
  },
  {
    label: "Gatekeeping",
    detail:
      "Deliberately making others feel unwelcome or inadequate because of their skill level or background.",
  },
  {
    label: "Elitism",
    detail:
      "Dismissing or belittling contributions, questions, or ideas because they are considered too basic or simple.",
  },
  { label: "Plagiarism", detail: "Misrepresenting others' code, ideas, or work as your own." },
  {
    label: "Misleading identity",
    detail:
      "Impersonating someone else or pretending to be someone else to evade enforcement actions.",
  },
  {
    label: "Unsolicited promotion",
    detail: "Sharing marketing or commercial content outside the norms of the community.",
  },
];

export function OnboardingStepConduct({ onNext, onBack }: StepProps) {
  const conductAgreed = useOnboardingStore((s) => s.conductAgreed);
  const merge = useOnboardingStore((s) => s.merge);
  const [agreed, setAgreed] = useState(conductAgreed);
  const [activeTab, setActiveTab] = useState<Tab>("encouraged");

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 w-full max-w-3xl">
      <span className="text-[10px] uppercase tracking-[0.25em] text-zinc-400 font-mono font-bold mb-6 block">
        Code of Conduct
      </span>

      <h1 className="text-4xl sm:text-5xl font-bold text-zinc-900 mb-3 leading-[1.1]">
        How We Behave
      </h1>
      <p className="font-mono text-zinc-500 text-sm leading-relaxed mb-8">
        Read through our expected and prohibited behaviours before joining.
      </p>

      {/* Tabs */}
      <div className="flex border-b border-zinc-200 mb-6">
        <button
          type="button"
          onClick={() => setActiveTab("encouraged")}
          className={`flex items-center gap-2 px-4 py-2.5 text-[11px] uppercase tracking-[0.2em] font-mono font-bold transition-colors border-b-2 -mb-px ${
            activeTab === "encouraged"
              ? "border-emerald-500 text-zinc-900"
              : "border-transparent text-zinc-400 hover:text-zinc-600"
          }`}
        >
          <span className="w-1.5 h-1.5 bg-emerald-500 shrink-0" />
          Encouraged
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("restricted")}
          className={`flex items-center gap-2 px-4 py-2.5 text-[11px] uppercase tracking-[0.2em] font-mono font-bold transition-colors border-b-2 -mb-px ${
            activeTab === "restricted"
              ? "border-red-500 text-zinc-900"
              : "border-transparent text-zinc-400 hover:text-zinc-600"
          }`}
        >
          <span className="w-1.5 h-1.5 bg-red-500 shrink-0" />
          Restricted
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("enforcement")}
          className={`flex items-center gap-2 px-4 py-2.5 text-[11px] uppercase tracking-[0.2em] font-mono font-bold transition-colors border-b-2 -mb-px ${
            activeTab === "enforcement"
              ? "border-zinc-900 text-zinc-900"
              : "border-transparent text-zinc-400 hover:text-zinc-600"
          }`}
        >
          <span className="w-1.5 h-1.5 bg-zinc-900 shrink-0" />
          Enforcement
        </button>
      </div>

      {/* Tab content */}
      <div className="space-y-5 mb-8">
        {activeTab === "encouraged" &&
          ENCOURAGED.map((item, i) => (
            <div key={i} className="flex gap-3 animate-in fade-in duration-300">
              <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-1" />
              <div>
                <p className="text-sm font-mono font-semibold text-zinc-800">{item.label}</p>
                <p className="text-sm font-mono text-zinc-500 leading-relaxed mt-0.5">
                  {item.detail}
                </p>
              </div>
            </div>
          ))}

        {activeTab === "restricted" &&
          RESTRICTED.map((item, i) => (
            <div key={i} className="flex gap-3 animate-in fade-in duration-300">
              <X className="w-3.5 h-3.5 text-red-400 shrink-0 mt-1" />
              <div>
                <p className="text-sm font-mono font-semibold text-zinc-800">{item.label}</p>
                <p className="text-sm font-mono text-zinc-500 leading-relaxed mt-0.5">
                  {item.detail}
                </p>
              </div>
            </div>
          ))}

        {activeTab === "enforcement" && (
          <div className="animate-in fade-in duration-300 space-y-6">
            <div className="border border-zinc-200 bg-white p-5 flex gap-4 items-start">
              <Mail className="w-4 h-4 text-zinc-400 shrink-0 mt-1" />
              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] font-mono font-bold text-zinc-400 mb-2">
                  Report an Issue
                </p>
                <p className="text-sm font-mono text-zinc-600 leading-relaxed mb-3">
                  If you witness or experience a Code of Conduct violation, reach out to our
                  Community Moderators privately:
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

            <div>
              <div className="flex items-center gap-2 mb-5">
                <ShieldAlert className="w-3.5 h-3.5 text-zinc-400" />
                <p className="text-[10px] uppercase tracking-[0.25em] font-mono font-bold text-zinc-400">
                  Enforcement Ladder
                </p>
              </div>
              <div className="space-y-4">
                {ENFORCEMENT_LADDER.map((step, i) => (
                  <div key={i} className="flex gap-4">
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
                        <span className="text-[10px] uppercase tracking-[0.2em] font-mono font-bold text-zinc-400 block mb-1">
                          Event
                        </span>
                        <p className="text-sm font-mono text-zinc-600 leading-relaxed">
                          {step.event}
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase tracking-[0.2em] font-mono font-bold text-zinc-400 block mb-1">
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
          </div>
        )}
      </div>

      {/* Agreement */}
      <label className="flex gap-3 items-start cursor-pointer border border-zinc-200 bg-white p-4 hover:bg-zinc-50 transition-colors mb-6">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => {
            setAgreed(e.target.checked);
            merge({ conductAgreed: e.target.checked });
          }}
          className="mt-0.5 w-4 h-4 accent-zinc-900 shrink-0"
        />
        <span className="text-sm font-mono text-zinc-600 leading-relaxed">
          I have read and understood the Codetopia Community Code of Conduct and Enforcement Policy.
          I agree to uphold these standards and acknowledge that violations may result in
          consequences up to and including permanent removal.
        </span>
      </label>

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
          disabled={!agreed}
          className="bg-zinc-900 text-white px-8 py-3 text-[11px] uppercase tracking-[0.2em] hover:bg-zinc-700 transition-colors font-mono disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Check className="w-3.5 h-3.5" /> I Agree — Continue
        </button>
      </div>
    </div>
  );
}

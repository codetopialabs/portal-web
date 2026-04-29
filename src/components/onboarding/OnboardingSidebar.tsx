"use client";

import Image from "next/image";

const STEPS = [
  { label: "Terms", description: "Platform & privacy" },
  { label: "Welcome", description: "Who we are" },
  { label: "Core Values", description: "What we stand for" },
  { label: "Code of Conduct", description: "How we behave & enforce" },
  { label: "Intro Video", description: "Meet Codetopia Community" },
  { label: "Join Us", description: "Discord & WhatsApp" },
  { label: "Your Background", description: "Discipline & experience" },
  { label: "Your Goals", description: "What you're here for" },
  { label: "Your Profile", description: "Set up your account" },
  { label: "Welcome In", description: "You're all set" },
];

interface OnboardingSidebarProps {
  currentStep: number;
}

export function OnboardingSidebar({ currentStep }: OnboardingSidebarProps) {
  const progress = Math.round((currentStep / (STEPS.length - 1)) * 100);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-52 shrink-0 h-screen sticky top-0 bg-zinc-950 px-5 py-8">
        <div className="mb-8">
          <Image
            src="/logos/codetopia-community.png"
            alt="Codetopia Community"
            width={140}
            height={36}
            className="object-contain h-6 w-auto brightness-0 invert"
            priority
          />
        </div>

        <nav className="flex flex-col flex-1 overflow-y-auto pl-2 py-4">
          {STEPS.map((step, i) => {
            const isCompleted = i < currentStep;
            const isActive = i === currentStep;

            return (
              <div key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div
                    className={`
                      w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px] leading-none font-bold font-mono transition-all duration-300
                      ${isCompleted ? "bg-zinc-100 text-zinc-900" : ""}
                      ${isActive ? "bg-white text-zinc-900 ring-2 ring-white ring-offset-2 ring-offset-zinc-950" : ""}
                      ${!isCompleted && !isActive ? "bg-zinc-800 text-zinc-500" : ""}
                    `}
                  >
                    {isCompleted ? (
                      <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                        <path
                          d="M2.5 7L5.5 10L11.5 4"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : (
                      <span>{i + 1}</span>
                    )}
                  </div>
                  {i < STEPS.length - 1 && (
                    <div
                      className={`w-px flex-1 my-1 min-h-[1.5rem] transition-all duration-500 ${i < currentStep ? "bg-zinc-400" : "bg-zinc-800"}`}
                    />
                  )}
                </div>
                <div className="pb-4 pt-0.5">
                  <p
                    className={`text-xs font-mono font-semibold uppercase tracking-widest transition-colors duration-300 ${isActive ? "text-white" : isCompleted ? "text-zinc-400" : "text-zinc-600"}`}
                  >
                    {step.label}
                  </p>
                  <p
                    className={`text-[10px] font-mono mt-0.5 transition-colors duration-300 ${isActive ? "text-zinc-400" : "text-zinc-700"}`}
                  >
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </nav>

        <p className="text-[10px] font-mono text-zinc-700 mt-auto">
          Step {currentStep + 1} of {STEPS.length}
        </p>
      </aside>

      {/* Mobile header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-zinc-950 px-4 py-3 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Image
            src="/logos/codetopia-community.png"
            alt="Codetopia Community"
            width={120}
            height={30}
            className="object-contain h-5 w-auto brightness-0 invert"
            priority
          />
          <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
            {currentStep + 1} / {STEPS.length}
          </span>
        </div>

        <div className="w-full h-0.5 bg-zinc-800 overflow-hidden">
          <div
            className="h-full bg-white transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="text-[10px] font-mono text-zinc-300 uppercase tracking-widest">
          {STEPS[currentStep]?.label}
          <span className="text-zinc-600"> — {STEPS[currentStep]?.description}</span>
        </p>
      </header>
    </>
  );
}

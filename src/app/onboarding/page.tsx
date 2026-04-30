"use client";

import { useEffect, useState } from "react";
import { OnboardingSidebar } from "@/components/onboarding/OnboardingSidebar";
import { OnboardingStepBackground } from "@/components/onboarding/OnboardingStepBackground";
import { OnboardingStepCommunity } from "@/components/onboarding/OnboardingStepCommunity";
import { OnboardingStepConduct } from "@/components/onboarding/OnboardingStepConduct";
import { OnboardingStepCongrats } from "@/components/onboarding/OnboardingStepCongrats";
import { OnboardingStepGoals } from "@/components/onboarding/OnboardingStepGoals";
import { OnboardingStepProfile } from "@/components/onboarding/OnboardingStepProfile";
import { OnboardingStepTerms } from "@/components/onboarding/OnboardingStepTerms";
import { OnboardingStepValues } from "@/components/onboarding/OnboardingStepValues";
import { OnboardingStepVideo } from "@/components/onboarding/OnboardingStepVideo";
import { OnboardingStepWelcome } from "@/components/onboarding/OnboardingStepWelcome";
import { useUserStore } from "@/store/user.store";

const TOTAL_STEPS = 10;

export default function OnboardingPage() {
  const isLoading = useUserStore((s) => s.isLoading);

  const [currentStep, setCurrentStep] = useState(0);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = Math.min(Number(localStorage.getItem("onboarding_step") ?? 0), TOTAL_STEPS - 1);
    setCurrentStep(saved);
    setHydrated(true);
  }, []);

  function nextStep() {
    setCurrentStep((s) => {
      const next = Math.min(s + 1, TOTAL_STEPS - 1);
      localStorage.setItem("onboarding_step", String(next));
      return next;
    });
  }

  function prevStep() {
    setCurrentStep((s) => {
      const prev = Math.max(s - 1, 0);
      localStorage.setItem("onboarding_step", String(prev));
      return prev;
    });
  }

  return (
    <main className="h-screen overflow-hidden bg-white flex flex-col md:flex-row font-mono text-zinc-900">
      <OnboardingSidebar currentStep={currentStep} />

      <div className="flex-1 overflow-y-auto pt-[88px] md:pt-0 bg-[#f9fafb] bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:40px_40px]">

        <div className="flex items-center justify-center min-h-full px-8 py-12 md:px-16">
          {isLoading || !hydrated ? (
            <div className="flex flex-col items-center gap-6">
              <div className="flex items-center gap-2">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-2 h-2 rounded-full bg-zinc-900 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
              <p className="text-xs uppercase tracking-widest text-zinc-400 font-mono">Loading</p>
            </div>
          ) : (
            <>
              {currentStep === 0 && <OnboardingStepTerms onNext={nextStep} />}
              {currentStep === 1 && <OnboardingStepWelcome onNext={nextStep} onBack={prevStep} />}
              {currentStep === 2 && <OnboardingStepValues onNext={nextStep} onBack={prevStep} />}
              {currentStep === 3 && <OnboardingStepConduct onNext={nextStep} onBack={prevStep} />}
              {currentStep === 4 && <OnboardingStepVideo onNext={nextStep} onBack={prevStep} />}
              {currentStep === 5 && <OnboardingStepCommunity onNext={nextStep} onBack={prevStep} />}
              {currentStep === 6 && (
                <OnboardingStepBackground onNext={nextStep} onBack={prevStep} />
              )}
              {currentStep === 7 && <OnboardingStepGoals onNext={nextStep} onBack={prevStep} />}
              {currentStep === 8 && <OnboardingStepProfile onBack={prevStep} onNext={nextStep} />}
              {currentStep === 9 && <OnboardingStepCongrats />}
            </>
          )}
        </div>
      </div>
    </main>
  );
}

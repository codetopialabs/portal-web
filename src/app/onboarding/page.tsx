"use client";

import { useState } from "react";
import { OnboardingSidebar } from "@/components/onboarding/OnboardingSidebar";
import { OnboardingStepWelcome } from "@/components/onboarding/OnboardingStepWelcome";
import { OnboardingStepValues } from "@/components/onboarding/OnboardingStepValues";
import { OnboardingStepConduct } from "@/components/onboarding/OnboardingStepConduct";
import { OnboardingStepVideo } from "@/components/onboarding/OnboardingStepVideo";
import { OnboardingStepEnforcement } from "@/components/onboarding/OnboardingStepEnforcement";
import { OnboardingStepCommunity } from "@/components/onboarding/OnboardingStepCommunity";
import { OnboardingStepProfile } from "@/components/onboarding/OnboardingStepProfile";
import { OnboardingStepCongrats } from "@/components/onboarding/OnboardingStepCongrats";
import { useUserStore } from "@/store/user.store";

const TOTAL_STEPS = 8;

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const isLoading = useUserStore((s) => s.isLoading);

  const nextStep = () => setCurrentStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  const prevStep = () => setCurrentStep((s) => Math.max(s - 1, 0));

  return (
    <main className="h-screen overflow-hidden bg-white flex flex-col md:flex-row font-mono text-zinc-900">
      <OnboardingSidebar currentStep={currentStep} />

      <div className="flex-1 overflow-y-auto pt-[88px] md:pt-0">
        <div className="flex flex-col items-center justify-center min-h-full px-6 py-10 md:py-12 md:px-12">
          <div className="w-full max-w-5xl mx-auto">
            {isLoading ? (
              <div className="flex flex-col items-center gap-6 py-16">
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
                {currentStep === 0 && <OnboardingStepWelcome onNext={nextStep} />}
                {currentStep === 1 && <OnboardingStepValues onNext={nextStep} onBack={prevStep} />}
                {currentStep === 2 && <OnboardingStepConduct onNext={nextStep} onBack={prevStep} />}
                {currentStep === 3 && <OnboardingStepVideo onNext={nextStep} onBack={prevStep} />}
                {currentStep === 4 && <OnboardingStepEnforcement onNext={nextStep} onBack={prevStep} />}
                {currentStep === 5 && <OnboardingStepCommunity onNext={nextStep} onBack={prevStep} />}
                {currentStep === 6 && <OnboardingStepProfile onBack={prevStep} onNext={nextStep} />}
                {currentStep === 7 && <OnboardingStepCongrats />}
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

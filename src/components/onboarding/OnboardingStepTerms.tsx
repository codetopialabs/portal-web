import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { useOnboardingStore } from "@/store/onboarding.store";

interface StepProps {
  onNext: () => void;
}

export function OnboardingStepTerms({ onNext }: StepProps) {
  const termsAccepted = useOnboardingStore((s) => s.termsAccepted);
  const merge = useOnboardingStore((s) => s.merge);
  const [accepted, setAccepted] = useState(termsAccepted);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 w-full max-w-3xl">
      <span className="text-[10px] uppercase tracking-[0.25em] text-zinc-400 font-mono font-bold mb-6 block">
        Terms of Service
      </span>

      <h1 className="text-4xl sm:text-5xl font-bold text-zinc-900 mb-3 leading-[1.1]">
        Before We Begin
      </h1>
      <p className="font-mono text-zinc-500 text-sm leading-relaxed mb-8">
        Please review how we handle your data and the terms of using this platform.
      </p>

      <div className="space-y-5 mb-8">
        <div>
          <h3 className="text-sm font-mono font-semibold text-zinc-900 mb-1">
            Data Collection & Usage
          </h3>
          <p className="text-sm font-mono text-zinc-500 leading-relaxed">
            We collect and store your personal information including name, email, profile data, and
            activity logs to manage your membership and improve our services.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-mono font-semibold text-zinc-900 mb-1">
            Analytics & Monitoring
          </h3>
          <p className="text-sm font-mono text-zinc-500 leading-relaxed">
            We use analytics tools to track platform usage and engagement metrics to understand how
            members interact with the platform and make data-driven improvements.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-mono font-semibold text-zinc-900 mb-1">
            Third-Party Integrations
          </h3>
          <p className="text-sm font-mono text-zinc-500 leading-relaxed">
            Your data may be shared with services we use to operate the community, including Discord
            and WhatsApp. We only share what's necessary for these integrations to function.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-mono font-semibold text-zinc-900 mb-1">Account Management</h3>
          <p className="text-sm font-mono text-zinc-500 leading-relaxed">
            Codetopia reserves the right to suspend or terminate accounts that violate our terms or
            engage in harmful behavior. You will be notified before any account action is taken.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-mono font-semibold text-zinc-900 mb-1">Content Ownership</h3>
          <p className="text-sm font-mono text-zinc-500 leading-relaxed">
            You retain ownership of content you create. By posting on our platform, you grant
            Codetopia a license to use and display that content for community purposes.
          </p>
        </div>
      </div>

      <label className="flex gap-3 items-start cursor-pointer border border-zinc-200 bg-white p-4 hover:bg-zinc-50 transition-colors mb-6">
        <input
          type="checkbox"
          checked={accepted}
          onChange={(e) => {
            setAccepted(e.target.checked);
            merge({ termsAccepted: e.target.checked });
          }}
          className="mt-0.5 w-4 h-4 accent-zinc-900 shrink-0"
        />
        <span className="text-sm font-mono text-zinc-600 leading-relaxed">
          I have read and agree to the Codetopia Terms of Service and Privacy Policy. I understand
          how my data will be collected, stored, and used by the platform.
        </span>
      </label>

      <div className="flex items-center gap-6">
        <button
          type="button"
          onClick={onNext}
          disabled={!accepted}
          className="bg-zinc-900 text-white px-8 py-3.5 text-[11px] uppercase tracking-[0.2em] hover:bg-zinc-700 transition-colors font-mono flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Continue <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

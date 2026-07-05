"use client";

import { ArrowLeft, ArrowRight, Heart, Megaphone, Target } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { COMMUNITY_GOALS, REFERRAL_SOURCES } from "@/lib/profile-options";
import { useOnboardingStore } from "@/store/onboarding.store";
import { useUserStore } from "@/store/user.store";

interface OnboardingStepGoalsProps {
  onNext: () => void;
  onBack: () => void;
}

const hintStyles = "font-mono text-[11px] text-zinc-500 leading-relaxed mb-3";
const labelStyles = "font-mono text-sm font-medium text-zinc-500";

function SectionHeader({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-6 h-6 bg-zinc-900 text-white flex items-center justify-center shrink-0">
        <Icon className="w-3 h-3" />
      </div>
      <h2 className="font-mono text-lg font-bold text-zinc-900">{title}</h2>
    </div>
  );
}

function Divider() {
  return <div className="border-t border-zinc-100" />;
}

function CheckIndicator({ selected }: { selected: boolean }) {
  return (
    <div
      className={`w-4 h-4 shrink-0 border flex items-center justify-center transition-all duration-150 ${
        selected ? "bg-white border-white" : "border-zinc-300 bg-white"
      }`}
    >
      {selected && (
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
          <path
            d="M2 5L4 7L8 3"
            stroke="#18181b"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </div>
  );
}

function SelectItem({
  label,
  description,
  selected,
  onClick,
  className,
}: {
  label: string;
  description?: string;
  selected: boolean;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-start gap-3 px-4 py-3.5 text-left transition-colors duration-150 ${
        selected ? "bg-zinc-900" : "bg-white hover:bg-zinc-50"
      } ${className ?? ""}`}
    >
      <div className="mt-0.5">
        <CheckIndicator selected={selected} />
      </div>
      <div className="min-w-0">
        <p
          className={`font-mono text-sm leading-snug transition-colors ${
            selected ? "text-white font-bold" : "text-zinc-600 font-medium"
          }`}
        >
          {label}
        </p>
        {description && (
          <p
            className={`font-mono text-[11px] mt-1 leading-relaxed ${
              selected ? "text-zinc-400" : "text-zinc-500"
            }`}
          >
            {description}
          </p>
        )}
      </div>
    </button>
  );
}

export function OnboardingStepGoals({ onNext, onBack }: OnboardingStepGoalsProps) {
  const updateMe = useUserStore((s) => s.updateMe);
  const onboarding = useOnboardingStore((s) => s);

  const [primaryGoal, setPrimaryGoal] = useState(onboarding.primaryGoal);
  const [communityGoals, setCommunityGoals] = useState<string[]>(onboarding.communityGoals);
  const [referralSource, setReferralSource] = useState<string | null>(onboarding.referralSource);
  const [otherReferral, setOtherReferral] = useState(onboarding.otherReferral);

  const [errors, setErrors] = useState<{
    primaryGoal?: string;
    communityGoals?: string;
    referralSource?: string;
    otherReferral?: string;
  }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function toggleGoal(value: string) {
    setCommunityGoals((prev) =>
      prev.includes(value) ? prev.filter((g) => g !== value) : [...prev, value]
    );
    setErrors((e) => ({ ...e, communityGoals: undefined }));
  }

  function saveToStore() {
    onboarding.merge({ primaryGoal, communityGoals, referralSource, otherReferral });
  }

  function handleBack() {
    saveToStore();
    onBack();
  }

  async function handleContinue() {
    const newErrors: typeof errors = {};
    if (!primaryGoal.trim()) newErrors.primaryGoal = "Please tell us your primary goal.";
    if (communityGoals.length === 0) newErrors.communityGoals = "Select at least one.";
    if (!referralSource) newErrors.referralSource = "Please let us know how you found us.";
    if (referralSource === "other" && !otherReferral.trim())
      newErrors.otherReferral = "Please tell us how you found us.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setSubmitError(null);
    setIsSubmitting(true);

    const resolvedReferral =
      referralSource === "other" ? otherReferral.trim() : (referralSource as string);

    try {
      saveToStore();
      await updateMe({
        primary_goal: primaryGoal.trim(),
        community_goals: communityGoals,
        referral_source: resolvedReferral,
      });
      onNext();
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 w-full max-w-3xl">
      <span className="font-mono text-xs font-medium text-zinc-400 mb-6 block">Your Goals</span>
      <h1 className="font-sans text-4xl sm:text-5xl font-bold text-zinc-900 mb-3 leading-[1.1]">
        What Are You Here For?
      </h1>
      <p className="font-mono text-zinc-500 text-sm leading-relaxed mb-10">
        This shapes how we connect you with mentors, peers, and programmes.
      </p>

      <div className="space-y-8">
        {/* Primary Goal */}
        <section className="space-y-4">
          <SectionHeader icon={Target} title="Your Primary Goal" />
          <p className={hintStyles}>
            Be specific. The more detail you give, the better we can support you.
          </p>
          <label htmlFor="primary-goal" className={labelStyles}>
            What is your primary goal as a Codetopia member? *
          </label>
          <textarea
            id="primary-goal"
            value={primaryGoal}
            onChange={(e) => {
              setPrimaryGoal(e.target.value);
              setErrors((er) => ({ ...er, primaryGoal: undefined }));
            }}
            placeholder="e.g. Land my first UX role in 6 months, build and launch a personal project, transition from accounting into data analysis"
            rows={3}
            className="w-full border border-zinc-200 bg-white px-3 py-2.5 font-mono text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 transition-all resize-none"
          />
          {errors.primaryGoal && (
            <p className="text-red-500 text-xs font-mono">{errors.primaryGoal}</p>
          )}
        </section>

        <Divider />

        {/* Community Goals */}
        <section className="space-y-4">
          <SectionHeader icon={Heart} title="What Do You Want From This Community?" />
          <p className={hintStyles}>
            Helps us connect you with the right people and resources. Select all that apply.
          </p>
          <p className={labelStyles}>Select all that apply *</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-zinc-200 border border-zinc-200 overflow-hidden">
            {COMMUNITY_GOALS.map((goal, i) => (
              <SelectItem
                key={goal.value}
                label={goal.label}
                description={goal.description}
                selected={communityGoals.includes(goal.value)}
                onClick={() => toggleGoal(goal.value)}
                className={
                  i === COMMUNITY_GOALS.length - 1 && COMMUNITY_GOALS.length % 2 !== 0
                    ? "sm:col-span-2"
                    : undefined
                }
              />
            ))}
          </div>
          {errors.communityGoals && (
            <p className="text-red-500 text-xs font-mono">{errors.communityGoals}</p>
          )}
        </section>

        <Divider />

        {/* Referral Source */}
        <section className="space-y-4">
          <SectionHeader icon={Megaphone} title="How Did You Find Us?" />
          <p className={hintStyles}>Helps us understand how people discover Codetopia.</p>
          <p className={labelStyles}>Select one *</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-zinc-200 border border-zinc-200 overflow-hidden">
            {REFERRAL_SOURCES.map((source, i) => (
              <SelectItem
                key={source.value}
                label={source.label}
                selected={referralSource === source.value}
                onClick={() => {
                  setReferralSource(source.value);
                  setErrors((e) => ({ ...e, referralSource: undefined }));
                }}
                className={
                  i === REFERRAL_SOURCES.length - 1 && REFERRAL_SOURCES.length % 2 !== 0
                    ? "sm:col-span-2"
                    : undefined
                }
              />
            ))}
          </div>
          {errors.referralSource && (
            <p className="text-red-500 text-xs font-mono">{errors.referralSource}</p>
          )}
          {referralSource === "other" && (
            <div className="space-y-2">
              <label htmlFor="other-referral" className={labelStyles}>
                Please tell us how *
              </label>
              <input
                id="other-referral"
                type="text"
                value={otherReferral}
                onChange={(e) => {
                  setOtherReferral(e.target.value);
                  setErrors((er) => ({ ...er, otherReferral: undefined }));
                }}
                placeholder="e.g. A YouTube video, a university notice board..."
                className="h-11 w-full border border-zinc-900 bg-white px-3 font-mono text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none transition-all"
              />
              {errors.otherReferral && (
                <p className="text-red-500 text-xs font-mono">{errors.otherReferral}</p>
              )}
            </div>
          )}
        </section>

        {submitError && <p className="text-red-500 text-sm font-mono">{submitError}</p>}

        {/* Navigation */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleBack}
            className="border border-zinc-200 bg-white px-6 py-3 text-sm font-medium text-zinc-600 hover:bg-zinc-50 transition-colors font-mono flex items-center gap-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
          <button
            type="button"
            onClick={handleContinue}
            disabled={isSubmitting}
            className="bg-zinc-900 text-white px-8 py-3 text-sm font-medium hover:bg-zinc-700 transition-colors font-mono disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-1">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-white animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            ) : (
              <>
                Continue <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

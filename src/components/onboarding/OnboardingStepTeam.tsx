"use client";

import { ArrowLeft, ArrowRight, Clock, Users } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { useCommunityTeams } from "@/hooks/useCommunityTeams";
import { HOURS_PER_MONTH } from "@/lib/profile-options";
import { useOnboardingStore } from "@/store/onboarding.store";
import { useUserStore } from "@/store/user.store";

// Teams v2 only: rendered by the onboarding page when the teamsV2 flag is on.
// Picking a team is optional here. Most members skip it and help now and
// then, when a team asks in #get-involved; a lead may later ask them to join.

interface OnboardingStepTeamProps {
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
  disabled,
  onClick,
  className,
}: {
  label: string;
  description?: string;
  selected: boolean;
  disabled?: boolean;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`w-full flex items-start gap-3 px-4 py-3.5 text-left transition-colors duration-150 ${
        selected ? "bg-zinc-900" : "bg-white hover:bg-zinc-50"
      } disabled:opacity-40 disabled:cursor-not-allowed ${className ?? ""}`}
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

export function OnboardingStepTeam({ onNext, onBack }: OnboardingStepTeamProps) {
  const updateMe = useUserStore((s) => s.updateMe);
  const onboarding = useOnboardingStore((s) => s);
  const { data: teams = [], isLoading } = useCommunityTeams();

  const [primaryTeam, setPrimaryTeam] = useState<string | null>(onboarding.primaryTeam);
  const [secondaryTeam, setSecondaryTeam] = useState<string | null>(onboarding.secondaryTeam);
  const [hoursPerMonth, setHoursPerMonth] = useState(onboarding.hoursPerMonth);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function pickPrimary(slug: string) {
    const next = primaryTeam === slug ? null : slug;
    setPrimaryTeam(next);
    if (next !== null && secondaryTeam === next) setSecondaryTeam(null);
  }

  function pickSecondary(slug: string) {
    setSecondaryTeam(secondaryTeam === slug ? null : slug);
  }

  function saveToStore() {
    onboarding.merge({ primaryTeam, secondaryTeam, hoursPerMonth });
  }

  function handleBack() {
    saveToStore();
    onBack();
  }

  async function handleContinue() {
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      saveToStore();
      await updateMe({
        primary_team: primaryTeam,
        secondary_team: primaryTeam ? secondaryTeam : null,
        hours_per_month: hoursPerMonth,
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
      <span className="font-mono text-xs font-medium text-zinc-400 mb-6 block">Your Team</span>
      <h1 className="font-sans text-4xl sm:text-5xl font-bold text-zinc-900 mb-3 leading-[1.1]">
        Where Would You Like To Help?
      </h1>
      <p className="font-mono text-zinc-500 text-sm leading-relaxed mb-10">
        Codetopia Community runs on five teams, each with a lead and a small core team. Pick the one
        you are drawn to, or skip this and help out whenever you like: teams post what they need in
        #get-involved on Discord.
      </p>

      <div className="space-y-8">
        {/* Primary team */}
        <section className="space-y-4">
          <SectionHeader icon={Users} title="Your Team" />
          <p className={hintStyles}>
            Optional. Its lead will see you on their roster and may offer you a role. You can change
            this any time in Settings.
          </p>
          <p className={labelStyles}>Pick one, or none</p>
          {isLoading ? (
            <p className="font-mono text-xs text-zinc-400">Loading teams</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-zinc-200 border border-zinc-200 overflow-hidden">
              {teams.map((team, i) => (
                <SelectItem
                  key={team.slug}
                  label={team.name}
                  description={team.description}
                  selected={primaryTeam === team.slug}
                  onClick={() => pickPrimary(team.slug)}
                  className={
                    i === teams.length - 1 && teams.length % 2 !== 0 ? "sm:col-span-2" : undefined
                  }
                />
              ))}
            </div>
          )}
        </section>

        {primaryTeam && (
          <>
            <Divider />

            {/* Secondary team */}
            <section className="space-y-4">
              <SectionHeader icon={Users} title="A Second Team?" />
              <p className={hintStyles}>
                Optional. Only if you genuinely have time for two. Most members leave this empty.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-zinc-200 border border-zinc-200 overflow-hidden">
                {teams.map((team, i) => (
                  <SelectItem
                    key={team.slug}
                    label={team.name}
                    selected={secondaryTeam === team.slug}
                    disabled={team.slug === primaryTeam}
                    onClick={() => pickSecondary(team.slug)}
                    className={
                      i === teams.length - 1 && teams.length % 2 !== 0 ? "sm:col-span-2" : undefined
                    }
                  />
                ))}
              </div>
            </section>
          </>
        )}

        <Divider />

        {/* Hours per month */}
        <section className="space-y-4">
          <SectionHeader icon={Clock} title="Time You Can Give" />
          <p className={hintStyles}>
            Optional. Hours are a ceiling, not a floor. Leads use this to match roles to the time
            people actually have.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-zinc-200 border border-zinc-200 overflow-hidden">
            {HOURS_PER_MONTH.map((option) => (
              <SelectItem
                key={option.value}
                label={option.label}
                description={option.description}
                selected={hoursPerMonth === option.value}
                onClick={() => setHoursPerMonth(hoursPerMonth === option.value ? "" : option.value)}
              />
            ))}
          </div>
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
                {primaryTeam ? "Continue" : "Skip for now"} <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

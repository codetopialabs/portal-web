"use client";

import { ArrowLeft, ArrowRight, Briefcase, Code2, TrendingUp } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { useUserStore } from "@/store/user.store";

interface OnboardingStepBackgroundProps {
  onNext: () => void;
  onBack: () => void;
}

const DISCIPLINES = [
  { value: "software_engineering", label: "Software Engineering" },
  { value: "ux_ui_design", label: "UX / UI Design" },
  { value: "data_science", label: "Data Science / Analytics" },
  { value: "ml_ai", label: "Machine Learning / AI" },
  { value: "cybersecurity", label: "Cybersecurity" },
  { value: "cloud_devops", label: "Cloud / DevOps" },
  { value: "product_management", label: "Product Management" },
  { value: "hardware_embedded", label: "Hardware / Embedded" },
  { value: "robotics_iot", label: "Robotics / IoT" },
  { value: "mobile_development", label: "Mobile Development" },
  { value: "qa_testing", label: "QA / Testing" },
  { value: "technical_writing", label: "Technical Writing" },
  { value: "other", label: "Other" },
];

const EXPERIENCE_LEVELS = [
  {
    value: "complete_beginner",
    label: "Complete Beginner",
    description: "No prior experience. Just starting out.",
  },
  {
    value: "learner",
    label: "Learner",
    description: "Studying actively. Some foundational knowledge.",
  },
  {
    value: "practitioner",
    label: "Practitioner",
    description: "Applying skills on personal projects.",
  },
  {
    value: "intermediate",
    label: "Intermediate",
    description: "1–3 years of hands-on experience.",
  },
  {
    value: "advanced",
    label: "Advanced",
    description: "3+ years. Confident and independent.",
  },
  {
    value: "expert_senior",
    label: "Expert / Senior",
    description: "5+ years. Can lead teams or mentor.",
  },
];

const MEMBER_STATUSES = [
  { value: "student", label: "Student" },
  { value: "recent_graduate", label: "Recent Graduate" },
  { value: "job_seeker", label: "Job Seeker" },
  { value: "employed_in_tech", label: "Employed in Tech" },
  { value: "employed_non_tech", label: "Employed (Non-tech)" },
  { value: "freelancer", label: "Freelancer / Contractor" },
  { value: "founder", label: "Founder / Building my own" },
  { value: "career_changer", label: "Career Changer" },
  { value: "taking_a_break", label: "Taking a Break" },
  { value: "other", label: "Other" },
];

const hintStyles = "font-mono text-[11px] text-zinc-400 leading-relaxed mb-3";
const labelStyles = "font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400 font-bold";

function SectionHeader({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-6 h-6 bg-zinc-900 text-white flex items-center justify-center shrink-0">
        <Icon className="w-3 h-3" />
      </div>
      <h2 className="font-mono font-bold text-sm uppercase tracking-[0.2em] text-zinc-900">
        {title}
      </h2>
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

function RadioItem({
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
          className={`font-mono text-xs uppercase tracking-widest leading-snug transition-colors ${
            selected ? "text-white font-bold" : "text-zinc-600 font-medium"
          }`}
        >
          {label}
        </p>
        {description && (
          <p
            className={`font-mono text-[11px] mt-1 leading-relaxed transition-colors ${
              selected ? "text-zinc-400" : "text-zinc-400"
            }`}
          >
            {description}
          </p>
        )}
      </div>
    </button>
  );
}

export function OnboardingStepBackground({ onNext, onBack }: OnboardingStepBackgroundProps) {
  const updateMe = useUserStore((s) => s.updateMe);

  const [discipline, setDiscipline] = useState<string | null>(null);
  const [otherDiscipline, setOtherDiscipline] = useState("");
  const [experienceLevel, setExperienceLevel] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [otherStatus, setOtherStatus] = useState("");
  const [currentRole, setCurrentRole] = useState("");

  const [errors, setErrors] = useState<{
    discipline?: string;
    otherDiscipline?: string;
    experienceLevel?: string;
    status?: string;
    otherStatus?: string;
  }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleContinue() {
    const newErrors: typeof errors = {};
    if (!discipline) newErrors.discipline = "Please select your primary discipline.";
    if (discipline === "other" && !otherDiscipline.trim())
      newErrors.otherDiscipline = "Please specify your discipline.";
    if (!experienceLevel) newErrors.experienceLevel = "Please select your experience level.";
    if (!status) newErrors.status = "Please select your current status.";
    if (status === "other" && !otherStatus.trim())
      newErrors.otherStatus = "Please describe your current status.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setSubmitError(null);
    setIsSubmitting(true);

    const resolvedDiscipline =
      discipline === "other" ? otherDiscipline.trim() : (discipline as string);
    const resolvedStatus = status === "other" ? otherStatus.trim() : (status as string);

    try {
      await updateMe({
        discipline: resolvedDiscipline,
        experience_level: experienceLevel as string,
        member_status: resolvedStatus,
        current_role: currentRole.trim() || undefined,
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
      <span className="text-[10px] uppercase tracking-[0.25em] text-zinc-400 font-mono font-bold mb-6 block">
        Your Background
      </span>
      <h1 className="text-4xl sm:text-5xl font-bold text-zinc-900 mb-3 leading-[1.1]">About You</h1>
      <p className="font-mono text-zinc-500 text-sm leading-relaxed mb-10">
        Help us understand what you do and where you are in your journey.
      </p>

      <div className="space-y-8">
        {/* Primary Discipline */}
        <section className="space-y-4">
          <SectionHeader icon={Code2} title="Primary Tech Discipline" />
          <p className={hintStyles}>
            Your main focus area. Used for mentorship pairing and programme recommendations.
          </p>
          <p className={labelStyles}>Select one *</p>
          {/* gap-px + bg-zinc-200 creates hairline grid lines between cells */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-zinc-200 border border-zinc-200 overflow-hidden">
            {DISCIPLINES.map((d, i) => (
              <RadioItem
                key={d.value}
                label={d.label}
                selected={discipline === d.value}
                onClick={() => {
                  setDiscipline(d.value);
                  setErrors((e) => ({ ...e, discipline: undefined }));
                }}
                className={
                  i === DISCIPLINES.length - 1 && DISCIPLINES.length % 2 !== 0
                    ? "sm:col-span-2"
                    : undefined
                }
              />
            ))}
          </div>
          {errors.discipline && (
            <p className="text-red-500 text-xs font-mono">{errors.discipline}</p>
          )}
          {discipline === "other" && (
            <div className="space-y-2">
              <label htmlFor="other-discipline" className={labelStyles}>
                Please specify *
              </label>
              <input
                id="other-discipline"
                type="text"
                value={otherDiscipline}
                onChange={(e) => {
                  setOtherDiscipline(e.target.value);
                  setErrors((er) => ({ ...er, otherDiscipline: undefined }));
                }}
                placeholder="e.g. Game Development, Blockchain, AR/VR"
                className="h-11 w-full border border-zinc-900 bg-white px-3 font-mono text-sm text-zinc-900 placeholder:text-zinc-300 focus:outline-none transition-all"
              />
              {errors.otherDiscipline && (
                <p className="text-red-500 text-xs font-mono">{errors.otherDiscipline}</p>
              )}
            </div>
          )}
        </section>

        <Divider />

        {/* Experience Level */}
        <section className="space-y-4">
          <SectionHeader icon={TrendingUp} title="Experience Level" />
          <p className={hintStyles}>
            Helps us match you with the right mentor or mentee. Be honest, there is no wrong answer.
          </p>
          <p className={labelStyles}>In your primary discipline *</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-zinc-200 border border-zinc-200 overflow-hidden">
            {EXPERIENCE_LEVELS.map((level) => (
              <RadioItem
                key={level.value}
                label={level.label}
                description={level.description}
                selected={experienceLevel === level.value}
                onClick={() => {
                  setExperienceLevel(level.value);
                  setErrors((e) => ({ ...e, experienceLevel: undefined }));
                }}
              />
            ))}
          </div>
          {errors.experienceLevel && (
            <p className="text-red-500 text-xs font-mono">{errors.experienceLevel}</p>
          )}
        </section>

        <Divider />

        {/* Current Status */}
        <section className="space-y-4">
          <SectionHeader icon={Briefcase} title="Current Status" />
          <p className={labelStyles}>What best describes you right now? *</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-zinc-200 border border-zinc-200 overflow-hidden">
            {MEMBER_STATUSES.map((s, i) => (
              <RadioItem
                key={s.value}
                label={s.label}
                selected={status === s.value}
                onClick={() => {
                  setStatus(s.value);
                  setErrors((e) => ({ ...e, status: undefined }));
                }}
                className={
                  i === MEMBER_STATUSES.length - 1 && MEMBER_STATUSES.length % 2 !== 0
                    ? "sm:col-span-2"
                    : undefined
                }
              />
            ))}
          </div>
          {errors.status && <p className="text-red-500 text-xs font-mono">{errors.status}</p>}

          {status === "other" && (
            <div className="space-y-2">
              <label htmlFor="other-status" className={labelStyles}>
                Please describe *
              </label>
              <input
                id="other-status"
                type="text"
                value={otherStatus}
                onChange={(e) => {
                  setOtherStatus(e.target.value);
                  setErrors((er) => ({ ...er, otherStatus: undefined }));
                }}
                placeholder="e.g. National Service, Intern, Bootcamp student"
                className="h-11 w-full border border-zinc-900 bg-white px-3 font-mono text-sm text-zinc-900 placeholder:text-zinc-300 focus:outline-none transition-all"
              />
              {errors.otherStatus && (
                <p className="text-red-500 text-xs font-mono">{errors.otherStatus}</p>
              )}
            </div>
          )}

          <div className="space-y-2 pt-1">
            <label htmlFor="current-role" className={labelStyles}>
              Current role or occupation
            </label>
            <p className={hintStyles}>
              Helps us understand your day-to-day context. Optional but useful.
            </p>
            <input
              id="current-role"
              type="text"
              value={currentRole}
              onChange={(e) => setCurrentRole(e.target.value)}
              placeholder="e.g. Frontend Developer at Acme Ltd, CS student at UG, Freelance designer"
              className="h-11 w-full border border-zinc-200 bg-white px-3 font-mono text-sm text-zinc-900 placeholder:text-zinc-300 focus:outline-none focus:border-zinc-900 transition-all"
            />
          </div>
        </section>

        {submitError && <p className="text-red-500 text-sm font-mono">{submitError}</p>}

        {/* Navigation */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onBack}
            className="border border-zinc-200 bg-white px-6 py-3 text-[11px] uppercase tracking-[0.2em] text-zinc-600 hover:bg-zinc-50 transition-colors font-mono flex items-center gap-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
          <button
            type="button"
            onClick={handleContinue}
            disabled={isSubmitting}
            className="bg-zinc-900 text-white px-8 py-3 text-[11px] uppercase tracking-[0.2em] hover:bg-zinc-700 transition-colors font-mono disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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

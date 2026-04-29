"use client";

import { ArrowLeft, ArrowRight, Camera, Cpu, Globe, Plus, User, X } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  FaBehance,
  FaCodepen,
  FaDiscord,
  FaDribbble,
  FaFacebook,
  FaGithub,
  FaGitlab,
  FaInstagram,
  FaLinkedin,
  FaMedium,
  FaStackOverflow,
  FaTelegram,
  FaTiktok,
  FaWhatsapp,
  FaXTwitter,
} from "react-icons/fa6";
import { useUserStore } from "@/store/user.store";

interface OnboardingStepProfileProps {
  onBack: () => void;
  onNext: () => void;
}

interface ProfileFormValues {
  full_name: string;
  username: string;
  date_of_birth: string;
  discord_username: string;
  bio: string;
  github_handle: string;
  linkedin_url: string;
  twitter_handle: string;
  website_url: string;
}

const LINK_PLATFORMS = [
  {
    value: "gitlab",
    label: "GitLab",
    icon: FaGitlab,
    color: "#FC6D26",
    placeholder: "gitlab.com/username",
  },
  {
    value: "stackoverflow",
    label: "Stack Overflow",
    icon: FaStackOverflow,
    color: "#F58025",
    placeholder: "stackoverflow.com/users/...",
  },
  {
    value: "codepen",
    label: "CodePen",
    icon: FaCodepen,
    color: "#000000",
    placeholder: "codepen.io/username",
  },
  {
    value: "dribbble",
    label: "Dribbble",
    icon: FaDribbble,
    color: "#EA4C89",
    placeholder: "dribbble.com/username",
  },
  {
    value: "behance",
    label: "Behance",
    icon: FaBehance,
    color: "#1769FF",
    placeholder: "behance.net/username",
  },
  {
    value: "instagram",
    label: "Instagram",
    icon: FaInstagram,
    color: "#E1306C",
    placeholder: "instagram.com/username",
  },
  {
    value: "facebook",
    label: "Facebook",
    icon: FaFacebook,
    color: "#1877F2",
    placeholder: "facebook.com/username",
  },
  {
    value: "tiktok",
    label: "TikTok",
    icon: FaTiktok,
    color: "#000000",
    placeholder: "tiktok.com/@username",
  },
  {
    value: "telegram",
    label: "Telegram",
    icon: FaTelegram,
    color: "#26A5E4",
    placeholder: "t.me/username",
  },
  {
    value: "whatsapp",
    label: "WhatsApp",
    icon: FaWhatsapp,
    color: "#25D366",
    placeholder: "wa.me/number",
  },
  {
    value: "medium",
    label: "Medium",
    icon: FaMedium,
    color: "#000000",
    placeholder: "medium.com/@username",
  },
  { value: "custom", label: "Custom", icon: Globe, color: "#71717A", placeholder: "https://..." },
];

const inputStyles =
  "h-11 w-full border border-zinc-200 bg-white px-3 font-mono text-sm text-zinc-900 placeholder:text-zinc-300 focus:outline-none focus:border-zinc-900 transition-all";

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

export function OnboardingStepProfile({ onBack, onNext }: OnboardingStepProfileProps) {
  const profile = useUserStore((s) => s.profile);
  const updateMe = useUserStore((s) => s.updateMe);
  const setOnboarded = useUserStore((s) => s.setOnboarded);

  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [customLinks, setCustomLinks] = useState<
    { platform: string; label: string; url: string }[]
  >([]);
  const [showPicker, setShowPicker] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  function addCustomLink(platform: string) {
    const p = LINK_PLATFORMS.find((pl) => pl.value === platform);
    setCustomLinks((prev) => [...prev, { platform, label: p?.label ?? "", url: "" }]);
    setShowPicker(false);
  }

  function updateCustomLink(index: number, field: "label" | "url", value: string) {
    setCustomLinks((prev) =>
      prev.map((link, i) => (i === index ? { ...link, [field]: value } : link))
    );
  }

  function removeCustomLink(index: number) {
    setCustomLinks((prev) => prev.filter((_, i) => i !== index));
  }

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>();

  function addSkill() {
    const trimmed = newSkill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills((prev) => [...prev, trimmed]);
    }
    setNewSkill("");
    setIsAddingSkill(false);
  }

  async function onSubmit(data: ProfileFormValues) {
    setSubmitError(null);
    try {
      await updateMe({
        full_name: data.full_name.trim(),
        username: data.username.trim(),
        discord_username: data.discord_username.trim().replace(/^@/, "") || undefined,
        bio: data.bio || undefined,
        skills,
        github_handle: data.github_handle || undefined,
        linkedin_url: data.linkedin_url || undefined,
        twitter_handle: data.twitter_handle || undefined,
        website_url: data.website_url || undefined,
        date_of_birth: data.date_of_birth || undefined,
        is_onboarded: true,
      });
      setOnboarded();
      localStorage.removeItem("onboarding_step");
      onNext();
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="animate-in fade-in slide-in-from-bottom-4 duration-700 w-full max-w-3xl"
    >
      <span className="text-[10px] uppercase tracking-[0.25em] text-zinc-400 font-mono font-bold mb-6 block">
        Final Step
      </span>
      <h1 className="text-4xl sm:text-5xl font-bold text-zinc-900 mb-3 leading-[1.1]">
        Your Profile
      </h1>
      <p className="font-mono text-zinc-500 text-sm leading-relaxed mb-10">
        Tell the community a bit about yourself.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* LEFT — avatar */}
        <div className="space-y-4">
          <div className="bg-white border border-zinc-200 p-6 flex flex-col items-center gap-4">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full overflow-hidden border border-zinc-200 bg-zinc-100 flex items-center justify-center">
                <User className="w-10 h-10 text-zinc-300" />
              </div>
              <button
                type="button"
                className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                <Camera className="w-4 h-4 text-white" />
              </button>
            </div>
            <p className="font-mono text-xs text-zinc-400 text-center leading-relaxed">
              You can update your photo after joining.
            </p>
            <button
              type="button"
              className="w-full h-9 border border-zinc-200 font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-500 hover:border-zinc-900 hover:text-zinc-900 transition-all flex items-center justify-center gap-2"
            >
              <Camera className="w-3.5 h-3.5" /> Upload Photo
            </button>
          </div>

          <div className="p-4 bg-white border border-zinc-200">
            <p className="font-mono text-xs text-zinc-500 leading-relaxed">
              Your profile is visible across the Codetopia ecosystem once you complete setup.
            </p>
          </div>
        </div>

        {/* RIGHT — form */}
        <div className="lg:col-span-2 space-y-8">
          <section className="space-y-4">
            <SectionHeader icon={User} title="Personal Info" />
            <div className="bg-white border border-zinc-200 p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className={labelStyles}>Display Name *</label>
                  <input
                    className={inputStyles}
                    placeholder="Your display name"
                    defaultValue={profile?.fullName ?? ""}
                    {...register("full_name", {
                      required: "Display name is required",
                      validate: (v) => v.trim() !== "" || "Display name is required",
                    })}
                  />
                  {errors.full_name && (
                    <p className="text-red-500 text-xs font-mono">{errors.full_name.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className={labelStyles}>Username *</label>
                  <input
                    className={inputStyles}
                    placeholder="your_username"
                    defaultValue={profile?.username ?? ""}
                    {...register("username", {
                      required: "Username is required",
                      validate: (v) => v.trim() !== "" || "Username is required",
                    })}
                  />
                  {errors.username && (
                    <p className="text-red-500 text-xs font-mono">{errors.username.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="date-of-birth" className={labelStyles}>
                  Birthday
                </label>
                <p className="font-mono text-[11px] text-zinc-400 leading-relaxed">
                  Used to celebrate your birthday with the community. Your birth year is never
                  shared publicly.
                </p>
                <input
                  id="date-of-birth"
                  type="date"
                  className={inputStyles}
                  {...register("date_of_birth")}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="discord-username" className={labelStyles}>
                  Discord Username
                </label>
                <p className="font-mono text-[11px] text-zinc-400 leading-relaxed">
                  Helps us identify and connect your account on Discord.
                </p>
                <div className="flex items-center gap-3 border border-zinc-200 bg-white px-3 focus-within:border-zinc-900 transition-all">
                  <FaDiscord className="w-4 h-4 shrink-0" style={{ color: "#5865F2" }} />
                  <input
                    id="discord-username"
                    className="flex-1 h-11 bg-transparent font-mono text-sm text-zinc-900 placeholder:text-zinc-300 focus:outline-none"
                    placeholder="your_username"
                    defaultValue={profile?.discordUsername ?? ""}
                    {...register("discord_username", {
                      validate: (v) =>
                        !v.trim() ||
                        v.trim().replace(/^@/, "").length >= 2 ||
                        "Enter a valid Discord username",
                    })}
                  />
                </div>
                {errors.discord_username && (
                  <p className="text-red-500 text-xs font-mono">
                    {errors.discord_username.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className={labelStyles}>Bio</label>
                <textarea
                  placeholder="Tell the community who you are..."
                  className="min-h-[100px] w-full border border-zinc-200 bg-white px-3 py-2.5 font-mono text-sm text-zinc-900 placeholder:text-zinc-300 focus:outline-none focus:border-zinc-900 transition-all resize-none"
                  {...register("bio")}
                />
              </div>
            </div>
          </section>

          <Divider />

          <section className="space-y-4">
            <SectionHeader icon={Globe} title="Social Links" />
            <p className="font-mono text-xs text-zinc-400">
              All optional. Adding at least one helps the community connect with you.
            </p>
            <div className="bg-white border border-zinc-200 divide-y divide-zinc-100">
              <div className="flex items-center gap-3 px-4">
                <FaGithub className="w-4 h-4 shrink-0" style={{ color: "#181717" }} />
                <input
                  placeholder="github.com/username"
                  className="flex-1 h-11 bg-transparent font-mono text-sm placeholder:text-zinc-300 focus:outline-none text-zinc-900"
                  {...register("github_handle")}
                />
              </div>
              <div className="flex items-center gap-3 px-4">
                <FaLinkedin className="w-4 h-4 shrink-0" style={{ color: "#0A66C2" }} />
                <input
                  placeholder="linkedin.com/in/username"
                  className="flex-1 h-11 bg-transparent font-mono text-sm placeholder:text-zinc-300 focus:outline-none text-zinc-900"
                  {...register("linkedin_url")}
                />
              </div>
              <div className="flex items-center gap-3 px-4">
                <FaXTwitter className="w-4 h-4 shrink-0" style={{ color: "#000000" }} />
                <input
                  placeholder="x.com/username"
                  className="flex-1 h-11 bg-transparent font-mono text-sm placeholder:text-zinc-300 focus:outline-none text-zinc-900"
                  {...register("twitter_handle")}
                />
              </div>
              <div className="flex items-center gap-3 px-4">
                <Globe className="w-4 h-4 text-zinc-400 shrink-0" />
                <input
                  placeholder="yoursite.com"
                  className="flex-1 h-11 bg-transparent font-mono text-sm placeholder:text-zinc-300 focus:outline-none text-zinc-900"
                  defaultValue={profile?.websiteUrl ?? ""}
                  {...register("website_url")}
                />
              </div>
              {customLinks.map((link, i) => {
                const p = LINK_PLATFORMS.find((pl) => pl.value === link.platform);
                const Icon = p?.icon ?? Globe;
                return (
                  <div key={i} className="flex items-center gap-3 px-4">
                    <Icon className="w-4 h-4 shrink-0" style={{ color: p?.color }} />
                    {link.platform === "custom" && (
                      <input
                        value={link.label}
                        onChange={(e) => updateCustomLink(i, "label", e.target.value)}
                        placeholder="Label"
                        className="w-20 h-11 bg-transparent font-mono text-sm placeholder:text-zinc-300 focus:outline-none text-zinc-900 border-r border-zinc-100 pr-3 shrink-0"
                      />
                    )}
                    <input
                      value={link.url}
                      onChange={(e) => updateCustomLink(i, "url", e.target.value)}
                      placeholder={p?.placeholder ?? "https://..."}
                      className="flex-1 h-11 bg-transparent font-mono text-sm placeholder:text-zinc-300 focus:outline-none text-zinc-900"
                    />
                    <button
                      type="button"
                      onClick={() => removeCustomLink(i)}
                      className="text-zinc-400 hover:text-zinc-900 transition-colors shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
              <div className="px-4 py-3">
                <button
                  type="button"
                  onClick={() => setShowPicker((v) => !v)}
                  className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest text-zinc-400 hover:text-zinc-900 transition-colors"
                >
                  <Plus className="w-3 h-3" /> Add link
                </button>
              </div>
            </div>

            {showPicker && (
              <div className="border border-zinc-200 bg-zinc-50 p-4">
                <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-400 mb-3">
                  Choose platform
                </p>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-1">
                  {LINK_PLATFORMS.map((p) => {
                    const Icon = p.icon;
                    return (
                      <button
                        key={p.value}
                        type="button"
                        onClick={() => addCustomLink(p.value)}
                        className="flex flex-col items-center gap-1.5 p-2.5 border border-transparent hover:bg-white hover:border-zinc-200 transition-all"
                      >
                        <Icon className="w-5 h-5" style={{ color: p.color }} />
                        <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-500 text-center leading-tight">
                          {p.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </section>

          <Divider />

          <section className="space-y-4">
            <SectionHeader icon={Cpu} title="Skills" />
            <div className="bg-white border border-zinc-200 p-5">
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 px-3 h-8 bg-zinc-50 border border-zinc-200 font-mono text-xs uppercase tracking-widest text-zinc-700"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => setSkills((prev) => prev.filter((s) => s !== skill))}
                      className="text-zinc-400 hover:text-zinc-900 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}

                {isAddingSkill ? (
                  <div className="inline-flex items-center gap-1.5">
                    <input
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addSkill();
                        }
                        if (e.key === "Escape") {
                          setIsAddingSkill(false);
                          setNewSkill("");
                        }
                      }}
                      autoFocus
                      className="h-8 w-28 border border-zinc-900 bg-white px-2 font-mono text-xs uppercase tracking-widest outline-none"
                      placeholder="Skill..."
                    />
                    <button
                      type="button"
                      onClick={addSkill}
                      className="h-8 w-8 bg-zinc-900 text-white flex items-center justify-center hover:bg-zinc-700 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsAddingSkill(true)}
                    className="inline-flex items-center gap-1.5 px-3 h-8 border border-dashed border-zinc-300 font-mono text-xs uppercase tracking-widest text-zinc-400 hover:border-zinc-900 hover:text-zinc-900 transition-all"
                  >
                    <Plus className="w-3 h-3" /> Add
                  </button>
                )}
              </div>
            </div>
          </section>

          {submitError && <p className="text-red-500 text-sm font-mono">{submitError}</p>}

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
              onClick={() => setShowConfirm(true)}
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
                  Complete Setup <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white w-full max-w-sm p-8 space-y-5 shadow-2xl">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-400 font-mono font-bold mb-2">
                One last thing
              </p>
              <h2 className="font-bold text-xl text-zinc-900 leading-snug">
                Ready to join Codetopia Community?
              </h2>
            </div>
            <p className="font-mono text-sm text-zinc-500 leading-relaxed">
              You've reviewed our values, code of conduct, and community guidelines. By continuing,
              you agree to uphold them.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="border border-zinc-200 px-5 py-3 text-[11px] uppercase tracking-widest text-zinc-600 hover:bg-zinc-50 transition-colors font-mono"
              >
                Go Back
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-zinc-900 text-white px-5 py-3 text-[11px] uppercase tracking-widest hover:bg-zinc-700 transition-colors font-mono disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  [0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-white animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))
                ) : (
                  <>
                    Join the Community <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}

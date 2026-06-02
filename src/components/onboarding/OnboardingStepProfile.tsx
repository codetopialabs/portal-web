"use client";

import { ArrowLeft, ArrowRight, Camera, Cpu, Globe, Loader2, Plus, User, X } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  FaBehance,
  FaCodepen,
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
import { getAvatarUrl } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserService } from "@/services/user.service";
import { useOnboardingStore } from "@/store/onboarding.store";
import { useUserStore } from "@/store/user.store";

interface OnboardingStepProfileProps {
  onBack: () => void;
  onNext: () => void;
}

interface ProfileFormValues {
  full_name: string;
  username: string;
  date_of_birth: string;
  gender: string;
  nationality: string;
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

function BioCharCount({
  fieldName,
  max,
  watch,
}: {
  fieldName: string;
  max: number;
  watch: (name: string) => string;
}) {
  const value = watch(fieldName) || "";
  const count = value.length;
  const near = count >= max * 0.85;
  const over = count > max;
  return (
    <p
      className={`text-right font-mono text-[10px] mt-1 ${over ? "text-red-500" : near ? "text-amber-500" : "text-zinc-400"
        }`}
    >
      {count} / {max}
    </p>
  );
}

export function OnboardingStepProfile({ onBack, onNext }: OnboardingStepProfileProps) {
  const profile = useUserStore((s) => s.profile);
  const updateMe = useUserStore((s) => s.updateMe);
  const setOnboarded = useUserStore((s) => s.setOnboarded);
  const onboarding = useOnboardingStore((s) => s);

  const [skills, setSkills] = useState<string[]>(
    onboarding.skills.length ? onboarding.skills : (profile?.skills ?? [])
  );
  const [newSkill, setNewSkill] = useState("");
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    onboarding.avatarUrl ?? profile?.profilePictureUrl ?? null
  );
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [customLinks, setCustomLinks] = useState<
    { id: string; platform: string; label: string; url: string }[]
  >([]);
  const [showPicker, setShowPicker] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    setAvatarUrl(onboarding.avatarUrl ?? profile?.profilePictureUrl ?? null);
  }, [onboarding.avatarUrl, profile?.profilePictureUrl]);

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarError(null);
    if (!file.type.startsWith("image/")) {
      setAvatarError("Only image files are allowed.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError("Image must be smaller than 5 MB.");
      return;
    }
    setAvatarUploading(true);
    try {
      const url = await UserService.uploadAvatar(file);
      setAvatarUrl(url);
    } catch (err) {
      setAvatarError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setAvatarUploading(false);
    }
  }

  function addCustomLink(platform: string) {
    const p = LINK_PLATFORMS.find((pl) => pl.value === platform);
    setCustomLinks((prev) => [
      ...prev,
      {
        id: `${platform}-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
        platform,
        label: p?.label ?? "",
        url: "",
      },
    ]);
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
    control,
    register,
    handleSubmit,
    getValues,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    defaultValues: {
      full_name: profile?.fullName || "",
      username: profile?.username || "",
      date_of_birth: onboarding.dateOfBirth || profile?.dateOfBirth || "",
      gender: onboarding.gender || profile?.gender || "",
      nationality: onboarding.nationality || profile?.nationality || "",
      bio: onboarding.bio || profile?.bio || "",
      github_handle: onboarding.githubHandle || profile?.githubHandle || "",
      linkedin_url: onboarding.linkedinUrl || profile?.linkedinUrl || "",
      twitter_handle: onboarding.twitterHandle || profile?.twitterHandle || "",
      website_url: onboarding.websiteUrl || profile?.websiteUrl || "",
    },
  });

  // Populate the form from profile once it's available. We use the callback
  // form of reset() so we can read whatever the user has already typed
  // (current.*) and only fill in blanks from profile. full_name and username
  // always come from profile — the user cannot set them in a prior step.
  useEffect(() => {
    if (!profile) return;
    reset((current) => ({
      full_name: current.full_name || profile.fullName || "",
      username: current.username || profile.username || "",
      date_of_birth: current.date_of_birth || profile.dateOfBirth || "",
      gender: current.gender || profile.gender || "",
      nationality: current.nationality || profile.nationality || "",
      bio: current.bio || profile.bio || "",
      github_handle: current.github_handle || profile.githubHandle || "",
      linkedin_url: current.linkedin_url || profile.linkedinUrl || "",
      twitter_handle: current.twitter_handle || profile.twitterHandle || "",
      website_url: current.website_url || profile.websiteUrl || "",
    }));
  }, [profile, reset]);

  function saveToStore() {
    const v = getValues();
    onboarding.merge({
      fullName: v.full_name,
      username: v.username,
      dateOfBirth: v.date_of_birth,
      gender: v.gender,
      nationality: v.nationality,
      bio: v.bio,
      githubHandle: v.github_handle,
      linkedinUrl: v.linkedin_url,
      twitterHandle: v.twitter_handle,
      websiteUrl: v.website_url,
      skills,
      avatarUrl,
    });
  }

  function handleBack() {
    saveToStore();
    onBack();
  }

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
        bio: data.bio || undefined,
        skills,
        github_handle: data.github_handle || undefined,
        linkedin_url: data.linkedin_url || undefined,
        twitter_handle: data.twitter_handle || undefined,
        website_url: data.website_url || undefined,
        date_of_birth: data.date_of_birth || undefined,
        gender: data.gender || undefined,
        nationality: data.nationality || undefined,
        profile_picture_url: avatarUrl || undefined,
        is_onboarded: true,
      });
      setOnboarded();
      onboarding.reset();
      onNext();
    } catch (err) {
      setShowConfirm(false);
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
      <p className="font-mono text-zinc-500 text-sm leading-relaxed mb-6">
        Tell the community a bit about yourself.
      </p>

      <div className="border-l-2 border-zinc-900 bg-white px-5 py-4 mb-10">
        <p className="font-mono text-xs font-bold uppercase tracking-[0.15em] text-zinc-900 mb-2">
          Honesty matters here
        </p>
        <p className="font-mono text-xs text-zinc-500 leading-relaxed">
          Codetopia Community is built on trust. Every member is expected to represent themselves
          honestly and accurately. We do not tolerate impersonation, false identities, or any form
          of misrepresentation. Accounts found to contain deliberately false or misleading
          information will be permanently banned without warning or appeal. By continuing, you
          confirm that everything you submit is true and genuinely yours.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* LEFT — avatar */}
        <div className="space-y-4">
          <div className="bg-white border border-zinc-200 p-6 flex flex-col items-center gap-4">
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
            <button
              type="button"
              className="relative group cursor-pointer"
              onClick={() => !avatarUploading && avatarInputRef.current?.click()}
              disabled={avatarUploading}
            >
              <div className="w-24 h-24 rounded-none overflow-hidden border border-zinc-200 bg-zinc-100 flex items-center justify-center p-1">
                {/* biome-ignore lint/performance/noImgElement: user avatar */}
                <img
                  src={getAvatarUrl(avatarUrl, profile?.fullName ?? "User")}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute inset-0 rounded-none bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                {avatarUploading ? (
                  <Loader2 className="w-4 h-4 text-white animate-spin" />
                ) : (
                  <Camera className="w-4 h-4 text-white" />
                )}
              </div>
            </button>
            {avatarError && (
              <p className="text-red-500 text-xs font-mono text-center">{avatarError}</p>
            )}
            <button
              type="button"
              disabled={avatarUploading}
              onClick={() => avatarInputRef.current?.click()}
              className="w-full h-9 border border-zinc-200 font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-500 hover:border-zinc-900 hover:text-zinc-900 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {avatarUploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading…
                </>
              ) : (
                <>
                  <Camera className="w-3.5 h-3.5" /> {avatarUrl ? "Change Photo" : "Upload Photo"}
                </>
              )}
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
                  <label htmlFor="full_name" className={labelStyles}>
                    Display Name *
                  </label>
                  <input
                    id="full_name"
                    className={inputStyles}
                    placeholder="Your display name"
                    {...register("full_name", {
                      required: "Display name is required",
                      validate: (v) => {
                        const trimmed = v.trim();
                        if (trimmed === "") return "Display name is required";
                        if (trimmed.length < 2) return "Min 2 characters";
                        if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(trimmed)) {
                          return "Letters, spaces, hyphens and apostrophes only";
                        }
                        return true;
                      },
                    })}
                  />
                  {errors.full_name && (
                    <p className="text-red-500 text-xs font-mono">{errors.full_name.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label htmlFor="username" className={labelStyles}>
                    Username *
                  </label>
                  <input
                    id="username"
                    className={inputStyles}
                    placeholder="your_username"
                    {...register("username", {
                      required: "Username is required",
                      validate: (v) => {
                        const trimmed = v.trim();
                        if (trimmed === "") return "Username is required";
                        if (trimmed.length < 3) return "Min 3 characters";
                        if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
                          return "Letters, numbers and underscores only";
                        }
                        return true;
                      },
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
                  Only your day and month are visible to others. You must be at least 13 to join.
                </p>
                <input
                  id="date-of-birth"
                  type="date"
                  className={inputStyles}
                  {...register("date_of_birth", {
                    validate: (v) => {
                      if (!v) return true;
                      const dob = new Date(v);
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      if (dob >= today) return "Birthday can't be today or in the future.";
                      const age =
                        today.getFullYear() -
                        dob.getFullYear() -
                        (today < new Date(today.getFullYear(), dob.getMonth(), dob.getDate())
                          ? 1
                          : 0);
                      if (age < 13) return "You must be at least 13 years old.";
                      if (age > 120) return "Please enter a valid date of birth.";
                      return true;
                    },
                  })}
                />
                {errors.date_of_birth && (
                  <p className="text-red-500 text-xs font-mono">{errors.date_of_birth.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="gender" className={labelStyles}>
                  Gender *
                </label>
                <Controller
                  name="gender"
                  control={control}
                  rules={{ required: "Gender is required" }}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger
                        id="gender"
                        className="h-11 w-full rounded-none border-zinc-200 bg-white px-3 font-mono text-sm text-zinc-900 focus-visible:border-zinc-900 focus-visible:ring-0 data-placeholder:text-zinc-300"
                      >
                        <SelectValue placeholder="Select your gender" />
                      </SelectTrigger>
                      <SelectContent className="rounded-none border border-zinc-200 bg-white font-mono text-sm shadow-md z-50 p-1">
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.gender && (
                  <p className="text-red-500 text-xs font-mono">{errors.gender.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="nationality" className={labelStyles}>
                  Nationality *
                </label>
                <input
                  id="nationality"
                  className={inputStyles}
                  placeholder="e.g. Ghanaian, Nigerian, British"
                  {...register("nationality", { required: "Nationality is required" })}
                />
                {errors.nationality && (
                  <p className="text-red-500 text-xs font-mono">{errors.nationality.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="bio" className={labelStyles}>
                  Bio
                </label>
                <div className="relative">
                  <textarea
                    id="bio"
                    placeholder="Tell the community who you are..."
                    className="min-h-[100px] w-full border border-zinc-200 bg-white px-3 py-2.5 font-mono text-sm text-zinc-900 placeholder:text-zinc-300 focus:outline-none focus:border-zinc-900 transition-all resize-none"
                    {...register("bio", {
                      maxLength: { value: 1000, message: "Bio must be 1000 characters or less" },
                    })}
                  />
                  <BioCharCount fieldName="bio" max={1000} watch={watch} />
                </div>
                {errors.bio && (
                  <p className="text-red-500 text-xs font-mono">{errors.bio.message}</p>
                )}
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
                  {...register("website_url")}
                />
              </div>
              {customLinks.map((link, i) => {
                const p = LINK_PLATFORMS.find((pl) => pl.value === link.platform);
                const Icon = p?.icon ?? Globe;
                return (
                  <div key={link.id} className="flex items-center gap-3 px-4">
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
              onClick={handleBack}
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
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmit(onSubmit, () => setShowConfirm(false))}
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

"use client";

import type { DriveStep } from "driver.js";
import { Camera, Cpu, Globe, Loader2, MapPin, Plus, User, X } from "lucide-react";
import type React from "react";
import { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
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
import { toast } from "sonner";
import { formatRoleLabel } from "@/components/profile/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useWalkthrough } from "@/hooks/useWalkthrough";
import { getAvatarUrl } from "@/lib/utils";
import { UserService } from "@/services/user.service";
import { useUserStore } from "@/store/user.store";

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
  "h-11 rounded-none border-zinc-200 bg-white px-3 font-mono text-sm placeholder:text-zinc-300 focus-visible:ring-0 focus-visible:border-zinc-900 transition-all";

const labelStyles = "font-mono text-xs uppercase tracking-widest text-zinc-400 font-bold";

interface ProfileFormValues {
  full_name: string;
  username: string;
  location: string;
  current_role: string;
  primary_role: string;
  date_of_birth: string;
  bio: string;
  discord_username: string;
  github_handle: string;
  linkedin_url: string;
  twitter_handle: string;
  website_url: string;
}

function SectionHeader({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-7 h-7 bg-black text-white flex items-center justify-center shrink-0">
        <Icon className="w-3.5 h-3.5" />
      </div>
      <h2 className="font-sans font-black uppercase text-base tracking-widest text-zinc-900">
        {title}
      </h2>
    </div>
  );
}

function Divider() {
  return <div className="border-t border-zinc-100" />;
}

export default function SettingsProfilePage() {
  const profile = useUserStore((s) => s.profile);
  const updateMe = useUserStore((s) => s.updateMe);

  const [skills, setSkills] = useState<string[]>(profile?.skills ?? []);
  const [newSkill, setNewSkill] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [customLinks, setCustomLinks] = useState<
    { id: string; platform: string; label: string; url: string }[]
  >([]);
  const [showPicker, setShowPicker] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [coverUploading, setCoverUploading] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const walkthroughSteps: DriveStep[] = [
    {
      popover: {
        title: "Welcome to Settings",
        description:
          "This is your account control center. Let's do a quick tour of your configuration options!",
      },
    },
    {
      element: "#settings-tabs",
      popover: {
        title: "Navigation Tabs",
        description:
          "Switch seamlessly between your Profile details, Security credentials (sessions and passwords), and Connected third-party apps.",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#settings-profile-media",
      popover: {
        title: "Avatar & Cover Photo",
        description:
          "Upload a display avatar and cover image to customize your community presence and footprint.",
        side: "right",
        align: "start",
      },
    },
    {
      element: "#settings-personal-info",
      popover: {
        title: "Personal Information",
        description:
          "Update your full display name, username, location, job title, and bio so others in the community know what you're working on.",
        side: "left",
        align: "start",
      },
    },
    {
      element: "#settings-social-links",
      popover: {
        title: "Social connections",
        description:
          "Connect your digital footprint: Discord, GitHub, LinkedIn, Twitter/X, and add custom portfolio links.",
        side: "left",
        align: "start",
      },
    },
    {
      element: "#settings-skills",
      popover: {
        title: "Profile Skills",
        description:
          "Specify your core development skills. These will render as tags on your public profile card.",
        side: "left",
        align: "start",
      },
    },
    {
      element: "#settings-save-actions",
      popover: {
        title: "Apply Changes",
        description:
          "Once your settings are dialed in, hit Save Changes to sync across the community ecosystem, or Discard to revert.",
        side: "top",
        align: "end",
      },
    },
  ];

  useWalkthrough({
    tourId: "settings_profile_tour_v1",
    steps: walkthroughSteps,
    enabled: Boolean(profile),
  });

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are allowed.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5 MB.");
      return;
    }
    setAvatarUploading(true);
    try {
      const url = await UserService.uploadAvatar(file);
      await updateMe({ profile_picture_url: url });
      toast.success("Profile photo updated.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setAvatarUploading(false);
    }
  }

  async function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are allowed.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Cover image must be smaller than 10 MB.");
      return;
    }
    setCoverUploading(true);
    try {
      const url = await UserService.uploadCoverImage(file);
      await updateMe({ cover_image_url: url });
      toast.success("Cover image updated.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setCoverUploading(false);
    }
  }

  function addCustomLink(platform: string) {
    const p = LINK_PLATFORMS.find((pl) => pl.value === platform);
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setCustomLinks((prev) => [...prev, { id, platform, label: p?.label ?? "", url: "" }]);
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
    control,
    formState: { isSubmitting, isDirty },
    reset,
  } = useForm<ProfileFormValues>({
    defaultValues: {
      full_name: profile?.fullName ?? "",
      username: profile?.username ?? "",
      location: profile?.location ?? "",
      current_role: profile?.currentRole ?? "",
      primary_role: profile?.primaryRole ?? "",
      date_of_birth: profile?.dateOfBirth ?? "",
      bio: profile?.bio ?? "",
      discord_username: profile?.discordUsername ?? "",
      github_handle: profile?.githubHandle ?? "",
      linkedin_url: profile?.linkedinUrl ?? "",
      twitter_handle: profile?.twitterHandle ?? "",
      website_url: profile?.websiteUrl ?? "",
    },
  });

  function addSkill() {
    const trimmed = newSkill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills((prev) => [...prev, trimmed]);
    }
    setNewSkill("");
    setIsAdding(false);
  }

  async function onSubmit(data: ProfileFormValues) {
    try {
      await updateMe({
        full_name: data.full_name.trim(),
        username: data.username.trim(),
        location: data.location.trim() || undefined,
        current_role: data.current_role.trim() || undefined,
        primary_role: data.primary_role,
        date_of_birth: data.date_of_birth || undefined,
        bio: data.bio.trim() || undefined,
        discord_username: data.discord_username.trim().replace(/^@/, "") || undefined,
        github_handle: data.github_handle.trim() || undefined,
        linkedin_url: data.linkedin_url.trim() || undefined,
        twitter_handle: data.twitter_handle.trim() || undefined,
        website_url: data.website_url.trim() || undefined,
        skills,
      });
      toast.success("Profile updated.");
      reset(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start"
    >
      {/* LEFT — avatar */}
      <div id="settings-profile-media" className="space-y-6">
        {/* Cover image */}
        <div className="bg-white border border-zinc-200 overflow-hidden">
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleCoverChange}
          />
          <button
            type="button"
            className="w-full relative group cursor-pointer h-24 bg-zinc-100 flex items-center justify-center"
            onClick={() => !coverUploading && coverInputRef.current?.click()}
            disabled={coverUploading}
          >
            {profile?.coverImageUrl ? (
              // biome-ignore lint/performance/noImgElement: cover image
              <img src={profile.coverImageUrl} alt="Cover" className="w-full h-full object-cover" />
            ) : (
              <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">
                No cover image
              </span>
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              {coverUploading ? (
                <Loader2 className="w-4 h-4 text-white animate-spin" />
              ) : (
                <Camera className="w-4 h-4 text-white" />
              )}
            </div>
          </button>
          <button
            type="button"
            disabled={coverUploading}
            onClick={() => coverInputRef.current?.click()}
            className="w-full h-9 border-t border-zinc-200 font-mono text-xs uppercase tracking-widest text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {coverUploading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading…
              </>
            ) : (
              <>
                <Camera className="w-3.5 h-3.5" />{" "}
                {profile?.coverImageUrl ? "Change Cover" : "Upload Cover"}
              </>
            )}
          </button>
        </div>
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
                src={getAvatarUrl(profile?.profilePictureUrl, profile?.fullName ?? "User")}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              {avatarUploading ? (
                <Loader2 className="w-4 h-4 text-white animate-spin" />
              ) : (
                <Camera className="w-4 h-4 text-white" />
              )}
            </div>
          </button>
          <div className="text-center">
            <p className="font-mono font-black text-base uppercase tracking-tight text-zinc-900">
              {profile?.fullName ?? "—"}
            </p>
            <p className="font-mono text-xs text-zinc-500 mt-0.5">{profile?.email ?? ""}</p>
          </div>
          <button
            type="button"
            disabled={avatarUploading}
            onClick={() => avatarInputRef.current?.click()}
            className="w-full h-9 border border-zinc-200 font-mono text-xs uppercase tracking-widest text-zinc-500 hover:border-zinc-900 hover:text-zinc-900 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {avatarUploading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading…
              </>
            ) : (
              <>
                <Camera className="w-3.5 h-3.5" /> Change Photo
              </>
            )}
          </button>
        </div>

        <div className="p-4 bg-zinc-50 border border-zinc-200">
          <p className="font-mono text-xs text-zinc-500 leading-relaxed">
            Changes are visible across the Codetopia ecosystem once saved.
          </p>
        </div>
      </div>

      {/* RIGHT — form */}
      <div className="lg:col-span-2 space-y-8">
        {/* Personal Info */}
        <section id="settings-personal-info" className="space-y-5">
          <SectionHeader icon={User} title="Personal Info" />
          <div className="bg-white border border-zinc-200 p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="full-name" className={labelStyles}>
                  Display Name
                </Label>
                <Input id="full-name" className={inputStyles} {...register("full_name")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username" className={labelStyles}>
                  Username
                </Label>
                <Input id="username" className={inputStyles} {...register("username")} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className={labelStyles}>
                Location
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
                <Input
                  id="location"
                  placeholder="City, Country"
                  className={`${inputStyles} pl-9`}
                  {...register("location")}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="current-role" className={labelStyles}>
                Job Title / Occupation
              </Label>
              <Input
                id="current-role"
                placeholder="e.g. Frontend Developer, CS student, Freelance designer"
                className={inputStyles}
                {...register("current_role")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="primary-role" className={labelStyles}>
                Primary Community Role
              </Label>
              <p className="font-mono text-[11px] text-zinc-400 leading-relaxed">
                Identify yourself with one of your assigned roles to the community.
              </p>
              <Controller
                control={control}
                name="primary_role"
                render={({ field }) => (
                  <Select
                    value={field.value || "none"}
                    onValueChange={(val) => field.onChange(val === "none" ? "" : val)}
                  >
                    <SelectTrigger
                      id="primary-role"
                      className="h-11 w-full rounded-none border border-zinc-200 bg-white px-3 font-mono text-sm focus:border-zinc-900 transition-all focus:ring-0 focus-visible:ring-0 outline-none shadow-none text-left flex justify-between items-center text-zinc-900 dark:bg-white dark:text-zinc-900"
                    >
                      <SelectValue placeholder="None (Default)" />
                    </SelectTrigger>
                    <SelectContent className="rounded-none border border-zinc-200 bg-white font-mono text-sm shadow-md z-50 p-1 min-w-[200px]">
                      <SelectItem
                        value="none"
                        className="rounded-none font-mono py-2 px-3 text-zinc-900 hover:bg-zinc-50 cursor-pointer focus:bg-zinc-50 focus:text-zinc-900 focus:outline-none"
                      >
                        None (Default)
                      </SelectItem>
                      {profile?.roles?.map((role) => (
                        <SelectItem
                          key={role}
                          value={role}
                          className="rounded-none font-mono py-2 px-3 text-zinc-900 hover:bg-zinc-50 cursor-pointer focus:bg-zinc-50 focus:text-zinc-900 focus:outline-none"
                        >
                          {formatRoleLabel(role)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date-of-birth" className={labelStyles}>
                Birthday
              </Label>
              <p className="font-mono text-[11px] text-zinc-400 leading-relaxed">
                Used to celebrate your birthday with the community. Your birth year is never shared
                publicly.
              </p>
              <Input
                id="date-of-birth"
                type="date"
                className={inputStyles}
                {...register("date_of_birth")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className={labelStyles}>
                Bio
              </Label>
              <textarea
                id="bio"
                placeholder="Tell the community who you are..."
                className="min-h-[100px] w-full rounded-none border border-zinc-200 bg-white px-3 py-2.5 font-mono text-sm placeholder:text-zinc-300 focus:outline-none focus:border-zinc-900 transition-all resize-none"
                {...register("bio")}
              />
            </div>
          </div>
        </section>

        <Divider />

        {/* Social Links */}
        <section id="settings-social-links" className="space-y-5">
          <SectionHeader icon={Globe} title="Social Links" />
          <div className="bg-white border border-zinc-200 divide-y divide-zinc-100">
            <div className="flex items-center gap-3 px-4">
              <FaDiscord className="w-4 h-4 shrink-0" style={{ color: "#5865F2" }} />
              <input
                placeholder="Discord username"
                className="flex-1 h-11 bg-transparent font-mono text-sm placeholder:text-zinc-300 focus:outline-none text-zinc-900"
                {...register("discord_username")}
              />
            </div>
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

        {/* Skills */}
        <section id="settings-skills" className="space-y-5">
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

              {isAdding ? (
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
                        setIsAdding(false);
                        setNewSkill("");
                      }
                    }}
                    className="h-8 w-28 border border-zinc-900 bg-white px-2 font-mono text-xs uppercase tracking-widest outline-none"
                    placeholder="Skill..."
                  />
                  <button
                    type="button"
                    onClick={addSkill}
                    className="h-8 w-8 bg-black text-white flex items-center justify-center hover:bg-zinc-800 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsAdding(true)}
                  className="inline-flex items-center gap-1.5 px-3 h-8 border border-dashed border-zinc-300 font-mono text-xs uppercase tracking-widest text-zinc-400 hover:border-zinc-900 hover:text-zinc-900 transition-all"
                >
                  <Plus className="w-3 h-3" /> Add
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Save */}
        <div id="settings-save-actions" className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => reset()}
            disabled={!isDirty && skills.join() === (profile?.skills ?? []).join()}
            className="h-10 rounded-none border-zinc-200 font-mono text-xs uppercase tracking-widest px-6 hover:border-zinc-400"
          >
            Discard
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-10 rounded-none bg-black text-white font-mono text-xs uppercase tracking-widest px-6 hover:bg-zinc-800 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </form>
  );
}

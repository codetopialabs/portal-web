"use client";

import {
  Bot,
  BrainCircuit,
  CalendarDays,
  Cloud,
  Code2,
  Cpu,
  ExternalLink,
  FileText,
  FlaskConical,
  Globe,
  HelpCircle,
  MapPin,
  Paintbrush,
  Shield,
  Smartphone,
  Sparkles,
  TestTube2,
  X,
} from "lucide-react";
import Link from "next/link";
import { Dialog as DialogPrimitive } from "radix-ui";
import type { ComponentType } from "react";
import { FaGithub, FaLinkedin, FaXTwitter } from "react-icons/fa6";
import { getAvatarUrl, getCoverUrl, sanitizeHandle } from "@/lib/utils";
import type { CommunityMember } from "@/services/user.service";
import { normalizeUrl } from "@/utils/url";

interface DisciplineMeta {
  label: string;
  icon: ComponentType<{ className?: string }>;
}

const DISCIPLINE_MAP: Record<string, DisciplineMeta> = {
  software_engineering: { label: "Software Engineering", icon: Code2 },
  ux_ui_design: { label: "UX / UI Design", icon: Paintbrush },
  data_science: { label: "Data Science", icon: FlaskConical },
  ml_ai: { label: "Machine Learning / AI", icon: BrainCircuit },
  cybersecurity: { label: "Cybersecurity", icon: Shield },
  cloud_devops: { label: "Cloud / DevOps", icon: Cloud },
  product_management: { label: "Product Management", icon: Sparkles },
  hardware_embedded: { label: "Hardware / Embedded", icon: Cpu },
  robotics_iot: { label: "Robotics / IoT", icon: Bot },
  mobile_development: { label: "Mobile Development", icon: Smartphone },
  qa_testing: { label: "QA / Testing", icon: TestTube2 },
  technical_writing: { label: "Technical Writing", icon: FileText },
  other: { label: "Other", icon: HelpCircle },
};

interface MemberProfileModalProps {
  member: CommunityMember | null;
  open: boolean;
  onClose: () => void;
}

export function MemberProfileModal({ member, open, onClose }: MemberProfileModalProps) {
  if (!member) return null;

  const primaryRole = member.primaryRole || member.communityRoles?.[0] || "Member";
  const discipline = member.discipline
    ? (DISCIPLINE_MAP[member.discipline] ?? {
        label: member.discipline.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
        icon: HelpCircle,
      })
    : null;
  const skills = member.skills ?? [];
  const roles = member.communityRoles?.filter((r) => r.trim() !== "") ?? ["Member"];

  const socials = [
    member.githubHandle
      ? {
          label: "GitHub",
          href: `https://github.com/${sanitizeHandle(member.githubHandle)}`,
          Icon: FaGithub,
        }
      : null,
    member.twitterHandle
      ? {
          label: "X / Twitter",
          href: `https://x.com/${sanitizeHandle(member.twitterHandle)}`,
          Icon: FaXTwitter,
        }
      : null,
    member.linkedinUrl
      ? { label: "LinkedIn", href: normalizeUrl(member.linkedinUrl), Icon: FaLinkedin }
      : null,
    member.websiteUrl
      ? { label: "Website", href: normalizeUrl(member.websiteUrl), Icon: Globe }
      : null,
  ].filter(Boolean) as {
    label: string;
    href: string;
    Icon: ComponentType<{ className?: string }>;
  }[];

  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
        <DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-50 flex w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 flex-col max-h-[90vh] overflow-hidden bg-white p-0 outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 mx-4">
          <DialogPrimitive.Title className="sr-only">
            {member.fullName}'s profile
          </DialogPrimitive.Title>
          {/* Close button */}
          <DialogPrimitive.Close
            className="absolute top-4 right-4 z-20 flex h-8 w-8 items-center justify-center bg-black/40 text-white transition-colors hover:bg-black/60"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </DialogPrimitive.Close>

          {/* Hero — cover + avatar */}
          <div className="relative h-44 shrink-0 overflow-hidden bg-zinc-900">
            {/* biome-ignore lint/performance/noImgElement: user cover image */}
            <img
              src={getCoverUrl(member.coverImageUrl, member.fullName)}
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-50"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-zinc-950/30 to-transparent" />

            {/* Badges over hero */}
            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 border border-white/20 bg-white/10 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur-sm">
                <Sparkles className="h-3 w-3" />
                {primaryRole}
              </span>
              {discipline && (
                <span className="inline-flex items-center gap-1.5 border border-white/20 bg-white/10 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur-sm">
                  <discipline.icon className="h-3 w-3" />
                  {discipline.label}
                </span>
              )}
            </div>

            {/* Avatar anchored to bottom-left */}
            <div className="absolute -bottom-10 left-6">
              <div className="h-20 w-20 border-[3px] border-white bg-white p-0.5 shadow-lg">
                {/* biome-ignore lint/performance/noImgElement: user avatar */}
                <img
                  src={getAvatarUrl(member.profilePictureUrl, member.fullName)}
                  alt={member.fullName}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto">
            {/* Name row (gives space for avatar overhang) */}
            <div className="border-b border-zinc-100 px-6 pb-5 pt-14">
              <h2 className="font-sans text-2xl font-black tracking-tight text-zinc-950">
                {member.fullName}
              </h2>
              <div className="mt-1 flex flex-wrap items-center gap-3 font-mono text-[11px] text-zinc-400">
                <span>@{member.username}</span>
                {member.location && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {member.location}
                  </span>
                )}
                {member.joinedAt && (
                  <span className="inline-flex items-center gap-1">
                    <CalendarDays className="h-3 w-3" />
                    Joined{" "}
                    {new Date(member.joinedAt).toLocaleDateString("en", {
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                )}
                {member.currentRole && (
                  <span className="font-bold text-zinc-700">{member.currentRole}</span>
                )}
              </div>
            </div>

            <div className="space-y-5 p-6">
              {/* Bio */}
              {member.bio && (
                <div>
                  <p className="mb-2 font-mono text-xs font-medium text-zinc-400">Bio</p>
                  <p className="font-sans text-sm leading-6 text-zinc-600 line-clamp-4">
                    {member.bio}
                  </p>
                </div>
              )}

              {/* Skills */}
              {skills.length > 0 && (
                <div>
                  <p className="mb-2 font-mono text-xs font-medium text-zinc-400">Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {skills.slice(0, 12).map((skill) => (
                      <span
                        key={skill}
                        className="border border-zinc-200 bg-zinc-50 px-2.5 py-1 font-mono text-xs font-semibold text-zinc-700"
                      >
                        {skill}
                      </span>
                    ))}
                    {skills.length > 12 && (
                      <span className="px-2.5 py-1 font-mono text-[10px] text-zinc-400">
                        +{skills.length - 12} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Roles */}
              {roles.length > 0 && (
                <div>
                  <p className="mb-2 font-mono text-xs font-medium text-zinc-400">
                    Community Roles
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {roles.map((role) => (
                      <span
                        key={role}
                        className="border border-zinc-900 bg-zinc-900 px-2.5 py-1 font-mono text-[10px] font-black uppercase tracking-[0.14em] text-white"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Socials */}
              {socials.length > 0 && (
                <div>
                  <p className="mb-2 font-mono text-xs font-medium text-zinc-400">Links</p>
                  <div className="flex gap-2">
                    {socials.map(({ label, href, Icon }) => (
                      <a
                        key={label}
                        href={href}
                        target="_blank"
                        rel="noreferrer"
                        title={label}
                        className="flex h-9 w-9 items-center justify-center border border-zinc-200 bg-zinc-50 text-zinc-500 transition-colors hover:border-zinc-900 hover:bg-zinc-900 hover:text-white"
                      >
                        <Icon className="h-4 w-4" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="shrink-0 border-t border-zinc-100 bg-zinc-50 px-6 py-4 flex items-center justify-between gap-4">
            <p className="font-mono text-xs text-zinc-400">
              {skills.length} skills · {roles.length} {roles.length === 1 ? "role" : "roles"}
            </p>
            <Link
              href={`/@${member.username}`}
              onClick={onClose}
              className="inline-flex h-9 items-center gap-2 bg-zinc-900 px-5 font-mono text-sm font-medium text-white transition-colors hover:bg-zinc-800"
            >
              View Full Profile
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

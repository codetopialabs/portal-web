"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import {
  FaFacebook,
  FaGithub,
  FaInstagram,
  FaLinkedinIn,
  FaMastodon,
  FaThreads,
  FaTiktok,
  FaWhatsapp,
  FaXTwitter,
  FaYoutube,
} from "react-icons/fa6";
import { SiBluesky } from "react-icons/si";

interface StepProps {
  onNext: () => void;
  onBack: () => void;
}

const SOCIALS = [
  {
    id: "youtube",
    icon: FaYoutube,
    iconColor: "text-red-500",
    label: "YouTube",
    href: "https://www.youtube.com/@codetopiacommunity",
  },
  {
    id: "linkedin",
    icon: FaLinkedinIn,
    iconColor: "text-blue-600",
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/codetopiacommunity",
  },
  {
    id: "x",
    icon: FaXTwitter,
    iconColor: "text-zinc-900",
    label: "X",
    href: "https://x.com/codetopiacom",
  },
  {
    id: "facebook",
    icon: FaFacebook,
    iconColor: "text-blue-700",
    label: "Facebook",
    href: "https://www.facebook.com/codetopiacommunity",
  },
  {
    id: "instagram",
    icon: FaInstagram,
    iconColor: "text-pink-500",
    label: "Instagram",
    href: "https://www.instagram.com/codetopiacommunity/",
  },
  {
    id: "threads",
    icon: FaThreads,
    iconColor: "text-zinc-900",
    label: "Threads",
    href: "http://www.threads.com/codetopiacommunity/",
  },
  {
    id: "tiktok",
    icon: FaTiktok,
    iconColor: "text-zinc-900",
    label: "TikTok",
    href: "https://www.tiktok.com/@codetopiacommunity",
  },
  {
    id: "bluesky",
    icon: SiBluesky,
    iconColor: "text-sky-500",
    label: "Bluesky",
    href: "https://bsky.app/profile/codetopiacommunity.bsky.social",
  },
  {
    id: "mastodon",
    icon: FaMastodon,
    iconColor: "text-indigo-500",
    label: "Mastodon",
    href: "https://mastodon.social/@codetopiacommunity",
  },
  {
    id: "whatsapp",
    icon: FaWhatsapp,
    iconColor: "text-emerald-500",
    label: "WhatsApp",
    href: "https://whatsapp.com/channel/0029VaFHtkR8KMqpEVu24v2o",
  },
  {
    id: "github",
    icon: FaGithub,
    iconColor: "text-zinc-900",
    label: "GitHub",
    href: "https://github.com/codetopiacommunity",
  },
];

export function OnboardingStepCommunity({ onNext, onBack }: StepProps) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 w-full max-w-3xl">
      <span className="text-[10px] uppercase tracking-[0.25em] text-zinc-500 font-mono font-bold mb-6 block">
        Join the Community
      </span>

      <h1 className="font-sans text-4xl sm:text-5xl font-bold text-zinc-900 mb-3 leading-[1.1]">
        Connect With Us
      </h1>
      <p className="font-mono text-zinc-500 text-sm leading-relaxed mb-10">
        We recommend you connect with us on our socials to stay updated and connected with the
        community.
      </p>

      {/* Socials */}
      <div className="mb-10">
        <p className="text-[10px] uppercase tracking-[0.25em] text-zinc-500 font-mono font-bold mb-4">
          Also follow us on
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {SOCIALS.map(({ id, icon: Icon, iconColor, label, href }) => (
            <a
              key={id}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center gap-2 border border-zinc-200 bg-white p-4 text-center transition-all hover:border-zinc-400"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-zinc-50 transition-colors group-hover:border-zinc-300">
                <Icon className={`w-4 h-4 ${iconColor}`} />
              </div>
              <p className="font-mono text-xs font-semibold truncate w-full text-zinc-900">
                {label}
              </p>
            </a>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="border border-zinc-200 bg-white px-6 py-3 text-[11px] uppercase tracking-[0.2em] text-zinc-600 hover:bg-zinc-50 transition-colors font-mono flex items-center gap-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </button>
        <button
          type="button"
          onClick={onNext}
          className="bg-zinc-900 text-white px-8 py-3 text-[11px] uppercase tracking-[0.2em] hover:bg-zinc-700 transition-colors font-mono flex items-center gap-2"
        >
          Continue <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

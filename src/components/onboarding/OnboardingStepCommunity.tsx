"use client";

import { useState } from "react";
import { FaDiscord, FaWhatsapp, FaLinkedinIn, FaXTwitter, FaBluesky, FaTiktok, FaYoutube } from "react-icons/fa6";
import { ArrowLeft, ArrowRight, Check, ExternalLink } from "lucide-react";

interface StepProps {
  onNext: () => void;
  onBack: () => void;
}

const COMMUNITIES = [
  {
    id: "discord",
    icon: FaDiscord,
    iconColor: "text-indigo-500",
    name: "Discord Server",
    description:
      "Our main hub for discussions, help channels, announcements, and real-time collaboration with the community.",
    cta: "Join Discord",
    href: "https://discord.gg/codetopia",
    joinedBg: "bg-indigo-50 border-indigo-200",
    joinedBtn: "bg-indigo-500",
  },
  {
    id: "whatsapp",
    icon: FaWhatsapp,
    iconColor: "text-emerald-500",
    name: "WhatsApp Community",
    description:
      "Stay in the loop with quick updates, community news, and casual conversations on the go.",
    cta: "Join WhatsApp",
    href: "https://chat.whatsapp.com/codetopia",
    joinedBg: "bg-emerald-50 border-emerald-200",
    joinedBtn: "bg-emerald-500",
  },
];

const SOCIALS = [
  {
    id: "linkedin",
    icon: FaLinkedinIn,
    iconColor: "text-blue-600",
    name: "LinkedIn",
    href: "https://linkedin.com/company/codetopia",
    followedBtn: "bg-blue-600",
  },
  {
    id: "x",
    icon: FaXTwitter,
    iconColor: "text-zinc-900",
    name: "X (Twitter)",
    href: "https://x.com/codetopia",
    followedBtn: "bg-zinc-900",
  },
  {
    id: "bluesky",
    icon: FaBluesky,
    iconColor: "text-sky-500",
    name: "Bluesky",
    href: "https://bsky.app/profile/codetopia.bsky.social",
    followedBtn: "bg-sky-500",
  },
  {
    id: "tiktok",
    icon: FaTiktok,
    iconColor: "text-zinc-900",
    name: "TikTok",
    href: "https://tiktok.com/@codetopia",
    followedBtn: "bg-zinc-900",
  },
  {
    id: "youtube",
    icon: FaYoutube,
    iconColor: "text-red-500",
    name: "YouTube",
    href: "https://youtube.com/@codetopia",
    followedBtn: "bg-red-500",
  },
];

export function OnboardingStepCommunity({ onNext, onBack }: StepProps) {
  const [joined, setJoined] = useState<Record<string, boolean>>({});
  const [followed, setFollowed] = useState<Record<string, boolean>>({});

  const allJoined = COMMUNITIES.every(({ id }) => joined[id]);

  function handleJoin(id: string, href: string) {
    window.open(href, "_blank", "noopener,noreferrer");
    setJoined((prev) => ({ ...prev, [id]: true }));
  }

  function handleFollow(id: string, href: string) {
    window.open(href, "_blank", "noopener,noreferrer");
    setFollowed((prev) => ({ ...prev, [id]: true }));
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 w-full max-w-3xl">
      <span className="text-[10px] uppercase tracking-[0.25em] text-zinc-400 font-mono font-bold mb-6 block">
        Join the Community
      </span>

      <h1 className="text-4xl sm:text-5xl font-bold text-zinc-900 mb-3 leading-[1.1]">
        Connect With Us
      </h1>
      <p className="font-mono text-zinc-500 text-sm leading-relaxed mb-10">
        Join our spaces to stay connected, get support, and be part of the conversation.
      </p>

      <div className="space-y-4 mb-10">
        {COMMUNITIES.map(({ id, icon: Icon, iconColor, name, description, cta, href, joinedBg, joinedBtn }) => {
          const isJoined = joined[id];
          return (
            <div
              key={id}
              className={`border p-6 transition-all duration-300 ${isJoined ? joinedBg : "border-zinc-200 bg-white"}`}
            >
              <div className="flex items-start gap-5">
                <Icon className={`w-9 h-9 shrink-0 mt-0.5 ${iconColor}`} />
                <div className="flex-1 min-w-0">
                  <p className="font-mono font-semibold text-base text-zinc-900 mb-1">{name}</p>
                  <p className="font-mono text-sm text-zinc-500 leading-relaxed mb-5">{description}</p>
                  <button
                    type="button"
                    onClick={() => handleJoin(id, href)}
                    className={`inline-flex items-center gap-2 px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.2em] transition-all ${
                      isJoined
                        ? `${joinedBtn} text-white`
                        : "border border-zinc-200 text-zinc-600 hover:border-zinc-900 hover:text-zinc-900"
                    }`}
                  >
                    {isJoined ? (
                      <><Check className="w-3.5 h-3.5" /> Joined</>
                    ) : (
                      <><ExternalLink className="w-3.5 h-3.5" /> {cta}</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Socials */}
      <div className="mb-10">
        <p className="text-[10px] uppercase tracking-[0.25em] text-zinc-400 font-mono font-bold mb-4">
          Also follow us on
        </p>
        <div className="flex flex-wrap gap-3">
          {SOCIALS.map(({ id, icon: Icon, iconColor, name, href, followedBtn }) => {
            const isFollowed = followed[id];
            return (
              <button
                key={id}
                type="button"
                onClick={() => handleFollow(id, href)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.2em] transition-all border ${
                  isFollowed
                    ? `${followedBtn} text-white border-transparent`
                    : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-900 hover:text-zinc-900"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isFollowed ? "text-white" : iconColor}`} />
                {isFollowed ? <><Check className="w-3 h-3" /> {name}</> : name}
              </button>
            );
          })}
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
          disabled={!allJoined}
          className="bg-zinc-900 text-white px-8 py-3 text-[11px] uppercase tracking-[0.2em] hover:bg-zinc-700 transition-colors font-mono disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
        >
          Continue <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

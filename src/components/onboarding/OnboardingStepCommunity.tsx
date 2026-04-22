"use client";

import { useState } from "react";
import { FaDiscord, FaWhatsapp } from "react-icons/fa6";
import { ExternalLink, Check } from "lucide-react";

interface StepProps {
  onNext: () => void;
  onBack: () => void;
}

const COMMUNITIES = [
  {
    id: "discord",
    icon: FaDiscord,
    iconColor: "text-indigo-500",
    borderColor: "border-indigo-100",
    activeBg: "bg-indigo-50",
    checkColor: "bg-indigo-500",
    name: "Discord Server",
    description:
      "Our main hub for discussions, help channels, announcements, and real-time collaboration with the community.",
    cta: "Join Discord",
    href: "https://discord.gg/codetopia",
  },
  {
    id: "whatsapp",
    icon: FaWhatsapp,
    iconColor: "text-emerald-500",
    borderColor: "border-emerald-100",
    activeBg: "bg-emerald-50",
    checkColor: "bg-emerald-500",
    name: "WhatsApp Community",
    description:
      "Stay in the loop with quick updates, community news, and casual conversations on the go.",
    cta: "Join WhatsApp",
    href: "https://chat.whatsapp.com/codetopia",
  },
];

export function OnboardingStepCommunity({ onNext, onBack }: StepProps) {
  const [joined, setJoined] = useState<Record<string, boolean>>({});

  const allJoined = COMMUNITIES.every(({ id }) => joined[id]);

  function handleJoin(id: string, href: string) {
    window.open(href, "_blank", "noopener,noreferrer");
    setJoined((prev) => ({ ...prev, [id]: true }));
  }

  return (
    <div className="flex flex-col max-w-xl">
      <p className="text-xs uppercase tracking-widest text-zinc-400 font-mono mb-3">
        Join the Community
      </p>
      <h1 className="text-3xl font-bold font-mono uppercase tracking-widest text-zinc-900 mb-2">
        Connect With Us
      </h1>
      <p className="font-mono text-zinc-500 text-sm mb-10">
        Join our spaces to stay connected, get support, and be part of the conversation.
      </p>

      <div className="space-y-4">
        {COMMUNITIES.map(({ id, icon: Icon, iconColor, borderColor, activeBg, checkColor, name, description, cta, href }) => {
          const isJoined = joined[id];
          return (
            <div
              key={id}
              className={`border ${isJoined ? `${borderColor} ${activeBg}` : "border-zinc-200 bg-white"} p-5 transition-all duration-300`}
            >
              <div className="flex items-start gap-4">
                <Icon className={`w-8 h-8 shrink-0 mt-0.5 ${iconColor}`} />
                <div className="flex-1 min-w-0">
                  <p className="font-mono font-bold uppercase tracking-widest text-sm text-zinc-900 mb-1">
                    {name}
                  </p>
                  <p className="font-mono text-xs text-zinc-500 leading-relaxed mb-4">
                    {description}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleJoin(id, href)}
                    className={`inline-flex items-center gap-2 h-9 px-4 font-mono text-xs uppercase tracking-widest transition-all ${
                      isJoined
                        ? `${checkColor} text-white`
                        : "border border-zinc-200 text-zinc-600 hover:border-zinc-900 hover:text-zinc-900"
                    }`}
                  >
                    {isJoined ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> Joined
                      </>
                    ) : (
                      <>
                        <ExternalLink className="w-3.5 h-3.5" /> {cta}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-3 mt-6">
        <button
          type="button"
          onClick={onBack}
          className="border border-zinc-200 px-6 py-3 text-sm uppercase tracking-widest text-zinc-600 hover:bg-zinc-50 transition-colors font-mono"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!allJoined}
          className="bg-zinc-900 text-white px-6 py-3 text-sm uppercase tracking-widest hover:bg-zinc-700 transition-colors font-mono disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

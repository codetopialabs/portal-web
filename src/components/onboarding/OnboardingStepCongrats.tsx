"use client";

import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/user.store";

export function OnboardingStepCongrats() {
  const router = useRouter();
  const username = useUserStore((s) => s.profile?.username ?? "member");

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 flex flex-col items-center max-w-xl mx-auto text-center px-4">
      <p className="font-mono text-xs font-medium text-zinc-500 mb-4">Welcome In</p>
      <h1 className="font-sans text-4xl sm:text-5xl font-bold text-zinc-900 leading-[1.1] mb-4">
        You're in, <span className="text-zinc-500">@{username}</span>
      </h1>
      <p className="font-mono text-zinc-500 text-sm mb-10">
        You're officially a Codetopia Community member. Go build something great.
      </p>
      <button
        type="button"
        onClick={() => router.push("/")}
        className="inline-flex items-center gap-2 bg-zinc-900 text-white px-10 py-4 text-sm font-medium hover:bg-zinc-700 transition-colors font-mono"
      >
        Go to Dashboard <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

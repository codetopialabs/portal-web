"use client";

import { useRouter } from "next/navigation";

export function OnboardingStepCongrats() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center max-w-2xl mx-auto text-center">
      <p className="text-xs uppercase tracking-widest text-zinc-400 font-mono mb-3">
        You're in
      </p>
      <h1 className="text-2xl md:text-4xl font-bold font-mono uppercase tracking-widest text-zinc-900 mb-3">
        Congratulations
      </h1>
      <p className="font-mono text-zinc-500 text-sm mb-10">
        Welcome to Codetopia. You're officially part of the community — now go build something great.
      </p>

      <div className="w-full aspect-video border border-zinc-200 mb-10">
        <iframe
          src="https://www.youtube.com/embed/SC4xMk98Pdc?si=4bIY5w5z3QcugdzT"
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          className="w-full h-full"
        />
      </div>

      <button
        type="button"
        onClick={() => router.push("/")}
        className="bg-zinc-900 text-white px-10 py-4 text-sm uppercase tracking-widest hover:bg-zinc-700 transition-colors font-mono"
      >
        Explore the Community →
      </button>
    </div>
  );
}

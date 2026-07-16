"use client";

import { ArrowRight, Award, Crown, Trophy, Users } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { BadgesService } from "@/services/badges.service";
import { useAuthStore } from "@/store/auth.store";
import type { BadgeAward } from "@/types/badges.types";

function Confetti() {
  const pieces = Array.from({ length: 50 }, (_, i) => {
    const left = Math.random() * 100;
    const delay = Math.random() * 0.5;
    const duration = 2 + Math.random() * 1.5;
    const rotation = Math.random() * 720 - 360;
    const hue = [45, 38, 50, 0, 200, 280, 120][i % 7];
    const size = 4 + Math.random() * 5;
    const drift = (Math.random() - 0.5) * 60;
    return { id: i, left, delay, duration, rotation, hue, size, drift };
  });

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="absolute top-0 block animate-[confetti-fall_var(--dur)_ease-out_var(--delay)_forwards] opacity-0"
          style={
            {
              left: `${p.left}%`,
              "--delay": `${p.delay}s`,
              "--dur": `${p.duration}s`,
              "--rotation": `${p.rotation}deg`,
              "--drift": `${p.drift}px`,
              width: `${p.size}px`,
              height: `${p.size * (Math.random() > 0.5 ? 2.5 : 1)}px`,
              backgroundColor: `hsl(${p.hue}, 85%, 60%)`,
              borderRadius: Math.random() > 0.5 ? "50%" : "1px",
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

function holderLabel(count: number): string {
  if (count <= 1) return "First to earn this badge!";
  if (count <= 5) return `Rare — only ${count} holders`;
  if (count <= 20) return `${count} members earned this`;
  return `Joined ${count} holders`;
}

export function BadgeCelebration() {
  const session = useAuthStore((state) => state.session);
  const [queue, setQueue] = useState<BadgeAward[]>([]);
  const [phase, setPhase] = useState<"enter" | "reveal" | "idle">("enter");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fetchedRef = useRef(false);

  const fetchPending = useCallback(async () => {
    if (!session?.accessToken) return;
    try {
      const pending = await BadgesService.pending();
      if (pending.length > 0) {
        setQueue((prev) => {
          const ids = new Set(prev.map((a) => a.id));
          const fresh = pending.filter((a) => !ids.has(a.id));
          return fresh.length > 0 ? [...prev, ...fresh] : prev;
        });
      }
    } catch {
      /* silent */
    }
  }, [session?.accessToken]);

  useEffect(() => {
    if (!session?.accessToken) return;
    if (!fetchedRef.current) {
      fetchedRef.current = true;
      fetchPending();
    }
    intervalRef.current = setInterval(fetchPending, 30_000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [session?.accessToken, fetchPending]);

  const award = queue[0];

  useEffect(() => {
    if (!award) return;
    setPhase("enter");
    const t1 = setTimeout(() => setPhase("reveal"), 300);
    const t2 = setTimeout(() => setPhase("idle"), 900);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [award?.id, award]);

  const close = async () => {
    if (!award) return;
    setQueue((items) => items.slice(1));
    await BadgesService.markSeen([award.id]);
  };

  if (!award) return null;

  const count = award.badge.awardCount ?? 0;
  const isFirst = count <= 1;
  const isRare = count <= 5;
  const revealed = phase !== "enter";

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: backdrop overlay closes dialog on click — keyboard users use the Escape key handler on the inner dialog
    <div
      className="fixed inset-0 z-[100] grid place-items-center bg-black/85 backdrop-blur-sm animate-[fade-in_0.25s_ease-out] p-4"
      onClick={close}
      role="presentation"
    >
      <Confetti />

      <div
        className="relative w-full max-w-xs overflow-visible"
        role="dialog"
        aria-modal="true"
        aria-label={`Badge earned: ${award.badge.name}`}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.key === "Escape" && close()}
      >
        <div className="relative overflow-hidden border border-amber-400/20 bg-zinc-950">
          {/* Shimmer bar */}
          <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-amber-600 via-amber-300 to-amber-600 animate-[shimmer_2s_linear_infinite] bg-[length:200%_100%]" />

          {/* Badge artwork — the hero */}
          <div className="relative flex justify-center bg-gradient-to-b from-amber-400/[0.06] to-transparent px-6 pt-8 pb-5">
            {/* Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-32 w-32 animate-[glow-pulse_2.5s_ease-in-out_infinite] rounded-full bg-amber-400/20 blur-2xl" />

            <div
              className={`relative flex h-28 w-28 items-center justify-center rounded-full border border-amber-400/30 bg-gradient-to-b from-white/10 to-white/[0.03] shadow-[0_0_40px_rgba(251,191,36,0.12)] transition-all duration-600 ${
                revealed ? "scale-100 opacity-100" : "scale-0 opacity-0"
              }`}
            >
              {award.badge.imageUrl ? (
                <img
                  src={award.badge.imageUrl}
                  alt={award.badge.name}
                  className="h-20 w-20 object-contain drop-shadow-[0_0_8px_rgba(251,191,36,0.25)]"
                />
              ) : (
                <Award className="h-12 w-12 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.25)]" />
              )}
            </div>
          </div>

          {/* Content — tight, no wasted space */}
          <div className="px-6 pb-6 text-center">
            <p
              className={`font-mono text-[9px] font-black uppercase tracking-[0.3em] text-amber-400 transition-all duration-400 ${
                revealed ? "opacity-100" : "translate-y-1 opacity-0"
              }`}
            >
              Achievement unlocked
            </p>

            <h2
              className={`mt-2 font-sans text-xl font-black uppercase tracking-widest text-white transition-all duration-400 delay-100 ${
                revealed ? "opacity-100" : "translate-y-2 opacity-0"
              }`}
            >
              {award.badge.name}
            </h2>

            <p
              className={`mt-1.5 font-mono text-[10px] leading-5 text-zinc-500 transition-all duration-400 delay-150 ${
                revealed ? "opacity-100" : "translate-y-2 opacity-0"
              }`}
            >
              {award.reason || award.badge.description}
            </p>

            {/* Metrics row */}
            <div
              className={`mt-4 flex items-center justify-center gap-3 transition-all duration-400 delay-200 ${
                revealed ? "opacity-100" : "translate-y-2 opacity-0"
              }`}
            >
              <span className="inline-flex items-center gap-1 border border-zinc-800 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-wider text-zinc-500">
                {isFirst ? (
                  <Crown className="h-3 w-3 text-amber-400" />
                ) : isRare ? (
                  <Trophy className="h-3 w-3 text-amber-400" />
                ) : (
                  <Users className="h-3 w-3 text-zinc-600" />
                )}
                {holderLabel(count)}
              </span>
            </div>

            {/* Actions */}
            <div
              className={`mt-5 flex flex-col items-center gap-2 transition-all duration-400 delay-300 ${
                revealed ? "opacity-100" : "translate-y-2 opacity-0"
              }`}
            >
              <Link
                href="/badges"
                onClick={close}
                className="inline-flex h-10 w-full items-center justify-center gap-2 bg-amber-400 font-mono text-[10px] font-black uppercase tracking-widest text-zinc-950 transition-colors hover:bg-amber-300"
              >
                View collection <ArrowRight className="h-3 w-3" />
              </Link>
              <button
                type="button"
                onClick={close}
                className="py-1 font-mono text-[10px] text-zinc-600 transition-colors hover:text-zinc-400"
              >
                Dismiss{queue.length > 1 ? ` (${queue.length - 1} more)` : ""}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

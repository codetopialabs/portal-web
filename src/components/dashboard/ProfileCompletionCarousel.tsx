import { ArrowRight, ChevronLeft, ChevronRight, Circle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { DASHBOARD_ITEM_ICONS } from "@/data/dashboard";
import type { StrengthItem } from "@/types/dashboard";

interface ProfileCompletionCarouselProps {
  items: StrengthItem[];
  profileStrength: number;
  barColor: string;
}

export function ProfileCompletionCarousel({
  items,
  profileStrength,
  barColor,
}: ProfileCompletionCarouselProps) {
  const [idx, setIdx] = useState(0);
  const safeIdx = Math.min(idx, items.length - 1);
  const item = items[safeIdx];

  const prev = () => setIdx((i) => (i - 1 + items.length) % items.length);
  const next = () => setIdx((i) => (i + 1) % items.length);

  if (!item) return null;

  const ItemIcon = DASHBOARD_ITEM_ICONS[item.key] ?? Circle;

  return (
    <section id="dashboard-profile-completion" className="border border-zinc-200 bg-white">
      <div className="flex items-center justify-between gap-4 border-b border-zinc-100 px-5 py-3">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
          Profile incomplete · {profileStrength}%
        </p>
        <div className="flex items-center gap-2">
          <div className="h-1 w-20 bg-zinc-100">
            <div className={`h-full ${barColor}`} style={{ width: `${profileStrength}%` }} />
          </div>
          <span className="font-mono text-[10px] text-zinc-400">
            {safeIdx + 1} / {items.length}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4 px-5 py-4">
        <div className="shrink-0 border border-zinc-200 bg-zinc-50 p-2.5 text-zinc-600">
          <ItemIcon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
            Missing · +{item.weight}%
          </p>
          <h3 className="mt-0.5 font-sans text-sm font-black text-zinc-950">{item.label}</h3>
          <p className="mt-1 text-xs leading-5 text-zinc-500">{item.hint}</p>
        </div>
        <Link
          href={item.href}
          className="shrink-0 inline-flex h-8 items-center gap-2 border border-zinc-900 bg-zinc-950 px-3.5 font-mono text-[10px] font-black uppercase tracking-[0.16em] text-white transition-colors hover:bg-zinc-800"
        >
          Fix
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="flex items-center justify-between border-t border-zinc-100 px-5 py-2">
        <button
          type="button"
          onClick={prev}
          disabled={items.length <= 1}
          className="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-400 transition-colors hover:text-zinc-950 disabled:opacity-30"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Prev
        </button>
        <div className="flex gap-1">
          {items.map((dotItem, i) => (
            <span
              key={dotItem.key}
              className={`h-1.5 transition-all ${i === safeIdx ? "w-4 bg-zinc-900" : "w-1.5 bg-zinc-200"}`}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={next}
          disabled={items.length <= 1}
          className="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-400 transition-colors hover:text-zinc-950 disabled:opacity-30"
        >
          Next
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </section>
  );
}

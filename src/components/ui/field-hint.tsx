"use client";

import { Check, CircleQuestionMark, X } from "lucide-react";
import type * as React from "react";
import { useEffect, useRef, useState } from "react";

import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface FieldHintContent {
  /** Field name, repeated as the popover heading. */
  title: string;
  /** What the field actually is. */
  what: string;
  /** Why it's worth filling in properly — where the value shows up or gets used. */
  why: string;
  /** Optional weak/strong pair. Most useful on free-text fields people rush. */
  example?: { avoid: string; better: string };
}

/**
 * "?" affordance next to a field label. Opens on hover for mouse users and on
 * tap/Enter for everyone else — Radix tooltips never open on touch, so this is
 * a popover with hover behaviour bolted on rather than a plain tooltip.
 */
export function FieldHint({
  hint,
  side = "top",
  align = "start",
  className,
}: {
  hint: FieldHintContent;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    },
    []
  );

  function clearTimer() {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }

  function openNow() {
    clearTimer();
    setOpen(true);
  }

  // Small grace period so the pointer can travel from the icon into the popover.
  function closeSoon() {
    clearTimer();
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  }

  function handlePointerEnter(e: React.PointerEvent) {
    if (e.pointerType === "mouse") openNow();
  }

  function handlePointerLeave(e: React.PointerEvent) {
    if (e.pointerType === "mouse") closeSoon();
  }

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        clearTimer();
        setOpen(next);
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`Why we ask for ${hint.title.toLowerCase()}`}
          onPointerEnter={handlePointerEnter}
          onPointerLeave={handlePointerLeave}
          onFocus={openNow}
          onBlur={closeSoon}
          className={cn(
            "inline-flex h-4 w-4 shrink-0 items-center justify-center text-zinc-300 transition-colors hover:text-zinc-900 focus-visible:text-zinc-900 focus-visible:outline-none data-[state=open]:text-zinc-900",
            className
          )}
        >
          <CircleQuestionMark className="h-3.5 w-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        side={side}
        align={align}
        sideOffset={6}
        collisionPadding={12}
        onOpenAutoFocus={(e) => e.preventDefault()}
        onPointerEnter={openNow}
        onPointerLeave={handlePointerLeave}
        className="w-72 gap-0 rounded-none border border-zinc-200 bg-white p-0 shadow-md ring-0"
      >
        <div className="border-b border-zinc-100 px-3 py-2">
          <p className="font-sans text-xs font-bold text-zinc-900">{hint.title}</p>
        </div>
        <div className="space-y-2 px-3 py-2.5">
          <p className="font-mono text-[11px] leading-relaxed text-zinc-600">{hint.what}</p>
          <p className="font-mono text-[11px] leading-relaxed text-zinc-500">
            <span className="font-bold text-zinc-700">Why it matters: </span>
            {hint.why}
          </p>
          {hint.example && (
            <div className="space-y-1.5 border-t border-zinc-100 pt-2">
              <p className="flex items-start gap-1.5 font-mono text-[11px] leading-relaxed text-zinc-400">
                <X className="mt-0.5 h-3 w-3 shrink-0 text-red-400" />
                <span className="line-through decoration-zinc-300">{hint.example.avoid}</span>
              </p>
              <p className="flex items-start gap-1.5 font-mono text-[11px] leading-relaxed text-zinc-600">
                <Check className="mt-0.5 h-3 w-3 shrink-0 text-emerald-500" />
                <span>{hint.example.better}</span>
              </p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

/**
 * Field label with its "?" hint attached. Keeps the icon vertically aligned
 * with the label text instead of the whole form row.
 */
export function FieldLabel({
  htmlFor,
  children,
  hint,
  className,
  hintSide,
  hintAlign,
}: {
  htmlFor?: string;
  children: React.ReactNode;
  hint?: FieldHintContent;
  className?: string;
  hintSide?: "top" | "right" | "bottom" | "left";
  hintAlign?: "start" | "center" | "end";
}) {
  return (
    <div className="flex items-center gap-1.5">
      <Label htmlFor={htmlFor} className={className}>
        {children}
      </Label>
      {hint && <FieldHint hint={hint} side={hintSide} align={hintAlign} />}
    </div>
  );
}

"use client";

import { Check, CircleQuestionMark, X } from "lucide-react";
import type * as React from "react";
import { useEffect, useRef, useState } from "react";

import { Label } from "@/components/ui/label";
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

/** Long enough that crossing the icon on the way somewhere else doesn't open it. */
const HOVER_OPEN_DELAY = 400;
/** Short grace period so the pointer can travel from the icon into the panel. */
const HOVER_CLOSE_DELAY = 150;

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
 * "?" affordance next to a field label. Hovering with intent peeks at the hint;
 * clicking pins it open so a long one can be read without holding the mouse
 * still. Pinned hints close on a second click, Escape, or a click elsewhere.
 *
 * The button is an anchor rather than a Radix trigger because the trigger's
 * built-in click-to-toggle fights the hover state: hover opens, then the click
 * meant to pin reads as a close.
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
  const [pinned, setPinned] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (openTimer.current) clearTimeout(openTimer.current);
      if (closeTimer.current) clearTimeout(closeTimer.current);
    },
    []
  );

  function clearTimers() {
    if (openTimer.current) {
      clearTimeout(openTimer.current);
      openTimer.current = null;
    }
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }

  function close() {
    clearTimers();
    setPinned(false);
    setOpen(false);
  }

  function handlePointerEnter(e: React.PointerEvent) {
    if (e.pointerType !== "mouse" || pinned) return;
    clearTimers();
    openTimer.current = setTimeout(() => setOpen(true), HOVER_OPEN_DELAY);
  }

  function handlePointerLeave(e: React.PointerEvent) {
    if (e.pointerType !== "mouse" || pinned) return;
    clearTimers();
    closeTimer.current = setTimeout(() => setOpen(false), HOVER_CLOSE_DELAY);
  }

  // Keeps the hint up while the pointer is inside the panel itself.
  function handleContentEnter(e: React.PointerEvent) {
    if (e.pointerType !== "mouse" || pinned) return;
    clearTimers();
  }

  function handleClick() {
    clearTimers();
    if (pinned) {
      close();
      return;
    }
    setPinned(true);
    setOpen(true);
  }

  return (
    <Popover open={open} onOpenChange={(next) => !next && close()}>
      <PopoverAnchor asChild>
        <button
          ref={buttonRef}
          type="button"
          aria-expanded={open}
          aria-label={`Why we ask for ${hint.title.toLowerCase()}`}
          onClick={handleClick}
          onPointerEnter={handlePointerEnter}
          onPointerLeave={handlePointerLeave}
          onFocus={() => setOpen(true)}
          onBlur={() => !pinned && close()}
          className={cn(
            "inline-flex h-4 w-4 shrink-0 items-center justify-center transition-colors focus-visible:text-zinc-900 focus-visible:outline-none",
            open ? "text-zinc-900" : "text-zinc-300 hover:text-zinc-500",
            className
          )}
        >
          <CircleQuestionMark className="h-3.5 w-3.5" />
        </button>
      </PopoverAnchor>
      <PopoverContent
        side={side}
        align={align}
        sideOffset={6}
        collisionPadding={12}
        onOpenAutoFocus={(e) => e.preventDefault()}
        // The button is an anchor, not a trigger, so Radix counts a click on it
        // as "outside". Without this the close fires before handleClick, and a
        // pinned hint reopens instead of closing.
        onPointerDownOutside={(e) => {
          if (buttonRef.current?.contains(e.target as Node)) e.preventDefault();
        }}
        onPointerEnter={handleContentEnter}
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

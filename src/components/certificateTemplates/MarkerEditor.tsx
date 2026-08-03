"use client";

import { Crosshair } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ALLOWED_TEMPLATE_FONTS,
  FONT_WEIGHTS,
  type TemplateMarker,
  type TemplateTextAlign,
  type TemplateTextPositions,
} from "@/types/certificateTemplates.types";

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

// Mirrors the render route's own alignTransform -- the CSS preview overlay
// and the satori-rendered PNG must agree on where a marker's (x, y) anchor
// point sits relative to its own text box, or the preview would lie.
export function alignTransform(align: TemplateTextAlign): string {
  const x = align === "left" ? "0%" : align === "right" ? "-100%" : "-50%";
  return `translate(${x}, -50%)`;
}

// ─── Marker style panel -- font, weight, align, color, size, wrap width ────

export function MarkerStylePanel({
  marker,
  onChange,
}: {
  marker: TemplateMarker;
  onChange: (marker: TemplateMarker) => void;
}) {
  const [hexInput, setHexInput] = useState(marker.color);

  useEffect(() => setHexInput(marker.color), [marker.color]);

  const commitHex = () => {
    if (/^#[0-9a-fA-F]{6}$/.test(hexInput)) {
      onChange({ ...marker, color: hexInput });
    } else {
      setHexInput(marker.color);
    }
  };

  const availableWeights = FONT_WEIGHTS[marker.fontFamily];

  const changeFont = (fontFamily: TemplateMarker["fontFamily"]) => {
    const weights = FONT_WEIGHTS[fontFamily];
    // A regular-only script font (e.g. Great Vibes) can't keep a Bold
    // selection made under the previous font -- fall back to whichever
    // weight it actually has rather than saving an impossible combination.
    const fontWeight = (weights as readonly number[]).includes(marker.fontWeight)
      ? marker.fontWeight
      : weights[0];
    onChange({ ...marker, fontFamily, fontWeight });
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-1.5">
        <Label className="font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-400">
          Font
        </Label>
        <select
          value={marker.fontFamily}
          onChange={(e) => changeFont(e.target.value as TemplateMarker["fontFamily"])}
          className="h-9 w-full border border-zinc-200 bg-white px-3 font-mono text-xs text-zinc-700 outline-none focus:border-zinc-950"
        >
          {ALLOWED_TEMPLATE_FONTS.map((font) => (
            <option key={font} value={font}>
              {font}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <Label className="font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-400">
          Weight
        </Label>
        <div className="inline-flex h-9 border border-zinc-200 bg-white p-0.5">
          {([400, 700] as const).map((weight) => {
            const supported = (availableWeights as readonly number[]).includes(weight);
            return (
              <button
                key={weight}
                type="button"
                disabled={!supported}
                title={
                  supported
                    ? undefined
                    : `${marker.fontFamily} doesn't have a ${weight === 400 ? "regular" : "bold"} weight`
                }
                onClick={() => onChange({ ...marker, fontWeight: weight })}
                className={`h-full px-4 font-mono text-[10px] font-black uppercase tracking-widest transition-colors ${
                  !supported
                    ? "cursor-not-allowed text-zinc-200"
                    : marker.fontWeight === weight
                      ? "bg-zinc-950 text-white"
                      : "text-zinc-400 hover:text-zinc-950"
                }`}
              >
                {weight === 400 ? "Regular" : "Bold"}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-400">
          Align
        </Label>
        <div className="inline-flex h-9 border border-zinc-200 bg-white p-0.5">
          {(["left", "center", "right"] as const).map((align) => (
            <button
              key={align}
              type="button"
              onClick={() => onChange({ ...marker, align })}
              className={`h-full px-4 font-mono text-[10px] font-black uppercase tracking-widest transition-colors ${
                marker.align === align
                  ? "bg-zinc-950 text-white"
                  : "text-zinc-400 hover:text-zinc-950"
              }`}
            >
              {align}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-400">
          Color
        </Label>
        <div className="flex h-9 items-center gap-2">
          <input
            type="color"
            value={marker.color}
            onChange={(e) => onChange({ ...marker, color: e.target.value })}
            className="h-9 w-9 shrink-0 cursor-pointer border border-zinc-200 bg-white p-0.5"
          />
          <Input
            value={hexInput}
            onChange={(e) => setHexInput(e.target.value)}
            onBlur={commitHex}
            className="h-9 rounded-none font-mono text-xs"
          />
        </div>
      </div>

      <div className="space-y-1.5 sm:col-span-2">
        <Label className="flex items-center justify-between font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-400">
          Text size
          <span className="text-zinc-500">{(marker.fontSizeRatio * 100).toFixed(1)}%</span>
        </Label>
        <input
          type="range"
          min={0.01}
          max={0.25}
          step={0.005}
          value={marker.fontSizeRatio}
          onChange={(e) => onChange({ ...marker, fontSizeRatio: Number(e.target.value) })}
          className="h-9 w-full accent-zinc-950"
        />
      </div>

      <div className="space-y-1.5 sm:col-span-2">
        <Label className="flex items-center justify-between font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-400">
          Wrap width
          <span className="text-zinc-500">{(marker.maxWidthRatio * 100).toFixed(0)}%</span>
        </Label>
        <input
          type="range"
          min={0.05}
          max={1}
          step={0.01}
          value={marker.maxWidthRatio}
          onChange={(e) => onChange({ ...marker, maxWidthRatio: Number(e.target.value) })}
          className="h-9 w-full accent-zinc-950"
        />
      </div>
    </div>
  );
}

// ─── Marker canvas -- the image with draggable name/code crosshairs and a
// live CSS-approximation of each marker's text box. Shared by the template
// editor (Phase 4) and the per-recipient placement adjuster (Phase 5),
// since both are the same "drag a point on this image" interaction, just
// scoped to a template's shared default vs. one person's override. ────────

export function MarkerCanvas({
  imageUrl,
  imageWidth,
  imageHeight,
  textPositions,
  onChange,
  selectedKey,
  onSelectKey,
  previewText,
}: {
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  textPositions: TemplateTextPositions;
  onChange: (textPositions: TemplateTextPositions) => void;
  selectedKey: keyof TemplateTextPositions;
  onSelectKey: (key: keyof TemplateTextPositions) => void;
  previewText: Record<keyof TemplateTextPositions, string>;
}) {
  const imgWrapRef = useRef<HTMLDivElement>(null);
  const draggingKey = useRef<keyof TemplateTextPositions | null>(null);
  const [renderedSize, setRenderedSize] = useState({ width: 0, height: 0 });
  const scale = imageHeight > 0 ? renderedSize.height / imageHeight : 0;

  // Dragging updates textPositions on every move, which would otherwise
  // change this closure's identity mid-drag. Mirroring the latest value
  // into a ref -- read by a pointermove listener attached ONCE for the
  // component's lifetime -- means the window listeners are never torn
  // down and re-added while a drag is still in progress.
  const latestRef = useRef({ textPositions, onChange });
  useLayoutEffect(() => {
    latestRef.current = { textPositions, onChange };
  });

  useEffect(() => {
    const el = imgWrapRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setRenderedSize({ width: entry.contentRect.width, height: entry.contentRect.height });
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    function handlePointerMove(e: PointerEvent) {
      const key = draggingKey.current;
      const el = imgWrapRef.current;
      if (!key || !el) return;
      const rect = el.getBoundingClientRect();
      const x = clamp01((e.clientX - rect.left) / rect.width);
      const y = clamp01((e.clientY - rect.top) / rect.height);
      const { textPositions: current, onChange: currentOnChange } = latestRef.current;
      currentOnChange({ ...current, [key]: { ...current[key], x, y } });
    }
    function handlePointerUp() {
      draggingKey.current = null;
    }
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, []);

  const startDrag = (key: keyof TemplateTextPositions) => (e: React.PointerEvent) => {
    e.preventDefault();
    draggingKey.current = key;
    onSelectKey(key);
  };

  return (
    <div
      ref={imgWrapRef}
      className="relative w-full select-none overflow-hidden border border-zinc-200 bg-zinc-50"
      style={{ aspectRatio: `${imageWidth} / ${imageHeight}` }}
    >
      {/* biome-ignore lint/performance/noImgElement: needs a plain DOM ref for getBoundingClientRect drag math */}
      <img
        src={imageUrl}
        alt=""
        draggable={false}
        className="pointer-events-none absolute inset-0 h-full w-full object-contain"
      />

      {scale > 0 &&
        (Object.keys(textPositions) as Array<keyof TemplateTextPositions>).map((key) => {
          const marker = textPositions[key];
          const isSelected = key === selectedKey;
          return (
            <div key={key}>
              {/* Wrap-boundary + live text preview */}
              <div
                className={`pointer-events-none absolute border border-dashed ${
                  isSelected ? "border-zinc-500" : "border-zinc-300"
                }`}
                style={{
                  left: `${marker.x * 100}%`,
                  top: `${marker.y * 100}%`,
                  width: `${marker.maxWidthRatio * 100}%`,
                  transform: alignTransform(marker.align),
                  textAlign: marker.align,
                  fontFamily: marker.fontFamily,
                  fontWeight: marker.fontWeight,
                  fontSize: marker.fontSizeRatio * imageHeight * scale,
                  color: marker.color,
                  lineHeight: 1.2,
                  padding: 2,
                }}
              >
                {previewText[key]}
              </div>

              {/* Draggable anchor */}
              <button
                type="button"
                onPointerDown={startDrag(key)}
                title={`Drag to place ${key}`}
                className={`absolute flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 cursor-grab items-center justify-center rounded-full border-2 bg-white/90 shadow active:cursor-grabbing ${
                  isSelected ? "border-zinc-950 text-zinc-950" : "border-zinc-400 text-zinc-400"
                }`}
                style={{ left: `${marker.x * 100}%`, top: `${marker.y * 100}%` }}
              >
                <Crosshair className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
    </div>
  );
}

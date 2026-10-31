"use client";

import { useId } from "react";
import { coverShapes } from "@/lib/cover-art";

// Light and dark colours for the soft shapes, lightest to darkest in light
// mode. Each pair is set on a gradient stop.
const TONES = [
  "[stop-color:#ffffff] dark:[stop-color:#000000]",
  "[stop-color:#d0d0d0] dark:[stop-color:#2c2c2c]",
  "[stop-color:#b8b8b8] dark:[stop-color:#3c3c3c]",
  "[stop-color:#a2a2a2] dark:[stop-color:#505050]",
];

// The cover for members who haven't uploaded one: soft greyscale shapes under
// a fine grain, drawn from their username so each member keeps theirs. The
// shapes are radial gradients rather than blurred, which Chrome renders in
// coarse bands at this size.
export function ProfileCoverArt({ seed }: { seed: string }) {
  const id = useId();
  const shapes = coverShapes(seed).map((shape) => ({ ...shape, tone: TONES[shape.tone] }));

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1200 300"
      preserveAspectRatio="xMidYMid slice"
      className="h-full w-full"
    >
      <defs>
        {shapes.map((shape, index) => (
          <radialGradient key={`${shape.cx}-${shape.cy}`} id={`${id}-shape-${index}`}>
            <stop offset="0" className={shape.tone} />
            <stop offset="0.45" stopOpacity="0.6" className={shape.tone} />
            <stop offset="1" stopOpacity="0" className={shape.tone} />
          </radialGradient>
        ))}
        <filter id={`${id}-grain`}>
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves="2"
            stitchTiles="stitch"
          />
          {/* Grey noise at full contrast and fully opaque; the raw output is
              too faint and half transparent to show. */}
          <feColorMatrix values="3 0 0 0 -1  3 0 0 0 -1  3 0 0 0 -1  0 0 0 0 1" />
        </filter>
      </defs>
      <rect width="1200" height="300" className="fill-[#e4e4e4] dark:fill-[#161616]" />
      {shapes.map((shape, index) => (
        <ellipse
          key={`${shape.cx}-${shape.cy}`}
          cx={shape.cx}
          cy={shape.cy}
          rx={shape.rx}
          ry={shape.ry}
          transform={`rotate(${shape.rotate} ${shape.cx} ${shape.cy})`}
          fill={`url(#${id}-shape-${index})`}
        />
      ))}
      <rect
        width="1200"
        height="300"
        filter={`url(#${id}-grain)`}
        className="opacity-20 mix-blend-overlay dark:opacity-25"
      />
    </svg>
  );
}

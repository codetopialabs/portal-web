"use client";

import { useId } from "react";

// Light and dark colours for the soft shapes, lightest to darkest in light
// mode. Each pair is set on a gradient stop.
const TONES = [
  "[stop-color:#ffffff] dark:[stop-color:#000000]",
  "[stop-color:#d0d0d0] dark:[stop-color:#2c2c2c]",
  "[stop-color:#b8b8b8] dark:[stop-color:#3c3c3c]",
  "[stop-color:#a2a2a2] dark:[stop-color:#505050]",
];

// Small seeded generator (cyrb53-style hash into mulberry32), so a username
// always draws the same picture.
function seededRandom(seed: string): () => number {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let state = h >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// The cover for members who haven't uploaded one: soft greyscale shapes under
// a fine grain, drawn from their username so each member keeps theirs. The shapes are radial gradients rather than blurred, which
// Chrome renders in coarse bands at this size.
export function ProfileCoverArt({ seed }: { seed: string }) {
  const id = useId();
  const random = seededRandom(seed);
  const shapes = Array.from({ length: 6 }, (_, index) => ({
    cx: random() * 1200,
    cy: random() * 300,
    rx: 220 + random() * 320,
    ry: 140 + random() * 160,
    rotate: random() * 180,
    tone: TONES[index % TONES.length],
  }));

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

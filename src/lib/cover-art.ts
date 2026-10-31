// The generated cover for members who haven't uploaded one, shared by the
// profile page and its share card so both draw the same picture.

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

export const COVER_WIDTH = 1200;
export const COVER_HEIGHT = 300;

export interface CoverShape {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  rotate: number;
  // Which of the four tones, lightest to darkest in light mode.
  tone: number;
}

// Six soft ellipses on a 1200 by 300 canvas.
export function coverShapes(seed: string): CoverShape[] {
  const random = seededRandom(seed);
  return Array.from({ length: 6 }, (_, index) => ({
    cx: random() * COVER_WIDTH,
    cy: random() * COVER_HEIGHT,
    rx: 220 + random() * 320,
    ry: 140 + random() * 160,
    rotate: random() * 180,
    tone: index % 4,
  }));
}

// Up to two initials, from the first and last names.
export function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  const letters = words.length > 1 ? [words[0], words[words.length - 1]] : [words[0]];
  return letters.map((word) => word[0].toUpperCase()).join("");
}

// Size for the huge faint handle behind a profile's header: up to 15vw or
// 240px, but smaller for long handles so it never runs off the page. Inter's
// letters average about 0.6em wide; 85vw leaves room for the page margins.
export function handleFontSize(handle: string): string {
  const fit = 85 / (Math.max(handle.length, 1) * 0.6);
  return `min(15vw, 240px, ${fit.toFixed(2)}vw)`;
}

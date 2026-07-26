/**
 * ImageResponse (satori) can't consume next/font's fingerprinted output, so
 * og images load raw font bytes directly. The CSS2 API returns woff2 to
 * browser user agents but a plain "Mozilla/5.0" gets truetype, which satori
 * can render.
 */
export async function loadGoogleFontTtf(family: string, weight: number): Promise<ArrayBuffer> {
  const cssUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}&display=swap`;
  const css = await fetch(cssUrl, { headers: { "User-Agent": "Mozilla/5.0" } }).then((res) =>
    res.text()
  );
  const match = css.match(/src: url\((.+?)\) format\('truetype'\)/);
  if (!match) {
    throw new Error(`[og-fonts] no truetype src found for ${family} @${weight}`);
  }
  return fetch(match[1]).then((res) => res.arrayBuffer());
}

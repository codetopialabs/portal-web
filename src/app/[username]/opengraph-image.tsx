import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { COVER_HEIGHT, COVER_WIDTH, coverShapes, initialsOf } from "@/lib/cover-art";
import { fetchMemberProfile } from "@/lib/member";
import { loadGoogleFontTtf } from "@/lib/og-fonts";
import { withCloudinaryTransform } from "@/lib/utils";

/**
 * Fetches an image ourselves (rather than letting satori's internal image
 * loader do it) so a slow/oversized user upload can't hang or 500 the route
 * that social crawlers hit with short, non-retrying timeouts.
 */
async function loadImageDataUri(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
    if (!res.ok) return null;
    const contentType = res.headers.get("content-type") ?? "image/jpeg";
    const buf = await res.arrayBuffer();
    return `data:${contentType};base64,${Buffer.from(buf).toString("base64")}`;
  } catch {
    return null;
  }
}

// The profile's generated cover in its dark colours, as an svg the renderer
// can rasterise: the same shapes and grain the page draws for this username.
function coverArtDataUri(seed: string): string {
  const tones = ["#000000", "#2c2c2c", "#3c3c3c", "#505050"];
  const shapes = coverShapes(seed);
  const gradients = shapes
    .map(
      (shape, index) =>
        `<radialGradient id="s${index}"><stop offset="0" stop-color="${tones[shape.tone]}"/><stop offset="0.45" stop-color="${tones[shape.tone]}" stop-opacity="0.6"/><stop offset="1" stop-color="${tones[shape.tone]}" stop-opacity="0"/></radialGradient>`
    )
    .join("");
  const ellipses = shapes
    .map(
      (shape, index) =>
        `<ellipse cx="${shape.cx}" cy="${shape.cy}" rx="${shape.rx}" ry="${shape.ry}" transform="rotate(${shape.rotate} ${shape.cx} ${shape.cy})" fill="url(#s${index})"/>`
    )
    .join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${COVER_WIDTH} ${COVER_HEIGHT}" width="${COVER_WIDTH}" height="${COVER_HEIGHT}"><defs>${gradients}<filter id="g"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="3 0 0 0 -1  3 0 0 0 -1  3 0 0 0 -1  0 0 0 0 1"/></filter></defs><rect width="${COVER_WIDTH}" height="${COVER_HEIGHT}" fill="#161616"/>${ellipses}<rect width="${COVER_WIDTH}" height="${COVER_HEIGHT}" filter="url(#g)" opacity="0.12"/></svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

export const runtime = "nodejs";
// GET route handlers (which this file compiles to) are cached by default —
// without this, a transient API failure gets baked in and served to every
// social crawler afterwards instead of just that one request.
export const dynamic = "force-dynamic";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// The card in the profile's dark colours: the panel, a cover band across the
// top and the avatar a third over its edge.
const PANEL = "#151515";
const COVER = 220;
const AVATAR = 210;
const AVATAR_TOP = COVER - AVATAR / 3;
const EDGE = 64;
const TEXT_LEFT = EDGE + AVATAR + 44;
const TEXT_WIDTH = size.width - TEXT_LEFT - EDGE;

// Biggest size, up to 76px, at which the name fits on one line. Space
// Grotesk's letters average a little under 0.6em wide.
function nameSize(name: string): number {
  return Math.round(Math.max(44, Math.min(76, TEXT_WIDTH / (name.length * 0.6))));
}

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username: rawUsername } = await params;
  const username = decodeURIComponent(rawUsername).replace(/^@/, "");

  const [profile, logoBuffer, spaceGrotesk, inter, interSemibold] = await Promise.all([
    // Crawlers don't retry, so a failed lookup still gets the plain card.
    fetchMemberProfile(username).catch(() => null),
    readFile(path.join(process.cwd(), "public/logos/community-logo-white.png")),
    loadGoogleFontTtf("Space Grotesk", 600),
    loadGoogleFontTtf("Inter", 500),
    loadGoogleFontTtf("Inter", 600),
  ]);

  const logoSrc = `data:image/png;base64,${logoBuffer.toString("base64")}`;
  const fonts = [
    { name: "Space Grotesk", data: spaceGrotesk, weight: 600 as const },
    { name: "Inter", data: inter, weight: 500 as const },
    { name: "Inter", data: interSemibold, weight: 600 as const },
  ];

  if (!profile) {
    return new ImageResponse(
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          background: PANEL,
        }}
      >
        {/** biome-ignore lint/performance/noImgElement: satori render, not a browser img */}
        <img src={logoSrc} width={386} height={78} alt="" />
      </div>,
      { ...size, fonts }
    );
  }

  const coverUrl = profile.coverImageUrl?.trim();
  const photoUrl = profile.profilePictureUrl?.trim();
  const [coverSrc, photoSrc] = await Promise.all([
    coverUrl
      ? loadImageDataUri(
          withCloudinaryTransform(coverUrl, `c_fill,g_auto,w_1200,h_${COVER},q_auto,f_jpg`)
        )
      : null,
    photoUrl
      ? loadImageDataUri(
          withCloudinaryTransform(photoUrl, "c_fill,g_face,w_420,h_420,q_auto,f_jpg")
        )
      : null,
  ]);

  const detail = [profile.currentRole, profile.location].filter(Boolean).join(" · ");
  const handleSize = Math.min(220, (size.width - EDGE * 2) / (profile.username.length * 0.62));

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        position: "relative",
        width: "100%",
        height: "100%",
        background: PANEL,
      }}
    >
      {/* Their handle, huge and faint, on the right, fading towards the foot
          as on the page. */}
      <div
        style={{
          display: "flex",
          position: "absolute",
          right: EDGE,
          bottom: 28,
          fontFamily: "Inter",
          fontWeight: 600,
          fontSize: handleSize,
          lineHeight: 0.8,
          letterSpacing: "-0.05em",
          color: "#1f1f1f",
          maskImage: "linear-gradient(to bottom, black 40%, transparent)",
        }}
      >
        {profile.username}
      </div>

      {/** biome-ignore lint/performance/noImgElement: satori render, not a browser img */}
      <img
        src={coverSrc ?? coverArtDataUri(profile.username)}
        width={size.width}
        height={COVER}
        style={{ position: "absolute", top: 0, left: 0, objectFit: "cover" }}
        alt=""
      />

      <div
        style={{
          display: "flex",
          position: "absolute",
          top: AVATAR_TOP,
          left: EDGE,
          width: AVATAR,
          height: AVATAR,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#1c1c1c",
          border: "1px solid rgba(255,255,255,0.1)",
          fontFamily: "Space Grotesk",
          fontWeight: 600,
          fontSize: 84,
          letterSpacing: "-0.04em",
          color: "#52525b",
        }}
      >
        {photoSrc ? (
          // biome-ignore lint/performance/noImgElement: satori render, not a browser img
          <img
            src={photoSrc}
            width={AVATAR - 2}
            height={AVATAR - 2}
            style={{ objectFit: "cover" }}
            alt=""
          />
        ) : (
          initialsOf(profile.fullName)
        )}
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          position: "absolute",
          top: COVER + 28,
          left: TEXT_LEFT,
          width: TEXT_WIDTH,
        }}
      >
        <div
          style={{
            display: "flex",
            fontFamily: "Space Grotesk",
            fontWeight: 600,
            fontSize: nameSize(profile.fullName),
            lineHeight: 1.05,
            letterSpacing: "-0.04em",
            color: "#ffffff",
          }}
        >
          {profile.fullName}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 10,
            fontFamily: "Inter",
            fontWeight: 500,
            fontSize: 30,
            color: "#71717a",
          }}
        >
          @{profile.username}
        </div>
        {detail && (
          <div
            style={{
              display: "flex",
              marginTop: 18,
              fontFamily: "Inter",
              fontWeight: 500,
              fontSize: 26,
              color: "#a1a1aa",
            }}
          >
            {detail}
          </div>
        )}
      </div>

      {/** biome-ignore lint/performance/noImgElement: satori render, not a browser img */}
      <img
        src={logoSrc}
        width={164}
        height={33}
        style={{ position: "absolute", left: EDGE, bottom: 48, objectFit: "contain" }}
        alt=""
      />
    </div>,
    { ...size, fonts }
  );
}

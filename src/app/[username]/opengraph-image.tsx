import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { fetchMemberProfile } from "@/lib/member";
import { loadGoogleFontTtf } from "@/lib/og-fonts";

/**
 * Uploaded avatars are Cloudinary URLs and can come in at several MB
 * uncompressed — wasteful and slow to fetch for a 240px circle. Cloudinary's
 * URL-based transforms let us ask for a small, face-cropped, pre-optimized
 * version instead. No-op for any URL that isn't a Cloudinary "/upload/" path
 * (e.g. the dicebear fallback below).
 */
function toAvatarThumbnail(url: string): string {
  const marker = "/upload/";
  const insertAt = url.indexOf(marker);
  if (insertAt === -1) return url;
  const splitAt = insertAt + marker.length;
  return `${url.slice(0, splitAt)}w_480,h_480,c_fill,g_face,q_auto,f_auto/${url.slice(splitAt)}`;
}

/** Dicebear's default svg endpoint can't be rasterized by satori — this card needs a raster fallback. */
function getOgAvatarUrl(url: string | null | undefined, name: string): string {
  const trimmed = url?.trim();
  if (trimmed) return toAvatarThumbnail(trimmed);
  return `https://api.dicebear.com/9.x/bottts-neutral/png?seed=${encodeURIComponent(name)}&size=440`;
}

/**
 * Fetches the avatar ourselves (rather than letting satori's internal image
 * loader do it) so a slow/oversized user-uploaded photo can't hang or 500 the
 * route that social crawlers hit with short, non-retrying timeouts.
 */
async function loadAvatarDataUri(url: string): Promise<string | null> {
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

export const runtime = "nodejs";
// GET route handlers (which this file compiles to) are cached by default —
// without this, a transient API failure gets baked in and served to every
// social crawler afterwards instead of just that one request.
export const dynamic = "force-dynamic";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const ROLE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Mentor: { bg: "rgba(255,247,237,0.9)", text: "#ea580c", border: "#fed7aa" },
  Member: { bg: "rgba(244,244,245,0.9)", text: "#71717a", border: "#e4e4e7" },
  Volunteer: { bg: "rgba(236,253,245,0.9)", text: "#059669", border: "#a7f3d0" },
  "Core Team": { bg: "#18181b", text: "#ffffff", border: "#18181b" },
  Admin: { bg: "#18181b", text: "#ffffff", border: "#18181b" },
  "Super Admin": { bg: "#18181b", text: "#ffffff", border: "#18181b" },
};

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username: rawUsername } = await params;
  const username = decodeURIComponent(rawUsername).replace(/^@/, "");

  const [profile, logoBuffer, spaceGrotesk, inter] = await Promise.all([
    fetchMemberProfile(username),
    readFile(path.join(process.cwd(), "public/logos/codetopia-community.png")),
    loadGoogleFontTtf("Space Grotesk", 700),
    loadGoogleFontTtf("Inter", 500),
  ]);

  const logoSrc = `data:image/png;base64,${logoBuffer.toString("base64")}`;
  const fonts = [
    { name: "Space Grotesk", data: spaceGrotesk, weight: 700 as const },
    { name: "Inter", data: inter, weight: 500 as const },
  ];

  if (!profile) {
    return new ImageResponse(
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          background: "#09090b",
        }}
      >
        {/** biome-ignore lint/performance/noImgElement: satori render, not a browser img */}
        <img src={logoSrc} width={280} height={158} style={{ objectFit: "contain" }} alt="" />
      </div>,
      { ...size, fonts }
    );
  }

  const primaryRole = profile.primaryRole || profile.communityRoles?.[0] || "Member";
  const roleColor = ROLE_COLORS[primaryRole] ?? ROLE_COLORS.Member;
  const avatarSrc = await loadAvatarDataUri(
    getOgAvatarUrl(profile.profilePictureUrl, profile.fullName)
  );

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        padding: 64,
        background: "#09090b",
        backgroundImage:
          "radial-gradient(circle at 85% 15%, rgba(255,255,255,0.08), transparent 55%)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div
        style={{
          display: "flex",
          flex: 1,
          alignItems: "center",
          gap: 56,
          padding: "0 8px",
        }}
      >
        <div
          style={{
            display: "flex",
            width: 320,
            height: 320,
            flexShrink: 0,
            backgroundColor: "#27272a",
          }}
        >
          {avatarSrc && (
            // biome-ignore lint/performance/noImgElement: satori render, not a browser img
            <img
              src={avatarSrc}
              width={320}
              height={320}
              style={{
                objectFit: "cover",
                border: "4px solid rgba(255,255,255,0.2)",
              }}
              alt=""
            />
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
          {profile.currentRole && (
            <div
              style={{
                display: "flex",
                marginBottom: 8,
                fontFamily: "Inter",
                fontWeight: 500,
                fontSize: 26,
                color: "#71717a",
              }}
            >
              {profile.currentRole}
            </div>
          )}
          <div
            style={{
              display: "flex",
              fontFamily: "Space Grotesk",
              fontWeight: 700,
              fontSize: 72,
              lineHeight: 1.05,
              color: "#ffffff",
            }}
          >
            {profile.fullName}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 14,
              fontFamily: "Inter",
              fontSize: 32,
              color: "#a1a1aa",
            }}
          >
            @{profile.username}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 32 }}>
            <div
              style={{
                display: "flex",
                fontFamily: "Inter",
                fontWeight: 500,
                fontSize: 22,
                padding: "10px 22px",
                textTransform: "uppercase",
                letterSpacing: 2,
                backgroundColor: roleColor.bg,
                color: roleColor.text,
                border: `2px solid ${roleColor.border}`,
              }}
            >
              {primaryRole}
            </div>
          </div>

          {profile.location && (
            <div
              style={{
                display: "flex",
                marginTop: 20,
                fontFamily: "Inter",
                fontSize: 26,
                color: "#71717a",
              }}
            >
              {profile.location}
            </div>
          )}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderTop: "1px solid rgba(255,255,255,0.1)",
          paddingTop: 32,
        }}
      >
        {/** biome-ignore lint/performance/noImgElement: satori render, not a browser img */}
        <img src={logoSrc} width={140} height={79} style={{ objectFit: "contain" }} alt="" />
        <div style={{ display: "flex", fontFamily: "Inter", fontSize: 24, color: "#52525b" }}>
          Codetopia Community
        </div>
      </div>
    </div>,
    { ...size, fonts }
  );
}

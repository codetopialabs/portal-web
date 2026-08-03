import { ImageResponse } from "next/og";
import { NextResponse } from "next/server";
import { loadGoogleFontTtf } from "@/lib/og-fonts";
import { MAX_TEMPLATE_DIMENSION } from "@/types/certificateTemplates.types";

export const runtime = "nodejs";

const ALLOWED_ALIGN = new Set(["left", "center", "right"]);

interface MarkerConfig {
  x: number;
  y: number;
  align: "left" | "center" | "right";
  fontFamily: string;
  fontWeight: 400 | 700;
  fontSizeRatio: number;
  color: string;
  maxWidthRatio: number;
}

interface RenderRequest {
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  markers: { name: MarkerConfig; code: MarkerConfig };
  name: string;
  code: string;
}

/** Fetches the template ourselves (rather than letting satori's internal
 * image loader do it) so a slow/oversized template can't hang this route --
 * same reasoning as opengraph-image.tsx's loadAvatarDataUri, just a longer
 * timeout since template designs are typically larger than an avatar. */
async function loadImageDataUri(url: string, timeoutMs = 6000): Promise<string | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
    if (!res.ok) return null;
    const contentType = res.headers.get("content-type") ?? "image/png";
    const buf = await res.arrayBuffer();
    return `data:${contentType};base64,${Buffer.from(buf).toString("base64")}`;
  } catch {
    return null;
  }
}

function isValidMarker(marker: unknown): marker is MarkerConfig {
  if (typeof marker !== "object" || marker === null) return false;
  const m = marker as Record<string, unknown>;
  return (
    typeof m.x === "number" &&
    m.x >= 0 &&
    m.x <= 1 &&
    typeof m.y === "number" &&
    m.y >= 0 &&
    m.y <= 1 &&
    typeof m.align === "string" &&
    ALLOWED_ALIGN.has(m.align) &&
    typeof m.fontFamily === "string" &&
    (m.fontWeight === 400 || m.fontWeight === 700) &&
    typeof m.fontSizeRatio === "number" &&
    m.fontSizeRatio > 0 &&
    m.fontSizeRatio <= 1 &&
    typeof m.color === "string" &&
    typeof m.maxWidthRatio === "number" &&
    m.maxWidthRatio > 0 &&
    m.maxWidthRatio <= 1
  );
}

/** Anchors the box on the marker's (x, y) point regardless of alignment or
 * text length -- translate shifts by the element's OWN rendered size, so
 * this works the same whether the text wraps to one line or three. */
function alignTransform(align: MarkerConfig["align"]): string {
  const x = align === "left" ? "0%" : align === "right" ? "-100%" : "-50%";
  return `translate(${x}, -50%)`;
}

function TextLayer({
  marker,
  text,
  imageHeight,
}: {
  marker: MarkerConfig;
  text: string;
  imageHeight: number;
}) {
  return (
    <div
      style={{
        position: "absolute",
        display: "flex",
        left: `${marker.x * 100}%`,
        top: `${marker.y * 100}%`,
        width: `${marker.maxWidthRatio * 100}%`,
        transform: alignTransform(marker.align),
        justifyContent:
          marker.align === "left" ? "flex-start" : marker.align === "right" ? "flex-end" : "center",
        textAlign: marker.align,
        fontFamily: marker.fontFamily,
        fontWeight: marker.fontWeight,
        fontSize: marker.fontSizeRatio * imageHeight,
        color: marker.color,
        lineHeight: 1.2,
      }}
    >
      {text}
    </div>
  );
}

export async function POST(req: Request) {
  let body: RenderRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ detail: "Invalid JSON body." }, { status: 400 });
  }

  const { imageUrl, imageWidth, imageHeight, markers, name, code } = body ?? {};

  if (
    typeof imageUrl !== "string" ||
    !imageUrl ||
    typeof imageWidth !== "number" ||
    imageWidth <= 0 ||
    imageWidth > MAX_TEMPLATE_DIMENSION ||
    typeof imageHeight !== "number" ||
    imageHeight <= 0 ||
    imageHeight > MAX_TEMPLATE_DIMENSION ||
    typeof name !== "string" ||
    typeof code !== "string" ||
    !markers ||
    !isValidMarker(markers.name) ||
    !isValidMarker(markers.code)
  ) {
    return NextResponse.json({ detail: "Invalid render request." }, { status: 400 });
  }

  const backgroundSrc = await loadImageDataUri(imageUrl);
  if (!backgroundSrc) {
    return NextResponse.json({ detail: "Template image could not be loaded." }, { status: 502 });
  }

  // Dedupe -- both markers might use the same font/weight, no need to fetch twice.
  const fontKeys = new Map<string, { family: string; weight: 400 | 700 }>();
  for (const marker of [markers.name, markers.code]) {
    fontKeys.set(`${marker.fontFamily}-${marker.fontWeight}`, {
      family: marker.fontFamily,
      weight: marker.fontWeight,
    });
  }

  let fonts: Array<{ name: string; data: ArrayBuffer; weight: 400 | 700 }>;
  try {
    fonts = await Promise.all(
      Array.from(fontKeys.values()).map(async ({ family, weight }) => ({
        name: family,
        data: await loadGoogleFontTtf(family, weight),
        weight,
      }))
    );
  } catch {
    return NextResponse.json({ detail: "Could not load the template's fonts." }, { status: 502 });
  }

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        position: "relative",
        width: imageWidth,
        height: imageHeight,
      }}
    >
      {/* biome-ignore lint/performance/noImgElement: satori render, not a browser img */}
      <img
        src={backgroundSrc}
        width={imageWidth}
        height={imageHeight}
        style={{ position: "absolute", top: 0, left: 0, objectFit: "cover" }}
        alt=""
      />
      <TextLayer marker={markers.name} text={name} imageHeight={imageHeight} />
      <TextLayer marker={markers.code} text={code} imageHeight={imageHeight} />
    </div>,
    { width: imageWidth, height: imageHeight, fonts }
  );
}

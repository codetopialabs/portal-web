export type CertificateTemplateStatus = "draft" | "active" | "archived";

/** Shared with the render route (which enforces it server-side on every
 * render) so the upload step can reject an oversized template up front,
 * instead of letting it save and only fail later at preview time. 4000px
 * is well beyond any standard certificate print size (300 DPI tops out
 * around 11-14in on a side, i.e. ~3300-4200px) -- it's a render-cost guard,
 * not a quality ceiling. */
export const MAX_TEMPLATE_DIMENSION = 4000;

/** Kept small and explicit -- these are the only families loadGoogleFontTtf
 * (the render route) knows how to fetch. Not user-extensible via upload.
 *
 * Weight availability is keyed per font, not one shared set -- Google Fonts
 * genuinely doesn't ship every family in both weights (script faces are
 * often regular-only), so mirrors the backend's FONT_WEIGHTS exactly. */
export const FONT_WEIGHTS = {
  Inter: [400, 700],
  "Space Grotesk": [400, 700],
  "Playfair Display": [400, 700],
  Merriweather: [400, 700],
  "JetBrains Mono": [400, 700],
  "Dancing Script": [400, 700],
  "Great Vibes": [400],
} as const;

export const ALLOWED_TEMPLATE_FONTS = Object.keys(FONT_WEIGHTS) as Array<keyof typeof FONT_WEIGHTS>;

export type TemplateFont = keyof typeof FONT_WEIGHTS;
export type TemplateFontWeight = 400 | 700;
export type TemplateTextAlign = "left" | "center" | "right";

/** Everything expressed as a fraction of the template's own image
 * dimensions, so the same config maps correctly whether it's laid out in
 * the browser's drag editor or on the server's render canvas. */
export interface TemplateMarker {
  x: number;
  y: number;
  align: TemplateTextAlign;
  fontFamily: TemplateFont;
  fontWeight: TemplateFontWeight;
  fontSizeRatio: number;
  color: string;
  maxWidthRatio: number;
}

export interface TemplateTextPositions {
  name: TemplateMarker;
  code: TemplateMarker;
}

export interface CertificateTemplate {
  id: string;
  name: string;
  certificateType: string;
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  textPositions: TemplateTextPositions;
  status: CertificateTemplateStatus;
  certificateCount: number;
  createdByUsername: string | null;
  updatedByUsername: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CertificateTemplateInput {
  name: string;
  certificateType?: string;
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  textPositions: TemplateTextPositions;
  status: CertificateTemplateStatus;
}

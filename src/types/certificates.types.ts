import type { TemplateTextPositions } from "@/types/certificateTemplates.types";

export type CertificateStatus = "pending" | "active" | "revoked";

/** Free text, like Recognition's awardName -- a curator can issue a new kind
 * of certificate without a code change. */
export type CertificateType = string;

/** Seeds the admin form's autocomplete for consistency ("Workshop" every
 * time, not "workshop"/"Workshops" drifting apart) -- not an enforced list. */
export const SUGGESTED_CERTIFICATE_TYPES = [
  "Program",
  "Workshop",
  "Bootcamp",
  "Internship",
  "Mentorship",
  "Hackathon",
];

/**
 * A verifiable certificate. Issuance is phased: reserved with a code up
 * front (`pending`, no artwork yet), then artwork is uploaded and it's
 * published (`active`). The recipient may have no portal account at all --
 * `username` is null in that case, and `recipientName`/`recipientEmail` are
 * the source of truth.
 */
export interface Certificate {
  id: string;
  verificationCode: string;
  username: string | null;
  recipientName: string;
  recipientEmail: string;
  certificateType: CertificateType;
  title: string;
  programDetails: string;
  issuedDate: string;
  artworkUrl: string;
  status: CertificateStatus;
  templateId: string | null;
  templateName: string | null;
  /** Per-recipient override of the template's own text_positions -- null
   * means "use the template's default placement/size as-is". */
  textPositions: TemplateTextPositions | null;
  issuedByUsername: string | null;
  publishedByUsername: string | null;
  publishedAt: string | null;
  revokedByUsername: string | null;
  revokedAt: string | null;
  revocationReason: string;
  createdAt: string;
  updatedAt: string;
}

/** One recipient row in a batch-issue request -- either an existing member
 * (by username) or a plain name+email for someone with no account.
 * `textPositions`, when set, overrides the batch's template placement for
 * just this one recipient (only meaningful alongside a templateId). */
export type CertificateRecipientInput =
  | { username: string; textPositions?: TemplateTextPositions | null }
  | {
      recipientName: string;
      recipientEmail: string;
      textPositions?: TemplateTextPositions | null;
    };

export interface CertificateBatchInput {
  certificateType: CertificateType;
  title: string;
  programDetails?: string;
  issuedDate: string;
  recipients: CertificateRecipientInput[];
  /** An active CertificateTemplate to auto-generate artwork from. Omitted
   * entirely preserves the manual-upload flow byte-for-byte. */
  templateId?: string;
}

export interface CertificateEditInput {
  certificateType?: CertificateType;
  title?: string;
  programDetails?: string;
  issuedDate?: string;
  artworkUrl?: string;
  textPositions?: TemplateTextPositions | null;
}

/**
 * What a member sees on their own "/certificates" page -- deliberately the
 * public shape (no recipient email, no internal actor fields), since it's
 * the exact same data anyone with the verification code could already look
 * up publicly. Pending certificates never appear here; revoked ones do
 * (labeled, not downloadable) rather than silently disappearing.
 */
export interface MyCertificate {
  id: string;
  verificationCode: string;
  recipientName: string;
  certificateType: CertificateType;
  title: string;
  issuedDate: string;
  artworkUrl: string;
  status: CertificateStatus;
  publishedAt: string | null;
}

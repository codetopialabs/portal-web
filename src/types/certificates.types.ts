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
 * (by username) or a plain name+email for someone with no account. */
export type CertificateRecipientInput =
  | { username: string }
  | { recipientName: string; recipientEmail: string };

export interface CertificateBatchInput {
  certificateType: CertificateType;
  title: string;
  programDetails?: string;
  issuedDate: string;
  recipients: CertificateRecipientInput[];
}

export interface CertificateEditInput {
  certificateType?: CertificateType;
  title?: string;
  programDetails?: string;
  issuedDate?: string;
  artworkUrl?: string;
}

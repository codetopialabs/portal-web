export type CareerProgressionStatus = "pending" | "approved" | "rejected" | "revoked";

export interface CareerProgression {
  id: number;
  username: string;
  fullName: string;
  profilePictureUrl: string | null;
  title: string;
  team: string | null;
  teamName: string | null;
  startDate: string;
  endDate: string | null; // null = Present / ongoing
  description: string;
  status: CareerProgressionStatus;
  reviewNote: string;
  reviewedByUsername: string | null;
  reviewedAt: string | null;
  needsManualVerification: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CareerProgressionInput {
  title: string;
  teamId?: string | null;
  startDate: string;
  endDate?: string | null;
  description?: string;
}

// Minimal, member-safe shape — deliberately not the full Role type from
// roles.types.ts (no permissions, rank, or member count; that requires
// roles.view, an admin-only permission every member submitting a career
// progression entry does not and should not hold).
export interface EligibleRole {
  id: number;
  displayName: string;
  teamRequirement: "none" | "optional" | "required";
  teamRoleRequirement: "any" | "lead_or_owner";
}

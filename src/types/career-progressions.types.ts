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

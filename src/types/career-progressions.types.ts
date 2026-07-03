export type CareerProgressionStatus = "pending" | "approved" | "rejected";

export interface CareerProgression {
  id: number;
  username: string;
  fullName: string;
  profilePictureUrl: string | null;
  title: string;
  organization: string;
  startDate: string;
  endDate: string | null; // null = Present / ongoing
  description: string;
  status: CareerProgressionStatus;
  reviewNote: string;
  reviewedByUsername: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CareerProgressionInput {
  title: string;
  organization?: string;
  startDate: string;
  endDate?: string | null;
  description?: string;
}

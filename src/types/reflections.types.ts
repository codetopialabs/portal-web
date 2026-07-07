export type ReflectionStatus =
  | "not_started"
  | "submitted"
  | "under_review"
  | "approved"
  | "changes_requested";

// Kept for backward compat with snapshots of old reflections.
export type ReflectionQuestionType = "short_text" | "long_text" | "file";

// Snapshot lives inside a JSONField; the camelCase renderer rewrites its keys
// recursively, so the frontend receives camelCase here too.
export interface ReflectionQuestionSnapshot {
  id: string;
  prompt: string;
  helpText?: string;
  type?: ReflectionQuestionType;
  isRequired?: boolean;
  order?: number;
}

export interface ReflectionCycleInfo {
  id: string;
  period: string;
  opensOn: string;
  dueOn: string;
  questions: ReflectionQuestionSnapshot[];
}

export interface CurrentReflection {
  shouldPrompt: boolean;
  isOpen: boolean;
  status: ReflectionStatus;
  daysRemaining?: number;
  /** Per-question reviewer notes. Key "_legacy" holds pre-migration flat notes. */
  reviewerNotes?: Record<string, string>;
  answers?: Record<string, string>;
  attachments?: Record<string, string[]>;
  cycle: ReflectionCycleInfo | null;
}

export interface UpcomingCycleInfo {
  id: string;
  period: string;
  opensOn: string;
  dueOn: string;
  questionsConfirmed: boolean;
  questionsSnapshot: ReflectionQuestionSnapshot[];
}

export interface ReflectionRecord {
  id: string;
  userId: string;
  username: string;
  fullName: string;
  profilePictureUrl: string;
  period: string;
  questions: ReflectionQuestionSnapshot[];
  answers: Record<string, string>;
  attachments: Record<string, string[]>;
  status: ReflectionStatus;
  submittedAt: string | null;
  /** Per-question reviewer notes: { questionId: noteText }. Key "_legacy" holds pre-migration notes. */
  reviewerNotes: Record<string, string>;
  reviewedByEmail: string;
  reviewedByUsername: string;
  reviewedByFullName: string;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ReflectionQuestion {
  id: string;
  prompt: string;
  helpText: string;
  type: ReflectionQuestionType;
  order: number;
  isRequired: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReflectionQuestionInput {
  prompt: string;
  helpText?: string;
  type?: ReflectionQuestionType;
  order?: number;
  isRequired?: boolean;
  isActive?: boolean;
}

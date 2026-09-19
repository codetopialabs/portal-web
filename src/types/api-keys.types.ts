export interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  permissions: string[];
  isActive: boolean;
  isExpired: boolean;
  lastUsedAt: string | null;
  expiresAt: string | null;
  revokedAt: string | null;
  createdByEmail: string;
  createdAt: string;
  updatedAt: string;
}

/** Returned only once, immediately after creation. */
export interface CreatedApiKey extends ApiKey {
  key: string;
}

export interface CreateApiKeyInput {
  name: string;
  permissions: string[];
  expiresAt?: string | null;
}

/** Edit a live key in place. The secret does not change. */
export interface UpdateApiKeyInput {
  name?: string;
  permissions?: string[];
  expiresAt?: string | null;
}

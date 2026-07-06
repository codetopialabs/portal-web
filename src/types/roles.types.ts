export interface Role {
  id: number;
  name: string;
  displayName: string;
  description: string;
  rank: number;
  permissions: string[];
  isSystem: boolean;
  isPublic: boolean;
  memberCount: number;
}

export type RoleDetail = Role;

export interface CreateRoleInput {
  name: string;
  displayName: string;
  description?: string;
  rank: number;
  isPublic?: boolean;
  permissions: string[];
}

export interface UpdateRoleInput {
  displayName?: string;
  description?: string;
  rank?: number;
  isPublic?: boolean;
  permissions?: string[];
}

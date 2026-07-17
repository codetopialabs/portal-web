export type TeamRequirement = "none" | "optional" | "required";
export type TeamRoleRequirement = "any" | "lead_or_owner";

export interface Role {
  id: number;
  name: string;
  displayName: string;
  description: string;
  rank: number;
  permissions: string[];
  isSystem: boolean;
  isPublic: boolean;
  progressionEligible: boolean;
  teamRequirement: TeamRequirement;
  teamRoleRequirement: TeamRoleRequirement;
  requiresContribution: boolean;
  memberCount: number;
}

export type RoleDetail = Role;

export interface CreateRoleInput {
  name: string;
  displayName: string;
  description?: string;
  rank: number;
  isPublic?: boolean;
  progressionEligible?: boolean;
  teamRequirement?: TeamRequirement;
  teamRoleRequirement?: TeamRoleRequirement;
  requiresContribution?: boolean;
  permissions: string[];
}

export interface UpdateRoleInput {
  displayName?: string;
  description?: string;
  rank?: number;
  isPublic?: boolean;
  progressionEligible?: boolean;
  teamRequirement?: TeamRequirement;
  teamRoleRequirement?: TeamRoleRequirement;
  requiresContribution?: boolean;
  permissions?: string[];
}

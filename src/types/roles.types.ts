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
  /** The matching Discord role. Empty means the role lives on the portal only. */
  discordRoleId: string;
  /** Hex code such as "#f5c518", or empty for Discord's default. */
  color: string;
  /** Whether Vector keeps this role in step with Discord. */
  synced: boolean;
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
  discordRoleId?: string;
  color?: string;
  synced?: boolean;
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
  discordRoleId?: string;
  color?: string;
  synced?: boolean;
}

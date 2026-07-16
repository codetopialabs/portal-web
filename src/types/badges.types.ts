export type BadgeStatus = "draft" | "active" | "archived";
export type BadgeOperator = "eq" | "neq" | "gte" | "lte" | "before" | "after";

export interface BadgeCondition {
  id: string;
  type: "condition";
  field: string;
  operator: BadgeOperator;
  value: string | number | boolean;
}

export interface BadgeRuleGroup {
  id: string;
  type: "group";
  logic: "all" | "any";
  children: Array<BadgeCondition | BadgeRuleGroup>;
}

export interface Badge {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  status: BadgeStatus;
  criteria: BadgeRuleGroup;
  criteriaVersion: number;
  awardCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface BadgeAward {
  id: string;
  badge: Badge;
  source: "automatic" | "manual";
  reason: string;
  awardedAt: string;
  seenAt: string | null;
  featuredRank: number | null;
  isRevoked: boolean;
}

export interface CriteriaDefinition {
  key: string;
  label: string;
  category: string;
  valueType: "number" | "boolean" | "date" | "role" | "teamRole" | "team" | "badge";
  operators: BadgeOperator[];
}

export interface BadgeCriteriaCatalog {
  criteria: CriteriaDefinition[];
  roles: Array<{ name: string; displayName: string }>;
  teams: Array<{ slug: string; name: string }>;
  teamRoles: Array<{ value: string; label: string }>;
  badges: Array<{ slug: string; name: string }>;
}

export interface BadgeInput {
  name: string;
  description: string;
  imageUrl: string;
  status: BadgeStatus;
  criteria: BadgeRuleGroup;
}

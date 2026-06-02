import { formatRoleLabel } from "@/components/profile/utils";
import type { CommunityMember } from "@/services/user.service";

export type MemberFilter = string | "all";

export interface MemberFilters {
  role: MemberFilter;
  skill: string;
  experience: string;
}

export const EMPTY_FILTERS: MemberFilters = {
  role: "all",
  skill: "all",
  experience: "all",
};

export function formatJoinedAt(joinedAt: string) {
  const date = new Date(joinedAt);

  if (Number.isNaN(date.getTime())) {
    return "recently";
  }

  return new Intl.DateTimeFormat("en", { month: "short", year: "numeric" }).format(date);
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function getMemberFilterOptions(members: CommunityMember[]) {
  return {
    roles: getUniqueValues(
      members.flatMap((member) => {
        const roles = [...(member.communityRoles || [])];
        if (member.primaryRole) roles.push(member.primaryRole);
        if (roles.length === 0) roles.push("Member");
        return roles.map(formatRoleLabel);
      })
    ),
    skills: getUniqueValues(members.flatMap((member) => member.skills)),
    experienceLevels: getUniqueValues(members.map((member) => member.experienceLevel)),
  };
}

export function filterMembers(members: CommunityMember[], search: string, filters: MemberFilters) {
  const normalizedSearch = search.trim().toLowerCase();

  return members.filter((member) => {
    const allRoles = [...(member.communityRoles || [])];
    if (member.primaryRole) allRoles.push(member.primaryRole);
    if (allRoles.length === 0) allRoles.push("Member");
    const formattedRoles = allRoles.map(formatRoleLabel);

    const matchesRole = filters.role === "all" || formattedRoles.includes(filters.role);
    const matchesSkill = filters.skill === "all" || member.skills.includes(filters.skill);
    const matchesExperience =
      filters.experience === "all" || member.experienceLevel === filters.experience;

    if (!matchesRole || !matchesSkill || !matchesExperience) {
      return false;
    }

    if (!normalizedSearch) {
      return true;
    }

    return [
      member.fullName,
      member.username,
      ...formattedRoles,
      member.location,
      ...member.skills,
    ].some((value) => value && value.toLowerCase().includes(normalizedSearch));
  });
}

function getUniqueValues(values: string[]) {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b));
}

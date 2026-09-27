import {
  Activity,
  Award,
  BriefcaseBusiness,
  ClipboardCheck,
  Code2,
  GitFork,
  Globe,
  HeartPulse,
  Home,
  Key,
  Layers,
  LayoutDashboard,
  LayoutTemplate,
  Library,
  Mail,
  ScrollText,
  Settings,
  ShieldCheck,
  Trophy,
  UserCheck,
  Users,
  Users2,
  UsersRound,
} from "lucide-react";
import type { NavGroup } from "@/types/navigation";

const BASE_MENU_GROUPS: NavGroup[] = [
  {
    label: "Discover",
    items: [
      { icon: Home, label: "Dashboard", href: "/", activePrefix: "/" },
      { icon: Globe, label: "Community", href: "/community", activePrefix: "/community" },
    ],
  },
  {
    label: "My Space",
    items: [
      { icon: Users, label: "Teams", href: "/teams", activePrefix: "/teams" },
      {
        icon: ClipboardCheck,
        label: "Reflections",
        href: "/reflections",
        activePrefix: "/reflections",
      },
      { icon: Activity, label: "Activity", href: "/activity", activePrefix: "/activity" },
      { icon: Award, label: "Badges", href: "/badges", activePrefix: "/badges" },
      {
        icon: ScrollText,
        label: "Certificates",
        href: "/certificates",
        activePrefix: "/certificates",
      },
      {
        icon: UserCheck,
        label: "Mentorship",
        href: "/mentorship",
        activePrefix: "/mentorship",
        comingSoon: true,
      },
      {
        icon: Library,
        label: "Resources",
        href: "/resources",
        activePrefix: "/resources",
        comingSoon: true,
      },
    ],
  },
  {
    label: "Account",
    items: [{ icon: Settings, label: "Settings", href: "/settings", activePrefix: "/settings" }],
  },
];

// Community moderation/management â€” the day-to-day admin work.
const ADMIN_MENU_GROUP: NavGroup = {
  label: "Admin",
  items: [
    { icon: LayoutDashboard, label: "Overview", href: "/admin", activePrefix: "/admin" },
    { icon: Users, label: "Members", href: "/admin/members", activePrefix: "/admin/members" },
    { icon: Users2, label: "All Teams", href: "/admin/teams", activePrefix: "/admin/teams" },
    {
      icon: Layers,
      label: "Departments",
      href: "/admin/departments",
      activePrefix: "/admin/departments",
    },
    { icon: ShieldCheck, label: "Roles", href: "/admin/roles", activePrefix: "/admin/roles" },
    { icon: Award, label: "Badges", href: "/admin/badges", activePrefix: "/admin/badges" },
    {
      icon: ClipboardCheck,
      label: "Reflections",
      href: "/admin/reflections",
      activePrefix: "/admin/reflections",
    },
    {
      icon: BriefcaseBusiness,
      label: "Career Progressions",
      href: "/admin/career-progressions",
      activePrefix: "/admin/career-progressions",
    },
    {
      icon: Trophy,
      label: "Wall of Impact",
      href: "/admin/recognitions",
      activePrefix: "/admin/recognitions",
    },
    {
      icon: ScrollText,
      label: "Certificates",
      href: "/admin/certificates",
      activePrefix: "/admin/certificates",
    },
    {
      icon: LayoutTemplate,
      label: "Certificate Templates",
      href: "/admin/certificate-templates",
      activePrefix: "/admin/certificate-templates",
    },
    { icon: Mail, label: "Emails", href: "/admin/emails", activePrefix: "/admin/emails" },
  ],
};

// Platform/system configuration â€” one-time setup, not ongoing moderation.
const INTEGRATIONS_MENU_GROUP: NavGroup = {
  label: "Integrations",
  items: [
    { icon: Key, label: "API Keys", href: "/admin/api-keys", activePrefix: "/admin/api-keys" },
    {
      icon: Code2,
      label: "OAuth Apps",
      href: "/admin/oauth-apps",
      activePrefix: "/admin/oauth-apps",
    },
    {
      icon: GitFork,
      label: "GitHub Repos",
      href: "/admin/github-repos",
      activePrefix: "/admin/github-repos",
    },
  ],
};

const MY_TEAM_ITEM = {
  icon: UsersRound,
  label: "My Team",
  href: "/my-team",
  activePrefix: "/my-team",
};

const CONTRIBUTIONS_ITEM = {
  icon: ClipboardCheck,
  label: "Contributions",
  href: "/contributions",
  activePrefix: "/contributions",
};

const TEAM_HEALTH_ITEM = {
  icon: HeartPulse,
  label: "Team Health",
  href: "/admin/team-health",
  activePrefix: "/admin/team-health",
};

export interface DashboardMenuOptions {
  /** TEAMS_V2_ENABLED, from useFeature("teamsV2"). */
  teamsV2?: boolean;
  /** The user leads or deputises at least one community team. */
  isTeamLead?: boolean;
  /** The user holds community_teams.health. */
  canViewTeamHealth?: boolean;
}

export function getDashboardMenuGroups(
  canAccessAdmin: boolean,
  options: DashboardMenuOptions = {}
): NavGroup[] {
  const groups = canAccessAdmin
    ? [...BASE_MENU_GROUPS, ADMIN_MENU_GROUP, INTEGRATIONS_MENU_GROUP]
    : BASE_MENU_GROUPS;
  if (!options.teamsV2) return groups;
  // Teams v2: the six community teams are "Teams". The older squad-style
  // teams under /teams are hidden from the sidebar (their pages stay
  // reachable by URL and their data is untouched) so the sidebar has one
  // meaning of "team". Revisit in December. Leads get My Team; Team Health
  // joins the admin group for those who may see it.
  return groups.map((group) => {
    let items = group.items
      .filter((item) => item.href !== "/teams" && item.href !== "/admin/teams")
      .map((item) => (item.href === "/admin/departments" ? { ...item, label: "Teams" } : item));
    if (group.label === "My Space") {
      items = options.isTeamLead
        ? [MY_TEAM_ITEM, CONTRIBUTIONS_ITEM, ...items]
        : [CONTRIBUTIONS_ITEM, ...items];
    }
    if (group.label === "Admin" && options.canViewTeamHealth) {
      const at = items.findIndex((item) => item.href === "/admin/departments");
      items.splice(at === -1 ? items.length : at + 1, 0, TEAM_HEALTH_ITEM);
    }
    return { ...group, items };
  });
}

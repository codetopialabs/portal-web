import {
  Activity,
  Award,
  BriefcaseBusiness,
  ClipboardCheck,
  Code2,
  GitFork,
  Globe,
  Home,
  Key,
  LayoutDashboard,
  Library,
  Mail,
  ScrollText,
  Settings,
  ShieldCheck,
  Trophy,
  UserCheck,
  Users,
  Users2,
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

export function getDashboardMenuGroups(canAccessAdmin: boolean): NavGroup[] {
  return canAccessAdmin
    ? [...BASE_MENU_GROUPS, ADMIN_MENU_GROUP, INTEGRATIONS_MENU_GROUP]
    : BASE_MENU_GROUPS;
}

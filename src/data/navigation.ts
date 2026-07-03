import {
  Activity,
  ClipboardCheck,
  Code2,
  Globe,
  Home,
  Key,
  LayoutDashboard,
  Library,
  Settings,
  ShieldCheck,
  UserCheck,
  Users,
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

const ADMIN_MENU_GROUP: NavGroup = {
  label: "Admin",
  items: [
    { icon: LayoutDashboard, label: "Overview", href: "/admin", activePrefix: "/admin" },
    { icon: Users, label: "Members", href: "/admin/members", activePrefix: "/admin/members" },
    { icon: ShieldCheck, label: "Roles", href: "/admin/roles", activePrefix: "/admin/roles" },
    {
      icon: ClipboardCheck,
      label: "Reflections",
      href: "/admin/reflections",
      activePrefix: "/admin/reflections",
    },
    { icon: Key, label: "API Keys", href: "/admin/api-keys", activePrefix: "/admin/api-keys" },
    {
      icon: Code2,
      label: "OAuth Apps",
      href: "/admin/oauth-apps",
      activePrefix: "/admin/oauth-apps",
    },
  ],
};

export function getDashboardMenuGroups(canAccessAdmin: boolean): NavGroup[] {
  return canAccessAdmin ? [...BASE_MENU_GROUPS, ADMIN_MENU_GROUP] : BASE_MENU_GROUPS;
}

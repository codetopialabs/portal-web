import { Globe, Home, Library, Settings, ShieldCheck, Users } from "lucide-react";
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
      { icon: Users, label: "Mentorship", href: "/mentorship", activePrefix: "/mentorship" },
      { icon: Library, label: "Resources", href: "/resources", activePrefix: "/resources" },
    ],
  },
  {
    label: "Account",
    items: [{ icon: Settings, label: "Settings", href: "/settings", activePrefix: "/settings" }],
  },
];

const ADMIN_MENU_GROUP: NavGroup = {
  label: "Panels",
  items: [
    {
      icon: ShieldCheck,
      label: "Admin Panel",
      href: "/admin",
      activePrefix: "/admin",
    },
  ],
};

export function getDashboardMenuGroups(canAccessAdmin: boolean): NavGroup[] {
  return canAccessAdmin ? [...BASE_MENU_GROUPS, ADMIN_MENU_GROUP] : BASE_MENU_GROUPS;
}

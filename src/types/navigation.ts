import type { ElementType } from "react";

export interface NavItem {
  icon: ElementType;
  label: string;
  href: string;
  activePrefix: string;
  /** Feature isn't built yet — the page it links to is a placeholder. */
  comingSoon?: boolean;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

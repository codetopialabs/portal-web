import type { ElementType } from "react";

export interface NavItem {
  icon: ElementType;
  label: string;
  href: string;
  activePrefix: string;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

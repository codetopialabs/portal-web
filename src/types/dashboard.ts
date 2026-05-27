import type { ElementType } from "react";

export interface StrengthItem {
  key: string;
  label: string;
  weight: number;
  fulfilled: boolean;
  href: string;
  hint: string;
}

export interface DashboardModule {
  title: string;
  subtitle: string;
  status: string;
  description: string;
  icon: ElementType;
  href: string;
  accent: string;
}

export interface DashboardAction {
  id?: string;
  title: string;
  description: string;
  href: string;
  icon: ElementType;
}

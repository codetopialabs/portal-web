import {
  Activity,
  BookOpen,
  Briefcase,
  ImageIcon,
  Library,
  Link2,
  MapPin,
  Pencil,
  ShieldCheck,
  Tag,
  Target,
  UserRoundCheck,
  Users,
} from "lucide-react";
import type { DashboardAction, DashboardModule, StrengthItem } from "@/types/dashboard";

export const DASHBOARD_ITEM_ICONS: Record<StrengthItem["key"], React.ElementType> = {
  avatar: UserRoundCheck,
  bio: BookOpen,
  currentRole: Briefcase,
  skills: Tag,
  location: MapPin,
  cover: ImageIcon,
  social: Link2,
  goal: Target,
};

export const DASHBOARD_MODULES: DashboardModule[] = [
  {
    title: "Mentorship",
    subtitle: "Guidance and goals",
    status: "Season setup",
    description: "Track mentor matching, session notes, goals, and shared resources.",
    icon: Users,
    href: "/mentorship",
    accent: "border-sky-200 bg-sky-50 text-sky-700",
  },
  {
    title: "Resources",
    subtitle: "Library and references",
    status: "Curating",
    description: "Keep guides, videos, templates, and program-linked materials together.",
    icon: Library,
    href: "/resources",
    accent: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
];

export const DASHBOARD_NEXT_ACTIONS: DashboardAction[] = [
  {
    title: "Tune your public profile",
    description: "Keep your profile sharp for mentors and collaborators.",
    href: "/settings/profile",
    icon: Pencil,
  },
  {
    id: "action-security",
    title: "Review account security",
    description: "Check active sessions and recent account access.",
    href: "/settings/security",
    icon: ShieldCheck,
  },
  {
    title: "Browse the community",
    description: "Find members by role, skills, and profile context.",
    href: "/community",
    icon: Users,
  },
  {
    title: "Open activity log",
    description: "Audit recent changes, sign-ins, and session events.",
    href: "/activity",
    icon: Activity,
  },
];

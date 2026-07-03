import { Globe } from "lucide-react";
import type { ComponentType, CSSProperties } from "react";
import {
  FaBehance,
  FaCodepen,
  FaDribbble,
  FaFacebook,
  FaGitlab,
  FaInstagram,
  FaMedium,
  FaStackOverflow,
  FaTelegram,
  FaTiktok,
  FaWhatsapp,
} from "react-icons/fa6";

export interface LinkPlatform {
  value: string;
  label: string;
  icon: ComponentType<{ className?: string; style?: CSSProperties }>;
  color: string;
  placeholder: string;
  /** Canonical "https://domain/path-segment" used to resolve a bare handle into a full URL. Absent for "custom". */
  prefix?: string;
}

export const LINK_PLATFORMS: LinkPlatform[] = [
  {
    value: "gitlab",
    label: "GitLab",
    icon: FaGitlab,
    color: "#FC6D26",
    placeholder: "gitlab.com/username",
    prefix: "https://gitlab.com/",
  },
  {
    value: "stackoverflow",
    label: "Stack Overflow",
    icon: FaStackOverflow,
    color: "#F58025",
    placeholder: "stackoverflow.com/users/...",
    prefix: "https://stackoverflow.com/users/",
  },
  {
    value: "codepen",
    label: "CodePen",
    icon: FaCodepen,
    color: "#000000",
    placeholder: "codepen.io/username",
    prefix: "https://codepen.io/",
  },
  {
    value: "dribbble",
    label: "Dribbble",
    icon: FaDribbble,
    color: "#EA4C89",
    placeholder: "dribbble.com/username",
    prefix: "https://dribbble.com/",
  },
  {
    value: "behance",
    label: "Behance",
    icon: FaBehance,
    color: "#1769FF",
    placeholder: "behance.net/username",
    prefix: "https://behance.net/",
  },
  {
    value: "instagram",
    label: "Instagram",
    icon: FaInstagram,
    color: "#E1306C",
    placeholder: "instagram.com/username",
    prefix: "https://instagram.com/",
  },
  {
    value: "facebook",
    label: "Facebook",
    icon: FaFacebook,
    color: "#1877F2",
    placeholder: "facebook.com/username",
    prefix: "https://facebook.com/",
  },
  {
    value: "tiktok",
    label: "TikTok",
    icon: FaTiktok,
    color: "#000000",
    placeholder: "tiktok.com/@username",
    prefix: "https://tiktok.com/@",
  },
  {
    value: "telegram",
    label: "Telegram",
    icon: FaTelegram,
    color: "#26A5E4",
    placeholder: "t.me/username",
    prefix: "https://t.me/",
  },
  {
    value: "whatsapp",
    label: "WhatsApp",
    icon: FaWhatsapp,
    color: "#25D366",
    placeholder: "wa.me/number",
    prefix: "https://wa.me/",
  },
  {
    value: "medium",
    label: "Medium",
    icon: FaMedium,
    color: "#000000",
    placeholder: "medium.com/@username",
    prefix: "https://medium.com/@",
  },
  { value: "custom", label: "Custom", icon: Globe, color: "#71717A", placeholder: "https://..." },
];

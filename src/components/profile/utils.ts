export const roleBadgeColors: Record<string, string> = {
  Mentor: "bg-orange-50/50 text-orange-500 border-orange-200",
  Member: "bg-zinc-50/50 text-zinc-400 border-zinc-200",
  Volunteer: "bg-emerald-50/50 text-emerald-500 border-emerald-200",
  "Core Team": "bg-zinc-900 text-white border-zinc-900",
  Admin: "bg-zinc-900 text-white border-zinc-900",
  "Super Admin": "bg-zinc-900 text-white border-zinc-900",
};

export function formatJoinedAt(dateStr?: string | null) {
  if (!dateStr) return "Unknown";
  try {
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return "Unknown";
    return new Intl.DateTimeFormat("en", { month: "short", year: "numeric" }).format(date);
  } catch {
    return "Unknown";
  }
}

export function formatRoleLabel(roleStr: string) {
  return roleStr.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

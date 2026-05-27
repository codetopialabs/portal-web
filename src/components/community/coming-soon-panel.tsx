import { BookOpen, CalendarClock, FolderGit2, GraduationCap, type LucideIcon } from "lucide-react";

interface ComingSoonPanelProps {
  title: string;
  description: string;
  type?: "events" | "projects" | "mentorship" | "resources";
  statusText?: string;
}

const ICONS: Record<NonNullable<ComingSoonPanelProps["type"]>, LucideIcon> = {
  events: CalendarClock,
  projects: FolderGit2,
  mentorship: GraduationCap,
  resources: BookOpen,
};

export function ComingSoonPanel({
  title,
  description,
  type = "events",
  statusText,
}: ComingSoonPanelProps) {
  const Icon = ICONS[type];

  const displayStatus =
    statusText ||
    `This section will show real community content once it is connected. No placeholder ${type} are being displayed.`;

  return (
    <div className="border border-zinc-200 bg-white">
      <div className="grid gap-0 lg:grid-cols-[18rem_1fr]">
        <div className="border-b border-zinc-200 bg-zinc-950 p-6 text-white lg:border-r lg:border-b-0">
          <div className="flex h-11 w-11 items-center justify-center border border-white/15 bg-white/10">
            <Icon className="h-5 w-5" />
          </div>
          <p className="mt-8 font-mono text-[10px] font-black uppercase tracking-[0.24em] text-zinc-400">
            Not available yet
          </p>
          <h2 className="mt-2 font-sans text-2xl font-black uppercase tracking-tight text-white">
            {title}
          </h2>
        </div>

        <div className="flex min-h-[16rem] flex-col justify-center p-6">
          <p className="max-w-2xl font-mono text-sm leading-6 text-zinc-500">{description}</p>
          <div className="mt-6 border border-zinc-200 bg-zinc-50 p-4">
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
              Current status
            </p>
            <p className="mt-2 font-mono text-sm leading-6 text-zinc-600">{displayStatus}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

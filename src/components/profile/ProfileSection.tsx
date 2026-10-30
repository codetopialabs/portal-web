import type { ReactNode } from "react";

// The public profile is one narrow column inside a dark panel. A section is
// a heading and its content, separated by space, with no lines or boxes.
export function ProfileSection({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="mt-12 first:mt-0 sm:mt-20">
      <div className="mb-8 flex items-center justify-between gap-4">
        <h2 className="font-sans text-2xl font-semibold tracking-tight text-zinc-950 dark:text-white">
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

// A CV-style row: the date in a narrow left column, the entry on the right,
// so dates line up down the page. On phones the date sits above the entry.
export function ProfileRow({ date, children }: { date: string; children: ReactNode }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[120px_1fr] sm:gap-6">
      <p className="pt-px font-mono text-sm tabular-nums text-zinc-500">{date}</p>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

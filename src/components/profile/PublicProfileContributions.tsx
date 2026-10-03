"use client";

import { ClipboardCheck, ExternalLink } from "lucide-react";
import { formatDoneOn } from "@/components/community-teams/ContributionCard";
import { useMemberContributions } from "@/hooks/useCommunityTeams";

// Teams v2: approved contributions on a public profile. Proof of work, in
// the member's words, with the link. Rendered only when there is something
// to show, like the Recognition section.

export function PublicProfileContributions({ username }: { username: string }) {
  const { data: contributions } = useMemberContributions(username);
  if (!contributions || contributions.length === 0) return null;

  return (
    <div className="border border-zinc-200 bg-white">
      <div className="flex items-center justify-between gap-3 border-b border-zinc-100 px-6 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center bg-zinc-950 text-white">
            <ClipboardCheck className="h-3.5 w-3.5" />
          </div>
          <h2 className="font-sans text-lg font-bold text-zinc-900">Contributions</h2>
        </div>
        <span className="font-mono text-[11px] text-zinc-400">{contributions.length} approved</span>
      </div>
      <div className="divide-y divide-zinc-100">
        {contributions.map((c) => (
          <a
            key={c.id}
            href={c.link}
            target="_blank"
            rel="noreferrer"
            className="group block p-6 transition-colors hover:bg-zinc-50"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <h3 className="font-sans text-base font-bold leading-snug text-zinc-950 group-hover:underline">
                {c.title}
              </h3>
              <span className="font-mono text-[11px] text-zinc-400">{formatDoneOn(c.doneOn)}</span>
            </div>
            <p className="mt-0.5 font-mono text-xs font-bold text-zinc-600">{c.team.name}</p>
            <p className="mt-2.5 font-sans text-sm leading-6 text-zinc-500">{c.description}</p>
            <span className="mt-3 inline-flex items-center gap-1.5 font-mono text-[11px] text-zinc-400 group-hover:text-zinc-900">
              <ExternalLink className="h-3 w-3" />
              Open the work
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}

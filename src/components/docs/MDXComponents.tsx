import { ArrowRight, Copy } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

type WithChildren = {
  children?: ReactNode;
};

type HeadingProps = WithChildren & {
  id?: string;
};

type CodeProps = WithChildren & {
  className?: string;
};

type LinkProps = WithChildren & {
  href: string;
};

const H1 = ({ children }: WithChildren) => (
  <h1 className="mt-12 mb-5 font-[var(--font-space-grotesk)] text-3xl font-bold tracking-[-0.03em] text-neutral-950">
    {children}
  </h1>
);

const H2 = ({ children, id }: HeadingProps) => (
  <h2
    id={id}
    className="group mt-14 mb-4 flex items-center gap-2 border-t border-neutral-200 pt-8 font-[var(--font-space-grotesk)] text-2xl font-bold tracking-[-0.025em] text-neutral-950"
  >
    {children}
    {id && (
      <a
        href={`#${id}`}
        className="text-neutral-300 opacity-0 transition-opacity hover:text-neutral-950 group-hover:opacity-100"
        aria-label="Link to section"
      >
        #
      </a>
    )}
  </h2>
);

const H3 = ({ children, id }: HeadingProps) => (
  <h3
    id={id}
    className="mt-8 mb-3 font-[var(--font-space-grotesk)] text-lg font-bold tracking-[-0.015em] text-neutral-900"
  >
    {children}
  </h3>
);

const P = ({ children }: WithChildren) => (
  <p className="mb-5 text-[15px] leading-7 text-neutral-650 [color:#4b5563]">{children}</p>
);

const UL = ({ children }: WithChildren) => <ul className="mb-7 space-y-2.5">{children}</ul>;

const LI = ({ children }: WithChildren) => (
  <li className="flex items-start gap-3 text-[15px] leading-7 text-neutral-700">
    <span className="mt-3 h-1.5 w-1.5 shrink-0 bg-neutral-950" />
    <span className="min-w-0">{children}</span>
  </li>
);

const OL = ({ children }: WithChildren) => (
  <ol className="mb-7 list-decimal space-y-2.5 pl-5 text-[15px] leading-7 text-neutral-700">
    {children}
  </ol>
);

const Code = ({ children, className }: CodeProps) => {
  const isInline = !className;
  if (isInline) {
    return (
      <code className="border border-neutral-200 bg-white px-1.5 py-0.5 font-mono text-[13px] font-semibold text-neutral-950 shadow-sm">
        {children}
      </code>
    );
  }
  return (
    <div className="group relative mb-8 overflow-hidden border border-neutral-800 bg-neutral-950 shadow-[0_24px_70px_rgba(15,15,15,0.18)]">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 bg-[#ff6b6b]" />
          <span className="h-2.5 w-2.5 bg-[#ffd166]" />
          <span className="h-2.5 w-2.5 bg-[#06d6a0]" />
        </div>
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center border border-white/10 bg-white/[0.04] text-white/45 transition-colors hover:border-white/30 hover:text-white"
        >
          <Copy className="h-3.5 w-3.5" />
          <span className="sr-only">Copy code</span>
        </button>
      </div>
      <pre className="overflow-x-auto p-5 font-mono text-[13px] leading-7 text-neutral-100">
        <code className={className}>{children}</code>
      </pre>
    </div>
  );
};

const Table = ({ children }: WithChildren) => (
  <div className="mb-9 overflow-hidden border border-neutral-200 bg-white shadow-sm">
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse text-left">{children}</table>
    </div>
  </div>
);

const THead = ({ children }: WithChildren) => (
  <thead className="border-b border-neutral-200 bg-neutral-950 text-white">{children}</thead>
);

const TH = ({ children }: WithChildren) => (
  <th className="px-4 py-3 text-xs font-bold uppercase tracking-[0.14em] text-white/65">
    {children}
  </th>
);

const TD = ({ children }: WithChildren) => (
  <td className="border-b border-neutral-100 px-4 py-3.5 text-sm leading-6 text-neutral-700">
    {children}
  </td>
);

const A = ({ href, children }: LinkProps) => {
  const isExternal = href?.startsWith("http");
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 font-semibold text-neutral-950 underline decoration-[#d4f23d] decoration-2 underline-offset-4 transition-all hover:bg-[#e8ff5f]"
      target={isExternal ? "_blank" : undefined}
    >
      {children}
      {!isExternal && <ArrowRight className="w-3 h-3 opacity-50" />}
    </Link>
  );
};

const Blockquote = ({ children }: WithChildren) => (
  <div className="mb-8 border-l-4 border-neutral-950 bg-white p-5 shadow-sm">
    <div className="text-[15px] leading-7 text-neutral-700">{children}</div>
  </div>
);

const Strong = ({ children }: WithChildren) => (
  <strong className="font-bold text-neutral-950">{children}</strong>
);

export const MDXComponents = {
  h1: H1,
  h2: H2,
  h3: H3,
  p: P,
  ul: UL,
  ol: OL,
  li: LI,
  code: Code,
  table: Table,
  thead: THead,
  th: TH,
  td: TD,
  a: A,
  blockquote: Blockquote,
  strong: Strong,
};

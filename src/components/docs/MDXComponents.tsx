import React from "react";
import Link from "next/link";
import { ArrowRight, Copy, Check } from "lucide-react";

const H1 = ({ children }: any) => (
  <h1 className="text-3xl font-sans font-black uppercase tracking-tighter text-zinc-900 mt-10 mb-6">
    {children}
  </h1>
);

const H2 = ({ children, id }: any) => (
  <h2 id={id} className="text-xl font-sans font-black uppercase tracking-tight text-zinc-800 mt-12 mb-4 group flex items-center gap-2">
    {children}
    <a href={`#${id}`} className="opacity-0 group-hover:opacity-100 text-zinc-300 hover:text-zinc-500 transition-opacity">#</a>
  </h2>
);

const H3 = ({ children, id }: any) => (
  <h3 id={id} className="text-base font-mono font-bold text-zinc-900 mt-8 mb-3 uppercase tracking-widest">
    {children}
  </h3>
);

const P = ({ children }: any) => (
  <p className="font-mono text-sm text-zinc-600 leading-relaxed mb-4">
    {children}
  </p>
);

const UL = ({ children }: any) => (
  <ul className="space-y-2 mb-6 ml-4">
    {children}
  </ul>
);

const LI = ({ children }: any) => (
  <li className="font-mono text-sm text-zinc-600 flex items-start gap-3">
    <span className="w-1.5 h-1.5 bg-zinc-900 mt-1.5 shrink-0" />
    <span>{children}</span>
  </li>
);

const Code = ({ children, className }: any) => {
  const isInline = !className;
  if (isInline) {
    return (
      <code className="bg-zinc-100 text-zinc-900 px-1 py-0.5 font-mono text-[13px] border border-zinc-200">
        {children}
      </code>
    );
  }
  return (
    <div className="relative group mb-6">
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <button className="p-1.5 bg-white border border-zinc-200 hover:border-zinc-900 transition-colors">
          <Copy className="w-3.5 h-3.5 text-zinc-400" />
        </button>
      </div>
      <pre className="bg-zinc-950 text-zinc-50 p-6 overflow-x-auto border-l-4 border-zinc-500 font-mono text-[13px] leading-relaxed">
        <code className={className}>{children}</code>
      </pre>
    </div>
  );
};

const Table = ({ children }: any) => (
  <div className="overflow-x-auto mb-8 border border-zinc-200 bg-white">
    <table className="w-full text-left border-collapse">
      {children}
    </table>
  </div>
);

const THead = ({ children }: any) => (
  <thead className="bg-zinc-50 border-b border-zinc-200">
    {children}
  </thead>
);

const TH = ({ children }: any) => (
  <th className="px-4 py-3 font-mono text-xs font-bold uppercase tracking-widest text-zinc-500">
    {children}
  </th>
);

const TD = ({ children }: any) => (
  <td className="px-4 py-3 font-mono text-sm text-zinc-600 border-b border-zinc-50">
    {children}
  </td>
);

const A = ({ href, children }: any) => {
  const isExternal = href?.startsWith("http");
  return (
    <Link
      href={href}
      className="text-zinc-900 font-bold underline decoration-zinc-200 underline-offset-4 hover:decoration-zinc-900 transition-all inline-flex items-center gap-1"
      target={isExternal ? "_blank" : undefined}
    >
      {children}
      {!isExternal && <ArrowRight className="w-3 h-3 opacity-50" />}
    </Link>
  );
};

const Blockquote = ({ children }: any) => (
  <div className="border-l-4 border-zinc-900 bg-zinc-50 p-5 mb-6">
    <div className="font-mono text-sm text-zinc-600 italic">
      {children}
    </div>
  </div>
);

export const MDXComponents = {
  h1: H1,
  h2: H2,
  h3: H3,
  p: P,
  ul: UL,
  li: LI,
  code: Code,
  table: Table,
  thead: THead,
  th: TH,
  td: TD,
  a: A,
  blockquote: Blockquote,
};

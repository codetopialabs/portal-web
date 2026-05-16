import React from "react";
import Link from "next/link";
import { getNavTree } from "@/lib/docs";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { Book, Search, Terminal } from "lucide-react";

export default async function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navTree = await getNavTree();

  return (
    <RouteGuard permission="docs.view">
      <div className="flex min-h-screen bg-white">
      {/* sidebar */}
      <aside className="w-72 border-r border-zinc-100 hidden lg:flex flex-col sticky top-0 h-screen">
        <div className="p-6 border-b border-zinc-100 flex items-center gap-3">
          <div className="w-8 h-8 bg-black text-white flex items-center justify-center">
            <Book className="w-4 h-4" />
          </div>
          <div>
            <p className="font-sans font-black uppercase tracking-tighter text-sm leading-none">Identity</p>
            <p className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest mt-1">Documentation</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Search docs..."
              className="w-full h-9 bg-zinc-50 border border-zinc-100 pl-9 pr-3 font-mono text-xs focus:outline-none focus:border-zinc-900 transition-colors"
            />
          </div>

          {navTree.map((category) => (
            <div key={category.title} className="space-y-3">
              <h3 className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400">
                {category.title}
              </h3>
              <ul className="space-y-1">
                {category.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="group flex items-center gap-2 font-mono text-xs text-zinc-600 hover:text-zinc-900 transition-colors py-1.5"
                    >
                      <span className="w-1 h-1 bg-transparent group-hover:bg-zinc-900 transition-colors" />
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="p-6 border-t border-zinc-100 bg-zinc-50/50">
          <Link
            href="/"
            className="flex items-center gap-3 font-mono text-xs text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            <Terminal className="w-3.5 h-3.5" />
            Return to Dashboard
          </Link>
        </div>
      </aside>

      {/* main content */}
      <main className="flex-1 min-w-0">
        <div className="max-w-4xl mx-auto px-6 py-12 lg:px-20 lg:py-20">
          {children}
        </div>
      </main>

      {/* toc / table of contents - can be added later */}
    </div>
    </RouteGuard>
  );
}

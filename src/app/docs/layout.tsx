import { ArrowUpRight, BookOpen, FileText, Home, Search, Sparkles } from "lucide-react";
import Link from "next/link";
import type React from "react";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { getNavTree } from "@/lib/docs";

export default async function DocsLayout({ children }: { children: React.ReactNode }) {
  const navTree = await getNavTree();

  return (
    <RouteGuard permission="docs.view">
      <div className="min-h-screen bg-white font-[var(--font-inter)] text-neutral-950">
        <header className="sticky top-0 z-40 border-b border-neutral-200/80 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
          <div className="flex items-center justify-between gap-4">
            <Link href="/docs" className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center bg-neutral-950 text-white">
                <BookOpen className="h-4 w-4" />
              </span>
              <span>
                <span className="block font-[var(--font-space-grotesk)] text-sm font-bold leading-none">
                  Identity Docs
                </span>
                <span className="mt-1 block text-[11px] font-medium text-neutral-500">
                  Codetopia Community
                </span>
              </span>
            </Link>
            <Link
              href="/"
              className="flex h-9 w-9 items-center justify-center border border-neutral-300 bg-white text-neutral-700"
              aria-label="Return to dashboard"
            >
              <Home className="h-4 w-4" />
            </Link>
          </div>
          <nav className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
            {navTree.map((category) => (
              <a
                key={category.title}
                href={`#docs-${category.title.toLowerCase().replaceAll(" ", "-")}`}
                className="shrink-0 border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-600"
              >
                {category.title}
              </a>
            ))}
          </nav>
        </header>

        <div className="mx-auto flex min-h-screen w-full max-w-[1680px]">
          <aside className="sticky top-0 hidden h-screen w-80 shrink-0 flex-col overflow-hidden bg-neutral-950 text-white lg:flex">
            <div className="border-b border-white/10 p-7">
              <Link href="/docs" className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center bg-white text-neutral-950">
                  <BookOpen className="h-5 w-5" />
                </span>
                <span>
                  <span className="block font-[var(--font-space-grotesk)] text-base font-bold leading-none">
                    Identity
                  </span>
                  <span className="mt-1.5 block text-xs font-medium text-white/45">
                    Documentation
                  </span>
                </span>
              </Link>
            </div>

            <div className="border-b border-white/10 p-5">
              <label className="relative block">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                <input
                  type="text"
                  placeholder="Search documentation"
                  className="h-11 w-full border border-white/10 bg-white/[0.06] pl-10 pr-3 text-sm text-white placeholder:text-white/35 outline-none transition-colors focus:border-white/35"
                />
              </label>
            </div>

            <div className="no-scrollbar flex-1 overflow-y-auto px-5 py-6">
              <div className="mb-6 border border-white/10 bg-white/[0.04] p-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white/45">
                  <Sparkles className="h-3.5 w-3.5" />
                  Portal Guide
                </div>
                <p className="text-sm leading-6 text-white/70">
                  Permissions, roles, member lifecycle, API conventions, and operational notes for
                  the community identity portal.
                </p>
              </div>

              <nav className="space-y-7" aria-label="Documentation">
                {navTree.map((category) => (
                  <section
                    key={category.title}
                    id={`docs-${category.title.toLowerCase().replaceAll(" ", "-")}`}
                    className="scroll-mt-28"
                  >
                    <h2 className="mb-2 px-2 text-xs font-bold text-white/35">{category.title}</h2>
                    <ul className="space-y-1">
                      {category.items.map((item) => (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            className="group flex items-center gap-3 px-2 py-2.5 text-sm font-medium text-white/68 transition-colors hover:bg-white/[0.06] hover:text-white"
                          >
                            <FileText className="h-4 w-4 shrink-0 text-white/28 transition-colors group-hover:text-white/70" />
                            <span className="leading-5">{item.title}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </nav>
            </div>

            <div className="border-t border-white/10 p-5">
              <Link
                href="/"
                className="group flex items-center justify-between bg-white px-4 py-3 text-sm font-bold text-neutral-950 transition-colors hover:bg-[#e8ff5f]"
              >
                <span className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Dashboard
                </span>
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            </div>
          </aside>

          <main className="min-w-0 flex-1">
            <div className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-8 md:py-14 lg:px-14 lg:py-16 xl:px-20">
              {children}
            </div>
          </main>
        </div>
      </div>
    </RouteGuard>
  );
}

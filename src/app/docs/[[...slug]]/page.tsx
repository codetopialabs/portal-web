import { ArrowUpRight } from "lucide-react";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import React from "react";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { MDXComponents } from "@/components/docs/MDXComponents";
import { getDocBySlug } from "@/lib/docs";

interface DocPageProps {
  params: Promise<{
    slug?: string[];
  }>;
}

export default async function DocPage({ params }: DocPageProps) {
  const { slug } = await params;
  const actualSlug = slug || ["permissions", "overview"]; // Default page

  const doc = await getDocBySlug(actualSlug);

  if (!doc) {
    notFound();
  }

  return (
    <article className="max-w-none">
      <div className="mb-10 border-b border-neutral-200 pb-10 md:mb-14 md:pb-12">
        <div className="mb-5 flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-neutral-400">
          <span>Docs</span>
          {actualSlug.map((s) => (
            <React.Fragment key={s}>
              <span className="text-neutral-300">/</span>
              <span className="text-neutral-500">{s.replaceAll("-", " ")}</span>
            </React.Fragment>
          ))}
        </div>
        <h1 className="max-w-4xl font-[var(--font-space-grotesk)] text-5xl font-bold leading-[0.95] tracking-[-0.06em] text-neutral-950 sm:text-6xl lg:text-7xl">
          {doc.metadata.title}
        </h1>
        {doc.metadata.description && (
          <p className="mt-6 max-w-2xl text-lg leading-8 text-neutral-600">
            {doc.metadata.description}
          </p>
        )}
      </div>

      <MDXRemote
        source={doc.content}
        components={MDXComponents}
        options={{
          mdxOptions: {
            remarkPlugins: [remarkGfm],
            rehypePlugins: [
              rehypeHighlight,
              rehypeSlug,
              [rehypeAutolinkHeadings, { behavior: "append" }],
            ],
          },
        }}
      />

      <footer className="mt-20 flex flex-col gap-4 border-t border-neutral-200 pt-8 text-sm text-neutral-500 sm:flex-row sm:items-center sm:justify-between">
        <p>
          Last updated:{" "}
          <span className="font-semibold text-neutral-800">
            {doc.metadata.date || new Date().toLocaleDateString()}
          </span>
        </p>
        <a
          href={`https://github.com/codetopia/identity/edit/main/docs/${actualSlug.join("/")}.md`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 font-semibold text-neutral-950 underline decoration-neutral-300 underline-offset-4 transition-colors hover:decoration-neutral-950"
        >
          Edit this page on GitHub
          <ArrowUpRight className="h-4 w-4" />
        </a>
      </footer>
    </article>
  );
}

import React from "react";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getDocBySlug } from "@/lib/docs";
import { MDXComponents } from "@/components/docs/MDXComponents";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";

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
    <div className="prose prose-zinc max-w-none">
      <div className="mb-12 border-b border-zinc-100 pb-12">
        <div className="flex items-center gap-2 font-mono text-[11px] text-zinc-400 uppercase tracking-widest mb-4">
          <span>Docs</span>
          {actualSlug.map((s) => (
            <React.Fragment key={s}>
              <span className="text-zinc-200">/</span>
              <span>{s}</span>
            </React.Fragment>
          ))}
        </div>
        <h1 className="text-5xl font-sans font-black uppercase tracking-tighter text-zinc-900 leading-[0.9]">
          {doc.metadata.title}
        </h1>
        {doc.metadata.description && (
          <p className="mt-6 font-mono text-base text-zinc-500 leading-relaxed max-w-2xl">
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

      <div className="mt-20 pt-8 border-t border-zinc-100 flex items-center justify-between font-mono text-xs text-zinc-400">
        <p>Last updated: {doc.metadata.date || new Date().toLocaleDateString()}</p>
        <a 
          href={`https://github.com/codetopia/identity/edit/main/docs/${actualSlug.join("/")}.md`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-zinc-900 transition-colors"
        >
          Edit this page on GitHub
        </a>
      </div>
    </div>
  );
}

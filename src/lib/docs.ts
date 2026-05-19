import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const DOCS_PATH = path.join(process.cwd(), "docs");

export interface DocMetadata {
  title: string;
  description?: string;
  date?: string;
  category?: string;
  order?: number;
  slug: string[];
}

export interface DocContent {
  metadata: DocMetadata;
  content: string;
}

export interface NavItem {
  title: string;
  href: string;
  category?: string;
  order?: number;
}

export interface NavCategory {
  title: string;
  items: NavItem[];
}

export async function getDocBySlug(slug: string[]): Promise<DocContent | null> {
  try {
    const fullPath = `${path.join(DOCS_PATH, ...slug)}.md`;
    if (!fs.existsSync(fullPath)) {
      // Try directory index
      const indexPath = path.join(DOCS_PATH, ...slug, "index.md");
      if (fs.existsSync(indexPath)) {
        return readDocFile(indexPath, slug);
      }
      return null;
    }
    return readDocFile(fullPath, slug);
  } catch (_error) {
    return null;
  }
}

function readDocFile(fullPath: string, slug: string[]): DocContent {
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  return {
    metadata: {
      title: data.title || slug[slug.length - 1] || "Untitled",
      description: data.description || "",
      date: data.date || "",
      category: data.category || "",
      order: data.order || 0,
      slug,
    },
    content,
  };
}

export async function getNavTree(): Promise<NavCategory[]> {
  const categories: Record<string, NavItem[]> = {};

  function traverse(dir: string, currentSlug: string[] = []) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        traverse(fullPath, [...currentSlug, file]);
      } else if (file.endsWith(".md")) {
        const slug = [...currentSlug, file.replace(/\.md$/, "")];
        // Skip index files if they are handled by the directory slug
        if (file === "index.md" && currentSlug.length > 0) continue;

        const fileContents = fs.readFileSync(fullPath, "utf8");
        const { data } = matter(fileContents);

        const category = data.category || currentSlug[0] || "General";
        const title = data.title || slug[slug.length - 1];

        if (!categories[category]) categories[category] = [];

        categories[category].push({
          title,
          href: `/docs/${slug.join("/")}`,
          category,
          order: data.order || 0,
        });
      }
    }
  }

  traverse(DOCS_PATH);

  // Sort and format
  return Object.entries(categories).map(([title, items]) => ({
    title: title.charAt(0).toUpperCase() + title.slice(1),
    items: items.sort((a, b) => (a.order || 0) - (b.order || 0)),
  }));
}

import { writeFileSync } from "fs";
import { resolve } from "path";

// Import data sources — tsx handles the path aliases via tsconfig
import { USE_CASES } from "../src/data/use-cases";
import { ALL_BLOG_POSTS } from "../src/data/blog-posts";

const SITE_URL = "https://snaplert.com";
const TODAY = new Date().toISOString().split("T")[0];

interface SitemapEntry {
  loc: string;
  changefreq: "daily" | "weekly" | "monthly";
  priority: number;
}

const entries: SitemapEntry[] = [
  // Core pages
  { loc: "/", changefreq: "weekly", priority: 1.0 },
  { loc: "/features", changefreq: "monthly", priority: 0.9 },
  { loc: "/pricing", changefreq: "monthly", priority: 0.9 },

  // Use cases hub
  { loc: "/use-cases", changefreq: "weekly", priority: 0.8 },

  // Use case pages
  ...USE_CASES.map((uc) => ({
    loc: `/use-cases/${uc.slug}`,
    changefreq: "monthly" as const,
    priority: uc.category === "business" ? 0.8 : 0.7,
  })),

  // Comparison pages
  { loc: "/compare/visualping-alternative", changefreq: "monthly", priority: 0.8 },

  // Blog hub
  { loc: "/blog", changefreq: "weekly", priority: 0.8 },

  // Blog posts
  ...ALL_BLOG_POSTS.map((post) => ({
    loc: `/blog/${post.slug}`,
    changefreq: "monthly" as const,
    priority: 0.7,
  })),
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    (e) => `  <url>
    <loc>${SITE_URL}${e.loc}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority.toFixed(1)}</priority>
  </url>`
  )
  .join("\n")}
</urlset>
`;

const outPath = resolve(import.meta.dirname!, "../public/sitemap.xml");
writeFileSync(outPath, xml, "utf-8");
console.log(`Sitemap generated: ${entries.length} URLs → ${outPath}`);

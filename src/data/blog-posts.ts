import type { BlogPost } from "@/types/blog";
import { BLOG_POSTS_BATCH_1 } from "./blog-posts-1";
import { BLOG_POSTS_BATCH_2 } from "./blog-posts-2";

export type { BlogPost };

export const ALL_BLOG_POSTS: BlogPost[] = [
  ...BLOG_POSTS_BATCH_1,
  ...BLOG_POSTS_BATCH_2,
].sort(
  (a, b) =>
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
);

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return ALL_BLOG_POSTS.find((p) => p.slug === slug);
}

export function getRelatedPosts(slug: string, limit = 3): BlogPost[] {
  const post = getBlogPostBySlug(slug);
  if (!post) return ALL_BLOG_POSTS.slice(0, limit);

  // First try posts from relatedSlugs
  const related: BlogPost[] = [];
  for (const relSlug of post.relatedSlugs) {
    const relPost = getBlogPostBySlug(relSlug);
    if (relPost) related.push(relPost);
  }

  // If not enough, add posts from same category
  if (related.length < limit) {
    for (const p of ALL_BLOG_POSTS) {
      if (
        p.slug !== slug &&
        !related.find((r) => r.slug === p.slug) &&
        p.category === post.category
      ) {
        related.push(p);
        if (related.length >= limit) break;
      }
    }
  }

  // If still not enough, add any other posts
  if (related.length < limit) {
    for (const p of ALL_BLOG_POSTS) {
      if (p.slug !== slug && !related.find((r) => r.slug === p.slug)) {
        related.push(p);
        if (related.length >= limit) break;
      }
    }
  }

  return related.slice(0, limit);
}

export const CATEGORY_LABELS: Record<BlogPost["category"], string> = {
  comparison: "Comparison",
  tutorial: "Tutorial",
  industry: "Industry",
  technical: "Technical",
};

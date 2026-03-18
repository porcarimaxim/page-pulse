import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Calendar, Clock, Tag } from "lucide-react";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { MarketingCTA } from "@/components/marketing/MarketingCTA";
import {
  ALL_BLOG_POSTS,
  CATEGORY_LABELS,
  type BlogPost,
} from "@/data/blog-posts";
import { useState } from "react";

export const Route = createFileRoute("/blog/")({
  component: BlogIndex,
  head: () => ({
    meta: [
      {
        title:
          "Blog — Website Monitoring Guides, Tutorials & Comparisons | PagePulse",
      },
      {
        name: "description",
        content:
          "Learn how to monitor websites for changes. Tutorials, tool comparisons, and industry guides for competitor tracking, price alerts, compliance monitoring, and more.",
      },
      {
        property: "og:title",
        content: "PagePulse Blog — Website Monitoring Guides & Tutorials",
      },
      {
        property: "og:description",
        content:
          "Tutorials, comparisons, and strategies for website change monitoring.",
      },
      { property: "og:url", content: "https://pagepulse.io/blog" },
    ],
  }),
});

const CATEGORY_FILTERS: { key: BlogPost["category"] | "all"; label: string }[] =
  [
    { key: "all", label: "All Posts" },
    { key: "tutorial", label: "Tutorials" },
    { key: "comparison", label: "Comparisons" },
    { key: "industry", label: "Industry" },
    { key: "technical", label: "Technical" },
  ];

function BlogIndex() {
  const [filter, setFilter] = useState<BlogPost["category"] | "all">("all");

  const posts =
    filter === "all"
      ? ALL_BLOG_POSTS
      : ALL_BLOG_POSTS.filter((p) => p.category === filter);

  return (
    <MarketingLayout>
      {/* Hero */}
      <section className="px-6 pt-16 pb-12 md:pt-24 md:pb-16 max-w-4xl mx-auto text-center">
        <p className="text-xs md:text-sm font-bold uppercase tracking-[0.4em] text-[#666] mb-6">
          {ALL_BLOG_POSTS.length} Articles &amp; Growing
        </p>
        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[1.1] mb-6">
          The
          <br />
          <span className="text-[#2d5a2d]">Blog</span>
        </h1>
        <p className="text-lg text-[#666] max-w-xl mx-auto">
          Guides, tutorials, and comparisons to help you monitor the web and
          stay ahead of changes that matter.
        </p>
      </section>

      {/* Filter */}
      <section className="px-6 pb-12">
        <div className="max-w-5xl mx-auto flex flex-wrap gap-2 justify-center">
          {CATEGORY_FILTERS.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setFilter(cat.key)}
              className={`px-5 py-2 text-xs font-bold uppercase tracking-wider border-2 transition-colors ${
                filter === cat.key
                  ? "bg-[#1a1a1a] text-[#f0f0e8] border-[#1a1a1a]"
                  : "border-[#ccc] text-[#666] hover:border-[#1a1a1a] hover:text-[#1a1a1a]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* Featured Post (first post) */}
      {posts.length > 0 && (
        <section className="px-6 pb-16">
          <div className="max-w-5xl mx-auto">
            <Link
              to={`/blog/${posts[0].slug}`}
              className="block border-2 border-[#1a1a1a] shadow-[8px_8px_0px_0px_#1a1a1a] hover:shadow-[10px_10px_0px_0px_#2d5a2d] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all p-8 md:p-12 group"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#2d5a2d] text-[#f0f0e8] px-3 py-1">
                  {CATEGORY_LABELS[posts[0].category]}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#666]">
                  {posts[0].readTime}
                </span>
              </div>
              <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-[1.1] mb-4 group-hover:text-[#2d5a2d] transition-colors">
                {posts[0].title}
              </h2>
              <p className="text-[#666] leading-relaxed mb-6 max-w-2xl">
                {posts[0].heroSubtitle}
              </p>
              <span className="text-sm font-bold text-[#2d5a2d] uppercase tracking-wider group-hover:underline">
                Read Article <ArrowRight className="inline w-4 h-4 ml-1" />
              </span>
            </Link>
          </div>
        </section>
      )}

      {/* Post Grid */}
      <section className="border-t-2 border-[#1a1a1a] bg-[#1a1a1a] text-[#f0f0e8] px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.slice(1).map((post) => (
              <Link
                key={post.slug}
                to={`/blog/${post.slug}`}
                className="border-2 border-[#333] p-6 hover:border-[#7cb87c] transition-colors group flex flex-col"
              >
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#7cb87c]">
                    {CATEGORY_LABELS[post.category]}
                  </span>
                  <span className="text-[10px] text-[#a0a0a0]">·</span>
                  <span className="text-[10px] text-[#a0a0a0]">
                    {post.readTime}
                  </span>
                </div>
                <h3 className="text-lg font-black uppercase tracking-tighter leading-[1.1] mb-3 group-hover:text-[#7cb87c] transition-colors">
                  {post.title}
                </h3>
                <p className="text-xs text-[#666] leading-relaxed mb-4 flex-1">
                  {post.heroSubtitle}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#a0a0a0]">
                    {new Date(post.publishedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  <span className="text-xs font-bold text-[#7cb87c] uppercase tracking-wider group-hover:underline">
                    Read <ArrowRight className="inline w-3 h-3 ml-1" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <MarketingCTA
        subheadline="Ready To Start?"
        headline={"Stop Checking.\nStart Monitoring."}
        description="Set up your first monitor in under 60 seconds. Free forever — no credit card required."
      />
    </MarketingLayout>
  );
}

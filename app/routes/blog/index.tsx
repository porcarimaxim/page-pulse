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
        <p className="text-xs md:text-sm font-bold uppercase tracking-[0.4em] text-gray-500 mb-6">
          {ALL_BLOG_POSTS.length} Articles &amp; Growing
        </p>
        <h1 className="text-5xl md:text-7xl font-bold leading-[1.1] mb-6">
          The
          <br />
          <span className="text-emerald-600">Blog</span>
        </h1>
        <p className="text-lg text-gray-500 max-w-xl mx-auto">
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
              className={`px-5 py-2 text-xs font-bold uppercase tracking-wider border transition-colors rounded-lg ${
                filter === cat.key
                  ? "bg-gray-900 text-white border-gray-900"
                  : "border-gray-200 text-gray-500 hover:border-gray-900 hover:text-gray-900"
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
              className="block border border-gray-200 shadow-lg hover:shadow-xl transition-all p-8 md:p-12 group rounded-xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs font-bold uppercase tracking-wider bg-emerald-600 text-white px-3 py-1 rounded-full">
                  {CATEGORY_LABELS[posts[0].category]}
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  {posts[0].readTime}
                </span>
              </div>
              <h2 className="text-3xl md:text-5xl font-bold leading-[1.1] mb-4 group-hover:text-emerald-600 transition-colors">
                {posts[0].title}
              </h2>
              <p className="text-gray-500 leading-relaxed mb-6 max-w-2xl">
                {posts[0].heroSubtitle}
              </p>
              <span className="text-sm font-bold text-emerald-600 uppercase tracking-wider group-hover:underline">
                Read Article <ArrowRight className="inline w-4 h-4 ml-1" />
              </span>
            </Link>
          </div>
        </section>
      )}

      {/* Post Grid */}
      <section className="border-t border-gray-200 bg-gray-900 text-white px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.slice(1).map((post) => (
              <Link
                key={post.slug}
                to={`/blog/${post.slug}`}
                className="border border-gray-700 p-6 hover:border-emerald-400 transition-colors group flex flex-col rounded-xl"
              >
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    {CATEGORY_LABELS[post.category]}
                  </span>
                  <span className="text-xs text-gray-400">·</span>
                  <span className="text-xs text-gray-400">
                    {post.readTime}
                  </span>
                </div>
                <h3 className="text-lg font-bold leading-[1.1] mb-3 group-hover:text-emerald-400 transition-colors">
                  {post.title}
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed mb-4 flex-1">
                  {post.heroSubtitle}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    {new Date(post.publishedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider group-hover:underline">
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

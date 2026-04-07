import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Calendar, Clock, Tag, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { MarketingCTA } from "@/components/marketing/MarketingCTA";
import {
  getBlogPostBySlug,
  getRelatedPosts,
  CATEGORY_LABELS,
} from "@/data/blog-posts";

export const Route = createFileRoute("/blog/$slug")({
  component: BlogPostPage,
  head: ({ params }) => {
    const post = getBlogPostBySlug(params.slug);
    if (!post)
      return {
        meta: [{ title: "Post Not Found — PagePulse Blog" }],
      };
    return {
      meta: [
        { title: post.metaTitle },
        { name: "description", content: post.metaDescription },
        { property: "og:title", content: post.metaTitle },
        { property: "og:description", content: post.metaDescription },
        {
          property: "og:url",
          content: `https://pagepulse.io/blog/${post.slug}`,
        },
        { property: "og:type", content: "article" },
        {
          property: "article:published_time",
          content: post.publishedAt,
        },
        { property: "article:author", content: post.author },
      ],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: post.title,
            description: post.metaDescription,
            author: {
              "@type": "Person",
              name: post.author,
            },
            publisher: {
              "@type": "Organization",
              name: "PagePulse",
              url: "https://pagepulse.io",
            },
            datePublished: post.publishedAt,
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": `https://pagepulse.io/blog/${post.slug}`,
            },
          }),
        },
      ],
    };
  },
});

function BlogPostPage() {
  const { slug } = Route.useParams();
  const post = getBlogPostBySlug(slug);

  if (!post) {
    return (
      <MarketingLayout>
        <section className="px-6 py-32 text-center">
          <h1 className="text-4xl font-bold mb-4">
            Post Not Found
          </h1>
          <p className="text-gray-500 mb-8">
            We couldn&apos;t find that article.
          </p>
          <Button asChild>
            <Link to="/blog">
              <ArrowLeft className="mr-2 w-4 h-4" />
              All Posts
            </Link>
          </Button>
        </section>
      </MarketingLayout>
    );
  }

  const related = getRelatedPosts(slug, 3);
  const publishDate = new Date(post.publishedAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <MarketingLayout>
      {/* ── HERO ── */}
      <section className="px-6 pt-16 pb-12 md:pt-24 md:pb-16">
        <div className="max-w-3xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-10 text-xs font-bold uppercase tracking-wider">
            <Link
              to="/blog"
              className="text-gray-500 hover:text-gray-900 transition-colors"
            >
              Blog
            </Link>
            <span className="text-gray-200">/</span>
            <span className="text-emerald-600">
              {CATEGORY_LABELS[post.category]}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-[1.1] mb-6">
            {post.title}
          </h1>

          <p className="text-lg text-gray-500 leading-relaxed mb-8">
            {post.heroSubtitle}
          </p>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-6 text-xs text-gray-500 border-t border-b border-gray-200 py-4">
            <div className="flex items-center gap-2">
              <User className="w-3.5 h-3.5" />
              <span>{post.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5" />
              <span>{publishDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" />
              <span>{post.readTime}</span>
            </div>
            <div className="flex items-center gap-2">
              <Tag className="w-3.5 h-3.5" />
              <span className="text-emerald-600 font-bold uppercase tracking-wider">
                {CATEGORY_LABELS[post.category]}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── TABLE OF CONTENTS ── */}
      <section className="px-6 pb-8">
        <div className="max-w-3xl mx-auto">
          <details className="border border-gray-200 bg-white p-6 shadow-md rounded-xl">
            <summary className="font-bold text-sm cursor-pointer">
              Table of Contents
            </summary>
            <nav className="mt-4 space-y-2">
              {post.sections.map((section, i) => (
                <a
                  key={i}
                  href={`#section-${i}`}
                  className="block text-sm text-gray-500 hover:text-emerald-600 transition-colors"
                >
                  {section.heading}
                </a>
              ))}
            </nav>
          </details>
        </div>
      </section>

      {/* ── ARTICLE BODY ── */}
      <article className="px-6 pb-20">
        <div className="max-w-3xl mx-auto space-y-12">
          {post.sections.map((section, i) => (
            <section key={i} id={`section-${i}`}>
              <h2 className="text-2xl md:text-3xl font-bold leading-[1.1] mb-5">
                {section.heading}
              </h2>
              <div
                className="text-gray-600 leading-relaxed space-y-4 [&_p]:mb-4 [&_strong]:font-bold [&_strong]:text-gray-900 [&_em]:italic [&_a]:text-emerald-600 [&_a]:underline [&_a]:underline-offset-2 [&_code]:bg-gray-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-sm [&_code]:font-mono [&_code]:rounded"
                dangerouslySetInnerHTML={{ __html: section.content }}
              />
            </section>
          ))}
        </div>
      </article>

      {/* ── INLINE CTA ── */}
      <section className="px-6 pb-20">
        <div className="max-w-3xl mx-auto">
          <div className="border border-emerald-600 bg-emerald-600 text-white p-8 md:p-12 shadow-lg rounded-xl">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              {post.cta.text}
            </h3>
            <p className="opacity-70 mb-6">
              Set up your first monitor in under 60 seconds. Free forever — no
              credit card required.
            </p>
            <Button
              asChild
              size="lg"
              className="bg-white text-gray-900 hover:bg-gray-100 border-white"
            >
              <Link to={post.cta.link}>
                Start Monitoring Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── RELATED POSTS ── */}
      {related.length > 0 && (
        <section className="border-t border-gray-200 bg-gray-900 text-white px-6 py-20">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-12">
              Related Articles
            </h2>
            <div className="grid sm:grid-cols-3 gap-6">
              {related.map((rel) => (
                <Link
                  key={rel.slug}
                  to={`/blog/${rel.slug}`}
                  className="border border-gray-700 p-6 hover:border-emerald-400 transition-colors group flex flex-col rounded-xl"
                >
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3">
                    {CATEGORY_LABELS[rel.category]}
                  </span>
                  <h3 className="text-base font-bold leading-[1.1] mb-3 group-hover:text-emerald-400 transition-colors flex-1">
                    {rel.title}
                  </h3>
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider group-hover:underline">
                    Read <ArrowRight className="inline w-3 h-3 ml-1" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <MarketingCTA
        subheadline="Ready To Start?"
        headline={"Stop Checking.\nStart Monitoring."}
        description="Set up your first monitor in under 60 seconds. Free forever — no credit card required."
      />
    </MarketingLayout>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { MarketingCTA } from "@/components/marketing/MarketingCTA";
import {
  CATEGORIES,
  PERSONAL_CASES,
  BUSINESS_CASES,
  INDUSTRY_CASES,
} from "@/data/use-cases";
import type { UseCase } from "@/data/use-cases";

export const Route = createFileRoute("/use-cases/")({
  component: UseCasesHub,
  head: () => ({
    meta: [
      {
        title:
          "22 Website Monitoring Use Cases — Business, Personal & Industry | Snaplert",
      },
      {
        name: "description",
        content:
          "Discover 22+ ways to use website change monitoring: track competitor pricing, catch compliance changes, monitor job postings, get restock alerts, and watch SEO rankings.",
      },
      {
        property: "og:title",
        content: "22 Website Monitoring Use Cases for Teams & Individuals",
      },
      {
        property: "og:description",
        content:
          "From competitor intelligence to price alerts — see how teams and individuals monitor the web with Snaplert.",
      },
      { property: "og:url", content: "https://snaplert.com/use-cases" },
    ],
  }),
});

function UseCaseCard({
  useCase,
  variant,
}: {
  useCase: UseCase;
  variant: "light" | "dark";
}) {
  const isDark = variant === "dark";
  return (
    <Link
      to={`/use-cases/${useCase.slug}`}
      className={`border-2 p-6 transition-all group ${
        isDark
          ? "border-[#333] hover:border-[#7cb87c]"
          : "border-[#1a1a1a] shadow-[4px_4px_0px_0px_#1a1a1a] hover:shadow-[6px_6px_0px_0px_#1a1a1a] hover:translate-x-[-2px] hover:translate-y-[-2px]"
      }`}
    >
      <div className="flex items-center gap-3 mb-3">
        <div
          className={`w-10 h-10 border-2 flex items-center justify-center ${
            isDark ? "border-[#7cb87c]" : "border-[#2d5a2d]"
          }`}
        >
          <useCase.icon
            className={`w-5 h-5 ${isDark ? "text-[#7cb87c]" : "text-[#2d5a2d]"}`}
          />
        </div>
        <span
          className={`text-xs font-bold uppercase tracking-wider ${
            isDark ? "text-[#7cb87c]" : "text-[#2d5a2d]"
          }`}
        >
          {useCase.title}
        </span>
      </div>
      <h3 className="text-lg font-black uppercase tracking-tighter mb-2 leading-[1.1]">
        {useCase.headline}
      </h3>
      <p
        className={`text-xs leading-relaxed mb-3 ${
          isDark ? "opacity-60" : "text-[#666]"
        }`}
      >
        {useCase.tagline}
      </p>
      <span
        className={`text-xs font-bold uppercase tracking-wider group-hover:underline ${
          isDark ? "text-[#7cb87c]" : "text-[#2d5a2d]"
        }`}
      >
        Learn More <ArrowRight className="inline w-3 h-3 ml-1" />
      </span>
    </Link>
  );
}

function UseCasesHub() {
  return (
    <MarketingLayout>
      {/* Hero */}
      <section className="px-6 py-20 md:py-28 max-w-4xl mx-auto text-center">
        <p className="text-xs md:text-sm font-bold uppercase tracking-[0.4em] text-[#666] mb-6">
          22 Use Cases &amp; Growing
        </p>
        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[1.1] mb-6">
          Monitor
          <br />
          <span className="text-[#2d5a2d]">Everything</span>
        </h1>
        <p className="text-lg text-[#666] max-w-xl mx-auto">
          From competitor intelligence to price alerts — see how teams and
          individuals use Snaplert to stay ahead of changes that matter.
        </p>
      </section>

      {/* Business Use Cases */}
      <section className="border-t-2 border-[#1a1a1a] bg-[#1a1a1a] text-[#f0f0e8] px-6 py-24">
        <div className="max-w-5xl mx-auto">
          <p className="text-sm font-bold uppercase tracking-[0.4em] text-[#7cb87c] mb-4">
            For Teams &amp; Businesses
          </p>
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-6">
            Business Use Cases
          </h2>
          <p className="text-[#a0a0a0] leading-relaxed mb-16 max-w-lg">
            Professional monitoring for competitive intelligence, compliance,
            and website integrity.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {BUSINESS_CASES.map((uc) => (
              <UseCaseCard key={uc.slug} useCase={uc} variant="dark" />
            ))}
          </div>
        </div>
      </section>

      {/* Personal Use Cases */}
      <section className="border-t-2 border-[#1a1a1a] px-6 py-24">
        <div className="max-w-5xl mx-auto">
          <p className="text-sm font-bold uppercase tracking-[0.4em] text-[#666] mb-4">
            For Everyone
          </p>
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-6">
            Personal Use Cases
          </h2>
          <p className="text-[#666] leading-relaxed mb-16 max-w-lg">
            Stop manually checking websites. Let Snaplert watch for the changes
            that matter to you.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {PERSONAL_CASES.map((uc) => (
              <UseCaseCard key={uc.slug} useCase={uc} variant="light" />
            ))}
          </div>
        </div>
      </section>

      {/* Industry Solutions */}
      <section className="border-t-2 border-[#1a1a1a] bg-[#1a1a1a] text-[#f0f0e8] px-6 py-24">
        <div className="max-w-5xl mx-auto">
          <p className="text-sm font-bold uppercase tracking-[0.4em] text-[#7cb87c] mb-4">
            Tailored For Your Sector
          </p>
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-6">
            Industry Solutions
          </h2>
          <p className="text-[#888] leading-relaxed mb-16 max-w-lg">
            Purpose-built monitoring strategies for specific industries and
            professional use cases.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {INDUSTRY_CASES.map((uc) => (
              <UseCaseCard key={uc.slug} useCase={uc} variant="dark" />
            ))}
          </div>
        </div>
      </section>

      <MarketingCTA
        headline={"Your Use Case Here"}
        subheadline="Ready To Start?"
        description="If a website changes, Snaplert can detect it. Start monitoring in under 60 seconds."
      />
    </MarketingLayout>
  );
}

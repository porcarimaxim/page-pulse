// v4.0.0 — Audit-driven overhaul
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Eye,
  MousePointerClick,
  Mail,
  ArrowRight,
  TrendingUp,
  ShoppingCart,
  Briefcase,
  Newspaper,
  Shield,
  Clock,
  GitCompareArrows,
  Target,
  Bell,
  BarChart3,
  History,
  Globe,
  Scale,
  FileSearch,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { MarketingCTA } from "@/components/marketing/MarketingCTA";
import { useState, useEffect, useRef } from "react";
import {
  HeroIllustration,
} from "@/components/marketing/illustrations";

export const Route = createFileRoute("/")({
  component: LandingPage,
  head: () => ({
    meta: [
      { title: "PagePulse — #1 Free Website Change Monitoring Tool (2026)" },
      {
        name: "description",
        content:
          "Monitor any webpage for visual changes in under 60 seconds. Get email alerts with before/after screenshots. Track competitor prices, job postings, stock alerts, and more. Free forever.",
      },
      {
        property: "og:title",
        content: "PagePulse — Free Website Change Monitoring Tool",
      },
      {
        property: "og:description",
        content:
          "Monitor any webpage for visual changes. Get email alerts with before/after screenshots when something changes. Set up in 60 seconds.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://pagepulse.io" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:title",
        content: "PagePulse — Free Website Change Monitoring Tool",
      },
    ],
  }),
});

function LandingPage() {
  return (
    <MarketingLayout>
      <Hero />
      <StatsBar />
      <HowItWorks />
      <BusinessUseCases />
      <PersonalUseCases />
      <Features />
      <Testimonials />
      <MarketingCTA />
    </MarketingLayout>
  );
}

/* ─── Hero ────────────────────────────────────────── */

const heroWords = [
  "competitors",
  "prices",
  "job postings",
  "product pages",
  "news sites",
  "regulations",
];

function Hero() {
  const [url, setUrl] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setIsExiting(true);
      setTimeout(() => {
        setWordIndex((i) => (i + 1) % heroWords.length);
        setIsExiting(false);
      }, 300);
    }, 2400);
    return () => clearInterval(interval);
  }, []);

  function handleGo(e: React.FormEvent) {
    e.preventDefault();
    const params = url ? { url: encodeURIComponent(url) } : {};
    navigate({ to: "/auth/sign-up", search: params as any });
  }

  return (
    <section className="px-4 md:px-6 pt-12 md:pt-20 pb-14 md:pb-20 max-w-6xl mx-auto">
      <div className="grid md:grid-cols-[1.1fr_1fr] gap-12 md:gap-16 items-center">
        {/* Left: copy */}
        <div>
          <p className="text-xs md:text-sm font-bold uppercase tracking-[0.4em] text-[#666] mb-4">
            Website Change Detection &amp; Monitoring
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tighter leading-[1.05] mb-6">
            We Monitor
            <br />
            <span
              aria-live="polite"
              className={`text-[#2d5a2d] inline-block min-w-[240px] sm:min-w-[300px] transition-all duration-300 ${
                isExiting
                  ? "opacity-0 translate-y-2"
                  : "opacity-100 translate-y-0"
              }`}
            >
              {heroWords[wordIndex]}
            </span>
            <br />
            So You Don&apos;t Have To
          </h1>
          <p className="text-base md:text-lg text-[#666] max-w-lg mb-8 md:mb-10 leading-relaxed">
            Select a zone on any webpage. Get email alerts with visual diffs
            when something changes. Dead simple monitoring for teams and
            individuals.
          </p>

          {/* URL Input */}
          <form
            onSubmit={handleGo}
            className="flex flex-col sm:flex-row border-2 border-[#1a1a1a] shadow-[4px_4px_0px_0px_#1a1a1a] bg-white"
          >
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter any URL to start monitoring..."
              className="flex-1 px-4 md:px-6 py-4 text-sm md:text-base bg-transparent outline-none placeholder:text-[#999] font-mono"
            />
            <Button
              type="submit"
              className="px-8 py-4 h-auto sm:border-l-2 border-t-2 sm:border-t-0 border-[#1a1a1a]"
            >
              Start Free <ArrowRight className="inline ml-1 w-4 h-4" />
            </Button>
          </form>

          <p className="text-xs text-[#999] mt-4">
            Free to get started — no credit card required
          </p>
        </div>

        {/* Right: product mockup */}
        <div className="hidden md:block">
          <HeroIllustration useCaseTitle="Competitor Monitoring" />
        </div>
      </div>
    </section>
  );
}

/* ─── Stats Bar ──────────────────────────────────── */

function StatsBar() {
  return (
    <section className="border-t-2 border-b-2 border-[#1a1a1a] bg-[#1a1a1a] text-[#f0f0e8]">
      <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 divide-x-2 divide-[#333]">
        {[
          { value: "< 60s", label: "Setup Time" },
          { value: "5 min", label: "Fastest Check" },
          { value: "100%", label: "Visual Accuracy" },
          { value: "24/7", label: "Monitoring" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="py-6 md:py-8 px-4 md:px-6 text-center"
          >
            <div className="text-xl md:text-3xl font-black tracking-tighter text-[#7cb87c]">
              {stat.value}
            </div>
            <div className="text-[10px] md:text-xs uppercase tracking-wider text-[#a0a0a0] mt-1">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── How It Works ────────────────────────────────── */

function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Enter URL",
      description:
        "Paste any webpage URL and we capture a full-page screenshot instantly.",
      icon: Eye,
    },
    {
      number: "02",
      title: "Select Zone",
      description:
        "Draw a rectangle or pick an element — monitor exactly what matters to you.",
      icon: MousePointerClick,
    },
    {
      number: "03",
      title: "Set Schedule",
      description:
        "Choose how often to check — every 5 minutes, hourly, daily, or weekly.",
      icon: Clock,
    },
    {
      number: "04",
      title: "Get Alerts",
      description:
        "Receive email alerts with before/after screenshots when changes are detected.",
      icon: Mail,
    },
  ];

  return (
    <section className="px-6 py-24">
      <div className="max-w-5xl mx-auto">
        <p className="text-sm font-bold uppercase tracking-[0.4em] text-[#666] mb-4 text-center">
          How It Works
        </p>
        <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-20 text-center">
          Four Simple Steps
        </h2>

        <div className="grid md:grid-cols-4 gap-0">
          {steps.map((step, i) => (
            <div key={step.number} className="relative px-6">
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 right-0 w-full h-[3px] bg-[#2d5a2d] translate-x-1/2 opacity-30" />
              )}

              <div className="relative">
                {/* Large background number */}
                <span className="absolute -top-6 -left-2 text-[80px] font-black text-[#1a1a1a] opacity-[0.04] leading-none select-none pointer-events-none">
                  {step.number}
                </span>
                <div className="w-14 h-14 border-2 border-[#2d5a2d] flex items-center justify-center mb-6">
                  <step.icon className="w-6 h-6 text-[#2d5a2d]" />
                </div>
                <span className="text-[#2d5a2d] font-mono text-xs mb-2 block">
                  {step.number}
                </span>
                <h3 className="text-lg font-black uppercase tracking-tighter mb-3">
                  {step.title}
                </h3>
                <p className="text-sm text-[#666] leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Business Use Cases ─────────────────────────── */

function BusinessUseCases() {
  const cases = [
    {
      icon: TrendingUp,
      title: "Competitor Monitoring",
      description:
        "Track competitor homepages, pricing pages, and product launches. Know the moment they make a move.",
      link: "/use-cases/competitor-monitoring",
    },
    {
      icon: Scale,
      title: "Compliance Monitoring",
      description:
        "Watch regulatory pages, terms of service, and policy updates. Stay ahead of legal changes.",
      link: "/use-cases/compliance-monitoring",
    },
    {
      icon: FileSearch,
      title: "SEO Monitoring",
      description:
        "Track search results, meta tags, and content changes on your own site. Catch issues before rankings drop.",
      link: "/use-cases/seo-monitoring",
    },
    {
      icon: Shield,
      title: "Website QA",
      description:
        "Monitor your production site for visual regressions, broken layouts, and unexpected content changes.",
      link: "/use-cases/regression-defacement",
    },
  ];

  return (
    <section className="border-t-2 border-[#1a1a1a] bg-[#1a1a1a] text-[#f0f0e8] px-6 py-24">
      <div className="max-w-5xl mx-auto">
        <p className="text-sm font-bold uppercase tracking-[0.4em] text-[#7cb87c] mb-4">
          For Teams &amp; Businesses
        </p>
        <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-6 leading-[0.92]">
          Professional
          <br />
          Monitoring
        </h2>
        <p className="text-[#a0a0a0] leading-relaxed mb-16 max-w-lg">
          Stay ahead of competitors, catch compliance changes, and protect your
          brand — all on autopilot.
        </p>

        <div className="grid sm:grid-cols-2 gap-6">
          {cases.map((c) => (
            <Link
              key={c.title}
              to={c.link}
              className="border-2 border-[#333] p-6 hover:border-[#7cb87c] transition-colors group"
            >
              <div className="w-10 h-10 border-2 border-[#7cb87c] flex items-center justify-center mb-4">
                <c.icon className="w-5 h-5 text-[#7cb87c]" />
              </div>
              <h3 className="font-black text-sm uppercase tracking-tighter mb-2">
                {c.title}
              </h3>
              <p className="text-xs text-[#a0a0a0] leading-relaxed mb-3">
                {c.description}
              </p>
              <span className="text-xs font-bold text-[#7cb87c] uppercase tracking-wider group-hover:underline">
                Learn More <ArrowRight className="inline w-3 h-3 ml-1" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Personal Use Cases ─────────────────────────── */

function PersonalUseCases() {
  const cases = [
    {
      icon: ShoppingCart,
      title: "Price Drops",
      description: "Get alerted when a product drops to your target price.",
    },
    {
      icon: Briefcase,
      title: "Job Postings",
      description:
        "Know the moment your dream company posts a new opening.",
    },
    {
      icon: Newspaper,
      title: "News & Media",
      description: "Track breaking news and topic updates across any site.",
    },
    {
      icon: Globe,
      title: "Product Availability",
      description:
        "Watch out-of-stock items and get alerted when they're back.",
    },
  ];

  return (
    <section className="border-t-2 border-[#1a1a1a] px-6 py-24">
      <div className="max-w-5xl mx-auto">
        <div className="grid md:grid-cols-[1fr_1.5fr] gap-16 items-start">
          <div className="md:sticky md:top-24">
            <p className="text-sm font-bold uppercase tracking-[0.4em] text-[#666] mb-4">
              For Everyone
            </p>
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-[0.92] mb-6">
              Personal
              <br />
              Monitoring
            </h2>
            <p className="text-[#666] leading-relaxed mb-8">
              Stop manually refreshing websites. Let PagePulse watch for you and
              save hours every week.
            </p>
            <Button asChild variant="outline" size="sm">
              <Link to="/use-cases">
                All Use Cases <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {cases.map((c) => (
              <div
                key={c.title}
                className="border-2 border-[#1a1a1a] p-6 shadow-[4px_4px_0px_0px_#1a1a1a] hover:shadow-[8px_8px_0px_0px_#1a1a1a] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all"
              >
                <div className="w-10 h-10 border-2 border-[#2d5a2d] flex items-center justify-center mb-4">
                  <c.icon className="w-5 h-5 text-[#2d5a2d]" />
                </div>
                <h3 className="font-black text-sm uppercase tracking-tighter mb-2">
                  {c.title}
                </h3>
                <p className="text-xs text-[#666] leading-relaxed">
                  {c.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Features ────────────────────────────────────── */

function Features() {
  // Hero feature (core value prop)
  const heroFeature = {
    icon: GitCompareArrows,
    title: "Visual Diff",
    headline: "Pixel-Level Comparison",
    description:
      "See exactly what changed with highlighted screenshot overlays. Every pixel difference is visible at a glance — no more guessing what's different.",
  };

  // Grid features
  const gridFeatures = [
    {
      icon: Target,
      title: "Zone Selection",
      description:
        "Pick a specific element or draw a zone. Ignore headers, ads, and noise.",
    },
    {
      icon: Bell,
      title: "Smart Alerts",
      description:
        "Before/after comparison emails the moment a change is detected.",
    },
    {
      icon: BarChart3,
      title: "Live Dashboard",
      description:
        "All monitors at a glance. Live status, check history, and change timelines.",
    },
    {
      icon: Clock,
      title: "Flexible Scheduling",
      description:
        "Every 5 minutes to weekly — pick the frequency that fits each monitor.",
    },
    {
      icon: History,
      title: "Change History",
      description:
        "Every change stored with visual comparisons. Scroll back through time.",
    },
  ];

  return (
    <section className="border-t-2 border-[#1a1a1a] px-6 py-24">
      <div className="max-w-5xl mx-auto">
        <p className="text-sm font-bold uppercase tracking-[0.4em] text-[#666] mb-4 text-center">
          Built For Monitoring
        </p>
        <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-6 text-center">
          Everything You Need
        </h2>
        <p className="text-center text-[#666] mb-16 max-w-xl mx-auto">
          Powerful tools working together to track webpage changes with zero
          complexity.
        </p>

        {/* Hero feature — full width */}
        <div className="border-2 border-[#1a1a1a] bg-[#1a1a1a] text-[#f0f0e8] p-8 md:p-12 shadow-[8px_8px_0px_0px_#2d5a2d] mb-12">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="w-14 h-14 border-2 border-[#7cb87c] flex items-center justify-center shrink-0">
              <heroFeature.icon className="w-6 h-6 text-[#7cb87c]" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#7cb87c] mb-1 block">
                Core Feature
              </span>
              <h3 className="text-2xl md:text-4xl font-black uppercase tracking-tighter mb-3">
                {heroFeature.headline}
              </h3>
              <p className="text-sm leading-relaxed text-[#a0a0a0] max-w-xl">
                {heroFeature.description}
              </p>
            </div>
          </div>
        </div>

        {/* Grid of remaining features */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {gridFeatures.map((f) => (
            <div
              key={f.title}
              className="border-2 border-[#1a1a1a] p-6 shadow-[4px_4px_0px_0px_#1a1a1a]"
            >
              <div className="w-10 h-10 border-2 border-[#2d5a2d] flex items-center justify-center mb-4">
                <f.icon className="w-5 h-5 text-[#2d5a2d]" />
              </div>
              <h3 className="font-black text-sm uppercase tracking-tighter mb-2">
                {f.title}
              </h3>
              <p className="text-xs text-[#666] leading-relaxed">
                {f.description}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button asChild variant="outline">
            <Link to="/features">
              See All Features <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

/* ─── Testimonials / Social Proof ────────────────── */

function Testimonials() {
  const quotes = [
    {
      text: "Set it up in 30 seconds and caught a competitor's price change before my team even noticed.",
      author: "Sarah K.",
      role: "Marketing Lead, E-commerce",
    },
    {
      text: "We replaced three manual check processes with PagePulse monitors. Saves us hours every week.",
      author: "David R.",
      role: "Operations Manager, SaaS",
      featured: true,
    },
    {
      text: "The visual diffs are incredibly clear. I always know exactly what changed and when.",
      author: "Lisa M.",
      role: "Product Designer, Agency",
    },
  ];

  return (
    <section className="border-t-2 border-[#1a1a1a] bg-[#1a1a1a] text-[#f0f0e8] px-6 py-24">
      <div className="max-w-5xl mx-auto">
        <p className="text-sm font-bold uppercase tracking-[0.4em] text-[#7cb87c] mb-4 text-center">
          What People Say
        </p>
        <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-16 text-center">
          Trusted By Teams
        </h2>

        <div className="grid md:grid-cols-3 gap-6 items-stretch">
          {quotes.map((q, i) => (
            <div
              key={i}
              className={`border-2 p-6 flex flex-col justify-between ${
                q.featured
                  ? "border-[#7cb87c] md:scale-105 md:-my-2"
                  : "border-[#333]"
              }`}
            >
              <p className="text-sm leading-relaxed text-[#a0a0a0] mb-6">
                &ldquo;{q.text}&rdquo;
              </p>
              <div>
                <p className="font-black text-sm uppercase tracking-tighter">
                  {q.author}
                </p>
                <p className="text-xs text-[#a0a0a0]">{q.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

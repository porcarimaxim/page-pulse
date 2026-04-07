// v6.0.0 — Streamlined homepage: fewer sections, more impact
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  TrendingUp,
  ShoppingCart,
  Briefcase,
  Newspaper,
  Shield,
  Clock,
  GitCompareArrows,
  Scale,
  FileSearch,
  Globe,
  Zap,
  CreditCard,
  Eye,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { MarketingCTA } from "@/components/marketing/MarketingCTA";
import { useState, useEffect } from "react";
import { HeroIllustration } from "@/components/marketing/illustrations";
import {
  ElementPicker,
  AlertEmailMockup,
} from "@/components/marketing/illustrations/FeatureIllustrations";

export const Route = createFileRoute("/")({
  component: LandingPage,
  head: () => ({
    meta: [
      {
        title: "PagePulse — #1 Free Website Change Monitoring Tool (2026)",
      },
      {
        name: "description",
        content:
          "Monitor any webpage for visual changes in under 60 seconds. Get email alerts with AI-powered summaries and before/after screenshots. Track competitor prices, job postings, stock alerts, and more. Free forever.",
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
      <TrustBar />
      <HowItWorks />
      <WhoItsFor />
      <CoreFeature />
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
        <div>
          <p className="text-xs md:text-sm font-bold uppercase tracking-[0.4em] text-gray-500 mb-4">
            Website Change Detection &amp; Monitoring
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.1] mb-6">
            We Monitor
            <br />
            <span
              aria-live="polite"
              className={`text-emerald-600 inline-block min-w-[240px] sm:min-w-[300px] transition-all duration-300 ${
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
          <p className="text-base md:text-lg text-gray-500 max-w-lg mb-8 md:mb-10 leading-relaxed">
            Select a zone on any webpage. Get email alerts with visual diffs
            and AI-powered summaries when something changes. Dead simple
            monitoring for teams and individuals.
          </p>

          <form
            onSubmit={handleGo}
            className="flex flex-col sm:flex-row border border-gray-200 shadow-md bg-white rounded-xl"
          >
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter any URL to monitor"
              className="flex-1 px-4 md:px-6 py-4 text-sm md:text-base bg-transparent outline-none placeholder:text-gray-400"
            />
            <Button
              type="submit"
              className="px-8 py-4 h-auto sm:border-l border-t sm:border-t-0 border-gray-200"
            >
              Start Free <ArrowRight className="inline ml-1 w-4 h-4" />
            </Button>
          </form>

          <p className="text-xs text-gray-400 mt-4">
            Free to get started — no credit card required
          </p>
        </div>

        <div className="hidden md:block">
          <HeroIllustration useCaseTitle="Competitor Monitoring" />
        </div>
      </div>
    </section>
  );
}

/* ─── Trust Bar ──────────────────────────────────── */

function TrustBar() {
  return (
    <section className="border-t border-b border-gray-200 bg-gray-900 text-white">
      <div className="max-w-5xl mx-auto py-6 md:py-8">
        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-700">
          {[
            { value: "< 60s", label: "Setup Time" },
            { value: "5 min", label: "Fastest Check" },
            { value: "100%", label: "Visual Accuracy" },
            { value: "24/7", label: "Monitoring" },
          ].map((stat) => (
            <div key={stat.label} className="px-4 md:px-6 text-center">
              <div className="text-xl md:text-3xl font-bold text-emerald-400">
                {stat.value}
              </div>
              <div className="text-xs md:text-xs uppercase tracking-wider text-gray-400 mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── How It Works (tabbed walkthrough) ──────────── */

const howItWorksSteps = [
  {
    number: "01",
    label: "Paste URL",
    headline: "Enter any webpage address",
    description:
      "Paste the URL you want to monitor. We capture a full-page screenshot instantly — no browser extension or code required.",
    visual: "url" as const,
  },
  {
    number: "02",
    label: "Select Zone",
    headline: "Pick what to watch",
    description:
      "Use our visual element picker to click on a specific element. Monitor a price tag, a headline, a button — anything.",
    visual: "zone" as const,
  },
  {
    number: "03",
    label: "Get Alerts",
    headline: "Changes delivered to you",
    description:
      "When something changes, you get an email with before/after screenshots, the exact diff percentage, an AI-generated summary of what changed, and a direct link to your dashboard.",
    visual: "alerts" as const,
  },
];

function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = 5000;
    const interval = 50;
    let elapsed = 0;

    const timer = setInterval(() => {
      elapsed += interval;
      setProgress((elapsed / duration) * 100);
      if (elapsed >= duration) {
        elapsed = 0;
        setProgress(0);
        setActiveStep((prev) => (prev + 1) % howItWorksSteps.length);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [activeStep]);

  const step = howItWorksSteps[activeStep];

  return (
    <section className="px-6 py-20 md:py-24">
      <div className="max-w-5xl mx-auto">
        <p className="text-xs md:text-sm font-bold uppercase tracking-[0.4em] text-gray-500 mb-4 text-center">
          How It Works
        </p>
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 leading-[1.1]">
          Three Steps. <span className="text-emerald-600">That&apos;s It.</span>
        </h2>

        <div className="flex border border-gray-200 rounded-t-xl mb-0">
          {howItWorksSteps.map((s, i) => (
            <button
              key={s.number}
              onClick={() => {
                setActiveStep(i);
                setProgress(0);
              }}
              className={`flex-1 py-4 px-4 text-center transition-colors relative ${
                activeStep === i
                  ? "bg-gray-900 text-white"
                  : "bg-white text-gray-900 hover:bg-gray-50"
              } ${i > 0 ? "border-l border-gray-200" : ""} ${i === 0 ? "rounded-tl-xl" : ""} ${i === howItWorksSteps.length - 1 ? "rounded-tr-xl" : ""}`}
            >
              <span className="text-xs font-bold uppercase tracking-wider block">
                {s.number}
              </span>
              <span className="text-xs md:text-sm font-semibold uppercase tracking-wider">
                {s.label}
              </span>
              {activeStep === i && (
                <div
                  className="absolute bottom-0 left-0 h-0.5 bg-emerald-400 transition-none"
                  style={{ width: `${progress}%` }}
                />
              )}
            </button>
          ))}
        </div>

        <div className="border border-t-0 border-gray-200 bg-white rounded-b-xl">
          <div className="flex flex-col md:flex-row">
            <div className="flex-1 p-8 md:p-12 flex flex-col justify-center">
              <h3 className="text-2xl md:text-3xl font-bold mb-4 leading-[1.1]">
                {step.headline}
              </h3>
              <p className="text-gray-500 leading-relaxed mb-6">
                {step.description}
              </p>
              <div>
                <Button asChild size="sm">
                  <Link to="/auth/sign-up">
                    Try It Now <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </div>
            <div className="flex-1 p-4 md:p-6 border-t md:border-t-0 md:border-l border-gray-200 bg-gray-50 flex items-center justify-center min-h-[280px]">
              {step.visual === "url" && (
                <div className="w-full max-w-sm">
                  <div className="border border-gray-200 bg-white rounded-lg">
                    <div className="px-4 py-2 bg-gray-900 text-xs font-bold uppercase tracking-wider text-white rounded-t-lg">
                      New Monitor
                    </div>
                    <div className="p-4">
                      <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                        URL to monitor
                      </div>
                      <div className="flex border border-gray-200 rounded-lg">
                        <div className="flex-1 px-3 py-2 font-mono text-xs text-gray-900">
                          competitor.com/pricing
                        </div>
                        <div className="px-3 py-2 bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider rounded-r-lg">
                          Capture
                        </div>
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-400 animate-pulse rounded-full" />
                        <span className="text-xs text-emerald-600 font-bold">
                          Screenshot captured in 1.2s
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {step.visual === "zone" && (
                <div className="w-full max-w-sm">
                  <ElementPicker />
                </div>
              )}
              {step.visual === "alerts" && (
                <div className="w-full max-w-sm">
                  <AlertEmailMockup />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Who It's For (outcome-driven, not feature-copy) ─── */

function WhoItsFor() {
  const audiences = [
    {
      icon: TrendingUp,
      title: "Growth Teams",
      outcome: "Stay one step ahead",
      description: "Know the moment a rival changes pricing, launches a feature, or updates their messaging. React in hours, not weeks.",
      link: "/use-cases/rival-radar",
    },
    {
      icon: Shield,
      title: "Engineering & QA",
      outcome: "Ship without surprises",
      description: "Catch visual regressions, layout breaks, and unintended content changes on production before your users do.",
      link: "/use-cases/site-shield",
    },
    {
      icon: Scale,
      title: "Legal & Compliance",
      outcome: "Never miss a policy shift",
      description: "Regulatory pages, terms of service, and government notices — tracked automatically with a timestamped audit trail.",
      link: "/use-cases/vendor-guard",
    },
    {
      icon: FileSearch,
      title: "SEO & Content",
      outcome: "Protect your rankings",
      description: "Detect content drift, meta tag changes, and SERP shifts on your own site or competitors' before traffic drops.",
      link: "/use-cases/rank-protect",
    },
  ];

  const personalWins = [
    {
      icon: ShoppingCart,
      outcome: "Snag the deal",
      description: "Watch any product page. Get pinged when the price drops.",
    },
    {
      icon: Briefcase,
      outcome: "Land the role",
      description: "Monitor career pages. Apply the day a position opens.",
    },
    {
      icon: Globe,
      outcome: "Be first in line",
      description: "Track out-of-stock items. Buy the moment they restock.",
    },
    {
      icon: Newspaper,
      outcome: "Stay informed",
      description: "Follow any page for updates — news, research, government filings.",
    },
  ];

  return (
    <section className="border-t border-gray-200 bg-gray-900 text-white px-6 py-20 md:py-24">
      <div className="max-w-5xl mx-auto">
        {/* Teams section */}
        <div className="mb-16">
          <p className="text-sm font-bold uppercase tracking-[0.4em] text-emerald-400 mb-4">
            Built For Teams That Move Fast
          </p>
          <h2 className="text-4xl md:text-5xl font-bold leading-[1.1] mb-12">
            Your Autopilot
            <br />
            For The Web
          </h2>

          <div className="grid sm:grid-cols-2 gap-4">
            {audiences.map((a) => (
              <Link
                key={a.title}
                to={a.link}
                className="border border-gray-700 p-6 hover:border-emerald-400 transition-colors group rounded-xl"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 border border-emerald-400 flex items-center justify-center rounded-lg">
                    <a.icon className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    {a.title}
                  </span>
                </div>
                <h3 className="font-bold text-lg mb-2 leading-[1.1]">
                  {a.outcome}
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed mb-3">
                  {a.description}
                </p>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider group-hover:underline">
                  See How <ArrowRight className="inline w-3 h-3 ml-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Personal wins — compact row */}
        <div className="border-t border-gray-700 pt-12">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-gray-400 mb-6">
            Also great for personal use
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {personalWins.map((w) => (
              <div key={w.outcome} className="flex gap-3">
                <div className="w-7 h-7 border border-gray-600 flex items-center justify-center shrink-0 mt-0.5 rounded-lg">
                  <w.icon className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-1">
                    {w.outcome}
                  </h4>
                  <p className="text-[11px] text-gray-500 leading-relaxed">
                    {w.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Core Feature (just one, links to features page) ─── */

function CoreFeature() {
  return (
    <section className="border-t border-gray-200 px-6 py-20 md:py-24">
      <div className="max-w-5xl mx-auto">
        <div className="border border-gray-200 shadow-lg rounded-xl">
          <div className="flex flex-col md:flex-row">
            {/* Text side */}
            <div className="flex-1 bg-gray-900 text-white p-8 md:p-12 flex flex-col justify-center rounded-t-xl md:rounded-t-none md:rounded-l-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 border border-emerald-400 flex items-center justify-center rounded-lg">
                  <GitCompareArrows className="w-5 h-5 text-emerald-400" />
                </div>
                <span className="text-xs font-bold uppercase tracking-[0.3em] text-emerald-400">
                  Core Feature
                </span>
              </div>
              <h2 className="text-3xl md:text-5xl font-bold mb-4 leading-[1.1]">
                Pixel-Level
                <br />
                Visual Diff
              </h2>
              <p className="text-sm leading-relaxed text-gray-400 max-w-md mb-8">
                See exactly what changed with highlighted screenshot overlays.
                Every pixel difference is visible at a glance — no more
                guessing what&apos;s different.
              </p>

              {/* Feature highlights */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                {[
                  { icon: Eye, label: "Visual\nComparison" },
                  { icon: Sparkles, label: "AI\nSummaries" },
                  { icon: Zap, label: "Instant\nAlerts" },
                ].map((f) => (
                  <div key={f.label} className="text-center">
                    <div className="w-8 h-8 border border-gray-700 flex items-center justify-center mx-auto mb-2 rounded-lg">
                      <f.icon className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <span className="text-xs uppercase tracking-wider text-gray-400 whitespace-pre-line leading-tight">
                      {f.label}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex gap-4">
                <Button
                  asChild
                  size="sm"
                  className="bg-white text-gray-900 hover:bg-gray-100 border border-white shadow-md"
                >
                  <Link to="/auth/sign-up">
                    Start Free <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
                <Link
                  to="/features"
                  className="text-xs font-bold uppercase tracking-wider text-white/60 hover:text-white underline underline-offset-4 transition-colors self-center"
                >
                  All Features →
                </Link>
              </div>
            </div>

            {/* Visual side — use the product illustration */}
            <div className="flex-1 bg-gray-50 p-6 md:p-8 border-t md:border-t-0 md:border-l border-gray-200 flex items-center justify-center rounded-b-xl md:rounded-b-none md:rounded-r-xl">
              <div className="w-full max-w-md">
                <HeroIllustration useCaseTitle="Price Monitoring" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Testimonials ────────────────────────────────── */

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
    <section className="border-t border-gray-200 bg-gray-900 text-white px-6 py-20 md:py-24">
      <div className="max-w-5xl mx-auto">
        <p className="text-sm font-bold uppercase tracking-[0.4em] text-emerald-400 mb-4 text-center">
          What People Say
        </p>
        <h2 className="text-4xl md:text-5xl font-bold mb-16 text-center leading-[1.1]">
          Trusted By Teams
        </h2>

        <div className="grid md:grid-cols-3 gap-6 items-stretch">
          {quotes.map((q, i) => (
            <div
              key={i}
              className={`border p-6 flex flex-col justify-between rounded-xl ${
                q.featured
                  ? "border-emerald-400"
                  : "border-gray-700"
              }`}
            >
              <p className="text-sm leading-relaxed text-gray-400 mb-6">
                &ldquo;{q.text}&rdquo;
              </p>
              <div>
                <p className="font-bold text-sm">
                  {q.author}
                </p>
                <p className="text-xs text-gray-400">{q.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

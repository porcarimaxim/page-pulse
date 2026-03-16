// v3.0.0 — Full marketing overhaul
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
  CheckCircle2,
  Zap,
  Globe,
  Users,
  FileSearch,
  Scale,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { MarketingCTA } from "@/components/marketing/MarketingCTA";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/")({
  component: LandingPage,
  head: () => ({
    meta: [
      { title: "PagePulse — Website Change Detection & Monitoring Alerts" },
      {
        name: "description",
        content:
          "Monitor any webpage for visual changes. Get email alerts with before/after screenshots when something changes. Track competitor prices, job postings, product availability, and more.",
      },
      {
        property: "og:title",
        content: "PagePulse — Website Change Detection & Monitoring Alerts",
      },
      {
        property: "og:description",
        content:
          "Monitor any webpage for visual changes. Get email alerts with before/after screenshots when something changes.",
      },
      { property: "og:type", content: "website" },
      {
        name: "twitter:card",
        content: "summary_large_image",
      },
      {
        name: "twitter:title",
        content: "PagePulse — Website Change Detection & Monitoring Alerts",
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
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((i) => (i + 1) % heroWords.length);
    }, 2400);
    return () => clearInterval(interval);
  }, []);

  function handleGo(e: React.FormEvent) {
    e.preventDefault();
    navigate({ to: "/auth/sign-up" });
  }

  return (
    <section className="px-4 md:px-6 pt-12 md:pt-20 pb-14 md:pb-20 max-w-5xl mx-auto">
      <p className="text-xs md:text-sm font-bold uppercase tracking-[0.4em] text-[#888] mb-4 text-center">
        Website Change Detection &amp; Monitoring
      </p>
      <h1 className="text-4xl sm:text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[1.05] mb-6 text-center">
        We Monitor
        <br />
        <span className="text-[#2d5a2d] inline-block min-w-[240px] sm:min-w-[340px] text-center transition-opacity duration-300">
          {heroWords[wordIndex]}
        </span>
        <br />
        So You Don&apos;t Have To
      </h1>
      <p className="text-base md:text-lg text-[#888] max-w-2xl mx-auto mb-8 md:mb-10 text-center leading-relaxed">
        Select a zone on any webpage. Get email alerts with visual diffs when
        something changes. Dead simple monitoring for teams and individuals.
      </p>

      {/* URL Input */}
      <form
        onSubmit={handleGo}
        className="max-w-2xl mx-auto flex flex-col sm:flex-row border-2 border-[#1a1a1a] shadow-[6px_6px_0px_0px_#1a1a1a] bg-white"
      >
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter any URL to start monitoring..."
          className="flex-1 px-4 md:px-6 py-4 text-sm md:text-base bg-transparent outline-none placeholder:text-[#aaa] font-mono"
        />
        <button
          type="submit"
          className="px-8 py-4 bg-[#2d5a2d] text-[#f0f0e8] font-bold uppercase tracking-wider text-sm hover:bg-[#3a6a3a] transition-colors sm:border-l-2 border-t-2 sm:border-t-0 border-[#1a1a1a]"
        >
          Start Free <ArrowRight className="inline ml-1 w-4 h-4" />
        </button>
      </form>

      <p className="text-center text-xs text-[#aaa] mt-4">
        Free to get started — no credit card required
      </p>
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
          <div key={stat.label} className="py-6 md:py-8 px-4 md:px-6 text-center">
            <div className="text-xl md:text-3xl font-black tracking-tighter text-[#7cb87c]">
              {stat.value}
            </div>
            <div className="text-[10px] md:text-xs uppercase tracking-wider text-[#888] mt-1">
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
        <p className="text-sm font-bold uppercase tracking-[0.4em] text-[#888] mb-4 text-center">
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
                <div className="hidden md:block absolute top-8 right-0 w-full h-[2px] bg-[#ccc] translate-x-1/2" />
              )}

              <div className="relative">
                <div className="w-16 h-16 border-2 border-[#2d5a2d] flex items-center justify-center mb-6">
                  <step.icon className="w-7 h-7 text-[#2d5a2d]" />
                </div>
                <span className="text-[#2d5a2d] font-mono text-xs mb-2 block">
                  {step.number}
                </span>
                <h3 className="text-lg font-black uppercase tracking-tighter mb-3">
                  {step.title}
                </h3>
                <p className="text-sm text-[#888] leading-relaxed">
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
        <p className="text-[#888] leading-relaxed mb-16 max-w-lg">
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
              <p className="text-xs text-[#888] leading-relaxed mb-3">
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
            <p className="text-sm font-bold uppercase tracking-[0.4em] text-[#888] mb-4">
              For Everyone
            </p>
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-[0.92] mb-6">
              Personal
              <br />
              Monitoring
            </h2>
            <p className="text-[#888] leading-relaxed mb-8">
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
                className="border-2 border-[#1a1a1a] p-6 shadow-[4px_4px_0px_0px_#1a1a1a] hover:shadow-[6px_6px_0px_0px_#1a1a1a] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all"
              >
                <div className="w-10 h-10 border-2 border-[#2d5a2d] flex items-center justify-center mb-4">
                  <c.icon className="w-5 h-5 text-[#2d5a2d]" />
                </div>
                <h3 className="font-black text-sm uppercase tracking-tighter mb-2">
                  {c.title}
                </h3>
                <p className="text-xs text-[#888] leading-relaxed">
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
  const features = [
    {
      icon: GitCompareArrows,
      title: "Visual Diff",
      headline: "Pixel-Level Comparison",
      description:
        "See exactly what changed with highlighted screenshot overlays. Every pixel difference is visible at a glance.",
    },
    {
      icon: Target,
      title: "Zone Selection",
      headline: "Monitor What Matters",
      description:
        "Pick a specific element or draw a zone. Ignore headers, ads, and noise — focus on what counts.",
    },
    {
      icon: Bell,
      title: "Smart Alerts",
      headline: "Instant Email Notifications",
      description:
        "Before/after comparison emails the moment a change is detected. Visual diffs included in every alert.",
    },
    {
      icon: BarChart3,
      title: "Live Dashboard",
      headline: "Real-Time Status",
      description:
        "All monitors at a glance. Live status, check history, and change timelines in one place.",
    },
    {
      icon: Clock,
      title: "Flexible Scheduling",
      headline: "Check On Your Terms",
      description:
        "Every 5 minutes to weekly — pick the frequency that fits. Different intervals per monitor.",
    },
    {
      icon: History,
      title: "Change History",
      headline: "Full Timeline",
      description:
        "Every change stored with visual comparisons. Scroll back through time and see how a page evolved.",
    },
  ];

  return (
    <section className="border-t-2 border-[#1a1a1a] px-6 py-24">
      <div className="max-w-5xl mx-auto">
        <p className="text-sm font-bold uppercase tracking-[0.4em] text-[#888] mb-4 text-center">
          Built For Monitoring
        </p>
        <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-6 text-center">
          Everything You Need
        </h2>
        <p className="text-center text-[#888] mb-20 max-w-xl mx-auto">
          Six powerful tools working together to track webpage changes with zero
          complexity.
        </p>

        <div className="space-y-8">
          {features.map((f, i) => (
            <div
              key={f.title}
              className={`flex flex-col md:flex-row gap-8 items-start p-8 border-2 border-[#1a1a1a] ${
                i % 2 === 0
                  ? "bg-[#f0f0e8] shadow-[8px_8px_0px_0px_#1a1a1a]"
                  : "bg-[#1a1a1a] text-[#f0f0e8] shadow-[8px_8px_0px_0px_#2d5a2d]"
              }`}
            >
              <div
                className={`w-14 h-14 border-2 flex items-center justify-center shrink-0 ${
                  i % 2 === 0 ? "border-[#2d5a2d]" : "border-[#7cb87c]"
                }`}
              >
                <f.icon
                  className={`w-6 h-6 ${
                    i % 2 === 0 ? "text-[#2d5a2d]" : "text-[#7cb87c]"
                  }`}
                />
              </div>
              <div>
                <span
                  className={`text-xs font-bold uppercase tracking-[0.3em] mb-1 block ${
                    i % 2 === 0 ? "text-[#888]" : "text-[#7cb87c]"
                  }`}
                >
                  {f.title}
                </span>
                <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tighter mb-3">
                  {f.headline}
                </h3>
                <p
                  className={`text-sm leading-relaxed max-w-xl ${
                    i % 2 === 0 ? "text-[#888]" : "opacity-60"
                  }`}
                >
                  {f.description}
                </p>
              </div>
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
      author: "Marketing Lead",
      role: "E-commerce Company",
    },
    {
      text: "We replaced three manual check processes with PagePulse monitors. Saves us hours every week.",
      author: "Operations Manager",
      role: "SaaS Startup",
    },
    {
      text: "The visual diffs are incredibly clear. I always know exactly what changed and when.",
      author: "Product Designer",
      role: "Design Agency",
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

        <div className="grid md:grid-cols-3 gap-6">
          {quotes.map((q, i) => (
            <div
              key={i}
              className="border-2 border-[#333] p-6 flex flex-col justify-between"
            >
              <p className="text-sm leading-relaxed opacity-80 mb-6">
                &ldquo;{q.text}&rdquo;
              </p>
              <div>
                <p className="font-black text-sm uppercase tracking-tighter">
                  {q.author}
                </p>
                <p className="text-xs text-[#888]">{q.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


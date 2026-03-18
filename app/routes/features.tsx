import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  GitCompareArrows,
  Target,
  Clock,
  Bell,
  BarChart3,
  History,
  Check,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { MarketingCTA } from "@/components/marketing/MarketingCTA";
import {
  DiffSlider,
  ElementPicker,
  FrequencySelector,
  AlertEmailMockup,
} from "@/components/marketing/illustrations/FeatureIllustrations";
import { DashboardMockup, ChangeTimeline } from "@/components/marketing/illustrations/DashboardMockup";

export const Route = createFileRoute("/features")({
  component: FeaturesPage,
  head: () => ({
    meta: [
      {
        title:
          "Website Change Monitoring Features — Visual Diffs, Alerts, Scheduling | PagePulse",
      },
      {
        name: "description",
        content:
          "Pixel-level visual diffs, point-and-click zone selection, 5-minute check intervals, email alerts with before/after screenshots, real-time dashboard, and full change history timeline.",
      },
      {
        property: "og:title",
        content: "Website Monitoring Features — Visual Diffs, Alerts & More",
      },
      {
        property: "og:description",
        content:
          "Six powerful tools: visual diff, zone selection, flexible scheduling, smart alerts, live dashboard, and change history.",
      },
      { property: "og:url", content: "https://pagepulse.io/features" },
    ],
  }),
});

/* ─── Bento Grid Feature Cards ─── */

const features = [
  {
    id: "visual-diff",
    title: "Visual Diff",
    headline: "See Exactly What Changed",
    description:
      "Pixel-level screenshot comparison highlights every difference. Drag the slider to compare before and after.",
    icon: GitCompareArrows,
    size: "hero" as const,
  },
  {
    id: "zone-selection",
    title: "Zone Selection",
    headline: "Monitor Only What Matters",
    description:
      "Point-and-click to select any element. Ignore ads, banners, and noise.",
    icon: Target,
    size: "tall" as const,
  },
  {
    id: "scheduling",
    title: "Flexible Scheduling",
    headline: "Check On Your Terms",
    description:
      "From every 5 minutes to weekly. Different intervals per monitor.",
    icon: Clock,
    size: "normal" as const,
  },
  {
    id: "alerts",
    title: "Email Alerts",
    headline: "Changes In Your Inbox",
    description:
      "Before/after screenshots, diff percentage, and direct dashboard link in every alert.",
    icon: Bell,
    size: "wide" as const,
  },
  {
    id: "dashboard",
    title: "Live Dashboard",
    headline: "All Monitors At A Glance",
    description:
      "Live status, change counts, and recent screenshots across every monitor.",
    icon: BarChart3,
    size: "normal" as const,
  },
  {
    id: "history",
    title: "Change History",
    headline: "Full Timeline Of Every Change",
    description:
      "Every change logged with timestamps, diff scores, and visual comparisons.",
    icon: History,
    size: "normal" as const,
  },
];

function FeatureCard({
  feature,
}: {
  feature: (typeof features)[0];
}) {
  const Icon = feature.icon;

  const sizeClasses = {
    hero: "md:col-span-2 md:row-span-2",
    tall: "md:row-span-2",
    wide: "md:col-span-2",
    normal: "",
  };

  return (
    <div
      className={`group border-2 border-[#1a1a1a] bg-[#f0f0e8] hover:shadow-[8px_8px_0px_0px_#1a1a1a] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all overflow-hidden flex flex-col ${sizeClasses[feature.size]}`}
    >
      {/* Illustration area */}
      <div className="flex-1 min-h-[180px] md:min-h-[220px] bg-white border-b-2 border-[#1a1a1a] p-3 md:p-4 flex items-center justify-center overflow-hidden">
        {feature.id === "visual-diff" && <DiffSlider />}
        {feature.id === "zone-selection" && <ElementPicker />}
        {feature.id === "scheduling" && <FrequencySelector />}
        {feature.id === "alerts" && <AlertEmailMockup />}
        {feature.id === "dashboard" && <DashboardMockup monitors={4} />}
        {feature.id === "history" && <ChangeTimeline events={5} />}
      </div>

      {/* Text content */}
      <div className="p-5 md:p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 border-2 border-[#2d5a2d] flex items-center justify-center shrink-0">
            <Icon className="w-4 h-4 text-[#2d5a2d]" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#2d5a2d]">
            {feature.title}
          </span>
        </div>
        <h3 className="text-xl md:text-2xl font-black uppercase tracking-tighter leading-[0.95] mb-2">
          {feature.headline}
        </h3>
        <p className="text-sm text-[#666] leading-relaxed">
          {feature.description}
        </p>
      </div>
    </div>
  );
}

/* ─── How It Works Walkthrough ─── */

const steps = [
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
      "Use our visual element picker to draw a rectangle or click on a specific element. Monitor a price tag, a headline, a button — anything.",
    visual: "zone" as const,
  },
  {
    number: "03",
    label: "Get Alerts",
    headline: "Changes delivered to you",
    description:
      "When something changes, you get an email with before/after screenshots, the exact diff percentage, and a direct link to your dashboard.",
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
        setActiveStep((prev) => (prev + 1) % steps.length);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [activeStep]);

  const step = steps[activeStep];

  return (
    <section className="border-t-2 border-[#1a1a1a] px-6 py-20 md:py-28">
      <div className="max-w-5xl mx-auto">
        <p className="text-xs md:text-sm font-bold uppercase tracking-[0.4em] text-[#666] mb-4 text-center">
          How It Works
        </p>
        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-center mb-12 leading-[0.9]">
          Three Steps.
          <br />
          <span className="text-[#2d5a2d]">Zero Complexity.</span>
        </h2>

        {/* Step tabs */}
        <div className="flex border-2 border-[#1a1a1a] mb-0">
          {steps.map((s, i) => (
            <button
              key={s.number}
              onClick={() => {
                setActiveStep(i);
                setProgress(0);
              }}
              className={`flex-1 py-4 px-4 text-center transition-colors relative ${
                activeStep === i
                  ? "bg-[#1a1a1a] text-[#f0f0e8]"
                  : "bg-[#f0f0e8] text-[#1a1a1a] hover:bg-[#e8e8e0]"
              } ${i > 0 ? "border-l-2 border-[#1a1a1a]" : ""}`}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider block">
                {s.number}
              </span>
              <span className="text-xs md:text-sm font-black uppercase tracking-wider">
                {s.label}
              </span>
              {/* Progress bar */}
              {activeStep === i && (
                <div className="absolute bottom-0 left-0 h-0.5 bg-[#7cb87c] transition-none" style={{ width: `${progress}%` }} />
              )}
            </button>
          ))}
        </div>

        {/* Step content */}
        <div className="border-2 border-t-0 border-[#1a1a1a] bg-white">
          <div className="flex flex-col md:flex-row">
            {/* Text */}
            <div className="flex-1 p-8 md:p-12 flex flex-col justify-center">
              <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tighter mb-4 leading-[0.95]">
                {step.headline}
              </h3>
              <p className="text-[#666] leading-relaxed mb-6">
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

            {/* Visual */}
            <div className="flex-1 p-4 md:p-6 border-t-2 md:border-t-0 md:border-l-2 border-[#1a1a1a] bg-[#f5f5f0] flex items-center justify-center min-h-[280px]">
              {step.visual === "url" && (
                <div className="w-full max-w-sm">
                  <div className="border-2 border-[#1a1a1a] bg-white">
                    <div className="px-4 py-2 bg-[#1a1a1a] text-[9px] font-bold uppercase tracking-wider text-[#f0f0e8]">
                      New Monitor
                    </div>
                    <div className="p-4">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[#888] mb-2">
                        URL to monitor
                      </div>
                      <div className="flex border-2 border-[#1a1a1a]">
                        <div className="flex-1 px-3 py-2 font-mono text-xs text-[#1a1a1a]">
                          competitor.com/pricing
                        </div>
                        <div className="px-3 py-2 bg-[#2d5a2d] text-white text-[10px] font-bold uppercase tracking-wider">
                          Capture
                        </div>
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        <div className="w-2 h-2 bg-[#7cb87c] animate-pulse" />
                        <span className="text-[10px] text-[#2d5a2d] font-bold">
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

/* ─── Social Proof ─── */

function SocialProof() {
  const testimonials = [
    {
      quote:
        "Set it up in 30 seconds and caught a competitor's price change before my team even noticed.",
      author: "Sarah K.",
      role: "Marketing Lead, E-commerce",
    },
    {
      quote:
        "We replaced three manual check processes with PagePulse monitors. Saves us hours every week.",
      author: "David R.",
      role: "Operations Manager, SaaS",
      featured: true,
    },
    {
      quote:
        "The visual diffs are incredibly clear. I always know exactly what changed and when.",
      author: "Lisa M.",
      role: "Product Designer, Agency",
    },
  ];

  return (
    <section className="border-t-2 border-[#1a1a1a] bg-[#1a1a1a] text-[#f0f0e8] px-6 py-20 md:py-24">
      <div className="max-w-5xl mx-auto">
        <p className="text-xs md:text-sm font-bold uppercase tracking-[0.4em] text-[#7cb87c] mb-4 text-center">
          Trusted By Teams
        </p>
        <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-center mb-12 leading-[0.9]">
          What Users Say
        </h2>

        <div className="grid md:grid-cols-3 gap-4">
          {testimonials.map((t) => (
            <div
              key={t.author}
              className={`border-2 p-6 ${
                t.featured
                  ? "border-[#7cb87c] bg-[#1a1a1a]"
                  : "border-[#333]"
              }`}
            >
              <p className="text-sm leading-relaxed opacity-80 mb-6">
                "{t.quote}"
              </p>
              <div>
                <div className="text-xs font-black uppercase tracking-wider">
                  {t.author}
                </div>
                <div className="text-[10px] text-[#a0a0a0]">{t.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Comparison Table ─── */

const comparisonFeatures = [
  { name: "Visual Diff", pagepulse: true, visualping: true, hexowatch: true },
  { name: "Zone Selection", pagepulse: true, visualping: true, hexowatch: false },
  { name: "5-Min Checks (Free)", pagepulse: true, visualping: false, hexowatch: false },
  { name: "Email Alerts", pagepulse: true, visualping: true, hexowatch: true },
  { name: "Webhook / Slack", pagepulse: true, visualping: true, hexowatch: true },
  { name: "Change History", pagepulse: true, visualping: true, hexowatch: true },
  { name: "Free Plan", pagepulse: true, visualping: true, hexowatch: false },
  { name: "No Credit Card Required", pagepulse: true, visualping: true, hexowatch: false },
];

function ComparisonTable() {
  return (
    <section className="border-t-2 border-[#1a1a1a] px-6 py-20 md:py-24">
      <div className="max-w-4xl mx-auto">
        <p className="text-xs md:text-sm font-bold uppercase tracking-[0.4em] text-[#666] mb-4 text-center">
          Feature Comparison
        </p>
        <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-center mb-12 leading-[0.9]">
          How We <span className="text-[#2d5a2d]">Compare</span>
        </h2>

        <div className="border-2 border-[#1a1a1a] overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#1a1a1a] text-[#f0f0e8]">
                <th className="text-left py-4 px-4 md:px-6 text-[10px] md:text-xs font-bold uppercase tracking-wider w-[40%]">
                  Feature
                </th>
                <th className="py-4 px-3 md:px-6 text-[10px] md:text-xs font-bold uppercase tracking-wider text-center bg-[#2d5a2d]">
                  PagePulse
                </th>
                <th className="py-4 px-3 md:px-6 text-[10px] md:text-xs font-bold uppercase tracking-wider text-center">
                  Visualping
                </th>
                <th className="py-4 px-3 md:px-6 text-[10px] md:text-xs font-bold uppercase tracking-wider text-center">
                  Hexowatch
                </th>
              </tr>
            </thead>
            <tbody>
              {comparisonFeatures.map((f, i) => (
                <tr
                  key={f.name}
                  className={`border-t-2 border-[#1a1a1a] ${
                    i % 2 === 0 ? "bg-[#f0f0e8]" : "bg-white"
                  }`}
                >
                  <td className="py-3 px-4 md:px-6 text-xs font-bold uppercase tracking-wider">
                    {f.name}
                  </td>
                  <td className="py-3 px-3 md:px-6 text-center bg-[#2d5a2d]/5">
                    {f.pagepulse ? (
                      <Check className="w-4 h-4 text-[#2d5a2d] mx-auto" />
                    ) : (
                      <X className="w-4 h-4 text-[#ccc] mx-auto" />
                    )}
                  </td>
                  <td className="py-3 px-3 md:px-6 text-center">
                    {f.visualping ? (
                      <Check className="w-4 h-4 text-[#666] mx-auto" />
                    ) : (
                      <X className="w-4 h-4 text-[#ccc] mx-auto" />
                    )}
                  </td>
                  <td className="py-3 px-3 md:px-6 text-center">
                    {f.hexowatch ? (
                      <Check className="w-4 h-4 text-[#666] mx-auto" />
                    ) : (
                      <X className="w-4 h-4 text-[#ccc] mx-auto" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="text-center mt-8">
          <Button asChild size="lg">
            <Link to="/auth/sign-up">
              Start Free — No Credit Card
              <ArrowRight className="ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

/* ─── Main Page ─── */

function FeaturesPage() {
  return (
    <MarketingLayout>
      {/* Hero — Split layout */}
      <section className="px-6 pt-16 pb-12 md:pt-24 md:pb-16">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-10 md:gap-16">
          <div className="flex-1">
            <p className="text-xs md:text-sm font-bold uppercase tracking-[0.4em] text-[#666] mb-4">
              Six Powerful Tools
            </p>
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.9] mb-6">
              Every Change.
              <br />
              <span className="text-[#2d5a2d]">Caught.</span>
            </h1>
            <p className="text-lg text-[#666] max-w-md mb-8">
              Visual diffs, smart alerts, and a live dashboard — everything you
              need to track webpage changes with zero complexity.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg">
                <Link to="/auth/sign-up">
                  Start Free <ArrowRight className="ml-2" />
                </Link>
              </Button>
              <Link
                to="/pricing"
                className="text-sm font-bold uppercase tracking-wider text-[#1a1a1a] hover:text-[#2d5a2d] underline underline-offset-4 transition-colors self-center"
              >
                View Pricing →
              </Link>
            </div>
          </div>

          {/* Hero illustration — mini feature grid */}
          <div className="flex-1 grid grid-cols-3 gap-2 max-w-sm">
            {[
              { icon: GitCompareArrows, label: "Visual Diff" },
              { icon: Target, label: "Zone Select" },
              { icon: Clock, label: "Scheduling" },
              { icon: Bell, label: "Alerts" },
              { icon: BarChart3, label: "Dashboard" },
              { icon: History, label: "History" },
            ].map((item) => (
              <div
                key={item.label}
                className="border-2 border-[#1a1a1a] p-3 md:p-4 flex flex-col items-center gap-2 bg-[#f0f0e8] hover:bg-white transition-colors"
              >
                <item.icon className="w-5 h-5 text-[#2d5a2d]" />
                <span className="text-[8px] md:text-[9px] font-bold uppercase tracking-wider text-center">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-t-2 border-b-2 border-[#1a1a1a] bg-[#1a1a1a] text-[#f0f0e8]">
        <div className="max-w-5xl mx-auto grid grid-cols-4 divide-x-2 divide-[#333]">
          {[
            { value: "< 60s", label: "Setup Time" },
            { value: "5 min", label: "Fastest Check" },
            { value: "100%", label: "Visual Accuracy" },
            { value: "24/7", label: "Monitoring" },
          ].map((stat) => (
            <div key={stat.label} className="py-6 md:py-8 px-3 md:px-6 text-center">
              <div className="text-xl md:text-3xl font-black tracking-tighter text-[#7cb87c]">
                {stat.value}
              </div>
              <div className="text-[8px] md:text-xs uppercase tracking-wider text-[#a0a0a0] mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bento Grid */}
      <section className="border-t-2 border-[#1a1a1a] px-6 py-16 md:py-24">
        <div className="max-w-5xl mx-auto">
          {/* Grid uses gap-[2px] on dark bg to create border effect */}
          <div className="border-2 border-[#1a1a1a] bg-[#1a1a1a]">
            {/* Row 1: Visual Diff hero (wide) + Zone Selection */}
            <div className="grid md:grid-cols-5 gap-[2px]">
              {/* Visual Diff — 3/5 width */}
              <div className="md:col-span-3 bg-[#f0f0e8] flex flex-col">
                <div className="bg-white p-4 h-[240px] md:h-[280px]">
                  <DiffSlider />
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 border-2 border-[#2d5a2d] flex items-center justify-center">
                      <GitCompareArrows className="w-4 h-4 text-[#2d5a2d]" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#2d5a2d]">
                      Visual Diff
                    </span>
                  </div>
                  <h3 className="text-xl md:text-2xl font-black uppercase tracking-tighter leading-[0.95] mb-1">
                    See Exactly What Changed
                  </h3>
                  <p className="text-sm text-[#666]">
                    Pixel-level comparison. Drag the slider to see it in action.
                  </p>
                </div>
              </div>

              {/* Zone Selection — 2/5 width */}
              <div className="md:col-span-2 bg-[#f0f0e8] flex flex-col">
                <div className="bg-white p-3 flex-1 flex items-center justify-center">
                  <ElementPicker />
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 border-2 border-[#2d5a2d] flex items-center justify-center">
                      <Target className="w-4 h-4 text-[#2d5a2d]" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#2d5a2d]">
                      Zone Selection
                    </span>
                  </div>
                  <h3 className="text-xl font-black uppercase tracking-tighter leading-[0.95] mb-1">
                    Monitor Only What Matters
                  </h3>
                  <p className="text-sm text-[#666]">
                    Click any element. Ignore the noise.
                  </p>
                </div>
              </div>
            </div>

            {/* Row 2: Scheduling + Alerts (2 equal cols) */}
            <div className="grid md:grid-cols-2 gap-[2px]">
              <div className="bg-[#f0f0e8] flex flex-col">
                <div className="bg-white p-3 flex items-center justify-center h-[260px]">
                  <div className="w-full max-w-[240px]">
                    <FrequencySelector />
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-7 h-7 border-2 border-[#2d5a2d] flex items-center justify-center">
                      <Clock className="w-3.5 h-3.5 text-[#2d5a2d]" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#2d5a2d]">
                      Scheduling
                    </span>
                  </div>
                  <h3 className="text-lg font-black uppercase tracking-tighter leading-[0.95] mb-1">
                    Check On Your Terms
                  </h3>
                  <p className="text-xs text-[#666]">
                    5 min to weekly. Per-monitor intervals.
                  </p>
                </div>
              </div>

              <div className="bg-[#f0f0e8] flex flex-col">
                <div className="bg-white p-3 flex items-center justify-center h-[260px]">
                  <div className="w-full max-w-[280px]">
                    <AlertEmailMockup />
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-7 h-7 border-2 border-[#2d5a2d] flex items-center justify-center">
                      <Bell className="w-3.5 h-3.5 text-[#2d5a2d]" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#2d5a2d]">
                      Email Alerts
                    </span>
                  </div>
                  <h3 className="text-lg font-black uppercase tracking-tighter leading-[0.95] mb-1">
                    Changes In Your Inbox
                  </h3>
                  <p className="text-xs text-[#666]">
                    Before/after screenshots in every email.
                  </p>
                </div>
              </div>
            </div>

            {/* Row 3: Dashboard + History + CTA (3 cols) */}
            <div className="grid md:grid-cols-3 gap-[2px]">
              <div className="bg-[#f0f0e8] flex flex-col">
                <div className="bg-white p-3 flex items-center justify-center h-[220px]">
                  <div className="w-full max-w-[240px]">
                    <DashboardMockup monitors={4} />
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-7 h-7 border-2 border-[#2d5a2d] flex items-center justify-center">
                      <BarChart3 className="w-3.5 h-3.5 text-[#2d5a2d]" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#2d5a2d]">
                      Dashboard
                    </span>
                  </div>
                  <h3 className="text-lg font-black uppercase tracking-tighter leading-[0.95] mb-1">
                    All Monitors At A Glance
                  </h3>
                  <p className="text-xs text-[#666]">
                    Live status across every monitor.
                  </p>
                </div>
              </div>

              <div className="bg-[#f0f0e8] flex flex-col">
                <div className="bg-white p-3 flex items-center justify-center h-[220px]">
                  <div className="w-full max-w-[200px]">
                    <ChangeTimeline events={5} />
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-7 h-7 border-2 border-[#2d5a2d] flex items-center justify-center">
                      <History className="w-3.5 h-3.5 text-[#2d5a2d]" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#2d5a2d]">
                      History
                    </span>
                  </div>
                  <h3 className="text-lg font-black uppercase tracking-tighter leading-[0.95] mb-1">
                    Full Change Timeline
                  </h3>
                  <p className="text-xs text-[#666]">
                    Every change logged with diffs.
                  </p>
                </div>
              </div>

              <div className="bg-[#2d5a2d] text-[#f0f0e8] flex flex-col items-center justify-center p-8 text-center">
                <div className="text-4xl md:text-5xl font-black tracking-tighter mb-2">6</div>
                <div className="text-xs font-bold uppercase tracking-wider text-[#7cb87c] mb-6">
                  Tools Working Together
                </div>
                <Button
                  asChild
                  size="sm"
                  className="bg-[#f0f0e8] text-[#1a1a1a] hover:bg-white border-2 border-[#f0f0e8]"
                >
                  <Link to="/auth/sign-up">
                    Get Started <ArrowRight className="ml-1 w-3 h-3" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <HowItWorks />

      {/* Social Proof */}
      <SocialProof />

      {/* Comparison Table */}
      <ComparisonTable />

      {/* Final CTA */}
      <MarketingCTA
        subheadline="Ready To Start?"
        headline={"Stop Checking.\nStart Monitoring."}
        description="Set up your first monitor in under 60 seconds. Free to get started, no credit card required."
        showPricing={false}
      />
    </MarketingLayout>
  );
}

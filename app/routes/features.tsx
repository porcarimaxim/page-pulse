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

/* ─── How It Works ─── */

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
    <section className="px-6 py-16 md:py-20">
      <div className="max-w-5xl mx-auto">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#666] mb-3 text-center">
          How It Works
        </p>
        <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-center mb-10 leading-[1.1]">
          Three Steps. <span className="text-[#2d5a2d]">Zero Complexity.</span>
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
              className={`flex-1 py-3 px-4 text-center transition-colors relative ${
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
              {activeStep === i && (
                <div
                  className="absolute bottom-0 left-0 h-0.5 bg-[#7cb87c] transition-none"
                  style={{ width: `${progress}%` }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Step content */}
        <div className="border-2 border-t-0 border-[#1a1a1a] bg-white">
          <div className="flex flex-col md:flex-row">
            <div className="flex-1 p-6 md:p-10 flex flex-col justify-center">
              <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tighter mb-3 leading-[1.1]">
                {step.headline}
              </h3>
              <p className="text-[#666] leading-relaxed mb-5 text-sm">
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
            <div className="flex-1 p-4 md:p-6 border-t-2 md:border-t-0 md:border-l-2 border-[#1a1a1a] bg-[#f5f5f0] flex items-center justify-center min-h-[240px]">
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
    <section className="border-t-2 border-[#1a1a1a] bg-[#1a1a1a] text-[#f0f0e8] px-6 py-16 md:py-20">
      <div className="max-w-5xl mx-auto">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#7cb87c] mb-3 text-center">
          Trusted By Teams
        </p>
        <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-center mb-10 leading-[1.1]">
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
    <section className="px-6 py-16 md:py-20">
      <div className="max-w-4xl mx-auto">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#666] mb-3 text-center">
          Feature Comparison
        </p>
        <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-center mb-10 leading-[1.1]">
          How We <span className="text-[#2d5a2d]">Compare</span>
        </h2>

        <div className="border-2 border-[#1a1a1a] overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#1a1a1a] text-[#f0f0e8]">
                <th className="text-left py-3 px-4 md:px-6 text-[10px] md:text-xs font-bold uppercase tracking-wider w-[40%]">
                  Feature
                </th>
                <th className="py-3 px-3 md:px-6 text-[10px] md:text-xs font-bold uppercase tracking-wider text-center bg-[#2d5a2d]">
                  PagePulse
                </th>
                <th className="py-3 px-3 md:px-6 text-[10px] md:text-xs font-bold uppercase tracking-wider text-center">
                  Visualping
                </th>
                <th className="py-3 px-3 md:px-6 text-[10px] md:text-xs font-bold uppercase tracking-wider text-center">
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

/* ─── Feature Section (alternating left/right) ─── */

interface FeatureBlockProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  headline: string;
  description: string;
  bullets: string[];
  illustration: React.ReactNode;
  reversed?: boolean;
  dark?: boolean;
}

function FeatureBlock({ icon: Icon, label, headline, description, bullets, illustration, reversed, dark }: FeatureBlockProps) {
  return (
    <section className={`px-6 py-10 md:py-16 ${dark ? "bg-[#1a1a1a] text-[#f0f0e8]" : ""} ${!dark ? "border-t-2 border-[#1a1a1a]" : ""}`}>
      <div className={`max-w-5xl mx-auto flex flex-col ${reversed ? "md:flex-row-reverse" : "md:flex-row"} items-center gap-10 md:gap-14`}>
        {/* Text side */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-8 h-8 border-2 ${dark ? "border-[#7cb87c]" : "border-[#2d5a2d]"} flex items-center justify-center`}>
              <Icon className={`w-4 h-4 ${dark ? "text-[#7cb87c]" : "text-[#2d5a2d]"}`} />
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${dark ? "text-[#7cb87c]" : "text-[#2d5a2d]"}`}>
              {label}
            </span>
          </div>
          <h3 className="text-2xl md:text-4xl font-black uppercase tracking-tighter leading-[1.1] mb-4">
            {headline}
          </h3>
          <p className={`text-sm leading-relaxed mb-5 ${dark ? "text-[#a0a0a0]" : "text-[#666]"}`}>
            {description}
          </p>
          <ul className="space-y-2 mb-6">
            {bullets.map((b) => (
              <li key={b} className="flex items-start gap-2 text-sm">
                <Check className={`w-4 h-4 shrink-0 mt-0.5 ${dark ? "text-[#7cb87c]" : "text-[#2d5a2d]"}`} />
                <span className={dark ? "text-[#ccc]" : ""}>{b}</span>
              </li>
            ))}
          </ul>
          <Button asChild size="sm">
            <Link to="/auth/sign-up">
              Start Free <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
        </div>

        {/* Illustration side */}
        <div className={`flex-1 w-full border-2 ${dark ? "border-[#333] bg-[#222]" : "border-[#1a1a1a] bg-white"} p-4 md:p-6`}>
          {illustration}
        </div>
      </div>
    </section>
  );
}

/* ─── Main Page ─── */

function FeaturesPage() {
  return (
    <MarketingLayout>
      {/* Hero */}
      <section className="px-6 pt-14 pb-10 md:pt-20 md:pb-14">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#666] mb-3">
            Six Powerful Tools
          </p>
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[1.1] mb-5">
            Every Change.<br />
            <span className="text-[#2d5a2d]">Caught.</span>
          </h1>
          <p className="text-lg text-[#666] max-w-lg mx-auto mb-8">
            Visual diffs, smart alerts, and a live dashboard — everything you
            need to track webpage changes with zero complexity.
          </p>
          <div className="flex justify-center gap-4">
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
            <div key={stat.label} className="py-5 md:py-6 px-3 md:px-6 text-center">
              <div className="text-xl md:text-2xl font-black tracking-tighter text-[#7cb87c]">
                {stat.value}
              </div>
              <div className="text-[8px] md:text-[10px] uppercase tracking-wider text-[#a0a0a0] mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Feature 1: Visual Diff (hero feature) */}
      <FeatureBlock
        icon={GitCompareArrows}
        label="Visual Diff"
        headline="See Exactly What Changed"
        description="Pixel-level screenshot comparison highlights every difference. Drag the slider to compare before and after — no more guessing."
        bullets={[
          "Side-by-side before/after comparison",
          "Highlighted change regions",
          "Percentage-based diff scoring",
        ]}
        illustration={<DiffSlider />}
      />

      {/* Feature 2: Zone Selection */}
      <FeatureBlock
        icon={Target}
        label="Zone Selection"
        headline="Monitor Only What Matters"
        description="Point-and-click to select any element on the page. Ignore ads, cookie banners, and dynamic noise — focus on the content that matters."
        bullets={[
          "Visual element picker",
          "CSS selector support",
          "Ignore dynamic elements",
        ]}
        illustration={<ElementPicker />}
        reversed
        dark
      />

      {/* Feature 3: Scheduling */}
      <FeatureBlock
        icon={Clock}
        label="Flexible Scheduling"
        headline="Check On Your Terms"
        description="From every 5 minutes to weekly — set different intervals per monitor based on how critical each page is."
        bullets={[
          "5-minute to weekly intervals",
          "Per-monitor scheduling",
          "Time-zone aware checks",
        ]}
        illustration={<FrequencySelector />}
      />

      {/* Feature 4: Email Alerts */}
      <FeatureBlock
        icon={Bell}
        label="Email Alerts"
        headline="Changes In Your Inbox"
        description="Every alert includes before/after screenshots, the exact diff percentage, and a direct link to your dashboard."
        bullets={[
          "Before/after screenshots in email",
          "Diff percentage and summary",
          "Direct dashboard link",
        ]}
        illustration={<AlertEmailMockup />}
        reversed
        dark
      />

      {/* Feature 5: Dashboard */}
      <FeatureBlock
        icon={BarChart3}
        label="Live Dashboard"
        headline="All Monitors At A Glance"
        description="Live status, change counts, and recent screenshots across every monitor — all in one clean interface."
        bullets={[
          "Real-time monitor status",
          "Change count tracking",
          "Recent screenshot previews",
        ]}
        illustration={<DashboardMockup monitors={4} />}
      />

      {/* Feature 6: History */}
      <FeatureBlock
        icon={History}
        label="Change History"
        headline="Full Timeline Of Every Change"
        description="Every change logged with timestamps, diff scores, and visual comparisons. Go back and see exactly what happened and when."
        bullets={[
          "Timestamped change log",
          "Visual diff for each change",
          "Export and share history",
        ]}
        illustration={<ChangeTimeline events={5} />}
        reversed
        dark
      />

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

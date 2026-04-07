import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Check,
  X,
  Minus,
  Zap,
  DollarSign,
  Clock,
  Eye,
  Shield,
  Users,
  Code,
  Gauge,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { MarketingCTA } from "@/components/marketing/MarketingCTA";

export const Route = createFileRoute("/compare/visualping-alternative")({
  component: VisualPingAlternativePage,
  head: () => ({
    meta: [
      {
        title:
          "Best Visualping Alternative (2026) — PagePulse vs Visualping Comparison",
      },
      {
        name: "description",
        content:
          "Looking for a Visualping alternative? Compare PagePulse vs Visualping side-by-side: pricing, features, speed, and ease of use. Free forever plan available.",
      },
      {
        property: "og:title",
        content: "PagePulse vs Visualping — Best Alternative for 2026",
      },
      {
        property: "og:description",
        content:
          "Side-by-side comparison of PagePulse and Visualping. See why teams are switching to PagePulse for website change monitoring.",
      },
      {
        property: "og:url",
        content: "https://pagepulse.io/compare/visualping-alternative",
      },
    ],
  }),
});

const comparisonRows = [
  {
    feature: "Free plan",
    pagepulse: "5 monitors, daily checks",
    visualping: "Limited (65 checks/mo)",
    winner: "pagepulse",
  },
  {
    feature: "Setup time",
    pagepulse: "Under 60 seconds",
    visualping: "2-3 minutes",
    winner: "pagepulse",
  },
  {
    feature: "Visual diff quality",
    pagepulse: "Pixel-level overlays",
    visualping: "Pixel-level overlays",
    winner: "tie",
  },
  {
    feature: "Zone selection",
    pagepulse: "Point-and-click element picker",
    visualping: "Draw rectangle on page",
    winner: "pagepulse",
  },
  {
    feature: "Fastest check interval",
    pagepulse: "Every 5 minutes",
    visualping: "Every 5 minutes",
    winner: "tie",
  },
  {
    feature: "Email alerts",
    pagepulse: "Before/after screenshots included",
    visualping: "Before/after screenshots included",
    winner: "tie",
  },
  {
    feature: "Change history",
    pagepulse: "Up to 1 year (Business)",
    visualping: "Varies by plan",
    winner: "tie",
  },
  {
    feature: "Pro plan price",
    pagepulse: "$19/mo (50 monitors)",
    visualping: "$50/mo (Personal)",
    winner: "pagepulse",
  },
  {
    feature: "Business plan price",
    pagepulse: "$49/mo (unlimited monitors)",
    visualping: "$100/mo (Business)",
    winner: "pagepulse",
  },
  {
    feature: "API access",
    pagepulse: "Business plan",
    visualping: "Business plan",
    winner: "tie",
  },
  {
    feature: "Chrome extension",
    pagepulse: "Coming soon",
    visualping: "Available",
    winner: "visualping",
  },
  {
    feature: "AI-powered analysis",
    pagepulse: "Coming soon",
    visualping: "Available (Solutions tier)",
    winner: "visualping",
  },
  {
    feature: "Team collaboration",
    pagepulse: "Business plan",
    visualping: "Business plan",
    winner: "tie",
  },
  {
    feature: "Webhook integrations",
    pagepulse: "Pro plan and above",
    visualping: "Business plan only",
    winner: "pagepulse",
  },
  {
    feature: "UI / Design",
    pagepulse: "Clean, minimal, fast",
    visualping: "Feature-rich, complex",
    winner: "tie",
  },
];

const whySwitchReasons = [
  {
    icon: DollarSign,
    title: "Save 50%+ on Monitoring",
    description:
      "PagePulse Pro starts at $19/mo for 50 monitors. Visualping charges $50/mo for their Personal plan with fewer features. Business plans are $49/mo vs $100/mo.",
  },
  {
    icon: Clock,
    title: "Set Up in 60 Seconds",
    description:
      "Paste a URL, pick what to watch, set your schedule. No tutorials needed, no onboarding calls required. Monitoring starts immediately.",
  },
  {
    icon: Eye,
    title: "Clearer Visual Diffs",
    description:
      "Pixel-level screenshot comparison with highlighted overlays. Every change is visible at a glance in your email alerts and dashboard.",
  },
  {
    icon: Gauge,
    title: "Faster, Simpler Dashboard",
    description:
      "A clean, no-clutter interface that shows you exactly what changed and when. No enterprise complexity when you just need to monitor a few pages.",
  },
  {
    icon: Zap,
    title: "Generous Free Tier",
    description:
      "5 monitors with daily checks, free forever. No credit card required. Visualping limits free users to 65 checks per month total.",
  },
  {
    icon: Code,
    title: "Developer-Friendly",
    description:
      "Webhook integrations from the Pro plan, full API on Business. Build custom workflows around your monitoring data.",
  },
];

const faqs = [
  {
    q: "Can I migrate my monitors from Visualping to PagePulse?",
    a: "Yes. Simply set up the same URLs in PagePulse and select the same zones you were monitoring. The whole process takes about 30 seconds per monitor. We're also building a one-click import tool.",
  },
  {
    q: "Does PagePulse have the same monitoring quality as Visualping?",
    a: "PagePulse uses pixel-level screenshot comparison, the same core technology. You get before/after visual diffs, zone selection, and flexible scheduling just like Visualping.",
  },
  {
    q: "What about Visualping's AI features?",
    a: "Visualping offers AI-powered change analysis on their Solutions tier ($3,000+/yr). We're building AI features for our Business plan at a fraction of that cost. For most users, visual diffs are more than enough.",
  },
  {
    q: "Is PagePulse suitable for enterprise teams?",
    a: "Our Business plan supports unlimited monitors, team collaboration, full API access, and priority support. For enterprise needs beyond this, reach out and we'll build a custom plan.",
  },
  {
    q: "What if I need a Chrome extension?",
    a: "Our Chrome extension is currently in development. In the meantime, setting up monitors through our web dashboard takes under 60 seconds per page.",
  },
];

function VisualPingAlternativePage() {
  return (
    <MarketingLayout>
      {/* Hero */}
      <section className="px-6 pt-16 pb-20 md:pt-24 md:pb-28 max-w-4xl mx-auto text-center">
        <p className="text-xs md:text-sm font-bold uppercase tracking-[0.4em] text-gray-500 mb-6">
          PagePulse vs Visualping
        </p>
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold leading-[1.1] mb-6">
          The Best
          <br />
          <span className="text-emerald-600">Visualping</span>
          <br />
          Alternative
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-10">
          Same powerful website change monitoring at half the price. Faster
          setup, cleaner interface, and a generous free tier. See how PagePulse
          compares.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg">
            <Link to="/auth/sign-up">
              Try PagePulse Free <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/pricing">View Pricing</Link>
          </Button>
        </div>
      </section>

      {/* Quick Comparison Banner */}
      <section className="border-t border-b border-gray-200 bg-gray-900 text-white">
        <div className="max-w-5xl mx-auto grid grid-cols-3 divide-x divide-gray-700">
          {[
            { value: "50%", label: "Lower Price" },
            { value: "< 60s", label: "Setup Time" },
            { value: "Free", label: "Forever Plan" },
          ].map((stat) => (
            <div key={stat.label} className="py-8 px-6 text-center">
              <div className="text-2xl md:text-4xl font-bold tracking-tighter text-emerald-400">
                {stat.value}
              </div>
              <div className="text-xs uppercase tracking-wider text-gray-500 mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Why Switch */}
      <section className="px-6 py-20 md:py-28">
        <div className="max-w-5xl mx-auto">
          <p className="text-sm font-bold uppercase tracking-[0.4em] text-gray-500 mb-4 text-center">
            Why Teams Switch
          </p>
          <h2 className="text-3xl md:text-5xl font-bold mb-16 text-center">
            6 Reasons To Choose PagePulse
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {whySwitchReasons.map((reason) => (
              <div
                key={reason.title}
                className="border border-gray-200 p-6 shadow-md hover:shadow-lg transition-all rounded-xl"
              >
                <div className="w-10 h-10 border border-emerald-600 flex items-center justify-center mb-4">
                  <reason.icon className="w-5 h-5 text-emerald-600" />
                </div>
                <h3 className="font-bold text-sm  mb-2">
                  {reason.title}
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {reason.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature-by-Feature Comparison Table */}
      <section className="border-t border-gray-200 bg-gray-900 text-white px-6 py-20 md:py-28">
        <div className="max-w-4xl mx-auto">
          <p className="text-sm font-bold uppercase tracking-[0.4em] text-emerald-400 mb-4 text-center">
            Side-By-Side
          </p>
          <h2 className="text-3xl md:text-5xl font-bold mb-16 text-center">
            Feature Comparison
          </h2>

          <div className="border border-gray-700 overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-[1.2fr_1fr_1fr] border-b border-gray-700 bg-gray-800">
              <div className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                Feature
              </div>
              <div className="p-4 text-xs font-bold uppercase tracking-wider text-emerald-400 border-l border-gray-700">
                PagePulse
              </div>
              <div className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500 border-l border-gray-700">
                Visualping
              </div>
            </div>

            {/* Rows */}
            {comparisonRows.map((row, i) => (
              <div
                key={row.feature}
                className={`grid grid-cols-[1.2fr_1fr_1fr] ${
                  i < comparisonRows.length - 1 ? "border-b border-gray-700" : ""
                }`}
              >
                <div className="p-4 text-sm font-bold">{row.feature}</div>
                <div
                  className={`p-4 text-xs leading-relaxed border-l border-gray-700 ${
                    row.winner === "pagepulse"
                      ? "text-emerald-400"
                      : "opacity-70"
                  }`}
                >
                  {row.pagepulse}
                </div>
                <div
                  className={`p-4 text-xs leading-relaxed border-l border-gray-700 ${
                    row.winner === "visualping"
                      ? "text-emerald-400"
                      : "opacity-70"
                  }`}
                >
                  {row.visualping}
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-gray-500 mt-6">
            Comparison based on publicly available information as of March 2026.
          </p>
        </div>
      </section>

      {/* Pricing Comparison */}
      <section className="px-6 py-20 md:py-28">
        <div className="max-w-5xl mx-auto">
          <p className="text-sm font-bold uppercase tracking-[0.4em] text-gray-500 mb-4 text-center">
            Pricing Comparison
          </p>
          <h2 className="text-3xl md:text-5xl font-bold mb-16 text-center">
            Half The Price,
            <br />
            Same Power
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {/* PagePulse */}
            <div className="border border-emerald-600 p-8 shadow-lg rounded-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-emerald-600 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-xl ">
                    PagePulse
                  </h3>
                  <p className="text-xs text-gray-500">
                    Simple, transparent pricing
                  </p>
                </div>
              </div>
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                  <span className="text-sm font-bold">Free</span>
                  <span className="font-bold text-xl">$0</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                  <span className="text-sm font-bold">Pro (50 monitors)</span>
                  <span className="font-bold text-xl">$19/mo</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold">
                    Business (unlimited)
                  </span>
                  <span className="font-bold text-xl">$49/mo</span>
                </div>
              </div>
              <Button asChild className="w-full">
                <Link to="/auth/sign-up">
                  Start Free <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </div>

            {/* Visualping */}
            <div className="border border-gray-200 p-8 opacity-75">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gray-500 flex items-center justify-center">
                  <Eye className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-xl ">
                    Visualping
                  </h3>
                  <p className="text-xs text-gray-500">
                    Higher cost at every tier
                  </p>
                </div>
              </div>
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                  <span className="text-sm font-bold">Free</span>
                  <span className="font-bold text-xl text-gray-500">
                    Limited
                  </span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                  <span className="text-sm font-bold">Personal</span>
                  <span className="font-bold text-xl text-gray-500">
                    $50/mo
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold">Business</span>
                  <span className="font-bold text-xl text-gray-500">
                    $100/mo
                  </span>
                </div>
              </div>
              <div className="h-11 bg-gray-100 flex items-center justify-center text-sm text-gray-500 font-bold uppercase tracking-wider">
                2x+ more expensive
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-gray-200 bg-gray-900 text-white px-6 py-20 md:py-28">
        <div className="max-w-3xl mx-auto">
          <p className="text-sm font-bold uppercase tracking-[0.4em] text-emerald-400 mb-4 text-center">
            Questions
          </p>
          <h2 className="text-3xl md:text-5xl font-bold mb-16 text-center">
            Switching FAQ
          </h2>

          <div className="space-y-0">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="border-t border-gray-700 py-6 grid md:grid-cols-[1fr_1.5fr] gap-4"
              >
                <h3 className="font-bold text-sm ">
                  {faq.q}
                </h3>
                <p className="text-sm opacity-70 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="px-6 py-16 md:py-20">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-lg md:text-2xl font-bold tracking-tight mb-4 leading-snug">
            "We replaced a $2,000/month competitive intelligence subscription
            with PagePulse. Better data, and we choose exactly what to track."
          </p>
          <p className="text-sm text-gray-500">
            Rachel Torres, VP of Strategy at a SaaS Company
          </p>
        </div>
      </section>

      <MarketingCTA
        subheadline="Ready To Switch?"
        headline={"Better Monitoring.\nHalf The Price."}
        description="Set up your first monitor in under 60 seconds. Free forever — no credit card required."
      />
    </MarketingLayout>
  );
}

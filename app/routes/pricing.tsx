import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Check,
  X,
  Zap,
  Building2,
  Rocket,
  Sparkles,
  Plus,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { MarketingCTA } from "@/components/marketing/MarketingCTA";
import { useState, Component, type ReactNode, type ErrorInfo } from "react";
import { SignedIn, SignedOut, PricingTable } from "@clerk/tanstack-react-start";

class BillingErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: Error) {
    console.warn("Billing component error:", error.message);
  }
  render() {
    if (this.state.hasError) return null; // silently hide if billing not enabled
    return this.props.children;
  }
}

export const Route = createFileRoute("/pricing")({
  component: PricingPage,
  head: () => ({
    meta: [
      { title: "Pricing & Plans — Free Website Monitoring | PagePulse" },
      {
        name: "description",
        content:
          "Start monitoring websites free with 500 checks/month. Pro from $8/mo with 10,000 checks. Business from $50/mo with 50,000 checks. Buy credit packs anytime — never lose a check.",
      },
      {
        property: "og:title",
        content: "Pricing & Plans — Free Website Monitoring | PagePulse",
      },
      {
        property: "og:url",
        content: "https://pagepulse.io/pricing",
      },
    ],
  }),
});

/* ─── Data ─── */

const plans = [
  {
    name: "Free",
    icon: Zap,
    description: "Get started with basic monitoring. No credit card required.",
    monthlyPrice: 0,
    yearlyPrice: 0,
    checks: "500",
    monitors: "5",
    frequency: "Daily",
    highlighted: false,
    cta: "Get Started",
    features: [
      { text: "500 checks / month", included: true },
      { text: "5 monitors", included: true },
      { text: "Daily checks", included: true },
      { text: "Visual diff comparison", included: true },
      { text: "Email alerts", included: true },
      { text: "7-day history", included: true },
      { text: "AI summaries", included: false },
      { text: "5-minute checks", included: false },
      { text: "Webhooks / Slack", included: false },
      { text: "API access", included: false },
    ],
  },
  {
    name: "Pro",
    icon: Rocket,
    description: "For professionals tracking competitors and critical pages.",
    monthlyPrice: 10,
    yearlyPrice: 96,
    checks: "10,000",
    monitors: "50",
    frequency: "5 min",
    highlighted: true,
    cta: "Start Pro Trial",
    features: [
      { text: "10,000 checks / month", included: true },
      { text: "50 monitors", included: true },
      { text: "5-minute checks", included: true },
      { text: "Visual diff comparison", included: true },
      { text: "Email alerts", included: true },
      { text: "90-day history", included: true },
      { text: "AI summaries", included: true },
      { text: "Keyword alerts", included: true },
      { text: "Webhooks / Slack", included: true },
      { text: "API access", included: false },
    ],
  },
  {
    name: "Business",
    icon: Building2,
    description: "For teams that need scale, integrations, and full control.",
    monthlyPrice: 60,
    yearlyPrice: 600,
    checks: "50,000",
    monitors: "Unlimited",
    frequency: "5 min",
    highlighted: false,
    cta: "Start Business Trial",
    features: [
      { text: "50,000 checks / month", included: true },
      { text: "Unlimited monitors", included: true },
      { text: "5-minute checks", included: true },
      { text: "Visual diff comparison", included: true },
      { text: "Email alerts", included: true },
      { text: "1-year history", included: true },
      { text: "AI summaries", included: true },
      { text: "Keyword alerts", included: true },
      { text: "Webhooks / Slack", included: true },
      { text: "Full API access", included: true },
    ],
  },
];

const creditPacks = [
  { checks: "1,000", price: 10, perCheck: "0.010" },
  { checks: "5,000", price: 40, perCheck: "0.008", popular: true },
  { checks: "20,000", price: 120, perCheck: "0.006" },
  { checks: "100,000", price: 500, perCheck: "0.005" },
];

const faqs = [
  {
    q: "What counts as a 'check'?",
    a: "A check is one screenshot capture of a monitored page. If you monitor 5 pages every hour, that's 120 checks per day (5 pages x 24 hours).",
  },
  {
    q: "What happens when I run out of monthly checks?",
    a: "Monitoring pauses until your monthly checks reset, or you can buy a credit pack instantly. Credit packs never expire and are used only when your monthly quota runs out.",
  },
  {
    q: "Do credit packs expire?",
    a: "No. Credit packs are one-time purchases that stay in your account until used. They carry over month to month indefinitely.",
  },
  {
    q: "Can I change plans later?",
    a: "Yes, upgrade or downgrade anytime. Changes take effect immediately and we prorate your billing. Unused credits carry over.",
  },
  {
    q: "What is BYOK for AI summaries?",
    a: "Bring Your Own Key — you add your own Claude API key in settings. AI summaries are generated using your key, so you control the cost directly with Anthropic. Works on all plans.",
  },
  {
    q: "Is there a free trial for paid plans?",
    a: "Yes, all paid plans include a 14-day free trial. No credit card required to start.",
  },
];

/* ─── Page ─── */

function PricingPage() {
  const [annual, setAnnual] = useState(true);

  return (
    <MarketingLayout>
      {/* Hero */}
      <section className="px-6 pt-12 pb-8 md:pt-16 md:pb-10 max-w-4xl mx-auto text-center">
        <p className="text-xs md:text-sm font-bold uppercase tracking-[0.4em] text-gray-500 mb-4">
          Simple, Transparent Pricing
        </p>
        <h1 className="text-5xl md:text-7xl font-bold leading-[1.1] mb-4">
          Plans That
          <br />
          <span className="text-emerald-600">Scale</span>
        </h1>
        <p className="text-base text-gray-500 max-w-xl mx-auto mb-6">
          Monthly checks included in every plan. Need more? Buy credit packs
          on demand — they never expire.
        </p>

        {/* Annual/Monthly Toggle */}
        <div className="flex flex-col items-center gap-2">
          <div className="inline-flex border border-gray-200 rounded-lg">
            <button
              onClick={() => setAnnual(false)}
              className={`px-6 py-3 text-sm font-bold uppercase tracking-wider transition-colors rounded-l-lg ${
                !annual
                  ? "bg-gray-900 text-white"
                  : "bg-transparent text-gray-500 hover:text-gray-900"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-6 py-3 text-sm font-bold uppercase tracking-wider transition-colors border-l border-gray-200 rounded-r-lg ${
                annual
                  ? "bg-gray-900 text-white"
                  : "bg-transparent text-gray-500 hover:text-gray-900"
              }`}
            >
              Annual
            </button>
          </div>
          <span
            className={`text-xs font-bold uppercase tracking-wider transition-opacity duration-200 ${
              annual ? "text-emerald-600 opacity-100" : "opacity-0"
            }`}
          >
            Save 2 months — best value
          </span>
        </div>
      </section>

      {/* Static plan cards (visible to everyone, primary for signed-out) */}
      <section className="px-6 pb-16">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const price = plan.monthlyPrice;
            const period = annual ? "/mo/yr" : "/mo";
            const h = plan.highlighted;

            return (
              <div
                key={plan.name}
                className={`border border-gray-200 flex flex-col rounded-xl ${
                  h
                    ? "bg-gray-900 text-white shadow-lg relative"
                    : "bg-white shadow-md"
                }`}
              >
                {h && (
                  <div className="absolute -top-4 left-6 bg-emerald-600 text-white px-4 py-1 text-xs font-bold uppercase tracking-wider rounded-full">
                    Most Popular
                  </div>
                )}

                <div className="p-8 pb-0">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className={`w-9 h-9 border flex items-center justify-center rounded-lg ${
                        h ? "border-emerald-400" : "border-emerald-600"
                      }`}
                    >
                      <plan.icon
                        className={`w-4 h-4 ${
                          h ? "text-emerald-400" : "text-emerald-600"
                        }`}
                      />
                    </div>
                    <h3 className="text-xl font-bold">
                      {plan.name}
                    </h3>
                  </div>

                  <p
                    className={`text-sm mb-6 ${
                      h ? "opacity-70" : "text-gray-500"
                    }`}
                  >
                    {plan.description}
                  </p>

                  {/* Price */}
                  <div className="mb-2">
                    <span className="text-5xl font-bold">
                      ${price}
                    </span>
                    {price > 0 && (
                      <span className={`text-sm ${h ? "opacity-60" : "text-gray-500"}`}>
                        {period}
                      </span>
                    )}
                    {price === 0 && (
                      <span className={`text-sm ml-2 ${h ? "opacity-60" : "text-gray-500"}`}>
                        forever
                      </span>
                    )}
                  </div>

                  {/* Key metrics row */}
                  <div
                    className={`grid grid-cols-3 gap-2 py-4 mb-4 border-y ${
                      h ? "border-gray-700" : "border-gray-200"
                    }`}
                  >
                    <div>
                      <p className="text-lg font-bold">
                        {plan.checks}
                      </p>
                      <p
                        className={`text-xs uppercase tracking-wider ${
                          h ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        Checks/mo
                      </p>
                    </div>
                    <div>
                      <p className="text-lg font-bold">
                        {plan.monitors}
                      </p>
                      <p
                        className={`text-xs uppercase tracking-wider ${
                          h ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        Monitors
                      </p>
                    </div>
                    <div>
                      <p className="text-lg font-bold">
                        {plan.frequency}
                      </p>
                      <p
                        className={`text-xs uppercase tracking-wider ${
                          h ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        Fastest
                      </p>
                    </div>
                  </div>

                  <Button
                    asChild
                    className={`w-full ${
                      h
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600"
                        : ""
                    }`}
                  >
                    <Link to="/auth/sign-up">
                      {plan.cta} <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                  </Button>
                </div>

                {/* Features */}
                <div className="p-8 pt-6 space-y-2.5 flex-1">
                  {plan.features.map((f) => (
                    <div key={f.text} className="flex items-center gap-2.5">
                      {f.included ? (
                        <Check
                          className={`w-3.5 h-3.5 shrink-0 ${
                            h ? "text-emerald-400" : "text-emerald-600"
                          }`}
                        />
                      ) : (
                        <X className="w-3.5 h-3.5 shrink-0 text-gray-500 opacity-40" />
                      )}
                      <span
                        className={`text-xs ${
                          f.included
                            ? ""
                            : h
                              ? "opacity-30"
                              : "text-gray-300"
                        }`}
                      >
                        {f.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Credit Packs */}
      <section className="border-t border-gray-200 px-6 py-20 md:py-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="w-8 h-8 border border-emerald-600 flex items-center justify-center rounded-lg">
                <CreditCard className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-gray-500">
                Need More Checks?
              </p>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold leading-[1.1] mb-4">
              Credit Packs
            </h2>
            <p className="text-base text-gray-500 max-w-lg mx-auto">
              Buy extra checks anytime. Credits never expire and are used
              automatically when your monthly quota runs out. Available on any
              plan.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {creditPacks.map((pack) => (
              <div
                key={pack.checks}
                className={`border border-gray-200 p-6 flex flex-col rounded-xl ${
                  pack.popular
                    ? "shadow-lg ring-2 ring-emerald-600 relative"
                    : "shadow-md"
                }`}
              >
                {pack.popular && (
                  <div className="absolute -top-3 right-4 bg-emerald-600 text-white px-3 py-0.5 text-xs font-bold uppercase tracking-wider rounded-full">
                    Best Value
                  </div>
                )}
                <p className="text-3xl font-bold mb-1">
                  {pack.checks}
                </p>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4">
                  Checks
                </p>
                <div className="mt-auto">
                  <p className="text-2xl font-bold">
                    ${pack.price}
                  </p>
                  <p className="text-xs text-gray-500 mb-4">
                    ${pack.perCheck} per check
                  </p>
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link to="/auth/sign-up">
                      Buy Pack <Plus className="ml-1 w-3 h-3" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* How credits work */}
          <div className="mt-12 border border-gray-200 bg-gray-900 text-white p-8 rounded-xl">
            <h3 className="text-sm font-bold mb-4">
              How Credits Work
            </h3>
            <div className="grid sm:grid-cols-3 gap-6">
              <div>
                <div className="text-2xl font-bold text-emerald-400 mb-1">01</div>
                <p className="text-xs leading-relaxed text-gray-400">
                  Your monthly plan checks are used first. As long as you have
                  quota, credits stay untouched.
                </p>
              </div>
              <div>
                <div className="text-2xl font-bold text-emerald-400 mb-1">02</div>
                <p className="text-xs leading-relaxed text-gray-400">
                  When monthly checks run out, credit packs kick in
                  automatically. No interruption to monitoring.
                </p>
              </div>
              <div>
                <div className="text-2xl font-bold text-emerald-400 mb-1">03</div>
                <p className="text-xs leading-relaxed text-gray-400">
                  Credits never expire. Buy once, use whenever. Monthly quota
                  resets on your billing date.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-gray-200 bg-gray-900 text-white px-6 py-24">
        <div className="max-w-3xl mx-auto">
          <p className="text-sm font-bold uppercase tracking-[0.4em] text-emerald-400 mb-4 text-center">
            Questions?
          </p>
          <h2 className="text-4xl md:text-5xl font-bold mb-16 text-center">
            FAQ
          </h2>

          <div className="space-y-0">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="border-t border-gray-700 py-6 grid md:grid-cols-[1fr_1.5fr] gap-4"
              >
                <h3 className="font-bold text-sm">
                  {faq.q}
                </h3>
                <p className="text-sm opacity-70 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <MarketingCTA
        headline="Start Monitoring Free"
        description="500 checks per month, no credit card required. Upgrade or buy credits anytime."
        showPricing={false}
      />
    </MarketingLayout>
  );
}

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
        <p className="text-xs md:text-sm font-bold uppercase tracking-[0.4em] text-[#666] mb-4">
          Simple, Transparent Pricing
        </p>
        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[1.1] mb-4">
          Plans That
          <br />
          <span className="text-[#2d5a2d]">Scale</span>
        </h1>
        <p className="text-base text-[#666] max-w-xl mx-auto mb-6">
          Monthly checks included in every plan. Need more? Buy credit packs
          on demand — they never expire.
        </p>

        {/* Annual/Monthly Toggle */}
        <div className="flex flex-col items-center gap-2">
          <div className="inline-flex border-2 border-[#1a1a1a]">
            <button
              onClick={() => setAnnual(false)}
              className={`px-6 py-3 text-sm font-bold uppercase tracking-wider transition-colors ${
                !annual
                  ? "bg-[#1a1a1a] text-[#f0f0e8]"
                  : "bg-transparent text-[#666] hover:text-[#1a1a1a]"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-6 py-3 text-sm font-bold uppercase tracking-wider transition-colors border-l-2 border-[#1a1a1a] ${
                annual
                  ? "bg-[#1a1a1a] text-[#f0f0e8]"
                  : "bg-transparent text-[#666] hover:text-[#1a1a1a]"
              }`}
            >
              Annual
            </button>
          </div>
          <span
            className={`text-xs font-bold uppercase tracking-wider transition-opacity duration-200 ${
              annual ? "text-[#2d5a2d] opacity-100" : "opacity-0"
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
                className={`border-2 border-[#1a1a1a] flex flex-col ${
                  h
                    ? "bg-[#1a1a1a] text-[#f0f0e8] shadow-[8px_8px_0px_0px_#2d5a2d] relative"
                    : "bg-white shadow-[6px_6px_0px_0px_#1a1a1a]"
                }`}
              >
                {h && (
                  <div className="absolute -top-4 left-6 bg-[#2d5a2d] text-[#f0f0e8] px-4 py-1 text-xs font-bold uppercase tracking-wider">
                    Most Popular
                  </div>
                )}

                <div className="p-8 pb-0">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className={`w-9 h-9 border-2 flex items-center justify-center ${
                        h ? "border-[#7cb87c]" : "border-[#2d5a2d]"
                      }`}
                    >
                      <plan.icon
                        className={`w-4 h-4 ${
                          h ? "text-[#7cb87c]" : "text-[#2d5a2d]"
                        }`}
                      />
                    </div>
                    <h3 className="text-xl font-black uppercase tracking-tighter">
                      {plan.name}
                    </h3>
                  </div>

                  <p
                    className={`text-sm mb-6 ${
                      h ? "opacity-70" : "text-[#666]"
                    }`}
                  >
                    {plan.description}
                  </p>

                  {/* Price */}
                  <div className="mb-2">
                    <span className="text-5xl font-black tracking-tighter">
                      ${price}
                    </span>
                    {price > 0 && (
                      <span className={`text-sm ${h ? "opacity-60" : "text-[#666]"}`}>
                        {period}
                      </span>
                    )}
                    {price === 0 && (
                      <span className={`text-sm ml-2 ${h ? "opacity-60" : "text-[#666]"}`}>
                        forever
                      </span>
                    )}
                  </div>

                  {/* Key metrics row */}
                  <div
                    className={`grid grid-cols-3 gap-2 py-4 mb-4 border-y ${
                      h ? "border-[#333]" : "border-[#ccc]"
                    }`}
                  >
                    <div>
                      <p className="text-lg font-black tracking-tighter">
                        {plan.checks}
                      </p>
                      <p
                        className={`text-[9px] uppercase tracking-wider ${
                          h ? "text-[#a0a0a0]" : "text-[#888]"
                        }`}
                      >
                        Checks/mo
                      </p>
                    </div>
                    <div>
                      <p className="text-lg font-black tracking-tighter">
                        {plan.monitors}
                      </p>
                      <p
                        className={`text-[9px] uppercase tracking-wider ${
                          h ? "text-[#a0a0a0]" : "text-[#888]"
                        }`}
                      >
                        Monitors
                      </p>
                    </div>
                    <div>
                      <p className="text-lg font-black tracking-tighter">
                        {plan.frequency}
                      </p>
                      <p
                        className={`text-[9px] uppercase tracking-wider ${
                          h ? "text-[#a0a0a0]" : "text-[#888]"
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
                        ? "bg-[#2d5a2d] hover:bg-[#3a6a3a] text-[#f0f0e8] border-[#2d5a2d]"
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
                            h ? "text-[#7cb87c]" : "text-[#2d5a2d]"
                          }`}
                        />
                      ) : (
                        <X className="w-3.5 h-3.5 shrink-0 text-[#888] opacity-40" />
                      )}
                      <span
                        className={`text-xs ${
                          f.included
                            ? ""
                            : h
                              ? "opacity-30"
                              : "text-[#ccc]"
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
      <section className="border-t-2 border-[#1a1a1a] px-6 py-20 md:py-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="w-8 h-8 border-2 border-[#2d5a2d] flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-[#2d5a2d]" />
              </div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#666]">
                Need More Checks?
              </p>
            </div>
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-[1.1] mb-4">
              Credit Packs
            </h2>
            <p className="text-base text-[#666] max-w-lg mx-auto">
              Buy extra checks anytime. Credits never expire and are used
              automatically when your monthly quota runs out. Available on any
              plan.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {creditPacks.map((pack) => (
              <div
                key={pack.checks}
                className={`border-2 border-[#1a1a1a] p-6 flex flex-col ${
                  pack.popular
                    ? "shadow-[6px_6px_0px_0px_#2d5a2d] relative"
                    : "shadow-[4px_4px_0px_0px_#1a1a1a]"
                }`}
              >
                {pack.popular && (
                  <div className="absolute -top-3 right-4 bg-[#2d5a2d] text-[#f0f0e8] px-3 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                    Best Value
                  </div>
                )}
                <p className="text-3xl font-black tracking-tighter mb-1">
                  {pack.checks}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#888] mb-4">
                  Checks
                </p>
                <div className="mt-auto">
                  <p className="text-2xl font-black tracking-tighter">
                    ${pack.price}
                  </p>
                  <p className="text-[10px] text-[#888] mb-4">
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
          <div className="mt-12 border-2 border-[#1a1a1a] bg-[#1a1a1a] text-[#f0f0e8] p-8">
            <h3 className="text-sm font-black uppercase tracking-tighter mb-4">
              How Credits Work
            </h3>
            <div className="grid sm:grid-cols-3 gap-6">
              <div>
                <div className="text-2xl font-black text-[#7cb87c] mb-1">01</div>
                <p className="text-xs leading-relaxed text-[#a0a0a0]">
                  Your monthly plan checks are used first. As long as you have
                  quota, credits stay untouched.
                </p>
              </div>
              <div>
                <div className="text-2xl font-black text-[#7cb87c] mb-1">02</div>
                <p className="text-xs leading-relaxed text-[#a0a0a0]">
                  When monthly checks run out, credit packs kick in
                  automatically. No interruption to monitoring.
                </p>
              </div>
              <div>
                <div className="text-2xl font-black text-[#7cb87c] mb-1">03</div>
                <p className="text-xs leading-relaxed text-[#a0a0a0]">
                  Credits never expire. Buy once, use whenever. Monthly quota
                  resets on your billing date.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t-2 border-[#1a1a1a] bg-[#1a1a1a] text-[#f0f0e8] px-6 py-24">
        <div className="max-w-3xl mx-auto">
          <p className="text-sm font-bold uppercase tracking-[0.4em] text-[#7cb87c] mb-4 text-center">
            Questions?
          </p>
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-16 text-center">
            FAQ
          </h2>

          <div className="space-y-0">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="border-t border-[#333] py-6 grid md:grid-cols-[1fr_1.5fr] gap-4"
              >
                <h3 className="font-black text-sm uppercase tracking-tighter">
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

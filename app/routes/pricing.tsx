import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Check,
  X,
  Zap,
  Building2,
  Rocket,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { MarketingCTA } from "@/components/marketing/MarketingCTA";
import { useState } from "react";

export const Route = createFileRoute("/pricing")({
  component: PricingPage,
  head: () => ({
    meta: [
      { title: "Pricing & Plans — Free Website Monitoring | PagePulse" },
      {
        name: "description",
        content:
          "Start monitoring websites free with 5 monitors and daily checks. Pro from $19/mo with 5-minute intervals. Business from $49/mo with unlimited monitors, API access, and team features.",
      },
      {
        property: "og:title",
        content: "Pricing & Plans — Free Website Monitoring | PagePulse",
      },
      {
        property: "og:description",
        content:
          "Free forever with 5 monitors. Pro from $19/mo. Business from $49/mo. No hidden fees.",
      },
      { property: "og:url", content: "https://pagepulse.io/pricing" },
    ],
  }),
});

const plans = [
  {
    name: "Free",
    icon: Zap,
    description: "Perfect for getting started with basic monitoring.",
    monthlyPrice: 0,
    yearlyPrice: 0,
    cta: "Get Started",
    ctaLink: "/auth/sign-up",
    highlighted: false,
    features: [
      { text: "5 monitors", included: true },
      { text: "Daily checks", included: true },
      { text: "Email alerts", included: true },
      { text: "Visual diff comparison", included: true },
      { text: "7-day change history", included: true },
      { text: "Zone selection", included: true },
      { text: "Hourly checks", included: false },
      { text: "Team collaboration", included: false },
      { text: "API access", included: false },
      { text: "Priority support", included: false },
    ],
  },
  {
    name: "Pro",
    icon: Rocket,
    description: "For professionals who need faster checks and more monitors.",
    monthlyPrice: 19,
    yearlyPrice: 190,
    cta: "Start Pro Trial",
    ctaLink: "/auth/sign-up",
    highlighted: true,
    features: [
      { text: "50 monitors", included: true },
      { text: "5-minute checks", included: true },
      { text: "Email alerts", included: true },
      { text: "Visual diff comparison", included: true },
      { text: "90-day change history", included: true },
      { text: "Zone & element selection", included: true },
      { text: "Keyword alerts", included: true },
      { text: "Webhook integrations", included: true },
      { text: "API access", included: false },
      { text: "Priority support", included: false },
    ],
  },
  {
    name: "Business",
    icon: Building2,
    description: "For teams that need scale, collaboration, and integrations.",
    monthlyPrice: 49,
    yearlyPrice: 490,
    cta: "Start Business Trial",
    ctaLink: "/auth/sign-up",
    highlighted: false,
    features: [
      { text: "Unlimited monitors", included: true },
      { text: "5-minute checks", included: true },
      { text: "Email alerts", included: true },
      { text: "Visual diff comparison", included: true },
      { text: "1-year change history", included: true },
      { text: "Zone & element selection", included: true },
      { text: "Keyword alerts", included: true },
      { text: "Webhook integrations", included: true },
      { text: "Full API access", included: true },
      { text: "Priority support", included: true },
    ],
  },
];

const faqs = [
  {
    q: "What counts as a 'check'?",
    a: "A check is one screenshot capture of a monitored page. If you monitor 5 pages daily, that's 5 checks per day.",
  },
  {
    q: "Can I change plans later?",
    a: "Yes, upgrade or downgrade anytime. Changes take effect immediately and we prorate your billing.",
  },
  {
    q: "Is there a free trial for paid plans?",
    a: "Yes, all paid plans include a 14-day free trial. No credit card required to start.",
  },
  {
    q: "What happens when I reach my monitor limit?",
    a: "You'll need to remove an existing monitor or upgrade to add more. Existing monitors keep running.",
  },
  {
    q: "Do you offer refunds?",
    a: "Yes, we offer a 30-day money-back guarantee on all paid plans. No questions asked.",
  },
  {
    q: "Can I monitor any website?",
    a: "You can monitor any publicly accessible webpage. We don't support pages behind logins yet, but it's on our roadmap.",
  },
];

function PricingPage() {
  const [annual, setAnnual] = useState(true);

  return (
    <MarketingLayout>
      {/* Hero — tightened so pricing cards appear above fold */}
      <section className="px-6 pt-12 pb-8 md:pt-16 md:pb-10 max-w-4xl mx-auto text-center">
        <p className="text-xs md:text-sm font-bold uppercase tracking-[0.4em] text-[#666] mb-4">
          Simple Pricing
        </p>
        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[1.1] mb-4">
          Plans That
          <br />
          <span className="text-[#2d5a2d]">Scale</span>
        </h1>
        <p className="text-base text-[#666] max-w-xl mx-auto mb-6">
          Start free, upgrade when you need more. No surprises, no hidden fees.
        </p>

        {/* Annual/Monthly Toggle + savings callout below */}
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
            ✓ Save 2 months — best value
          </span>
        </div>
      </section>

      {/* Plans */}
      <section className="px-6 pb-24">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const price = annual ? plan.yearlyPrice : plan.monthlyPrice;
            const period = annual ? "/yr" : "/mo";
            const isHighlighted = plan.highlighted;

            return (
              <div
                key={plan.name}
                className={`border-2 border-[#1a1a1a] p-8 flex flex-col ${
                  isHighlighted
                    ? "bg-[#1a1a1a] text-[#f0f0e8] shadow-[8px_8px_0px_0px_#2d5a2d] relative"
                    : "bg-white shadow-[6px_6px_0px_0px_#1a1a1a]"
                }`}
              >
                {isHighlighted && (
                  <div className="absolute -top-4 left-6 bg-[#2d5a2d] text-[#f0f0e8] px-4 py-1 text-xs font-bold uppercase tracking-wider">
                    Most Popular
                  </div>
                )}

                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`w-10 h-10 border-2 flex items-center justify-center ${
                      isHighlighted
                        ? "border-[#7cb87c]"
                        : "border-[#2d5a2d]"
                    }`}
                  >
                    <plan.icon
                      className={`w-5 h-5 ${
                        isHighlighted ? "text-[#7cb87c]" : "text-[#2d5a2d]"
                      }`}
                    />
                  </div>
                  <h3 className="text-xl font-black uppercase tracking-tighter">
                    {plan.name}
                  </h3>
                </div>

                <p
                  className={`text-sm mb-6 ${
                    isHighlighted ? "opacity-70" : "text-[#666]"
                  }`}
                >
                  {plan.description}
                </p>

                <div className="mb-8">
                  <span className="text-5xl font-black tracking-tighter">
                    ${price}
                  </span>
                  {price > 0 && (
                    <span
                      className={`text-sm ${
                        isHighlighted ? "opacity-60" : "text-[#666]"
                      }`}
                    >
                      {period}
                    </span>
                  )}
                  {price === 0 && (
                    <span
                      className={`text-sm ml-2 ${
                        isHighlighted ? "opacity-60" : "text-[#666]"
                      }`}
                    >
                      forever
                    </span>
                  )}
                </div>

                <Button
                  asChild
                  className={
                    isHighlighted
                      ? "bg-[#2d5a2d] hover:bg-[#3a6a3a] text-[#f0f0e8] border-[#2d5a2d]"
                      : ""
                  }
                >
                  <Link to={plan.ctaLink}>
                    {plan.cta} <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>

                <div className="mt-8 pt-8 border-t border-[#333] space-y-3 flex-1">
                  {plan.features.map((f) => (
                    <div key={f.text} className="flex items-center gap-3">
                      {f.included ? (
                        <Check
                          className={`w-4 h-4 shrink-0 ${
                            isHighlighted ? "text-[#7cb87c]" : "text-[#2d5a2d]"
                          }`}
                        />
                      ) : (
                        <X className="w-4 h-4 shrink-0 text-[#888] opacity-40" />
                      )}
                      <span
                        className={`text-sm ${
                          f.included
                            ? ""
                            : isHighlighted
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
        description="No credit card required. Set up your first monitor in under 60 seconds."
        showPricing={false}
      />
    </MarketingLayout>
  );
}

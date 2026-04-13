import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Check,
  ArrowLeft,
  AlertTriangle,
  Zap,
  Quote,
  Clock,
  Gauge,
  Shield,
  Users,
  Headphones,
  Settings,
  Target,
  Search,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { MarketingCTA } from "@/components/marketing/MarketingCTA";
import {
  getUseCaseBySlug,
  getRelatedUseCases,
  CATEGORIES,
  type UseCaseCategory,
} from "@/data/use-cases";
import {
  HeroIllustration,
  DiffView,
  EmailAlert,
  DashboardMockup,
  ChangeTimeline,
} from "@/components/marketing/illustrations";

export const Route = createFileRoute("/use-cases/$slug")({
  component: UseCasePage,
  head: ({ params }) => {
    const useCase = getUseCaseBySlug(params.slug);
    if (!useCase) return { meta: [{ title: "Not Found — Snaplert" }] };
    return {
      meta: [
        { title: useCase.metaTitle },
        { name: "description", content: useCase.metaDescription },
        { property: "og:title", content: useCase.metaTitle },
        { property: "og:description", content: useCase.metaDescription },
      ],
    };
  },
});

const TESTIMONIALS: Record<
  UseCaseCategory,
  { quote: string; name: string; role: string }[]
> = {
  personal: [
    {
      quote:
        "I saved over $400 last month just by getting alerts when prices dropped on items I was watching. The setup took literally 30 seconds.",
      name: "Sarah M.",
      role: "Online Shopper",
    },
    {
      quote:
        "I got my dream apartment because I was first to know about the listing. Snaplert is a game-changer.",
      name: "David K.",
      role: "Graduate Student",
    },
  ],
  business: [
    {
      quote:
        "We replaced a $2,000/month competitive intelligence subscription with Snaplert. Better data, and we choose exactly what to track.",
      name: "Rachel Torres",
      role: "VP of Strategy, SaaS Company",
    },
    {
      quote:
        "Our team gets alerts within minutes of any competitor change. That speed advantage has directly influenced three major product decisions this quarter.",
      name: "James Chen",
      role: "Product Manager, Series B Startup",
    },
  ],
  industry: [
    {
      quote:
        "Before Snaplert, regulatory changes would take weeks to reach our compliance team. Now we know within the hour.",
      name: "Patricia Alvarez",
      role: "Chief Compliance Officer",
    },
    {
      quote:
        "We monitor over 200 government and regulatory pages. The AI summaries save our team 15 hours per week.",
      name: "Michael O'Brien",
      role: "Director of Risk, Insurance Firm",
    },
  ],
};

const TIP_ICONS = [Search, Target, Eye, Shield, Settings, Clock];

function UseCasePage() {
  const { slug } = Route.useParams();
  const useCase = getUseCaseBySlug(slug);

  if (!useCase) {
    return (
      <MarketingLayout>
        <section className="px-6 py-32 text-center">
          <h1 className="text-4xl font-black uppercase tracking-tighter mb-4">
            Use Case Not Found
          </h1>
          <p className="text-[#888] mb-8">
            We couldn't find that use case.
          </p>
          <Button asChild>
            <Link to="/use-cases">
              <ArrowLeft className="mr-2 w-4 h-4" />
              All Use Cases
            </Link>
          </Button>
        </section>
      </MarketingLayout>
    );
  }

  const category = CATEGORIES.find((c) => c.key === useCase.category);
  const related = getRelatedUseCases(slug, 3);
  const testimonials = TESTIMONIALS[useCase.category] ?? [];

  return (
    <MarketingLayout>
      {/* ── HERO ── */}
      <section className="px-6 pt-16 pb-24 md:pt-24 md:pb-32">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 mb-10 text-xs font-bold uppercase tracking-wider">
            <Link
              to="/use-cases"
              className="text-[#888] hover:text-[#1a1a1a] transition-colors"
            >
              Use Cases
            </Link>
            <span className="text-[#ccc]">/</span>
            <span className="text-[#2d5a2d]">{category?.label}</span>
          </div>

          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-black uppercase tracking-tighter leading-[1.1] mb-6">
                {useCase.headline}
              </h1>
              <p className="text-lg text-[#666] leading-relaxed mb-10 max-w-md">
                {useCase.description}
              </p>

              {/* URL input */}
              <div className="flex gap-0 mb-3">
                <div className="flex-1 border-2 border-[#1a1a1a] border-r-0 px-4 py-3 bg-white text-sm text-[#aaa] font-mono">
                  Enter any web page...
                </div>
                <Button asChild className="shrink-0 py-3 px-6">
                  <Link to="/auth/sign-up">Start Monitoring</Link>
                </Button>
              </div>
              <p className="text-[10px] text-[#aaa] uppercase tracking-widest">
                Free to start · No credit card · Setup in 30 seconds
              </p>
            </div>

            <div className="hidden md:block pl-4">
              <HeroIllustration useCaseTitle={useCase.title} />
            </div>
          </div>
        </div>
      </section>

      {/* ── BOLD STATEMENT ── */}
      <section className="bg-[#1a1a1a] text-[#f0f0e8] px-6 py-14">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter leading-tight">
            The #1 {useCase.title.toLowerCase()} tool
          </h2>
          <p className="text-sm text-[#888] mt-3 max-w-xl mx-auto">
            Stay on top of exactly the updates you need — automatically.
          </p>
        </div>
      </section>

      {/* ── TESTIMONIAL 1 ── */}
      {testimonials[0] && (
        <section className="px-6 py-16 md:py-20">
          <div className="max-w-3xl mx-auto flex gap-5 items-start">
            <Quote className="w-8 h-8 text-[#2d5a2d] shrink-0 mt-1 opacity-20" />
            <div>
              <p className="text-lg md:text-xl font-bold leading-snug tracking-tight text-[#1a1a1a] mb-3">
                "{testimonials[0].quote}"
              </p>
              <p className="text-sm text-[#888]">
                {testimonials[0].name},{" "}
                <span className="text-[#aaa]">{testimonials[0].role}</span>
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ── FEATURES LABEL ── */}
      <section className="px-6 pb-6">
        <div className="max-w-6xl mx-auto text-center">
          <span className="text-xs font-bold uppercase tracking-[0.4em] text-[#2d5a2d] border-2 border-[#2d5a2d] px-4 py-1.5 inline-block">
            Features
          </span>
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mt-6 mb-3">
            Simple, powerful {useCase.title.toLowerCase()}
          </h2>
          <p className="text-[#888] max-w-lg mx-auto">
            Set it up once and get automatic alerts when the pages you care about change.
          </p>
        </div>
      </section>

      {/* ── FEATURE 1: Instant Alerts ── */}
      <section className="px-6 py-16 md:py-24">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#2d5a2d] mb-4">
              Instant Alerts
            </p>
            <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tighter leading-[1.1] mb-5">
              Identify changes at speed — and scale
            </h3>
            <p className="text-[#666] leading-relaxed mb-6">
              {useCase.longDescription[1] || useCase.description}
            </p>
            <div className="space-y-3 mb-8">
              {useCase.benefits.slice(0, 3).map((b) => (
                <div key={b} className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-[#2d5a2d] shrink-0 mt-0.5" />
                  <span className="text-sm text-[#555]">{b}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4">
              <Button asChild>
                <Link to="/auth/sign-up">
                  Start Free <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
              <Link
                to="/features"
                className="text-xs font-bold uppercase tracking-wider text-[#888] hover:text-[#1a1a1a] transition-colors"
              >
                See All Features
              </Link>
            </div>
          </div>
          <div>
            <EmailAlert
              subject={`${useCase.title}: Change Detected`}
              preview={useCase.benefits[0]}
              from="Snaplert Alerts"
              time="Just now"
            />
          </div>
        </div>
      </section>

      {/* ── FEATURE 2: Visual Comparison ── */}
      <section className="px-6 py-16 md:py-24 bg-[#fafaf2]">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div className="order-2 md:order-1">
            <DiffView beforeLabel="Previous" afterLabel="Current" />
            <div className="mt-6">
              <ChangeTimeline events={3} />
            </div>
          </div>
          <div className="order-1 md:order-2">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#2d5a2d] mb-4">
              Advanced Analysis
            </p>
            <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tighter leading-[1.1] mb-5">
              Assess the impact, not the details
            </h3>
            <p className="text-[#666] leading-relaxed mb-6">
              {useCase.longDescription[2] || useCase.longDescription[0]}
            </p>
            <div className="space-y-3 mb-8">
              {useCase.benefits.slice(3, 6).map((b) => (
                <div key={b} className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-[#2d5a2d] shrink-0 mt-0.5" />
                  <span className="text-sm text-[#555]">{b}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4">
              <Button asChild>
                <Link to="/auth/sign-up">
                  Start Free <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
              <Link
                to="/features"
                className="text-xs font-bold uppercase tracking-wider text-[#888] hover:text-[#1a1a1a] transition-colors"
              >
                See All Features
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURE 3: Dashboard ── */}
      <section className="px-6 py-16 md:py-24">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#2d5a2d] mb-4">
              Centralized Dashboard
            </p>
            <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tighter leading-[1.1] mb-5">
              All your monitors in one place
            </h3>
            <p className="text-[#666] leading-relaxed mb-6">
              Track all your monitored pages from a single dashboard. See
              change history, manage alerts, and respond to updates instantly.
            </p>
            <div className="flex items-center gap-4">
              <Button asChild>
                <Link to="/auth/sign-up">
                  Start Free <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
              <Link
                to="/features"
                className="text-xs font-bold uppercase tracking-wider text-[#888] hover:text-[#1a1a1a] transition-colors"
              >
                See All Features
              </Link>
            </div>
          </div>
          <div>
            <DashboardMockup monitors={4} />
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="bg-[#1a1a1a] text-[#f0f0e8] px-6 py-20 md:py-28">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-bold uppercase tracking-[0.4em] text-[#7cb87c] mb-4">
              Simple Setup
            </p>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">
              How It Works
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {useCase.howItWorks.map((step, i) => (
              <div key={step.step} className="text-center">
                <div className="w-12 h-12 border-2 border-[#7cb87c] flex items-center justify-center mx-auto mb-5">
                  <span className="text-lg font-black text-[#7cb87c]">
                    {step.step}
                  </span>
                </div>
                <h3 className="font-black text-lg uppercase tracking-tighter mb-3">
                  {step.title}
                </h3>
                <p className="text-sm opacity-60 leading-relaxed max-w-xs mx-auto">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIAL 2 ── */}
      {testimonials[1] && (
        <section className="px-6 py-16 md:py-20">
          <div className="max-w-3xl mx-auto flex gap-5 items-start">
            <Quote className="w-8 h-8 text-[#2d5a2d] shrink-0 mt-1 opacity-20" />
            <div>
              <p className="text-lg md:text-xl font-bold leading-snug tracking-tight text-[#1a1a1a] mb-3">
                "{testimonials[1].quote}"
              </p>
              <p className="text-sm text-[#888]">
                {testimonials[1].name},{" "}
                <span className="text-[#aaa]">{testimonials[1].role}</span>
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ── SUPPORT SECTION ── */}
      <section className="px-6 py-16 md:py-24 bg-[#fafaf2]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter">
              From Setup to Support
            </h2>
            <p className="text-[#888] mt-3">
              We're here to help you start monitoring.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[
              {
                icon: Settings,
                title: "Easy Setup",
                desc: "Paste a URL, select what to track, set your frequency. Monitoring in 60 seconds.",
              },
              {
                icon: Headphones,
                title: "Dedicated Support",
                desc: "Our team helps you configure monitors and get maximum value.",
              },
              {
                icon: Users,
                title: "Team Ready",
                desc: "Invite your team, share monitors, route alerts to the right people.",
              },
              {
                icon: Gauge,
                title: "Quality Assurance",
                desc: "We optimize alert quality and ensure you're getting the best results.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="border-2 border-[#1a1a1a] p-6 bg-white shadow-[4px_4px_0px_0px_#1a1a1a]"
              >
                <item.icon className="w-5 h-5 text-[#2d5a2d] mb-4" />
                <h3 className="font-black text-sm uppercase tracking-tighter mb-2">
                  {item.title}
                </h3>
                <p className="text-xs text-[#888] leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHAT TO MONITOR ── */}
      <section className="px-6 py-16 md:py-24">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#2d5a2d] mb-4">
                Use Cases
              </p>
              <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter leading-[1.1] mb-4">
                What To Monitor
              </h2>
              <p className="text-[#666] leading-relaxed mb-8">
                Not sure where to start? Here are the most valuable pages
                to monitor for {useCase.title.toLowerCase()}.
              </p>
              {/* Pain points compact */}
              <div className="space-y-2">
                {useCase.painPoints.slice(0, 3).map((point, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-[#cc8800] shrink-0 mt-0.5" />
                    <span className="text-xs text-[#888]">{point}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {useCase.monitoringTips.map((tip, i) => {
                const Icon = TIP_ICONS[i % TIP_ICONS.length];
                return (
                  <div
                    key={i}
                    className="border-2 border-[#1a1a1a] p-4 bg-white shadow-[3px_3px_0px_0px_#1a1a1a]"
                  >
                    <Icon className="w-4 h-4 text-[#2d5a2d] mb-2" />
                    <span className="text-xs text-[#555] leading-relaxed block">
                      {tip}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── EXAMPLES ── */}
      <section className="px-6 py-16 md:py-24 bg-[#fafaf2]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter">
              How People Use This
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {useCase.examples.map((ex) => (
              <div
                key={ex.title}
                className="border-2 border-[#1a1a1a] bg-white p-8 shadow-[6px_6px_0px_0px_#1a1a1a]"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="w-4 h-4 text-[#2d5a2d]" />
                  <h3 className="font-black text-base uppercase tracking-tighter">
                    {ex.title}
                  </h3>
                </div>
                <p className="text-sm text-[#555] leading-relaxed">
                  {ex.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING TEASER ── */}
      <section className="bg-[#2d5a2d] text-white px-6 py-14">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">
              Free to start. Upgrade when you need more.
            </h2>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Button
              asChild
              className="bg-white text-[#1a1a1a] hover:bg-[#f0f0e8] border-2 border-white"
            >
              <Link to="/pricing">View Pricing</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-2 border-white text-white hover:bg-white/10 bg-transparent"
            >
              <Link to="/auth/sign-up">Start Free</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── RELATED USE CASES ── */}
      {related.length > 0 && (
        <section className="px-6 py-16 md:py-24">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter mb-12">
              Related Use Cases
            </h2>
            <div className="grid sm:grid-cols-3 gap-6">
              {related.map((uc) => (
                <Link
                  key={uc.slug}
                  to={`/use-cases/${uc.slug}`}
                  className="border-2 border-[#1a1a1a] p-6 shadow-[4px_4px_0px_0px_#1a1a1a] hover:shadow-[6px_6px_0px_0px_#1a1a1a] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all group"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <uc.icon className="w-4 h-4 text-[#2d5a2d]" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#2d5a2d]">
                      {uc.title}
                    </span>
                  </div>
                  <h3 className="font-black text-sm uppercase tracking-tighter mb-2 leading-[1.1]">
                    {uc.headline}
                  </h3>
                  <span className="text-xs font-bold text-[#2d5a2d] uppercase tracking-wider group-hover:underline">
                    Learn More <ArrowRight className="inline w-3 h-3 ml-1" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <MarketingCTA
        headline={`Stop Checking.\nStart Monitoring.`}
        subheadline="Ready To Start?"
        description="Set up your first monitor in under 60 seconds. Free to get started, no credit card required."
      />
    </MarketingLayout>
  );
}

// v2.0.0
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f0f0e8]">
      <Nav />
      <Hero />
      <HowItWorks />
      <UseCases />
      <Features />
      <CTA />
      <Footer />
    </div>
  );
}

/* ─── Nav ─────────────────────────────────────────── */

function Nav() {
  return (
    <nav className="border-b-2 border-[#1a1a1a] px-4 md:px-6 py-4 flex items-center justify-between">
      <Link to="/" className="text-2xl font-black tracking-tighter shrink-0">
        PAGE<span className="text-[#2d5a2d]">PULSE</span>
      </Link>
      <div className="flex items-center gap-4">
        <Link
          to="/features"
          className="hidden md:block text-sm font-bold uppercase tracking-wider text-[#888] hover:text-[#1a1a1a] transition-colors"
        >
          Features
        </Link>
        <Link
          to="/auth/sign-in"
          className="hidden sm:block text-sm font-bold uppercase tracking-wider text-[#888] hover:text-[#1a1a1a] transition-colors"
        >
          Sign In
        </Link>
        <Button asChild size="sm">
          <Link to="/auth/sign-up">Get Started</Link>
        </Button>
      </div>
    </nav>
  );
}

/* ─── Hero ────────────────────────────────────────── */

function Hero() {
  const [url, setUrl] = useState("");
  const navigate = useNavigate();

  function handleGo(e: React.FormEvent) {
    e.preventDefault();
    navigate({ to: "/auth/sign-up" });
  }

  return (
    <section className="px-4 md:px-6 pt-16 md:pt-28 pb-20 md:pb-32 max-w-5xl mx-auto">
      <p className="text-xs md:text-sm font-bold uppercase tracking-[0.4em] text-[#888] mb-6 text-center">
        Your Website&apos;s Watchdog
      </p>
      <h1 className="text-4xl sm:text-6xl md:text-[5.5rem] font-black uppercase tracking-tighter leading-[1.1] mb-8 text-center">
        Monitor Any Page
        <br />
        For <span className="text-[#2d5a2d]">Changes</span>
      </h1>
      <p className="text-base md:text-lg text-[#888] max-w-2xl mx-auto mb-10 md:mb-14 text-center leading-relaxed">
        Select a zone on any webpage. Get email alerts with visual diffs when
        something changes. Dead simple monitoring.
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
          placeholder="Enter website URL to monitor..."
          className="flex-1 px-4 md:px-6 py-4 text-sm md:text-base bg-transparent outline-none placeholder:text-[#aaa] font-mono"
        />
        <button
          type="submit"
          className="px-8 py-4 bg-[#2d5a2d] text-[#f0f0e8] font-bold uppercase tracking-wider text-sm hover:bg-[#3a6a3a] transition-colors sm:border-l-2 border-t-2 sm:border-t-0 border-[#1a1a1a]"
        >
          Go <ArrowRight className="inline ml-1 w-4 h-4" />
        </button>
      </form>

      <p className="text-center text-xs text-[#aaa] mt-4">
        Free to get started — no credit card required
      </p>
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
        "Draw a rectangle around the exact area you want to monitor for changes.",
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
    <section className="border-t-2 border-[#1a1a1a] bg-[#1a1a1a] text-[#f0f0e8] px-6 py-24">
      <div className="max-w-5xl mx-auto">
        <p className="text-sm font-bold uppercase tracking-[0.4em] text-[#7cb87c] mb-4 text-center">
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
                <div className="hidden md:block absolute top-8 right-0 w-full h-[2px] bg-[#333] translate-x-1/2" />
              )}

              <div className="relative">
                <div className="w-16 h-16 border-2 border-[#7cb87c] flex items-center justify-center mb-6">
                  <step.icon className="w-7 h-7 text-[#7cb87c]" />
                </div>
                <span className="text-[#7cb87c] font-mono text-xs mb-2 block">
                  {step.number}
                </span>
                <h3 className="text-lg font-black uppercase tracking-tighter mb-3">
                  {step.title}
                </h3>
                <p className="text-sm opacity-60 leading-relaxed">
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

/* ─── Use Cases ───────────────────────────────────── */

function UseCases() {
  const cases = [
    {
      icon: TrendingUp,
      title: "Competitive Monitoring",
      description:
        "Track competitors' sites and stay informed about their latest moves.",
    },
    {
      icon: ShoppingCart,
      title: "Price Changes",
      description:
        "Be the first to know when a product drops to your target price.",
    },
    {
      icon: Briefcase,
      title: "Job Offers",
      description:
        "Get notified the moment your dream company posts a new opening.",
    },
    {
      icon: Newspaper,
      title: "Media Monitoring",
      description:
        "Know when your favorite outlets publish articles on topics you care about.",
    },
    {
      icon: Shield,
      title: "Website Errors",
      description:
        "Monitor your own site and catch visual bugs before your users do.",
    },
    {
      icon: Target,
      title: "Product Availability",
      description:
        "Track out-of-stock items and get alerted when they're back.",
    },
  ];

  return (
    <section className="border-t-2 border-[#1a1a1a] px-6 py-24">
      <div className="max-w-5xl mx-auto">
        <div className="grid md:grid-cols-[1fr_1.5fr] gap-16 items-start">
          <div className="md:sticky md:top-24">
            <p className="text-sm font-bold uppercase tracking-[0.4em] text-[#888] mb-4">
              Hundreds Of Use Cases
            </p>
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-[0.92] mb-6">
              Automate
              <br />
              Repetitive
              <br />
              Tasks
            </h2>
            <p className="text-[#888] leading-relaxed">
              Stop manually checking websites for updates. Let PagePulse watch
              for you and save hours every week.
            </p>
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
        "See exactly what changed with highlighted screenshot overlays. No more guessing — every pixel difference is visible at a glance.",
    },
    {
      icon: Target,
      title: "Zone Selection",
      headline: "Monitor What Matters",
      description:
        "Draw a rectangle around the specific area you care about. Ignore headers, ads, and noise. Focus on the content that matters to you.",
    },
    {
      icon: Bell,
      title: "Smart Alerts",
      headline: "Beautiful Email Notifications",
      description:
        "Receive before/after comparison emails the moment a change is detected. Every alert includes visual diffs so you know exactly what happened.",
    },
    {
      icon: BarChart3,
      title: "Live Dashboard",
      headline: "Real-Time Status",
      description:
        "See all your monitors at a glance. Live status updates, check history, and change timelines — everything in one place.",
    },
    {
      icon: Clock,
      title: "Flexible Scheduling",
      headline: "Check On Your Terms",
      description:
        "From every 5 minutes to weekly checks — pick the frequency that fits your needs. Upgrade anytime for more frequent monitoring.",
    },
    {
      icon: History,
      title: "Change History",
      headline: "Full Timeline",
      description:
        "Every detected change is stored with visual comparisons. Scroll back through time and see how a page evolved.",
    },
  ];

  return (
    <section className="border-t-2 border-[#1a1a1a] px-6 py-24">
      <div className="max-w-5xl mx-auto">
        <p className="text-sm font-bold uppercase tracking-[0.4em] text-[#888] mb-4 text-center">
          Built For Monitoring
        </p>
        <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-20 text-center">
          Everything You Need
        </h2>

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
                  i % 2 === 0
                    ? "border-[#2d5a2d]"
                    : "border-[#7cb87c]"
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
      </div>
    </section>
  );
}

/* ─── CTA ─────────────────────────────────────────── */

function CTA() {
  return (
    <section className="border-t-2 border-[#1a1a1a] bg-[#2d5a2d] text-[#f0f0e8] px-6 py-24 text-center">
      <div className="max-w-3xl mx-auto">
        <p className="text-sm font-bold uppercase tracking-[0.4em] text-[#7cb87c] mb-4">
          Get Started Today
        </p>
        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-6 leading-[0.9]">
          Stop Checking.
          <br />
          Start Monitoring.
        </h2>
        <p className="text-lg opacity-70 mb-10 max-w-lg mx-auto">
          Set up your first monitor in under 60 seconds. Free forever for basic
          usage.
        </p>
        <Button
          asChild
          size="lg"
          className="bg-[#f0f0e8] text-[#1a1a1a] hover:bg-white border-[#f0f0e8] shadow-[6px_6px_0px_0px_#1a4a1a]"
        >
          <Link to="/auth/sign-up">
            Start Monitoring Free
            <ArrowRight className="ml-2" />
          </Link>
        </Button>
      </div>
    </section>
  );
}

/* ─── Footer ──────────────────────────────────────── */

function Footer() {
  return (
    <footer className="border-t-2 border-[#1a1a1a] px-6 py-8">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <span className="text-sm font-bold tracking-tighter">
          PAGE<span className="text-[#2d5a2d]">PULSE</span>
        </span>
        <div className="flex items-center gap-6">
          <Link
            to="/features"
            className="text-xs text-[#888] hover:text-[#1a1a1a] transition-colors"
          >
            Features
          </Link>
          <span className="text-xs text-[#888]">
            &copy; {new Date().getFullYear()} PagePulse
          </span>
        </div>
      </div>
    </footer>
  );
}

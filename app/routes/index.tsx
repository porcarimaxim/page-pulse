import { createFileRoute, Link } from "@tanstack/react-router";
import { Eye, Zap, Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f0f0e8]">
      {/* Nav */}
      <nav className="border-b-2 border-[#1a1a1a] px-6 py-4 flex items-center justify-between">
        <Link to="/" className="text-2xl font-black tracking-tighter">
          PAGE<span className="text-[#2d5a2d]">PULSE</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link
            to="/features"
            className="text-sm font-bold uppercase tracking-wider text-[#888] hover:text-[#1a1a1a] transition-colors"
          >
            Features
          </Link>
          <Link
            to="/auth/sign-in"
            className="text-sm font-bold uppercase tracking-wider text-[#888] hover:text-[#1a1a1a] transition-colors"
          >
            Sign In
          </Link>
          <Button asChild size="sm">
            <Link to="/auth/sign-up">Get Started</Link>
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 py-24 max-w-4xl mx-auto text-center">
        <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.9] mb-6">
          Track Any
          <br />
          Webpage For
          <br />
          <span className="text-[#2d5a2d]">Changes</span>
        </h1>
        <p className="text-lg text-[#888] max-w-xl mx-auto mb-12">
          Select a zone on any page. Get email alerts with visual diffs
          when something changes. Dead simple monitoring.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Button asChild size="lg">
            <Link to="/auth/sign-up">
              Start Monitoring
              <ArrowRight className="ml-2" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/auth/sign-in">Sign In</Link>
          </Button>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t-2 border-[#1a1a1a] bg-[#1a1a1a] text-[#f0f0e8] px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-black uppercase tracking-tighter mb-16 text-center">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-12">
            <Step
              number="01"
              title="Enter URL"
              description="Paste any webpage URL and we'll capture a screenshot of it instantly."
              icon={<Eye className="w-8 h-8" />}
            />
            <Step
              number="02"
              title="Select Zone"
              description="Draw a rectangle around the exact area you want to monitor for changes."
              icon={<Zap className="w-8 h-8" />}
            />
            <Step
              number="03"
              title="Get Alerts"
              description="We check your page on schedule and email you with a visual diff when it changes."
              icon={<Mail className="w-8 h-8" />}
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t-2 border-[#1a1a1a] px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-black uppercase tracking-tighter mb-12 text-center">
            Features
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <FeatureCard
              title="Visual Diff"
              description="Pixel-level screenshot comparison highlights exactly what changed."
            />
            <FeatureCard
              title="Zone Selection"
              description="Monitor only the part of the page you care about. Ignore the noise."
            />
            <FeatureCard
              title="Flexible Scheduling"
              description="Check every 5 minutes, hourly, daily, or weekly. You decide."
            />
            <FeatureCard
              title="Email Alerts"
              description="Beautiful before/after emails with diff images sent to your inbox."
            />
            <FeatureCard
              title="Real-time Dashboard"
              description="Live status updates for all your monitors. See changes as they happen."
            />
            <FeatureCard
              title="Change History"
              description="Full timeline of every detected change with visual comparisons."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t-2 border-[#1a1a1a] bg-[#2d5a2d] text-[#f0f0e8] px-6 py-20 text-center">
        <h2 className="text-4xl font-black uppercase tracking-tighter mb-4">
          Start Monitoring Today
        </h2>
        <p className="text-lg opacity-80 mb-8">
          Free to get started. No credit card required.
        </p>
        <Button
          asChild
          size="lg"
          className="bg-[#f0f0e8] text-[#1a1a1a] hover:bg-white border-[#f0f0e8]"
        >
          <Link to="/auth/sign-up">
            Get Started Free
            <ArrowRight className="ml-2" />
          </Link>
        </Button>
      </section>

      {/* Footer */}
      <footer className="border-t-2 border-[#1a1a1a] px-6 py-8">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <span className="text-sm font-bold tracking-tighter">
            PAGE<span className="text-[#2d5a2d]">PULSE</span>
          </span>
          <span className="text-xs text-[#888]">
            &copy; {new Date().getFullYear()} PagePulse
          </span>
        </div>
      </footer>
    </div>
  );
}

function Step({
  number,
  title,
  description,
  icon,
}: {
  number: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <span className="text-[#7cb87c] font-mono text-sm">{number}</span>
        {icon}
      </div>
      <h3 className="text-xl font-black uppercase tracking-tighter mb-2">
        {title}
      </h3>
      <p className="text-sm opacity-70">{description}</p>
    </div>
  );
}

function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="border-2 border-[#1a1a1a] p-6 shadow-[8px_8px_0px_0px_var(--shadow-color)]">
      <h3 className="font-black text-lg uppercase tracking-tighter mb-2">
        {title}
      </h3>
      <p className="text-sm text-[#888]">{description}</p>
    </div>
  );
}

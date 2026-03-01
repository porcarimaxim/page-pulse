import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/features")({
  component: FeaturesPage,
});

const features = [
  {
    number: "01",
    title: "Visual Diff",
    headline: "See Exactly What Changed",
    description:
      "Pixel-level screenshot comparison highlights every difference between checks. We overlay before and after images and mark precisely what moved, appeared, or disappeared. You get a clear percentage score so you know if the change is trivial or critical.",
    image: "/features/screenshot-timeis.png",
    imageAlt: "Screenshot comparison showing detected changes on time.is",
  },
  {
    number: "02",
    title: "Zone Selection",
    headline: "Monitor Only What Matters",
    description:
      "Pick a specific element on the page using our visual element picker. Click on a button, a price tag, a headline — whatever you care about. We isolate that element in every screenshot so you never get noise from ads, banners, or unrelated content changing around it.",
    image: "/features/screenshot-paymo.png",
    imageAlt: "Element picker selecting a zone on paymoapp.com",
  },
  {
    number: "03",
    title: "Flexible Scheduling",
    headline: "Check On Your Terms",
    description:
      "Set your monitoring frequency from every 5 minutes to once a week. High-stakes pages get rapid checks, low-priority ones save resources with daily or weekly scans. Pause and resume any monitor instantly when you need a break.",
    image: null,
    imageAlt: "",
  },
  {
    number: "04",
    title: "Email Alerts",
    headline: "Changes Delivered To Your Inbox",
    description:
      "Every detected change triggers a clean email with before and after screenshots, the diff percentage, and a direct link to your dashboard. You also get webhook support for Slack, Discord, and custom endpoints — plug PagePulse into any workflow.",
    image: null,
    imageAlt: "",
  },
  {
    number: "05",
    title: "Real-Time Dashboard",
    headline: "All Your Monitors At A Glance",
    description:
      "A live overview of every monitor you run. See status, last check time, change count, and recent screenshots without clicking into each one. Tag and filter monitors by project, client, or priority to keep things organized as your list grows.",
    image: "/features/screenshot-monday.png",
    imageAlt: "Dashboard showing monitored pages with status and screenshots",
  },
  {
    number: "06",
    title: "Change History",
    headline: "A Full Timeline Of Every Change",
    description:
      "Every detected change is logged with a timestamp, diff score, and visual comparison. Scroll through the timeline to spot patterns — does a competitor update pricing every Tuesday? Does your own site break after deploys? The history tells the story.",
    image: null,
    imageAlt: "",
  },
];

function FeaturesPage() {
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
            className="text-sm font-bold uppercase tracking-wider text-[#1a1a1a] hover:text-[#2d5a2d] transition-colors"
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
          Built For
          <br />
          <span className="text-[#2d5a2d]">Monitoring</span>
        </h1>
        <p className="text-lg text-[#888] max-w-xl mx-auto">
          Everything you need to track webpage changes, delivered with zero
          complexity.
        </p>
      </section>

      {/* Feature Sections */}
      {features.map((feature, index) => {
        const isInverted = index % 2 === 0;
        const imageOnRight = index % 2 === 0;
        return (
          <section
            key={feature.number}
            className={`border-t-2 border-[#1a1a1a] px-6 py-20 ${
              isInverted ? "bg-[#1a1a1a] text-[#f0f0e8]" : ""
            }`}
          >
            <div className="max-w-5xl mx-auto">
              <div
                className={`flex flex-col ${feature.image ? "md:flex-row" : ""} gap-12 items-center`}
              >
                {/* Text */}
                <div
                  className={`flex-1 min-w-0 ${feature.image && imageOnRight ? "md:order-1" : feature.image ? "md:order-2" : ""}`}
                >
                  <div className="flex items-baseline gap-4 mb-4">
                    <span
                      className={`font-mono text-sm ${
                        isInverted ? "text-[#7cb87c]" : "text-[#2d5a2d]"
                      }`}
                    >
                      {feature.number}
                    </span>
                    <span
                      className={`text-sm font-bold uppercase tracking-wider ${
                        isInverted ? "text-[#7cb87c]" : "text-[#2d5a2d]"
                      }`}
                    >
                      {feature.title}
                    </span>
                  </div>
                  <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-[0.95] mb-6">
                    {feature.headline}
                  </h2>
                  <p
                    className={`text-lg ${
                      isInverted ? "opacity-70" : "text-[#888]"
                    }`}
                  >
                    {feature.description}
                  </p>
                </div>

                {/* Image */}
                {feature.image && (
                  <div
                    className={`flex-1 min-w-0 ${imageOnRight ? "md:order-2" : "md:order-1"}`}
                  >
                    <div
                      className={`border-2 overflow-hidden ${isInverted ? "border-[#333] shadow-[8px_8px_0px_0px_rgba(124,184,124,0.3)]" : "border-[#1a1a1a] shadow-[8px_8px_0px_0px_var(--shadow-color)]"}`}
                    >
                      <img
                        src={feature.image}
                        alt={feature.imageAlt}
                        className="w-full h-auto"
                        loading="lazy"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        );
      })}

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

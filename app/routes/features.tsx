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
} from "lucide-react";
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
      "Pixel-level screenshot comparison highlights every difference between checks. We overlay before and after images and mark precisely what moved, appeared, or disappeared.",
    highlights: [
      "Pixel-by-pixel overlay comparison",
      "Percentage-based change score",
      "Side-by-side before/after view",
    ],
    image: "/features/screenshot-timeis.png",
    imageAlt: "Screenshot comparison showing detected changes on time.is",
    icon: GitCompareArrows,
  },
  {
    number: "02",
    title: "Zone Selection",
    headline: "Monitor Only What Matters",
    description:
      "Pick a specific element on the page using our visual element picker. Click on a button, a price tag, a headline — whatever you care about.",
    highlights: [
      "Visual point-and-click element picker",
      "Ignore ads, banners, and noise",
      "Full-page or element-level monitoring",
    ],
    image: "/features/screenshot-paymo.png",
    imageAlt: "Element picker selecting a zone on paymoapp.com",
    icon: Target,
  },
  {
    number: "03",
    title: "Flexible Scheduling",
    headline: "Check On Your Terms",
    description:
      "Set your monitoring frequency from every 5 minutes to once a week. High-stakes pages get rapid checks, low-priority ones save resources.",
    highlights: [
      "5 min, hourly, daily, or weekly checks",
      "Pause and resume any monitor instantly",
      "Different intervals per monitor",
    ],
    image: null,
    imageAlt: "",
    icon: Clock,
  },
  {
    number: "04",
    title: "Email Alerts",
    headline: "Changes Delivered To Your Inbox",
    description:
      "Every detected change triggers a clean email with before and after screenshots, the diff percentage, and a direct link to your dashboard.",
    highlights: [
      "Before/after screenshots in every email",
      "Direct link to dashboard for details",
      "Webhook support for Slack and Discord",
    ],
    image: null,
    imageAlt: "",
    icon: Bell,
  },
  {
    number: "05",
    title: "Real-Time Dashboard",
    headline: "All Your Monitors At A Glance",
    description:
      "A live overview of every monitor you run. See status, last check time, change count, and recent screenshots without clicking into each one.",
    highlights: [
      "Live status updates across all monitors",
      "Filter by project, client, or priority",
      "Recent screenshots and change counts",
    ],
    image: "/features/screenshot-monday.png",
    imageAlt: "Dashboard showing monitored pages with status and screenshots",
    icon: BarChart3,
  },
  {
    number: "06",
    title: "Change History",
    headline: "A Full Timeline Of Every Change",
    description:
      "Every detected change is logged with a timestamp, diff score, and visual comparison. Scroll through the timeline to spot patterns.",
    highlights: [
      "Timestamped log of every change",
      "Visual comparison at each point",
      "Spot trends and recurring patterns",
    ],
    image: null,
    imageAlt: "",
    icon: History,
  },
];

function FeaturesPage() {
  return (
    <div className="min-h-screen bg-[#f0f0e8]">
      {/* Nav */}
      <nav className="border-b-2 border-[#1a1a1a] px-4 md:px-6 py-4 flex items-center justify-between">
        <Link to="/" className="text-2xl font-black tracking-tighter">
          PAGE<span className="text-[#2d5a2d]">PULSE</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link
            to="/features"
            className="hidden md:block text-sm font-bold uppercase tracking-wider text-[#1a1a1a] hover:text-[#2d5a2d] transition-colors"
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

      {/* Hero */}
      <section className="px-6 py-24 md:py-32 max-w-4xl mx-auto text-center">
        <p className="text-xs md:text-sm font-bold uppercase tracking-[0.4em] text-[#888] mb-6">
          Everything You Need
        </p>
        <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-[0.9] mb-6">
          Built For
          <br />
          <span className="text-[#2d5a2d]">Monitoring</span>
        </h1>
        <p className="text-lg text-[#888] max-w-xl mx-auto mb-12">
          Six powerful tools working together to track webpage changes with zero
          complexity. Set up in seconds, monitor forever.
        </p>
        <Button asChild size="lg">
          <Link to="/auth/sign-up">
            Start Free
            <ArrowRight className="ml-2" />
          </Link>
        </Button>
      </section>

      {/* Stats Bar */}
      <section className="border-t-2 border-b-2 border-[#1a1a1a] bg-[#1a1a1a] text-[#f0f0e8]">
        <div className="max-w-5xl mx-auto grid grid-cols-3 divide-x-2 divide-[#333]">
          {[
            { value: "< 60s", label: "Setup Time" },
            { value: "5 min", label: "Fastest Check Interval" },
            { value: "100%", label: "Visual Accuracy" },
          ].map((stat) => (
            <div key={stat.label} className="py-8 px-6 text-center">
              <div className="text-2xl md:text-3xl font-black tracking-tighter text-[#7cb87c]">
                {stat.value}
              </div>
              <div className="text-xs uppercase tracking-wider text-[#888] mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Sections */}
      {features.map((feature, index) => {
        const isInverted = index % 2 === 0;
        const imageOnRight = index % 2 === 0;
        const hasImage = !!feature.image;

        return (
          <section
            key={feature.number}
            className={`border-t-2 border-[#1a1a1a] px-6 py-20 md:py-28 ${
              isInverted ? "bg-[#1a1a1a] text-[#f0f0e8]" : ""
            }`}
          >
            <div className="max-w-5xl mx-auto">
              <div
                className={`flex flex-col ${hasImage ? "md:flex-row" : ""} gap-12 md:gap-16 items-start`}
              >
                {/* Text */}
                <div
                  className={`flex-1 min-w-0 ${hasImage && imageOnRight ? "md:order-1" : hasImage ? "md:order-2" : ""}`}
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div
                      className={`w-12 h-12 border-2 flex items-center justify-center ${
                        isInverted
                          ? "border-[#7cb87c]"
                          : "border-[#2d5a2d]"
                      }`}
                    >
                      <feature.icon
                        className={`w-5 h-5 ${
                          isInverted ? "text-[#7cb87c]" : "text-[#2d5a2d]"
                        }`}
                      />
                    </div>
                    <div>
                      <span
                        className={`font-mono text-xs block ${
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
                  </div>

                  <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-[0.95] mb-6">
                    {feature.headline}
                  </h2>

                  <p
                    className={`text-base md:text-lg mb-8 leading-relaxed ${
                      isInverted ? "opacity-70" : "text-[#888]"
                    }`}
                  >
                    {feature.description}
                  </p>

                  {/* Highlights */}
                  <ul className="space-y-3">
                    {feature.highlights.map((h) => (
                      <li key={h} className="flex items-start gap-3">
                        <div
                          className={`w-5 h-5 border flex items-center justify-center shrink-0 mt-0.5 ${
                            isInverted
                              ? "border-[#7cb87c]"
                              : "border-[#2d5a2d]"
                          }`}
                        >
                          <Check
                            className={`w-3 h-3 ${
                              isInverted
                                ? "text-[#7cb87c]"
                                : "text-[#2d5a2d]"
                            }`}
                          />
                        </div>
                        <span
                          className={`text-sm ${
                            isInverted ? "opacity-80" : "text-[#555]"
                          }`}
                        >
                          {h}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Image */}
                {hasImage && (
                  <div
                    className={`flex-1 min-w-0 ${imageOnRight ? "md:order-2" : "md:order-1"}`}
                  >
                    <div
                      className={`border-2 overflow-hidden ${
                        isInverted
                          ? "border-[#333] shadow-[8px_8px_0px_0px_rgba(124,184,124,0.3)]"
                          : "border-[#1a1a1a] shadow-[8px_8px_0px_0px_#1a1a1a]"
                      }`}
                    >
                      <img
                        src={feature.image!}
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
      <section className="border-t-2 border-[#1a1a1a] bg-[#2d5a2d] text-[#f0f0e8] px-6 py-24 text-center">
        <div className="max-w-3xl mx-auto">
          <p className="text-sm font-bold uppercase tracking-[0.4em] text-[#7cb87c] mb-4">
            Ready To Start?
          </p>
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-6 leading-[0.9]">
            Stop Checking.
            <br />
            Start Monitoring.
          </h2>
          <p className="text-lg opacity-70 mb-10 max-w-lg mx-auto">
            Set up your first monitor in under 60 seconds. Free to get started,
            no credit card required.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-[#f0f0e8] text-[#1a1a1a] hover:bg-white border-[#f0f0e8] shadow-[6px_6px_0px_0px_#1a4a1a]"
          >
            <Link to="/auth/sign-up">
              Get Started Free
              <ArrowRight className="ml-2" />
            </Link>
          </Button>
        </div>
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

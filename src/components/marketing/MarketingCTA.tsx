import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MarketingCTAProps {
  headline?: string;
  subheadline?: string;
  description?: string;
  showPricing?: boolean;
}

export function MarketingCTA({
  headline = "Stop Checking.\nStart Monitoring.",
  subheadline = "Get Started Today",
  description = "Set up your first monitor in under 60 seconds. Free forever for basic usage — upgrade when you need more.",
  showPricing = true,
}: MarketingCTAProps) {
  return (
    <section className="border-t-2 border-[#1a1a1a] bg-[#2d5a2d] text-[#f0f0e8] px-6 py-24 text-center">
      <div className="max-w-3xl mx-auto">
        <p className="text-sm font-bold uppercase tracking-[0.4em] text-[#7cb87c] mb-4">
          {subheadline}
        </p>
        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-6 leading-[0.9] whitespace-pre-line">
          {headline}
        </h2>
        <p className="text-lg opacity-70 mb-10 max-w-lg mx-auto">
          {description}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          {/* Primary CTA — filled cream, prominent */}
          <Button
            asChild
            size="lg"
            className="bg-[#f0f0e8] text-[#1a1a1a] hover:bg-white border-2 border-[#f0f0e8] shadow-[6px_6px_0px_0px_#1a4a1a] text-base px-8 py-6 h-auto font-black uppercase tracking-wider"
          >
            <Link to="/auth/sign-up">
              Start Monitoring Free
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
          {/* Secondary CTA — ghost outline, visually lighter */}
          {showPricing && (
            <Link
              to="/pricing"
              className="text-sm font-bold uppercase tracking-wider text-[#f0f0e8]/70 hover:text-[#f0f0e8] underline underline-offset-4 transition-colors"
            >
              View Pricing →
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

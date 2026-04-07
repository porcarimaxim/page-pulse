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
    <section className="border-t border-gray-200 bg-emerald-600 text-white px-6 py-24 text-center">
      <div className="max-w-3xl mx-auto">
        <p className="text-sm font-bold uppercase tracking-[0.4em] text-emerald-200 mb-4">
          {subheadline}
        </p>
        <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-[1.1] whitespace-pre-line">
          {headline}
        </h2>
        <p className="text-lg opacity-70 mb-10 max-w-lg mx-auto">
          {description}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          {/* Primary CTA — filled white, prominent */}
          <Button
            asChild
            size="lg"
            className="bg-white text-gray-900 hover:bg-gray-100 border border-white shadow-lg text-base px-8 py-6 h-auto font-bold uppercase tracking-wider"
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
              className="text-sm font-bold uppercase tracking-wider text-white/70 hover:text-white underline underline-offset-4 transition-colors"
            >
              View Pricing →
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

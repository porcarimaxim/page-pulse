import { Link } from "@tanstack/react-router";
import { PERSONAL_CASES, BUSINESS_CASES } from "@/data/use-cases";

export function MarketingFooter() {
  return (
    <footer className="border-t-2 border-[#1a1a1a] px-6 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div>
            <span className="text-lg font-black tracking-tighter block mb-4">
              PAGE<span className="text-[#2d5a2d]">PULSE</span>
            </span>
            <p className="text-xs text-[#666] leading-relaxed">
              Website change detection and monitoring alerts for teams and
              individuals.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-black uppercase tracking-wider mb-4">
              Product
            </h4>
            <div className="space-y-2">
              <Link
                to="/features"
                className="block text-xs text-[#666] hover:text-[#1a1a1a] transition-colors"
              >
                Features
              </Link>
              <Link
                to="/pricing"
                className="block text-xs text-[#666] hover:text-[#1a1a1a] transition-colors"
              >
                Pricing
              </Link>
              <Link
                to="/use-cases"
                className="block text-xs text-[#666] hover:text-[#1a1a1a] transition-colors"
              >
                Use Cases
              </Link>
              <Link
                to="/blog"
                className="block text-xs text-[#666] hover:text-[#1a1a1a] transition-colors"
              >
                Blog
              </Link>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-black uppercase tracking-wider mb-4">
              For Business
            </h4>
            <div className="space-y-2">
              {BUSINESS_CASES.slice(0, 4).map((uc) => (
                <Link
                  key={uc.slug}
                  to={`/use-cases/${uc.slug}`}
                  className="block text-xs text-[#666] hover:text-[#1a1a1a] transition-colors"
                >
                  {uc.title}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-black uppercase tracking-wider mb-4">
              For Everyone
            </h4>
            <div className="space-y-2">
              {PERSONAL_CASES.slice(0, 4).map((uc) => (
                <Link
                  key={uc.slug}
                  to={`/use-cases/${uc.slug}`}
                  className="block text-xs text-[#666] hover:text-[#1a1a1a] transition-colors"
                >
                  {uc.title}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t-2 border-[#1a1a1a] pt-6 flex items-center justify-between">
          <span className="text-xs text-[#666]">
            &copy; {new Date().getFullYear()} PagePulse. All rights reserved.
          </span>
        </div>
      </div>
    </footer>
  );
}

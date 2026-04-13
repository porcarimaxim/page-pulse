import { Link, useLocation } from "@tanstack/react-router";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  ArrowRight,
  ChevronDown,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { USE_CASES, CATEGORIES } from "@/data/use-cases";

export function MarketingNav() {
  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileCategory, setMobileCategory] = useState<string | null>(null);
  const location = useLocation();
  const navRef = useRef<HTMLElement>(null);
  const megaTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const closeMega = useCallback(() => {
    setMegaOpen(false);
  }, []);

  // Close on route change
  useEffect(() => {
    setMegaOpen(false);
    setMobileOpen(false);
    setMobileCategory(null);
  }, [location.pathname]);

  // Close on escape
  useEffect(() => {
    if (!megaOpen && !mobileOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMegaOpen(false);
        setMobileOpen(false);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [megaOpen, mobileOpen]);

  // Close mega on click outside
  useEffect(() => {
    if (!megaOpen) return;
    const handler = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setMegaOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [megaOpen]);

  const isActive = (path: string) => location.pathname === path;
  const isUseCases = location.pathname.startsWith("/use-cases");

  const linkClass = (path: string, active?: boolean) =>
    `text-sm font-bold uppercase tracking-wider transition-colors ${
      active || isActive(path)
        ? "text-[#1a1a1a]"
        : "text-[#888] hover:text-[#1a1a1a]"
    }`;

  return (
    <nav ref={navRef} className="relative border-b-2 border-[#1a1a1a] bg-[#f0f0e8]">
      <div className="px-4 md:px-6 py-4 flex items-center justify-between">
        <Link to="/" className="text-2xl font-black tracking-tighter shrink-0">
          SNAP<span className="text-[#2d5a2d]">LERT</span>
        </Link>

        {/* Desktop Nav - Left links */}
        <div className="hidden md:flex items-center gap-6 ml-8">
          <Link to="/features" className={linkClass("/features")}>
            Features
          </Link>

          {/* Use Cases with mega-menu trigger */}
          <div
            className="relative"
            onMouseEnter={() => {
              clearTimeout(megaTimeoutRef.current);
              setMegaOpen(true);
            }}
            onMouseLeave={() => {
              megaTimeoutRef.current = setTimeout(() => setMegaOpen(false), 200);
            }}
          >
            <button
              onClick={() => setMegaOpen(!megaOpen)}
              className={`flex items-center gap-1 ${linkClass("/use-cases", isUseCases)}`}
            >
              Use Cases
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${megaOpen ? "rotate-180" : ""}`}
              />
            </button>
          </div>

          <Link to="/pricing" className={linkClass("/pricing")}>
            Pricing
          </Link>

          <Link to="/blog" className={linkClass("/blog")}>
            Blog
          </Link>
        </div>

        {/* Desktop Nav - Right actions */}
        <div className="hidden md:flex items-center gap-6 ml-auto">
          <Link to="/auth/sign-in" className={linkClass("/auth/sign-in")}>
            Sign In
          </Link>

          <Button asChild size="sm">
            <Link to="/auth/sign-up">Get Started</Link>
          </Button>
        </div>

        {/* Mobile: Sign In + Get Started + Hamburger */}
        <div className="flex md:hidden items-center gap-3">
          <Button asChild size="sm">
            <Link to="/auth/sign-up">Get Started</Link>
          </Button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="w-10 h-10 border-2 border-[#1a1a1a] flex items-center justify-center"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Desktop Mega Menu */}
      {megaOpen && (
        <div
          className="hidden md:block absolute left-0 right-0 top-full z-50 border-b-2 border-[#1a1a1a] bg-[#f0f0e8] shadow-[0_8px_0px_0px_rgba(26,26,26,0.1)]"
          onMouseEnter={() => {
            clearTimeout(megaTimeoutRef.current);
          }}
          onMouseLeave={() => {
            megaTimeoutRef.current = setTimeout(() => setMegaOpen(false), 200);
          }}
        >
          <div className="max-w-5xl mx-auto grid grid-cols-3 divide-x-2 divide-[#1a1a1a]">
            {CATEGORIES.map((cat) => {
              const cases = USE_CASES.filter((uc) => uc.category === cat.key);
              return (
                <div key={cat.key} className="p-6">
                  <h3 className="text-xs font-black uppercase tracking-wider text-[#2d5a2d] mb-1">
                    {cat.label}
                  </h3>
                  <p className="text-[10px] text-[#888] mb-4">
                    {cat.description}
                  </p>
                  <div className="space-y-0.5">
                    {cases.map((uc) => (
                      <Link
                        key={uc.slug}
                        to={`/use-cases/${uc.slug}`}
                        onClick={closeMega}
                        className="flex items-center gap-3 px-3 py-2 -mx-3 hover:bg-[#1a1a1a] hover:text-[#f0f0e8] transition-colors group"
                      >
                        <uc.icon className="w-4 h-4 shrink-0 text-[#2d5a2d] group-hover:text-[#7cb87c]" />
                        <div className="min-w-0">
                          <span className="text-sm font-bold block leading-tight">
                            {uc.title}
                          </span>
                          <span className="text-[10px] text-[#888] group-hover:text-[#888] leading-tight block truncate">
                            {uc.tagline}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="border-t-2 border-[#1a1a1a] px-6 py-3 text-center">
            <Link
              to="/use-cases"
              onClick={closeMega}
              className="text-sm font-bold uppercase tracking-wider text-[#2d5a2d] hover:underline inline-flex items-center gap-1"
            >
              View All Use Cases
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t-2 border-[#1a1a1a] bg-[#f0f0e8] max-h-[70vh] overflow-y-auto">
          <div className="p-4 space-y-0">
            <Link
              to="/features"
              className="block px-4 py-3 text-sm font-bold uppercase tracking-wider hover:bg-[#1a1a1a] hover:text-[#f0f0e8] transition-colors"
            >
              Features
            </Link>

            {/* Use Cases Accordion */}
            <div>
              <button
                onClick={() =>
                  setMobileCategory(
                    mobileCategory === "all" ? null : "all",
                  )
                }
                className="w-full flex items-center justify-between px-4 py-3 text-sm font-bold uppercase tracking-wider hover:bg-[#1a1a1a] hover:text-[#f0f0e8] transition-colors"
              >
                Use Cases
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${mobileCategory === "all" ? "rotate-180" : ""}`}
                />
              </button>

              {mobileCategory === "all" && (
                <div className="border-t border-[#ccc]">
                  {CATEGORIES.map((cat) => {
                    const cases = USE_CASES.filter(
                      (uc) => uc.category === cat.key,
                    );
                    return (
                      <div key={cat.key} className="border-b border-[#ccc]">
                        <div className="px-6 py-2 bg-[#e8e8e0]">
                          <span className="text-[10px] font-black uppercase tracking-wider text-[#2d5a2d]">
                            {cat.label}
                          </span>
                        </div>
                        {cases.map((uc) => (
                          <Link
                            key={uc.slug}
                            to={`/use-cases/${uc.slug}`}
                            className="flex items-center gap-3 px-8 py-2.5 text-sm hover:bg-[#1a1a1a] hover:text-[#f0f0e8] transition-colors"
                          >
                            <uc.icon className="w-4 h-4 shrink-0 text-[#2d5a2d]" />
                            {uc.title}
                          </Link>
                        ))}
                      </div>
                    );
                  })}
                  <Link
                    to="/use-cases"
                    className="flex items-center gap-2 px-6 py-3 text-sm font-bold text-[#2d5a2d]"
                  >
                    View All Use Cases
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>

            <Link
              to="/pricing"
              className="block px-4 py-3 text-sm font-bold uppercase tracking-wider hover:bg-[#1a1a1a] hover:text-[#f0f0e8] transition-colors"
            >
              Pricing
            </Link>

            <Link
              to="/blog"
              className="block px-4 py-3 text-sm font-bold uppercase tracking-wider hover:bg-[#1a1a1a] hover:text-[#f0f0e8] transition-colors"
            >
              Blog
            </Link>

            <Link
              to="/auth/sign-in"
              className="block px-4 py-3 text-sm font-bold uppercase tracking-wider hover:bg-[#1a1a1a] hover:text-[#f0f0e8] transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

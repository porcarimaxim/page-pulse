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
    `text-sm font-medium transition-colors ${
      active || isActive(path)
        ? "text-gray-900"
        : "text-gray-500 hover:text-gray-900"
    }`;

  return (
    <nav ref={navRef} className="relative border-b border-gray-200 bg-white">
      <div className="px-4 md:px-6 py-4 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold shrink-0">
          PAGE<span className="text-emerald-600">PULSE</span>
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
            className="w-10 h-10 border border-gray-200 rounded-lg flex items-center justify-center"
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
          className="hidden md:block absolute left-0 right-0 top-full z-50 border-b border-gray-200 bg-white shadow-lg rounded-b-xl"
          onMouseEnter={() => {
            clearTimeout(megaTimeoutRef.current);
          }}
          onMouseLeave={() => {
            megaTimeoutRef.current = setTimeout(() => setMegaOpen(false), 200);
          }}
        >
          <div className="max-w-5xl mx-auto grid grid-cols-3 divide-x divide-gray-200">
            {CATEGORIES.map((cat) => {
              const cases = USE_CASES.filter((uc) => uc.category === cat.key);
              return (
                <div key={cat.key} className="p-6">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-600 mb-1">
                    {cat.label}
                  </h3>
                  <p className="text-xs text-gray-500 mb-4">
                    {cat.description}
                  </p>
                  <div className="space-y-0.5">
                    {cases.map((uc) => (
                      <Link
                        key={uc.slug}
                        to={`/use-cases/${uc.slug}`}
                        onClick={closeMega}
                        className="flex items-center gap-3 px-3 py-2 -mx-3 rounded-lg hover:bg-gray-50 transition-colors group"
                      >
                        <uc.icon className="w-4 h-4 shrink-0 text-emerald-600 group-hover:text-emerald-400" />
                        <div className="min-w-0">
                          <span className="text-sm font-medium block leading-tight">
                            {uc.title}
                          </span>
                          <span className="text-xs text-gray-500 group-hover:text-gray-500 leading-tight block truncate">
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
          <div className="border-t border-gray-200 px-6 py-3 text-center">
            <Link
              to="/use-cases"
              onClick={closeMega}
              className="text-sm font-medium text-emerald-600 hover:underline inline-flex items-center gap-1"
            >
              View All Use Cases
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white max-h-[70vh] overflow-y-auto">
          <div className="p-4 space-y-0">
            <Link
              to="/features"
              className="block px-4 py-3 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
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
                className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Use Cases
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${mobileCategory === "all" ? "rotate-180" : ""}`}
                />
              </button>

              {mobileCategory === "all" && (
                <div className="border-t border-gray-200">
                  {CATEGORIES.map((cat) => {
                    const cases = USE_CASES.filter(
                      (uc) => uc.category === cat.key,
                    );
                    return (
                      <div key={cat.key} className="border-b border-gray-200">
                        <div className="px-6 py-2 bg-gray-50">
                          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
                            {cat.label}
                          </span>
                        </div>
                        {cases.map((uc) => (
                          <Link
                            key={uc.slug}
                            to={`/use-cases/${uc.slug}`}
                            className="flex items-center gap-3 px-8 py-2.5 text-sm hover:bg-gray-50 transition-colors"
                          >
                            <uc.icon className="w-4 h-4 shrink-0 text-emerald-600" />
                            {uc.title}
                          </Link>
                        ))}
                      </div>
                    );
                  })}
                  <Link
                    to="/use-cases"
                    className="flex items-center gap-2 px-6 py-3 text-sm font-medium text-emerald-600"
                  >
                    View All Use Cases
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>

            <Link
              to="/pricing"
              className="block px-4 py-3 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Pricing
            </Link>

            <Link
              to="/blog"
              className="block px-4 py-3 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Blog
            </Link>

            <Link
              to="/auth/sign-in"
              className="block px-4 py-3 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

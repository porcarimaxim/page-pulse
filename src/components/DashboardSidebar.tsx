import { Link, useMatches } from "@tanstack/react-router";
import { UserButton } from "@clerk/tanstack-react-start";
import {
  BarChart3,
  Eye,
  Settings,
  Zap,
  Menu,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: BarChart3, exact: true },
  { to: "/dashboard/monitors", label: "Monitors", icon: Eye, exact: false },
  { to: "/dashboard/settings", label: "Settings", icon: Settings, exact: true },
] as const;

export function DashboardSidebar() {
  const matches = useMatches();
  const currentPath = matches[matches.length - 1]?.fullPath ?? "";
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [currentPath]);

  useEffect(() => {
    if (!mobileOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [mobileOpen]);

  function isActive(to: string, exact: boolean) {
    if (exact) return currentPath === to || currentPath === to + "/";
    if (to === "/dashboard/monitors") {
      return (
        currentPath.startsWith("/dashboard/monitors") ||
        currentPath.startsWith("/dashboard/$monitorId") ||
        currentPath === "/dashboard/new"
      );
    }
    return currentPath.startsWith(to);
  }

  const NavContent = ({ onClose }: { onClose?: () => void }) => (
    <>
      <div className="px-5 py-5 border-b-2 border-[#1a1a1a] flex items-center justify-between">
        <Link
          to="/dashboard"
          className="text-xl font-black tracking-tighter"
          onClick={onClose}
        >
          PAGE<span className="text-[#2d5a2d]">PULSE</span>
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center hover:bg-[#e8e8e0] transition-colors"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const active = isActive(item.to, item.exact);
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-3 text-sm font-bold uppercase tracking-wider transition-colors ${
                active
                  ? "text-[#2d5a2d] bg-[#2d5a2d]/5"
                  : "text-[#666] hover:text-[#1a1a1a] hover:bg-[#e8e8e0]"
              }`}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-3 border-t border-[#ccc]">
        <div className="flex items-center gap-2">
          <Zap className="w-3 h-3 text-[#2d5a2d]" />
          <span className="text-[10px] font-bold uppercase text-[#666]">Free plan</span>
        </div>
      </div>

      <div className="px-4 py-4 border-t-2 border-[#1a1a1a]">
        <UserButton
          appearance={{
            elements: { avatarBox: "border-2 border-[#1a1a1a]" },
          }}
        />
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-56 bg-[#f0f0e8] border-r-2 border-[#1a1a1a] flex-col z-40">
        <NavContent />
      </aside>

      {/* Mobile top bar */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-[#f0f0e8] border-b-2 border-[#1a1a1a] z-40 flex items-center justify-between px-4">
        <Link to="/dashboard" className="text-lg font-black tracking-tighter">
          PAGE<span className="text-[#2d5a2d]">PULSE</span>
        </Link>
        <button
          onClick={() => setMobileOpen(true)}
          className="w-10 h-10 border-2 border-[#1a1a1a] flex items-center justify-center"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </header>

      {/* Mobile slide-out drawer */}
      {mobileOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 bg-[#1a1a1a]/40 z-50"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="md:hidden fixed left-0 top-0 bottom-0 w-72 bg-[#f0f0e8] border-r-2 border-[#1a1a1a] flex flex-col z-50">
            <NavContent onClose={() => setMobileOpen(false)} />
          </aside>
        </>
      )}

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#f0f0e8] border-t-2 border-[#1a1a1a] z-40 flex">
        {navItems.map((item) => {
          const active = isActive(item.to, item.exact);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex-1 flex flex-col items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                active ? "text-[#2d5a2d]" : "text-[#888]"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}

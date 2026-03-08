import { Link, useMatches } from "@tanstack/react-router";
import { UserButton } from "@clerk/tanstack-react-start";
import {
  BarChart3,
  Eye,
  Settings,
  Zap,
} from "lucide-react";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: BarChart3, exact: true },
  { to: "/dashboard/monitors", label: "Monitors", icon: Eye, exact: false },
  { to: "/dashboard/settings", label: "Settings", icon: Settings, exact: true },
] as const;

export function DashboardSidebar() {
  const matches = useMatches();
  const currentPath = matches[matches.length - 1]?.fullPath ?? "";

  function isActive(to: string, exact: boolean) {
    if (exact) return currentPath === to || currentPath === to + "/";
    // "Monitors" should also be active for monitor detail/settings and new monitor pages
    if (to === "/dashboard/monitors") {
      return (
        currentPath.startsWith("/dashboard/monitors") ||
        currentPath.startsWith("/dashboard/$monitorId") ||
        currentPath === "/dashboard/new"
      );
    }
    return currentPath.startsWith(to);
  }

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-56 bg-[#f0f0e8] border-r-2 border-[#1a1a1a] flex flex-col z-40">
      {/* Logo */}
      <div className="px-5 py-5 border-b-2 border-[#1a1a1a]">
        <Link to="/dashboard" className="text-xl font-black tracking-tighter">
          PAGE<span className="text-[#2d5a2d]">PULSE</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const active = isActive(item.to, item.exact);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-3 py-2.5 text-sm font-bold uppercase tracking-wider transition-colors ${
                active
                  ? "text-[#2d5a2d] bg-[#2d5a2d]/5"
                  : "text-[#888] hover:text-[#1a1a1a] hover:bg-[#e8e8e0]"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Usage indicator */}
      <div className="px-4 py-3 border-t border-[#ccc]">
        <div className="flex items-center gap-2 mb-1">
          <Zap className="w-3 h-3 text-[#2d5a2d]" />
          <span className="text-[10px] font-bold uppercase text-[#888]">
            Free plan
          </span>
        </div>
      </div>

      {/* User */}
      <div className="px-4 py-4 border-t-2 border-[#1a1a1a]">
        <UserButton
          appearance={{
            elements: {
              avatarBox: "border-2 border-[#1a1a1a]",
            },
          }}
        />
      </div>
    </aside>
  );
}

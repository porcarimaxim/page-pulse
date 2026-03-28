import { Link, useMatches } from "@tanstack/react-router";
import { UserButton, useUser } from "@clerk/tanstack-react-start";
import {
  LayoutDashboard,
  Eye,
  Settings,
  Shield,
  Zap,
  Menu,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/dashboard/monitors", label: "Monitors", icon: Eye, exact: false },
  { to: "/dashboard/settings", label: "Settings", icon: Settings, exact: true },
] as const;

function UserInfo() {
  const { user } = useUser();
  const name =
    user?.fullName || user?.firstName || user?.username || "User";
  const email = user?.primaryEmailAddress?.emailAddress;

  return (
    <div className="px-4 py-3 border-t border-gray-200">
      <div className="flex items-center gap-2.5">
        <UserButton
          appearance={{
            elements: { avatarBox: "border border-gray-200 rounded-full w-8 h-8" },
          }}
        />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold truncate">{name}</p>
          {email && (
            <p className="text-xs text-gray-500 truncate">{email}</p>
          )}
        </div>
      </div>
    </div>
  );
}

const ADMIN_USER_IDS = (
  import.meta.env.VITE_ADMIN_USER_IDS ?? ""
)
  .split(",")
  .map((s: string) => s.trim())
  .filter(Boolean);

export function DashboardSidebar() {
  const { user } = useUser();
  const isAdmin = user?.id && ADMIN_USER_IDS.includes(user.id);
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
      <div className="px-5 py-5 border-b border-gray-200 flex items-center justify-between">
        <Link
          to="/dashboard"
          className="text-xl font-bold"
          onClick={onClose}
        >
          PAGE<span className="text-emerald-600">PULSE</span>
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
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
              className={`flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
                active
                  ? "text-emerald-600 bg-emerald-50 border-l-2 border-emerald-600"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-100 border-l-2 border-transparent"
              }`}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
        {isAdmin && (
          <Link
            to="/dashboard/admin"
            onClick={onClose}
            className={`flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
              isActive("/dashboard/admin", true)
                ? "text-emerald-600 bg-emerald-50 border-l-2 border-emerald-600"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-100 border-l-2 border-transparent"
            }`}
          >
            <Shield className="w-4 h-4 shrink-0" />
            Admin
          </Link>
        )}
      </nav>

      <Link
        to="/dashboard/settings"
        onClick={onClose}
        className="block px-4 py-3 border-t border-gray-200 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Zap className="w-3 h-3 text-emerald-600" />
          <span className="text-xs font-medium text-gray-500">
            Manage Plan
          </span>
        </div>
      </Link>

      <UserInfo />
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-56 bg-white border-r border-gray-200 flex-col z-40">
        <NavContent />
      </aside>

      {/* Mobile top bar */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 z-40 flex items-center justify-between px-4">
        <Link to="/dashboard" className="text-lg font-bold">
          PAGE<span className="text-emerald-600">PULSE</span>
        </Link>
        <button
          onClick={() => setMobileOpen(true)}
          className="w-10 h-10 border border-gray-200 rounded-lg flex items-center justify-center"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </header>

      {/* Mobile slide-out drawer */}
      {mobileOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 bg-black/40 z-50"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="md:hidden fixed left-0 top-0 bottom-0 w-72 bg-white border-r border-gray-200 flex flex-col z-50 shadow-lg">
            <NavContent onClose={() => setMobileOpen(false)} />
          </aside>
        </>
      )}

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 z-40 flex">
        {navItems.map((item) => {
          const active = isActive(item.to, item.exact);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex-1 flex flex-col items-center justify-center gap-1 text-xs font-medium transition-colors ${
                active ? "text-emerald-600 border-t-2 border-emerald-600 -mt-[2px]" : "text-gray-500 border-t-2 border-transparent -mt-[2px]"
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

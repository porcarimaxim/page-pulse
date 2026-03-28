import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation } from "convex/react";
import { useAuth } from "@clerk/tanstack-react-start";
import { api } from "@convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ZoneFocusedPreview } from "@/components/monitor/ZoneFocusedPreview";
import { formatRelativeTime, intervalLabel } from "@/lib/utils";
import {
  Plus,
  Search,
  Eye,
  AlertTriangle,
  Clock,
  Zap,
  LayoutGrid,
  List,
  ArrowRight,
} from "lucide-react";
import { useState, useMemo } from "react";
import type { Id } from "@convex/_generated/dataModel";

export const Route = createFileRoute("/dashboard/monitors")({
  component: MonitorsListPage,
});

type StatusFilter = "all" | "active" | "paused" | "error";
type ViewMode = "cards" | "list";

/* ─── Shared types ─── */

type Monitor = {
  _id: string;
  name: string;
  url: string;
  status: "active" | "paused" | "error";
  interval: string;
  lastCheckedAt?: number;
  changeCount: number;
  consecutiveErrors: number;
  screenshotUrl: string | null;
  selectionMode?: string;
  cssSelector?: string;
  tags?: string[];
  zone: { x: number; y: number; width: number; height: number };
};

/* ─── Page ─── */

function MonitorsListPage() {
  const { isSignedIn } = useAuth();
  const monitors = useQuery(api.monitors.list, isSignedIn ? {} : "skip");
  const usage = useQuery(api.monitors.usage, isSignedIn ? {} : "skip");
  const pauseMonitor = useMutation(api.monitors.pause);
  const resumeMonitor = useMutation(api.monitors.resume);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    try {
      const saved = localStorage.getItem("pagepulse:monitors-view");
      if (saved === "list" || saved === "cards") return saved;
    } catch {}
    return "cards";
  });

  const setAndPersistViewMode = (mode: ViewMode) => {
    setViewMode(mode);
    try {
      localStorage.setItem("pagepulse:monitors-view", mode);
    } catch {}
  };

  const stats = useMemo(() => {
    if (!monitors)
      return { total: 0, active: 0, paused: 0, errored: 0, changes: 0 };
    return {
      total: monitors.length,
      active: monitors.filter((m) => m.status === "active").length,
      paused: monitors.filter((m) => m.status === "paused").length,
      errored: monitors.filter((m) => m.status === "error").length,
      changes: monitors.reduce((sum, m) => sum + m.changeCount, 0),
    };
  }, [monitors]);

  const filteredMonitors = useMemo(() => {
    if (!monitors) return [];
    let result = monitors;
    if (statusFilter !== "all") {
      result = result.filter((m) => m.status === statusFilter);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(q) || m.url.toLowerCase().includes(q)
      );
    }
    return result;
  }, [monitors, search, statusFilter]);

  const handleToggle = async (monitorId: string, currentStatus: string) => {
    const id = monitorId as Id<"monitors">;
    if (currentStatus === "active") {
      await pauseMonitor({ monitorId: id });
    } else {
      await resumeMonitor({ monitorId: id });
    }
  };

  return (
    <main className="px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter">
            Monitors
          </h1>
          <p className="text-sm text-[#888] mt-1">
            {monitors
              ? `${monitors.length} monitor${monitors.length !== 1 ? "s" : ""} tracking ${stats.changes} change${stats.changes !== 1 ? "s" : ""}`
              : "Loading..."}
          </p>
        </div>
        <Button asChild>
          <Link to="/dashboard/new">
            <Plus className="w-4 h-4" />
            New Monitor
          </Link>
        </Button>
      </div>

      {/* Plan usage bar — hidden for unlimited/special plans */}
      {usage && usage.maxMonitors !== -1 && (
        <div className="border-2 border-[#ccc] p-4 mb-6 flex items-center gap-6">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#888]">
                {usage.planName} Plan — Monitors
              </span>
              <span className="text-xs font-black tracking-tighter">
                {usage.monitorCount}
                <span className="text-[#888] font-bold">
                  {" / "}
                  {usage.maxMonitors}
                </span>
              </span>
            </div>
            <div className="h-1.5 bg-[#e8e8e0] border border-[#ccc] overflow-hidden">
              <div
                className={`h-full transition-all ${
                  usage.monitorCount >= usage.maxMonitors
                    ? "bg-[#dc2626]"
                    : usage.monitorCount >= usage.maxMonitors * 0.8
                      ? "bg-[#ca8a04]"
                      : "bg-[#2d5a2d]"
                }`}
                style={{
                  width: `${Math.min(100, (usage.monitorCount / usage.maxMonitors) * 100)}%`,
                }}
              />
            </div>
          </div>
          {usage.monitorCount >= usage.maxMonitors && (
            <Link
              to="/pricing"
              className="text-[10px] font-bold uppercase tracking-wider text-[#2d5a2d] hover:underline underline-offset-4 shrink-0"
            >
              Upgrade →
            </Link>
          )}
        </div>
      )}

      {monitors === undefined ? (
        <div className="text-center py-20 text-[#888]">Loading...</div>
      ) : monitors.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* Filter bar */}
          <div className="flex items-center gap-3 mb-6">
            {/* Status tabs */}
            <div className="flex border-2 border-[#1a1a1a]">
              {(
                [
                  { key: "all", label: "All", count: stats.total },
                  { key: "active", label: "Active", count: stats.active },
                  { key: "paused", label: "Paused", count: stats.paused },
                  { key: "error", label: "Errors", count: stats.errored },
                ] as const
              ).map((tab, i) => (
                <button
                  key={tab.key}
                  onClick={() => setStatusFilter(tab.key)}
                  className={`px-3 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                    i > 0 ? "border-l-2 border-[#1a1a1a]" : ""
                  } ${
                    statusFilter === tab.key
                      ? "bg-[#1a1a1a] text-[#f0f0e8]"
                      : "text-[#888] hover:bg-[#e8e8e0]"
                  }`}
                >
                  {tab.label}
                  <span className="ml-1 opacity-60">{tab.count}</span>
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888]" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search monitors..."
                className="pl-10"
              />
            </div>

            <div className="flex-1" />

            {/* View mode toggle */}
            <div className="flex border-2 border-[#1a1a1a]">
              <button
                onClick={() => setAndPersistViewMode("cards")}
                aria-pressed={viewMode === "cards"}
                aria-label="Card view"
                className={`p-2 transition-colors ${
                  viewMode === "cards"
                    ? "bg-[#1a1a1a] text-[#f0f0e8]"
                    : "text-[#888] hover:bg-[#e8e8e0]"
                }`}
                title="Card view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setAndPersistViewMode("list")}
                aria-pressed={viewMode === "list"}
                aria-label="List view"
                className={`p-2 border-l-2 border-[#1a1a1a] transition-colors ${
                  viewMode === "list"
                    ? "bg-[#1a1a1a] text-[#f0f0e8]"
                    : "text-[#888] hover:bg-[#e8e8e0]"
                }`}
                title="List view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[10px] text-[#888] uppercase tracking-wider">
              {filteredMonitors.length} shown
            </p>
          </div>

          {/* Content */}
          {viewMode === "cards" ? (
            <CardGrid
              monitors={filteredMonitors as Monitor[]}
              onToggle={handleToggle}
            />
          ) : (
            <ListView
              monitors={filteredMonitors as Monitor[]}
              onToggle={handleToggle}
            />
          )}

          {/* No results */}
          {filteredMonitors.length === 0 && (
            <div className="border-2 border-[#ccc] border-dashed p-12 text-center mt-4">
              <Search className="w-8 h-8 text-[#ccc] mx-auto mb-3" />
              <p className="text-sm font-bold text-[#888]">
                No monitors match your filters
              </p>
              <button
                onClick={() => {
                  setSearch("");
                  setStatusFilter("all");
                }}
                className="text-xs text-[#2d5a2d] hover:underline mt-2"
              >
                Clear filters
              </button>
            </div>
          )}
        </>
      )}
    </main>
  );
}

/* ─── Card Grid View ─── */

function CardGrid({
  monitors,
  onToggle,
}: {
  monitors: Monitor[];
  onToggle: (id: string, status: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {monitors.map((monitor) => (
        <div
          key={monitor._id}
          className="border-2 border-[#1a1a1a] group hover:shadow-[4px_4px_0px_0px_#1a1a1a] transition-all"
        >
          {/* Screenshot */}
          <Link
            to="/dashboard/$monitorId"
            params={{ monitorId: monitor._id } as any}
            className="block relative h-36 border-b-2 border-[#1a1a1a] overflow-hidden"
          >
            <ZoneFocusedPreview
              screenshotUrl={monitor.screenshotUrl}
              zone={monitor.zone}
              selectionMode={monitor.selectionMode}
              className="h-full"
            />
            <StatusBadge status={monitor.status} className="absolute top-2 right-2 z-10" />
            {monitor.changeCount > 0 && (
              <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-[#1a1a1a] text-[#f0f0e8] px-1.5 py-0.5 z-10">
                <Zap className="w-2.5 h-2.5" />
                <span className="text-[9px] font-bold">{monitor.changeCount}</span>
              </div>
            )}
          </Link>

          {/* Info */}
          <div className="p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <Link
                to="/dashboard/$monitorId"
                params={{ monitorId: monitor._id } as any}
                className="flex-1 min-w-0"
              >
                <h3 className="text-sm font-black uppercase tracking-tighter truncate group-hover:text-[#2d5a2d] transition-colors">
                  {monitor.name}
                </h3>
                <p className="text-[10px] text-[#888] font-mono truncate mt-0.5">
                  {monitor.url}
                </p>
              </Link>
              <ToggleSwitch
                active={monitor.status === "active"}
                onToggle={() => onToggle(monitor._id, monitor.status)}
              />
            </div>
            <div className="flex items-center gap-3 text-[10px] text-[#888]">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {intervalLabel(monitor.interval)}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {monitor.lastCheckedAt
                  ? formatRelativeTime(monitor.lastCheckedAt)
                  : "Never"}
              </span>
            </div>
            {monitor.tags && monitor.tags.length > 0 && (
              <div className="flex gap-1 mt-2 flex-wrap">
                {monitor.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="text-[8px] uppercase font-bold text-[#888] bg-[#e8e8e0] border border-[#ccc] px-1.5 py-0"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            {monitor.status === "error" && (
              <div className="flex items-center gap-1.5 mt-2 text-[10px] text-[#dc2626] font-bold">
                <AlertTriangle className="w-3 h-3" />
                {monitor.consecutiveErrors} consecutive failures
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── List View ─── */

function ListView({
  monitors,
  onToggle,
}: {
  monitors: Monitor[];
  onToggle: (id: string, status: string) => void;
}) {
  return (
    <div className="border-2 border-[#1a1a1a]">
      {/* Table header */}
      <div className="grid grid-cols-[auto_2fr_1fr_1fr_1fr_auto_auto] gap-4 px-4 py-3 bg-[#1a1a1a] text-[#f0f0e8] items-center">
        <span className="text-[10px] font-bold uppercase tracking-wider w-12" />
        <span className="text-[10px] font-bold uppercase tracking-wider">
          Monitor
        </span>
        <span className="text-[10px] font-bold uppercase tracking-wider">
          Interval
        </span>
        <span className="text-[10px] font-bold uppercase tracking-wider">
          Last Check
        </span>
        <span className="text-[10px] font-bold uppercase tracking-wider">
          Changes
        </span>
        <span className="text-[10px] font-bold uppercase tracking-wider w-16 text-center">
          Status
        </span>
        <span className="text-[10px] font-bold uppercase tracking-wider w-12" />
      </div>

      {monitors.map((monitor, i) => (
        <Link
          key={monitor._id}
          to="/dashboard/$monitorId"
          params={{ monitorId: monitor._id } as any}
          className={`grid grid-cols-[auto_2fr_1fr_1fr_1fr_auto_auto] gap-4 px-4 py-3 items-center hover:bg-[#e8e8e0] transition-colors ${
            i < monitors.length - 1 ? "border-b border-[#ccc]" : ""
          }`}
        >
          {/* Thumbnail */}
          <div className="w-12 h-8 bg-[#e8e8e0] border border-[#ccc] overflow-hidden shrink-0">
            {monitor.screenshotUrl ? (
              <img
                src={monitor.screenshotUrl}
                alt=""
                className="w-full h-full object-cover object-top"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Eye className="w-3 h-3 text-[#ccc]" />
              </div>
            )}
          </div>

          {/* Name + URL */}
          <div className="min-w-0">
            <p className="text-sm font-black uppercase tracking-tighter truncate">
              {monitor.name}
            </p>
            <p className="text-[10px] text-[#888] font-mono truncate">
              {monitor.url}
            </p>
          </div>

          {/* Interval */}
          <span className="text-xs text-[#888]">
            {intervalLabel(monitor.interval)}
          </span>

          {/* Last check */}
          <span className="text-xs text-[#888]">
            {monitor.lastCheckedAt
              ? formatRelativeTime(monitor.lastCheckedAt)
              : "Never"}
          </span>

          {/* Changes */}
          <div className="flex items-center gap-2">
            <span
              className={`text-sm font-black ${
                monitor.changeCount > 0 ? "text-[#1a1a1a]" : "text-[#ccc]"
              }`}
            >
              {monitor.changeCount}
            </span>
            {monitor.status === "error" && (
              <AlertTriangle className="w-3.5 h-3.5 text-[#dc2626]" />
            )}
          </div>

          {/* Status */}
          <StatusBadge status={monitor.status} />

          {/* Toggle */}
          <ToggleSwitch
            active={monitor.status === "active"}
            onToggle={() => onToggle(monitor._id, monitor.status)}
          />
        </Link>
      ))}
    </div>
  );
}

/* ─── Shared Components ─── */

function ToggleSwitch({
  active,
  onToggle,
}: {
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggle();
      }}
      role="switch"
      aria-checked={active}
      aria-label={active ? "Pause monitor" : "Resume monitor"}
      className={`w-9 h-5 relative transition-colors shrink-0 ${
        active ? "bg-[#2d5a2d]" : "bg-[#ccc]"
      }`}
      title={active ? "Pause monitor" : "Resume monitor"}
    >
      <div
        className={`absolute top-0.5 w-4 h-4 bg-[#f0f0e8] transition-transform ${
          active ? "translate-x-4" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

function EmptyState() {
  return (
    <div className="border-2 border-[#1a1a1a] border-dashed p-16 text-center">
      <Eye className="w-12 h-12 mx-auto mb-4 text-[#888]" />
      <h2 className="text-xl font-black uppercase tracking-tighter mb-2">
        No Monitors Yet
      </h2>
      <p className="text-sm text-[#888] mb-6 max-w-sm mx-auto">
        Create your first monitor to start tracking a webpage for changes.
      </p>
      <Button asChild>
        <Link to="/dashboard/new">
          <Plus className="w-4 h-4" />
          Create Your First Monitor
        </Link>
      </Button>
    </div>
  );
}

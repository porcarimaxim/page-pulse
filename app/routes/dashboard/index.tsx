import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation } from "convex/react";
import { useAuth } from "@clerk/tanstack-react-start";
import { api } from "@convex/_generated/api";
import { formatRelativeTime, intervalLabel } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Eye,
  AlertTriangle,
  Plus,
  ArrowRight,
  CheckCheck,
  Check,
  Activity,
  Clock,
  Zap,
} from "lucide-react";
import { useMemo } from "react";
import type { Id } from "@convex/_generated/dataModel";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardOverview,
});

/* ─── Helpers ─── */

function diffSeverity(pct: number): "low" | "medium" | "high" {
  if (pct < 5) return "low";
  if (pct < 20) return "medium";
  return "high";
}
function severityBg(s: "low" | "medium" | "high") {
  return s === "low"
    ? "bg-[#2d5a2d]"
    : s === "medium"
      ? "bg-[#ca8a04]"
      : "bg-[#dc2626]";
}
function severityText(s: "low" | "medium" | "high") {
  return s === "low"
    ? "text-[#2d5a2d]"
    : s === "medium"
      ? "text-[#ca8a04]"
      : "text-[#dc2626]";
}

/* ─── Page ─── */

function DashboardOverview() {
  const { isSignedIn } = useAuth();
  const monitors = useQuery(api.monitors.list, isSignedIn ? {} : "skip");
  const usage = useQuery(api.monitors.usage, isSignedIn ? {} : "skip");
  const recentChanges = useQuery(
    api.changes.recentAcrossMonitors,
    isSignedIn ? { limit: 30 } : "skip"
  );
  const markReviewed = useMutation(api.changes.markReviewed);
  const markAllReviewed = useMutation(api.changes.markAllReviewed);

  const { unreviewed, reviewed, errorMonitors, activeMonitors, pausedMonitors } =
    useMemo(() => {
      const unrev = (recentChanges ?? []).filter((c) => !c.reviewed);
      const rev = (recentChanges ?? []).filter((c) => c.reviewed);
      const errMon = (monitors ?? []).filter((m) => m.status === "error");
      const actMon = (monitors ?? []).filter((m) => m.status === "active");
      const pausMon = (monitors ?? []).filter((m) => m.status === "paused");
      return {
        unreviewed: unrev,
        reviewed: rev,
        errorMonitors: errMon,
        activeMonitors: actMon,
        pausedMonitors: pausMon,
      };
    }, [recentChanges, monitors]);

  const totalChanges = (monitors ?? []).reduce(
    (sum, m) => sum + m.changeCount,
    0
  );

  // Find next check time
  const nextCheck = useMemo(() => {
    if (!monitors || monitors.length === 0) return null;
    const upcoming = monitors
      .filter((m) => m.status === "active" && m.nextCheckAt)
      .sort((a, b) => (a.nextCheckAt ?? 0) - (b.nextCheckAt ?? 0));
    return upcoming[0]?.nextCheckAt ?? null;
  }, [monitors]);

  // Most active monitors (by change count)
  const topMonitors = useMemo(() => {
    if (!monitors) return [];
    return [...monitors]
      .filter((m) => m.changeCount > 0)
      .sort((a, b) => b.changeCount - a.changeCount)
      .slice(0, 5);
  }, [monitors]);

  // Change frequency: today, 7d, 30d
  const changeFrequency = useMemo(() => {
    const all = recentChanges ?? [];
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;
    return {
      today: all.filter((c) => now - c.detectedAt < day).length,
      week: all.filter((c) => now - c.detectedAt < 7 * day).length,
      month: all.length,
    };
  }, [recentChanges]);

  // Recently checked monitors (last 3 checked)
  const recentlyChecked = useMemo(() => {
    if (!monitors) return [];
    return [...monitors]
      .filter((m) => m.lastCheckedAt)
      .sort((a, b) => (b.lastCheckedAt ?? 0) - (a.lastCheckedAt ?? 0))
      .slice(0, 4);
  }, [monitors]);

  // Monitors currently checking
  const checkingNow = useMemo(() => {
    return (monitors ?? []).filter((m) => m.isChecking);
  }, [monitors]);

  return (
    <main className="px-8 py-8">
      {/* Header */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter">
            Dashboard
          </h1>
          <p className="text-sm text-[#888] mt-1">
            {unreviewed.length > 0
              ? `${unreviewed.length} unreviewed change${unreviewed.length !== 1 ? "s" : ""} need your attention`
              : "All caught up"}
          </p>
        </div>
        <Button asChild>
          <Link to="/dashboard/new">
            <Plus className="w-4 h-4" />
            New Monitor
          </Link>
        </Button>
      </div>

      {/* ─── Errors (always top, full-width) ─── */}
      {errorMonitors.length > 0 && (
        <div className="border-2 border-[#dc2626] bg-[#fff5f5] p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-[#dc2626]" />
            <span className="text-xs font-black uppercase tracking-wider text-[#dc2626]">
              {errorMonitors.length} monitor
              {errorMonitors.length > 1 ? "s" : ""} failing
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {errorMonitors.slice(0, 4).map((m) => (
              <Link
                key={m._id}
                to="/dashboard/$monitorId"
                params={{ monitorId: m._id } as any}
                className="flex items-center gap-2 px-3 py-1.5 border border-[#dc2626]/30 hover:bg-[#fecaca] transition-colors text-xs"
              >
                <span className="font-bold truncate max-w-40">{m.name}</span>
                <span className="text-[#dc2626]">
                  {m.consecutiveErrors} failures
                </span>
                <ArrowRight className="w-3 h-3 text-[#dc2626]" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ─── Two-column layout ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* ─── Left: Inbox ─── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#888]">
              Recent Changes
            </h2>
            {unreviewed.length > 0 && (
              <button
                onClick={() => markAllReviewed({})}
                className="text-[10px] font-bold uppercase tracking-wider text-[#2d5a2d] hover:underline underline-offset-4"
              >
                Mark All Reviewed
              </button>
            )}
          </div>

          {recentChanges === undefined ? (
            <div className="text-center py-12 text-[#888]">Loading...</div>
          ) : unreviewed.length === 0 && reviewed.length === 0 ? (
            <div className="border-2 border-[#1a1a1a] border-dashed p-12 text-center">
              <Eye className="w-10 h-10 text-[#ccc] mx-auto mb-4" />
              <p className="text-lg font-black uppercase tracking-tighter mb-2">
                No changes yet
              </p>
              <p className="text-sm text-[#888] mb-6 max-w-sm mx-auto">
                When your monitors detect changes, they'll appear here.
              </p>
              <Button asChild>
                <Link to="/dashboard/new">
                  Create a Monitor <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </div>
          ) : (
            <>
              {/* Unreviewed */}
              {unreviewed.length > 0 && (
                <div className="border-2 border-[#1a1a1a] mb-4">
                  <div className="flex items-center justify-between px-4 py-2.5 bg-[#1a1a1a] text-[#f0f0e8]">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-[#dc2626] flex items-center justify-center text-[9px] font-black">
                        {unreviewed.length}
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wider">
                        Unreviewed
                      </span>
                    </div>
                  </div>
                  {unreviewed.map((change, i) => (
                    <InboxRow
                      key={change._id}
                      change={change}
                      onMarkReviewed={() =>
                        markReviewed({
                          changeId: change._id as Id<"changes">,
                          reviewed: true,
                        })
                      }
                      isLast={i === unreviewed.length - 1}
                    />
                  ))}
                </div>
              )}

              {/* All caught up */}
              {unreviewed.length === 0 && reviewed.length > 0 && (
                <div className="border-2 border-[#2d5a2d] bg-[#f0f8f0] p-6 text-center mb-4">
                  <CheckCheck className="w-6 h-6 text-[#2d5a2d] mx-auto mb-2" />
                  <p className="text-sm font-black uppercase tracking-tighter text-[#2d5a2d]">
                    All caught up
                  </p>
                  <p className="text-xs text-[#888] mt-1">
                    No unreviewed changes. Recent history is below.
                  </p>
                </div>
              )}

              {/* Reviewed */}
              {reviewed.length > 0 && (
                <div className="border-2 border-[#ccc]">
                  <div className="px-4 py-2.5 border-b border-[#ccc]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#888]">
                      Reviewed ({reviewed.length})
                    </span>
                  </div>
                  {reviewed.slice(0, 8).map((change, i) => (
                    <InboxRow
                      key={change._id}
                      change={change}
                      onMarkReviewed={() =>
                        markReviewed({
                          changeId: change._id as Id<"changes">,
                          reviewed: false,
                        })
                      }
                      isLast={i === Math.min(reviewed.length, 8) - 1}
                      muted
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* ─── Right: Overview sidebar ─── */}
        <div className="space-y-4">
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2">
            <div className="border-2 border-[#1a1a1a] p-3 text-center">
              <p className="text-xl font-black tracking-tighter">
                {activeMonitors.length}
              </p>
              <p className="text-[9px] font-bold uppercase tracking-wider text-[#888] mt-0.5">
                Active
              </p>
            </div>
            <div className="border-2 border-[#1a1a1a] p-3 text-center">
              <p className="text-xl font-black tracking-tighter">
                {totalChanges}
              </p>
              <p className="text-[9px] font-bold uppercase tracking-wider text-[#888] mt-0.5">
                Total
              </p>
            </div>
            <div className="border-2 border-[#1a1a1a] p-3 text-center">
              <p className={`text-xl font-black tracking-tighter ${errorMonitors.length > 0 ? "text-[#dc2626]" : ""}`}>
                {errorMonitors.length}
              </p>
              <p className="text-[9px] font-bold uppercase tracking-wider text-[#888] mt-0.5">
                Errors
              </p>
            </div>
          </div>

          {/* Change frequency */}
          <div className="border-2 border-[#1a1a1a] p-4">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-3.5 h-3.5 text-[#2d5a2d]" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#888]">
                Change Frequency
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <p className="text-lg font-black tracking-tighter">{changeFrequency.today}</p>
                <p className="text-[9px] text-[#888] uppercase">Today</p>
              </div>
              <div>
                <p className="text-lg font-black tracking-tighter">{changeFrequency.week}</p>
                <p className="text-[9px] text-[#888] uppercase">7 days</p>
              </div>
              <div>
                <p className="text-lg font-black tracking-tighter">{changeFrequency.month}</p>
                <p className="text-[9px] text-[#888] uppercase">30 days</p>
              </div>
            </div>
          </div>

          {/* Live status */}
          <div className="border-2 border-[#ccc] p-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-3.5 h-3.5 text-[#888]" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#888]">
                Status
              </span>
            </div>
            {checkingNow.length > 0 && (
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-[#2d5a2d] animate-pulse" />
                <span className="text-xs text-[#2d5a2d] font-bold">
                  Checking {checkingNow.length} monitor{checkingNow.length > 1 ? "s" : ""} now
                </span>
              </div>
            )}
            {nextCheck && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#888]">Next check</span>
                <span className="text-xs font-bold">{formatRelativeTime(nextCheck)}</span>
              </div>
            )}
            {pausedMonitors.length > 0 && (
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-[#888]">Paused</span>
                <span className="text-xs font-bold text-[#888]">{pausedMonitors.length}</span>
              </div>
            )}
          </div>

          {/* Plan usage */}
          {usage && usage.maxMonitors !== -1 && (
            <div className="border-2 border-[#ccc] p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-[#2d5a2d]" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#888]">
                    {usage.planName} Plan
                  </span>
                </div>
                <span className="text-[10px] font-bold text-[#888]">
                  {usage.monitorCount} / {usage.maxMonitors}
                </span>
              </div>
              <div className="w-full h-1.5 bg-[#e8e8e0] border border-[#ccc]">
                <div
                  className="h-full bg-[#2d5a2d]"
                  style={{
                    width: `${Math.min(100, (usage.monitorCount / usage.maxMonitors) * 100)}%`,
                  }}
                />
              </div>
              {usage.monitorCount >= usage.maxMonitors && (
                <Link
                  to="/pricing"
                  className="block mt-2 text-[10px] font-bold uppercase tracking-wider text-[#2d5a2d] hover:underline underline-offset-4"
                >
                  Upgrade →
                </Link>
              )}
            </div>
          )}

          {/* Recently checked */}
          {recentlyChecked.length > 0 && (
            <div className="border-2 border-[#ccc]">
              <div className="px-4 py-2.5 border-b border-[#ccc]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#888]">
                  Recently Checked
                </span>
              </div>
              {recentlyChecked.map((m, i) => (
                <Link
                  key={m._id}
                  to="/dashboard/$monitorId"
                  params={{ monitorId: m._id } as any}
                  className={`flex items-center gap-3 px-4 py-2 hover:bg-[#e8e8e0] transition-colors ${
                    i < recentlyChecked.length - 1 ? "border-b border-[#eee]" : ""
                  }`}
                >
                  <div
                    className={`w-2 h-2 shrink-0 ${
                      m.status === "active"
                        ? "bg-[#2d5a2d]"
                        : m.status === "error"
                          ? "bg-[#dc2626]"
                          : "bg-[#888]"
                    }`}
                  />
                  <span className="text-[11px] font-bold truncate flex-1">
                    {m.name}
                  </span>
                  <span className="text-[9px] text-[#888] shrink-0">
                    {formatRelativeTime(m.lastCheckedAt!)}
                  </span>
                </Link>
              ))}
            </div>
          )}

          {/* Most active monitors */}
          {topMonitors.length > 0 && (
            <div className="border-2 border-[#ccc]">
              <div className="px-4 py-2.5 border-b border-[#ccc]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#888]">
                  Most Active
                </span>
              </div>
              {topMonitors.map((m, i) => (
                <Link
                  key={m._id}
                  to="/dashboard/$monitorId"
                  params={{ monitorId: m._id } as any}
                  className={`flex items-center gap-3 px-4 py-2 hover:bg-[#e8e8e0] transition-colors ${
                    i < topMonitors.length - 1 ? "border-b border-[#eee]" : ""
                  }`}
                >
                  <span className="text-[11px] font-bold truncate flex-1">
                    {m.name}
                  </span>
                  <span className="text-[10px] font-bold tabular-nums text-[#888]">
                    {m.changeCount} changes
                  </span>
                </Link>
              ))}
              <Link
                to="/dashboard/monitors"
                className="block px-4 py-2.5 border-t border-[#ccc] text-[10px] font-bold uppercase tracking-wider text-[#2d5a2d] hover:bg-[#e8e8e0] transition-colors text-center"
              >
                View All Monitors →
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

/* ─── Inbox Row ─── */

function InboxRow({
  change,
  onMarkReviewed,
  isLast,
  muted,
}: {
  change: {
    _id: string;
    monitorId: string;
    monitorName: string;
    monitorUrl: string;
    diffPercentage: number;
    detectedAt: number;
    aiSummary?: string;
    reviewed?: boolean;
  };
  onMarkReviewed: () => void;
  isLast: boolean;
  muted?: boolean;
}) {
  const severity = diffSeverity(change.diffPercentage);

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 ${
        !isLast ? "border-b border-[#ccc]" : ""
      } ${muted ? "opacity-60" : ""} hover:bg-[#e8e8e0] transition-colors`}
    >
      {/* Severity dot */}
      <div
        className={`w-2.5 h-2.5 ${severityBg(severity)} mt-1.5 shrink-0 ${
          !change.reviewed ? "" : "opacity-40"
        }`}
      />

      {/* Content */}
      <Link
        to="/dashboard/$monitorId"
        params={{ monitorId: change.monitorId } as any}
        className="flex-1 min-w-0"
      >
        <div className="flex items-center gap-2 mb-0.5">
          <span
            className={`text-sm font-black uppercase tracking-tighter truncate ${
              muted ? "text-[#888]" : ""
            }`}
          >
            {change.monitorName}
          </span>
          <span
            className={`text-[10px] font-bold uppercase tracking-wider ${severityText(severity)}`}
          >
            {change.diffPercentage.toFixed(1)}%
          </span>
          <span className="text-[10px] text-[#888] ml-auto shrink-0">
            {formatRelativeTime(change.detectedAt)}
          </span>
        </div>

        {/* AI summary */}
        {change.aiSummary && !change.aiSummary.startsWith("[Error]") ? (
          <p className="text-xs text-[#555] leading-snug line-clamp-1">
            {change.aiSummary}
          </p>
        ) : (
          <p className="text-[10px] text-[#888] font-mono truncate">
            {change.monitorUrl}
          </p>
        )}
      </Link>

      {/* Action button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onMarkReviewed();
        }}
        className={`shrink-0 mt-1 p-1.5 border transition-all ${
          change.reviewed
            ? "border-[#ccc] text-[#888] hover:border-[#1a1a1a] hover:text-[#1a1a1a]"
            : "border-[#2d5a2d] text-[#2d5a2d] hover:bg-[#2d5a2d] hover:text-[#f0f0e8]"
        }`}
        title={change.reviewed ? "Mark as unreviewed" : "Mark as reviewed"}
      >
        <Check className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

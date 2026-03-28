import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation } from "convex/react";
import { useAuth } from "@clerk/tanstack-react-start";
import { api } from "@convex/_generated/api";
import { formatRelativeTime, intervalLabel } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { InboxRow } from "@/components/monitor/InboxRow";
import { PlanUsageCard } from "@/components/monitor/PlanUsageCard";
import {
  Eye,
  AlertTriangle,
  Plus,
  ArrowRight,
  CheckCheck,
  Activity,
  Clock,
} from "lucide-react";
import { useMemo } from "react";
import type { Id } from "@convex/_generated/dataModel";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardOverview,
});

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
    return monitors.slice()
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
    return monitors.slice()
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
          <h1 className="text-3xl font-bold">
            Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">
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
        <div className="border border-red-500 bg-red-50 p-4 mb-6 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <span className="text-xs font-bold text-red-500">
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
                className="flex items-center gap-2 px-3 py-1.5 border border-red-500/30 hover:bg-red-100 transition-colors text-xs rounded-lg"
              >
                <span className="font-bold truncate max-w-40">{m.name}</span>
                <span className="text-red-500">
                  {m.consecutiveErrors} failures
                </span>
                <ArrowRight className="w-3 h-3 text-red-500" />
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
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Recent Changes
            </h2>
            {unreviewed.length > 0 && (
              <button
                onClick={() => markAllReviewed({})}
                className="text-xs font-bold text-emerald-600 hover:underline underline-offset-4"
              >
                Mark All Reviewed
              </button>
            )}
          </div>

          {recentChanges === undefined ? (
            <div className="text-center py-12 text-gray-500">Loading...</div>
          ) : unreviewed.length === 0 && reviewed.length === 0 ? (
            <div className="border border-gray-200 border-dashed p-12 text-center rounded-lg">
              <Eye className="w-10 h-10 text-gray-200 mx-auto mb-4" />
              <p className="text-lg font-bold mb-2">
                No changes yet
              </p>
              <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
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
                <div className="border border-gray-200 mb-4 rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2.5 bg-gray-900 text-white">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-red-500 rounded flex items-center justify-center text-xs font-bold text-white">
                        {unreviewed.length}
                      </div>
                      <span className="text-xs font-bold">
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
                <div className="border border-emerald-600 bg-emerald-50 p-6 text-center mb-4 rounded-lg">
                  <CheckCheck className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                  <p className="text-sm font-bold text-emerald-600">
                    All caught up
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    No unreviewed changes. Recent history is below.
                  </p>
                </div>
              )}

              {/* Reviewed */}
              {reviewed.length > 0 && (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="px-4 py-2.5 border-b border-gray-200">
                    <span className="text-xs font-bold text-gray-500">
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
            <div className="border border-gray-200 p-3 text-center rounded-lg">
              <p className="text-xl font-bold">
                {activeMonitors.length}
              </p>
              <p className="text-xs font-bold text-gray-500 mt-0.5">
                Active
              </p>
            </div>
            <div className="border border-gray-200 p-3 text-center rounded-lg">
              <p className="text-xl font-bold">
                {totalChanges}
              </p>
              <p className="text-xs font-bold text-gray-500 mt-0.5">
                Total
              </p>
            </div>
            <div className="border border-gray-200 p-3 text-center rounded-lg">
              <p className={`text-xl font-bold ${errorMonitors.length > 0 ? "text-red-500" : ""}`}>
                {errorMonitors.length}
              </p>
              <p className="text-xs font-bold text-gray-500 mt-0.5">
                Errors
              </p>
            </div>
          </div>

          {/* Change frequency */}
          <div className="border border-gray-200 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-xs font-bold text-gray-500">
                Change Frequency
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <p className="text-lg font-bold">{changeFrequency.today}</p>
                <p className="text-xs text-gray-500">Today</p>
              </div>
              <div>
                <p className="text-lg font-bold">{changeFrequency.week}</p>
                <p className="text-xs text-gray-500">7 days</p>
              </div>
              <div>
                <p className="text-lg font-bold">{changeFrequency.month}</p>
                <p className="text-xs text-gray-500">30 days</p>
              </div>
            </div>
          </div>

          {/* Live status */}
          <div className="border border-gray-200 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-3.5 h-3.5 text-gray-500" />
              <span className="text-xs font-bold text-gray-500">
                Status
              </span>
            </div>
            {checkingNow.length > 0 && (
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-emerald-600 rounded-full animate-pulse" />
                <span className="text-xs text-emerald-600 font-bold">
                  Checking {checkingNow.length} monitor{checkingNow.length > 1 ? "s" : ""} now
                </span>
              </div>
            )}
            {nextCheck && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Next check</span>
                <span className="text-xs font-bold">{formatRelativeTime(nextCheck)}</span>
              </div>
            )}
            {pausedMonitors.length > 0 && (
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-gray-500">Paused</span>
                <span className="text-xs font-bold text-gray-500">{pausedMonitors.length}</span>
              </div>
            )}
          </div>

          {/* Plan usage */}
          {usage && <PlanUsageCard usage={usage} />}

          {/* Recently checked */}
          {recentlyChecked.length > 0 && (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="px-4 py-2.5 border-b border-gray-200">
                <span className="text-xs font-bold text-gray-500">
                  Recently Checked
                </span>
              </div>
              {recentlyChecked.map((m, i) => (
                <Link
                  key={m._id}
                  to="/dashboard/$monitorId"
                  params={{ monitorId: m._id } as any}
                  className={`flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors ${
                    i < recentlyChecked.length - 1 ? "border-b border-gray-100" : ""
                  }`}
                >
                  <div
                    className={`w-2 h-2 shrink-0 rounded-full ${
                      m.status === "active"
                        ? "bg-emerald-600"
                        : m.status === "error"
                          ? "bg-red-500"
                          : "bg-gray-500"
                    }`}
                  />
                  <span className="text-xs font-bold truncate flex-1">
                    {m.name}
                  </span>
                  <span className="text-xs text-gray-500 shrink-0">
                    {formatRelativeTime(m.lastCheckedAt!)}
                  </span>
                </Link>
              ))}
            </div>
          )}

          {/* Most active monitors */}
          {topMonitors.length > 0 && (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="px-4 py-2.5 border-b border-gray-200">
                <span className="text-xs font-bold text-gray-500">
                  Most Active
                </span>
              </div>
              {topMonitors.map((m, i) => (
                <Link
                  key={m._id}
                  to="/dashboard/$monitorId"
                  params={{ monitorId: m._id } as any}
                  className={`flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors ${
                    i < topMonitors.length - 1 ? "border-b border-gray-100" : ""
                  }`}
                >
                  <span className="text-xs font-bold truncate flex-1">
                    {m.name}
                  </span>
                  <span className="text-xs font-bold tabular-nums text-gray-500">
                    {m.changeCount} changes
                  </span>
                </Link>
              ))}
              <Link
                to="/dashboard/monitors"
                className="block px-4 py-2.5 border-t border-gray-200 text-xs font-bold text-emerald-600 hover:bg-gray-50 transition-colors text-center"
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

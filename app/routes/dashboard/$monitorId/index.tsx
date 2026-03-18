import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation } from "convex/react";
import { useAuth } from "@clerk/tanstack-react-start";
import { api } from "@convex/_generated/api";
import { ChangeTimeline } from "@/components/monitor/ChangeTimeline";
import { ZoneFocusedPreview } from "@/components/monitor/ZoneFocusedPreview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatRelativeTime, intervalLabel } from "@/lib/utils";
import { toCSV, toJSON, downloadFile } from "@/lib/export";
import {
  ArrowLeft,
  RefreshCw,
  Settings,
  Trash2,
  ExternalLink,
  AlertTriangle,
  Loader2,
  Download,
  Clock,
  Eye,
  Zap,
  TrendingUp,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import type { Id } from "@convex/_generated/dataModel";

export const Route = createFileRoute("/dashboard/$monitorId/")({
  component: MonitorDetailPage,
});

/* ─── Severity helpers ─── */

function diffSeverity(pct: number): "low" | "medium" | "high" {
  if (pct < 5) return "low";
  if (pct < 20) return "medium";
  return "high";
}

function severityColor(severity: "low" | "medium" | "high") {
  switch (severity) {
    case "low":
      return { bg: "bg-[#2d5a2d]", text: "text-[#2d5a2d]", border: "border-[#2d5a2d]" };
    case "medium":
      return { bg: "bg-[#ca8a04]", text: "text-[#ca8a04]", border: "border-[#ca8a04]" };
    case "high":
      return { bg: "bg-[#dc2626]", text: "text-[#dc2626]", border: "border-[#dc2626]" };
  }
}

/* ─── Mini sparkline from check history ─── */

function ActivitySparkline({ history }: { history: { status: string; diffPercentage?: number }[] }) {
  if (!history || history.length === 0) return null;
  const last20 = history.slice(0, 20).reverse();
  return (
    <div className="flex items-end gap-0.5 h-8">
      {last20.map((entry, i) => {
        const pct = entry.status === "changed" ? (entry.diffPercentage ?? 1) : 0;
        const height = pct > 0 ? Math.max(4, Math.min(32, (pct / 50) * 32)) : 2;
        const color = pct > 0 ? severityColor(diffSeverity(pct)).bg : "bg-[#ccc]";
        return (
          <div
            key={i}
            className={`w-2 ${color} transition-all`}
            style={{ height: `${height}px` }}
            title={pct > 0 ? `${pct.toFixed(1)}% changed` : "No change"}
          />
        );
      })}
    </div>
  );
}

/* ─── Main Page ─── */

function MonitorDetailPage() {
  const { monitorId } = Route.useParams();
  const { isSignedIn } = useAuth();
  const navigate = useNavigate();

  const monitor = useQuery(
    api.monitors.get,
    isSignedIn ? { monitorId: monitorId as Id<"monitors"> } : "skip"
  );
  const changes = useQuery(
    api.changes.listByMonitor,
    isSignedIn ? { monitorId: monitorId as Id<"monitors"> } : "skip"
  );
  const exportData = useQuery(
    api.changes.exportByMonitor,
    isSignedIn ? { monitorId: monitorId as Id<"monitors"> } : "skip"
  );
  const checkHistory = useQuery(
    api.snapshots.getCheckHistory,
    isSignedIn ? { monitorId: monitorId as Id<"monitors">, limit: 50 } : "skip"
  );

  const pauseMonitor = useMutation(api.monitors.pause);
  const resumeMonitor = useMutation(api.monitors.resume);
  const removeMonitor = useMutation(api.monitors.remove);
  const checkNow = useMutation(api.monitors.checkNow);

  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [activeTab, setActiveTab] = useState<"changes" | "activity">(
    "changes"
  );

  if (monitor === undefined) {
    return (
      <main className="px-8 py-8">
        <div className="text-center py-20 text-[#888]">Loading...</div>
      </main>
    );
  }

  if (monitor === null) {
    return (
      <main className="px-8 py-8">
        <div className="text-center py-20">
          <h2 className="text-xl font-black uppercase">Monitor Not Found</h2>
        </div>
      </main>
    );
  }

  const isChecking = monitor?.isChecking === true;

  const handleCheckNow = async () => {
    try {
      await checkNow({ monitorId: monitorId as Id<"monitors"> });
    } catch (error) {
      console.error("Check now failed:", error);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await removeMonitor({ monitorId: monitorId as Id<"monitors"> });
      navigate({ to: "/dashboard/monitors" });
    } catch {
      setIsDeleting(false);
    }
  };

  const handleExport = (format: "csv" | "json") => {
    if (!exportData || exportData.length === 0) return;
    const monitorName = monitor.name.replace(/[^a-zA-Z0-9]/g, "_");
    if (format === "csv") {
      downloadFile(
        toCSV(exportData, monitor.name),
        `${monitorName}_changes.csv`,
        "text/csv"
      );
    } else {
      downloadFile(
        toJSON(exportData, monitor.name),
        `${monitorName}_changes.json`,
        "application/json"
      );
    }
    setShowExport(false);
  };

  /* Compute stats */
  const totalChecks = checkHistory?.length ?? 0;
  const changedChecks = checkHistory?.filter((e) => e.status === "changed").length ?? 0;
  const avgDiff =
    changedChecks > 0
      ? (checkHistory!
          .filter((e) => e.status === "changed")
          .reduce((sum, e) => sum + (e.diffPercentage ?? 0), 0) / changedChecks)
      : 0;

  return (
    <main className="px-8 py-8">
      {/* Back + Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate({ to: "/dashboard/monitors" })}
          className="text-[#888] hover:text-[#1a1a1a] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black uppercase tracking-tighter">
              {monitor.name}
            </h1>
            <Badge
              variant={
                monitor.status === "active"
                  ? "success"
                  : monitor.status === "error"
                    ? "destructive"
                    : "secondary"
              }
            >
              {monitor.status}
            </Badge>
          </div>
          <a
            href={monitor.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[#2d5a2d] hover:underline flex items-center gap-1 font-mono"
          >
            {monitor.url}
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCheckNow}
            disabled={isChecking}
          >
            <RefreshCw
              className={`w-4 h-4 ${isChecking ? "animate-spin" : ""}`}
            />
            {isChecking ? "Checking..." : "Check Now"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              navigate({
                to: "/dashboard/$monitorId/settings",
                params: { monitorId } as any,
              })
            }
          >
            <Settings className="w-4 h-4" />
            Edit
          </Button>
        </div>
      </div>

      {/* Delete confirm */}
      {showDeleteConfirm && (
        <div className="border-2 border-[#dc2626] p-4 mb-6 flex items-center gap-3">
          <p className="text-sm text-[#888] flex-1">
            Are you sure? This cannot be undone.
          </p>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Yes, Delete"
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDeleteConfirm(false)}
          >
            Cancel
          </Button>
        </div>
      )}

      {/* ─── Stats Banner ─── */}
      <div className="border-2 border-[#1a1a1a] mb-6">
        <div className="grid grid-cols-2 md:grid-cols-5">
          {/* Screenshot preview */}
          <ZoneFocusedPreview
            screenshotUrl={monitor.screenshotUrl}
            zone={monitor.zone}
            selectionMode={monitor.selectionMode}
            className="border-r-2 border-[#1a1a1a] md:row-span-1 h-32"
          />

          {/* Stat cards */}
          <div className="border-r-2 border-[#1a1a1a] p-4 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-1">
              <Eye className="w-3.5 h-3.5 text-[#888]" />
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#888]">
                Total Checks
              </p>
            </div>
            <p className="text-2xl font-black tracking-tighter">{totalChecks}</p>
          </div>

          <div className="border-r-2 border-[#1a1a1a] p-4 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-3.5 h-3.5 text-[#888]" />
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#888]">
                Changes Found
              </p>
            </div>
            <p className="text-2xl font-black tracking-tighter text-[#dc2626]">
              {monitor.changeCount}
            </p>
          </div>

          <div className="border-r-2 border-[#1a1a1a] p-4 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-[#888]" />
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#888]">
                Avg Diff
              </p>
            </div>
            <p className="text-2xl font-black tracking-tighter">
              {avgDiff > 0 ? `${avgDiff.toFixed(1)}%` : "—"}
            </p>
          </div>

          <div className="p-4 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-3.5 h-3.5 text-[#888]" />
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#888]">
                Frequency
              </p>
            </div>
            <p className="text-lg font-black tracking-tighter">
              {intervalLabel(monitor.interval)}
            </p>
            <p className="text-[10px] text-[#888] mt-0.5">
              Next: {monitor.nextCheckAt ? formatRelativeTime(monitor.nextCheckAt) : "N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* Main content + Sidebar */}
      <div className="flex gap-6">
        {/* Left: Tabs content */}
        <div className="flex-1 min-w-0">
          {/* Tabs */}
          <div className="flex items-center gap-0 border-b-2 border-[#ccc] mb-6">
            <button
              onClick={() => setActiveTab("changes")}
              className={`px-4 py-3 text-sm font-bold uppercase tracking-wider transition-colors relative ${
                activeTab === "changes"
                  ? "text-[#2d5a2d]"
                  : "text-[#888] hover:text-[#1a1a1a]"
              }`}
            >
              Detected Changes
              {changes && changes.length > 0 && (
                <span className="ml-2 text-[10px] bg-[#1a1a1a] text-[#f0f0e8] px-1.5 py-0.5 align-middle">
                  {changes.length}
                </span>
              )}
              {activeTab === "changes" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2d5a2d]" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("activity")}
              className={`px-4 py-3 text-sm font-bold uppercase tracking-wider transition-colors relative ${
                activeTab === "activity"
                  ? "text-[#2d5a2d]"
                  : "text-[#888] hover:text-[#1a1a1a]"
              }`}
            >
              Monitoring Activity
              {activeTab === "activity" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2d5a2d]" />
              )}
            </button>
            <div className="flex-1" />
            {/* Export button inline */}
            {exportData && exportData.length > 0 && (
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowExport(!showExport)}
                  className="text-[#888] border-transparent"
                >
                  <Download className="w-4 h-4" />
                  Export
                </Button>
                {showExport && (
                  <div className="absolute right-0 top-full mt-1 border-2 border-[#1a1a1a] bg-[#f0f0e8] z-10 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
                    <button
                      onClick={() => handleExport("csv")}
                      className="block w-full text-left px-4 py-2 text-sm font-bold uppercase hover:bg-[#e8e8e0] border-b border-[#ccc]"
                    >
                      CSV
                    </button>
                    <button
                      onClick={() => handleExport("json")}
                      className="block w-full text-left px-4 py-2 text-sm font-bold uppercase hover:bg-[#e8e8e0]"
                    >
                      JSON
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Tab content */}
          {activeTab === "changes" ? (
            <div>
              {changes === undefined ? (
                <div className="text-center py-8 text-[#888]">Loading...</div>
              ) : changes.length === 0 ? (
                <div className="border-2 border-[#1a1a1a] border-dashed p-12 text-center">
                  <Eye className="w-8 h-8 text-[#ccc] mx-auto mb-3" />
                  <p className="text-sm font-black uppercase tracking-tighter mb-1">
                    No changes detected yet
                  </p>
                  <p className="text-xs text-[#888]">
                    We're watching this page. Changes will appear here with
                    before/after screenshots and visual diffs.
                  </p>
                </div>
              ) : (
                <ChangeTimeline changes={changes} />
              )}
            </div>
          ) : (
            <div>
              {/* Check history table — cleaned up */}
              <div className="border-2 border-[#1a1a1a]">
                {/* Table header */}
                <div className="grid grid-cols-[1fr_auto_auto] gap-4 px-4 py-3 bg-[#1a1a1a] text-[#f0f0e8]">
                  <p className="text-xs font-bold uppercase tracking-wider">
                    Check Time
                  </p>
                  <p className="text-xs font-bold uppercase tracking-wider w-24 text-right">
                    Diff
                  </p>
                  <p className="text-xs font-bold uppercase tracking-wider w-28 text-right">
                    Status
                  </p>
                </div>

                {/* In-progress row */}
                {isChecking && (
                  <div className="grid grid-cols-[1fr_auto_auto] gap-4 px-4 py-3 border-b border-[#ccc] bg-[#e8e8e0]">
                    <p className="text-sm text-[#888] self-center">Now</p>
                    <p className="text-sm text-[#888] self-center w-24 text-right">—</p>
                    <div className="flex items-center gap-2 self-center w-28 justify-end">
                      <Loader2 className="w-3 h-3 animate-spin text-[#ca8a04]" />
                      <Badge variant="warning">In Progress</Badge>
                    </div>
                  </div>
                )}

                {/* History rows */}
                {checkHistory === undefined ? (
                  <div className="px-4 py-8 text-center text-[#888] text-sm">
                    Loading...
                  </div>
                ) : checkHistory.length === 0 && !isChecking ? (
                  <div className="px-4 py-8 text-center text-[#888] text-sm">
                    No checks recorded yet.
                  </div>
                ) : (
                  checkHistory.map((entry) => {
                    const isChanged = entry.status === "changed";
                    const severity = isChanged
                      ? diffSeverity(entry.diffPercentage ?? 0)
                      : null;
                    const colors = severity ? severityColor(severity) : null;

                    return (
                      <div
                        key={entry._id}
                        className="grid grid-cols-[1fr_auto_auto] gap-4 px-4 py-3 border-b border-[#ccc] last:border-b-0 hover:bg-[#e8e8e0] transition-colors"
                      >
                        <p className="text-sm self-center">
                          {new Date(entry.capturedAt).toLocaleString()}
                        </p>
                        <div className="self-center w-24 text-right">
                          {isChanged ? (
                            <div className="flex items-center gap-2 justify-end">
                              <div className="w-12 h-1.5 bg-[#e8e8e0] overflow-hidden">
                                <div
                                  className={`h-full ${colors!.bg}`}
                                  style={{ width: `${Math.min(100, (entry.diffPercentage ?? 0) * 2)}%` }}
                                />
                              </div>
                              <span className={`text-xs font-bold ${colors!.text}`}>
                                {entry.diffPercentage?.toFixed(1)}%
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-[#ccc]">0%</span>
                          )}
                        </div>
                        <div className="self-center w-28 text-right">
                          {isChanged ? (
                            <div className="flex items-center gap-1.5 justify-end">
                              <XCircle className={`w-3.5 h-3.5 ${colors!.text}`} />
                              <span className={`text-xs font-bold uppercase ${colors!.text}`}>
                                Changed
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 justify-end">
                              <CheckCircle className="w-3.5 h-3.5 text-[#2d5a2d]" />
                              <span className="text-xs font-bold uppercase text-[#2d5a2d]">
                                No change
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right sidebar controls */}
        <div className="w-72 shrink-0 space-y-4">
          {/* Enable/Disable */}
          <div className="border-2 border-[#1a1a1a] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold">Enable / Disable</p>
                <p className="text-xs text-[#888] mt-0.5">
                  Toggle monitoring job
                </p>
              </div>
              <button
                onClick={() => {
                  if (monitor.status === "active") {
                    pauseMonitor({
                      monitorId: monitorId as Id<"monitors">,
                    });
                  } else {
                    resumeMonitor({
                      monitorId: monitorId as Id<"monitors">,
                    });
                  }
                }}
                className={`w-12 h-6 relative transition-colors ${
                  monitor.status === "active" ? "bg-[#2d5a2d]" : "bg-[#ccc]"
                }`}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 bg-[#f0f0e8] transition-transform ${
                    monitor.status === "active"
                      ? "translate-x-6"
                      : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Activity sparkline */}
          {checkHistory && checkHistory.length > 0 && (
            <div className="border-2 border-[#1a1a1a] p-4">
              <p className="text-sm font-bold mb-3">Recent Activity</p>
              <ActivitySparkline history={checkHistory} />
              <p className="text-[10px] text-[#888] mt-2 uppercase tracking-wider">
                Last {Math.min(20, checkHistory.length)} checks
              </p>
            </div>
          )}

          {/* Notifications */}
          <div className="border-2 border-[#1a1a1a] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold">Notifications</p>
                <p className="text-xs text-[#888] mt-0.5">
                  {monitor.email
                    ? monitor.email
                    : "No notification configured"}
                </p>
              </div>
            </div>
          </div>

          {/* Tags */}
          {monitor.tags && monitor.tags.length > 0 && (
            <div className="border-2 border-[#1a1a1a] p-4">
              <p className="text-sm font-bold mb-2">Tags</p>
              <div className="flex gap-1 flex-wrap">
                {monitor.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] uppercase font-bold text-[#888] bg-[#e8e8e0] border border-[#ccc] px-2 py-0.5"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Info */}
          <div className="border-2 border-[#1a1a1a] p-4">
            <p className="text-sm font-bold mb-2">Monitor Details</p>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#888]">Mode</span>
                <span className="font-bold">
                  {monitor.selectionMode === "element" ? "Element" : "Zone"}
                </span>
              </div>
              {monitor.cssSelector && (
                <div className="flex justify-between">
                  <span className="text-[#888]">Selector</span>
                  <span className="font-mono truncate max-w-32">
                    {monitor.cssSelector}
                  </span>
                </div>
              )}
              {monitor.compareType && (
                <div className="flex justify-between">
                  <span className="text-[#888]">Compare</span>
                  <span className="font-bold capitalize">
                    {monitor.compareType}
                  </span>
                </div>
              )}
              {monitor.mobileViewport && (
                <div className="flex justify-between">
                  <span className="text-[#888]">Viewport</span>
                  <span className="font-bold">Mobile</span>
                </div>
              )}
              {monitor.delay !== undefined && monitor.delay > 0 && (
                <div className="flex justify-between">
                  <span className="text-[#888]">Delay</span>
                  <span className="font-bold">{monitor.delay}s</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-[#888]">Last Checked</span>
                <span className="font-bold">
                  {monitor.lastCheckedAt
                    ? formatRelativeTime(monitor.lastCheckedAt)
                    : "Never"}
                </span>
              </div>
            </div>
          </div>

          {/* Keywords */}
          {monitor.keywords && monitor.keywords.length > 0 && (
            <div className="border-2 border-[#1a1a1a] p-4">
              <p className="text-sm font-bold mb-2">Keyword Alerts</p>
              <div className="flex gap-1 flex-wrap">
                {monitor.keywords.map((kw) => (
                  <span
                    key={kw}
                    className="text-[10px] uppercase font-bold text-[#2d5a2d] bg-[#e8e8e0] border border-[#ccc] px-2 py-0.5"
                  >
                    {kw}
                  </span>
                ))}
              </div>
              <p className="text-[10px] text-[#888] mt-1 uppercase">
                Mode: {monitor.keywordMode ?? "any"}
              </p>
            </div>
          )}

          {/* Active Days */}
          {monitor.activeDays && monitor.activeDays.length > 0 && (
            <div className="border-2 border-[#1a1a1a] p-4">
              <p className="text-sm font-bold mb-2">Active Days</p>
              <div className="flex gap-1">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                  (day, i) => (
                    <span
                      key={day}
                      className={`text-[10px] font-bold px-1.5 py-0.5 ${
                        monitor.activeDays!.includes(i)
                          ? "bg-[#1a1a1a] text-[#f0f0e8]"
                          : "text-[#ccc]"
                      }`}
                    >
                      {day}
                    </span>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

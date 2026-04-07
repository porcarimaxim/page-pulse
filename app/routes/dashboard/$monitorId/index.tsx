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
import { diffSeverity, severityColor } from "@/lib/severity-utils";
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
import * as Dialog from "@radix-ui/react-dialog";
import type { Id } from "@convex/_generated/dataModel";

export const Route = createFileRoute("/dashboard/$monitorId/")({
  component: MonitorDetailPage,
});

/* ─── Mini sparkline from check history ─── */

function ActivitySparkline({ history }: { history: { status: string; diffPercentage?: number }[] }) {
  if (!history || history.length === 0) return null;
  const last20 = history.slice(0, 20).reverse();
  return (
    <div className="flex items-end gap-0.5 h-8">
      {last20.map((entry, i) => {
        const pct = entry.status === "changed" ? (entry.diffPercentage ?? 1) : 0;
        const height = pct > 0 ? Math.max(4, Math.min(32, (pct / 50) * 32)) : 2;
        const color = pct > 0 ? severityColor(diffSeverity(pct)).bg : "bg-gray-200";
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
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [showExport, setShowExport] = useState(false);
  const [activeTab, setActiveTab] = useState<"changes" | "activity">(
    "changes"
  );

  if (monitor === undefined) {
    return (
      <main className="px-8 py-8">
        <div className="text-center py-20 text-gray-500">Loading...</div>
      </main>
    );
  }

  if (monitor === null) {
    return (
      <main className="px-8 py-8">
        <div className="text-center py-20">
          <h2 className="text-xl font-bold">Monitor Not Found</h2>
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
    setDeleteError(null);
    try {
      await removeMonitor({ monitorId: monitorId as Id<"monitors"> });
      navigate({ to: "/dashboard/monitors" });
    } catch (err) {
      console.error("Delete failed:", err);
      setDeleteError(err instanceof Error ? err.message : "Failed to delete monitor");
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
          className="text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">
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
            className="text-sm text-emerald-600 hover:underline flex items-center gap-1 font-mono"
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

      {/* Delete confirm dialog */}
      <Dialog.Root open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white border border-gray-200 shadow-lg rounded-xl p-6 w-full max-w-sm">
            <Dialog.Title className="text-lg font-bold mb-2">
              Delete Monitor
            </Dialog.Title>
            <Dialog.Description className="text-sm text-gray-500 mb-6">
              This will permanently delete <span className="font-bold text-gray-900">{monitor.name}</span> and
              all its snapshots and change history. This cannot be undone.
            </Dialog.Description>
            {deleteError && (
              <div className="border border-red-500 bg-red-50 p-3 mb-4 rounded-lg">
                <p className="text-sm text-red-500 font-bold">{deleteError}</p>
              </div>
            )}
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </>
                )}
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* ─── Stats Banner ─── */}
      <div className="border border-gray-200 mb-6 rounded-xl overflow-hidden">
        <div className="grid grid-cols-2 md:grid-cols-5">
          {/* Screenshot preview */}
          <ZoneFocusedPreview
            screenshotUrl={monitor.screenshotUrl}
            zone={monitor.zone}
            selectionMode={monitor.selectionMode}
            className="border-r border-gray-200 md:row-span-1 h-32"
          />

          {/* Stat cards */}
          <div className="border-r border-gray-200 p-4 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-1">
              <Eye className="w-3.5 h-3.5 text-gray-500" />
              <p className="text-xs font-bold text-gray-500">
                Total Checks
              </p>
            </div>
            <p className="text-2xl font-bold">{totalChecks}</p>
          </div>

          <div className="border-r border-gray-200 p-4 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-3.5 h-3.5 text-gray-500" />
              <p className="text-xs font-bold text-gray-500">
                Changes Found
              </p>
            </div>
            <p className="text-2xl font-bold text-red-500">
              {monitor.changeCount}
            </p>
          </div>

          <div className="border-r border-gray-200 p-4 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-gray-500" />
              <p className="text-xs font-bold text-gray-500">
                Avg Diff
              </p>
            </div>
            <p className="text-2xl font-bold">
              {avgDiff > 0 ? `${avgDiff.toFixed(1)}%` : "—"}
            </p>
          </div>

          <div className="p-4 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-3.5 h-3.5 text-gray-500" />
              <p className="text-xs font-bold text-gray-500">
                Frequency
              </p>
            </div>
            <p className="text-lg font-bold">
              {intervalLabel(monitor.interval)}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
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
          <div role="tablist" className="flex items-center gap-0 border-b border-gray-200 mb-6">
            <button
              role="tab"
              aria-selected={activeTab === "changes"}
              onClick={() => setActiveTab("changes")}
              className={`px-4 py-3 text-sm font-bold transition-colors relative ${
                activeTab === "changes"
                  ? "text-emerald-600"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Detected Changes
              {changes && changes.length > 0 && (
                <span className="ml-2 text-xs bg-gray-900 text-white px-1.5 py-0.5 rounded align-middle">
                  {changes.length}
                </span>
              )}
              {activeTab === "changes" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600" />
              )}
            </button>
            <button
              role="tab"
              aria-selected={activeTab === "activity"}
              onClick={() => setActiveTab("activity")}
              className={`px-4 py-3 text-sm font-bold transition-colors relative ${
                activeTab === "activity"
                  ? "text-emerald-600"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Monitoring Activity
              {activeTab === "activity" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600" />
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
                  className="text-gray-500 border-transparent"
                >
                  <Download className="w-4 h-4" />
                  Export
                </Button>
                {showExport && (
                  <div className="absolute right-0 top-full mt-1 border border-gray-200 bg-white z-10 shadow-md rounded-lg overflow-hidden">
                    <button
                      onClick={() => handleExport("csv")}
                      className="block w-full text-left px-4 py-2 text-sm font-bold hover:bg-gray-50 border-b border-gray-200"
                    >
                      CSV
                    </button>
                    <button
                      onClick={() => handleExport("json")}
                      className="block w-full text-left px-4 py-2 text-sm font-bold hover:bg-gray-50"
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
                <div className="text-center py-8 text-gray-500">Loading...</div>
              ) : changes.length === 0 ? (
                <div className="border border-gray-200 rounded-lg border-dashed p-12 text-center">
                  <Eye className="w-8 h-8 text-gray-200 mx-auto mb-3" />
                  <p className="text-sm font-bold mb-1">
                    No changes detected yet
                  </p>
                  <p className="text-xs text-gray-500">
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
              <div className="border border-gray-200 rounded-lg">
                {/* Table header */}
                <div className="grid grid-cols-[1fr_auto_auto] gap-4 px-4 py-3 bg-gray-900 text-white">
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
                  <div className="grid grid-cols-[1fr_auto_auto] gap-4 px-4 py-3 border-b border-gray-200 bg-gray-50">
                    <p className="text-sm text-gray-500 self-center">Now</p>
                    <p className="text-sm text-gray-500 self-center w-24 text-right">—</p>
                    <div className="flex items-center gap-2 self-center w-28 justify-end">
                      <Loader2 className="w-3 h-3 animate-spin text-amber-500" />
                      <Badge variant="warning">In Progress</Badge>
                    </div>
                  </div>
                )}

                {/* History rows */}
                {checkHistory === undefined ? (
                  <div className="px-4 py-8 text-center text-gray-500 text-sm">
                    Loading...
                  </div>
                ) : checkHistory.length === 0 && !isChecking ? (
                  <div className="px-4 py-8 text-center text-gray-500 text-sm">
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
                        className="grid grid-cols-[1fr_auto_auto] gap-4 px-4 py-3 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors"
                      >
                        <p className="text-sm self-center">
                          {new Date(entry.capturedAt).toLocaleString()}
                        </p>
                        <div className="self-center w-24 text-right">
                          {isChanged ? (
                            <div className="flex items-center gap-2 justify-end">
                              <div className="w-12 h-1.5 bg-gray-50 overflow-hidden">
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
                            <span className="text-xs text-gray-200">0%</span>
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
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-xs font-bold uppercase text-emerald-600">
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
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold">Enable / Disable</p>
                <p className="text-xs text-gray-500 mt-0.5">
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
                className={`w-12 h-6 relative transition-colors rounded-full ${
                  monitor.status === "active" ? "bg-emerald-600" : "bg-gray-200"
                }`}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
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
            <div className="border border-gray-200 rounded-lg p-4">
              <p className="text-sm font-bold mb-3">Recent Activity</p>
              <ActivitySparkline history={checkHistory} />
              <p className="text-xs text-gray-500 mt-2">
                Last {Math.min(20, checkHistory.length)} checks
              </p>
            </div>
          )}

          {/* Notifications */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold">Notifications</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {monitor.email
                    ? monitor.email
                    : "No notification configured"}
                </p>
              </div>
            </div>
          </div>

          {/* Tags */}
          {monitor.tags && monitor.tags.length > 0 && (
            <div className="border border-gray-200 rounded-lg p-4">
              <p className="text-sm font-bold mb-2">Tags</p>
              <div className="flex gap-1 flex-wrap">
                {monitor.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs font-bold text-gray-500 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Info */}
          <div className="border border-gray-200 rounded-lg p-4">
            <p className="text-sm font-bold mb-2">Monitor Details</p>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Mode</span>
                <span className="font-bold">
                  {monitor.selectionMode === "element" ? "Element" : "Zone"}
                </span>
              </div>
              {monitor.cssSelector && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Selector</span>
                  <span className="font-mono truncate max-w-32">
                    {monitor.cssSelector}
                  </span>
                </div>
              )}
              {monitor.compareType && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Compare</span>
                  <span className="font-bold capitalize">
                    {monitor.compareType}
                  </span>
                </div>
              )}
              {monitor.mobileViewport && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Viewport</span>
                  <span className="font-bold">Mobile</span>
                </div>
              )}
              {monitor.delay !== undefined && monitor.delay > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Delay</span>
                  <span className="font-bold">{monitor.delay}s</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Last Checked</span>
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
            <div className="border border-gray-200 rounded-lg p-4">
              <p className="text-sm font-bold mb-2">Keyword Alerts</p>
              <div className="flex gap-1 flex-wrap">
                {monitor.keywords.map((kw) => (
                  <span
                    key={kw}
                    className="text-xs font-bold text-emerald-600 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded"
                  >
                    {kw}
                  </span>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Mode: {monitor.keywordMode ?? "any"}
              </p>
            </div>
          )}

          {/* Active Days */}
          {monitor.activeDays && monitor.activeDays.length > 0 && (
            <div className="border border-gray-200 rounded-lg p-4">
              <p className="text-sm font-bold mb-2">Active Days</p>
              <div className="flex gap-1">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                  (day, i) => (
                    <span
                      key={day}
                      className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                        monitor.activeDays!.includes(i)
                          ? "bg-gray-900 text-white"
                          : "text-gray-300"
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

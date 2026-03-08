import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation } from "convex/react";
import { useAuth } from "@clerk/tanstack-react-start";
import { api } from "@convex/_generated/api";
import { ChangeTimeline } from "@/components/monitor/ChangeTimeline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatRelativeTime, intervalLabel } from "@/lib/utils";
import { toCSV, toJSON, downloadFile } from "@/lib/export";
import {
  ArrowLeft,
  Pause,
  Play,
  RefreshCw,
  Settings,
  Trash2,
  ExternalLink,
  Activity,
  AlertTriangle,
  Loader2,
  Download,
} from "lucide-react";
import { useState } from "react";
import type { Id } from "@convex/_generated/dataModel";

export const Route = createFileRoute("/dashboard/$monitorId/")({
  component: MonitorDetailPage,
});

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

  const pauseMonitor = useMutation(api.monitors.pause);
  const resumeMonitor = useMutation(api.monitors.resume);
  const removeMonitor = useMutation(api.monitors.remove);
  const checkNow = useMutation(api.monitors.checkNow);

  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
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

  const handleCheckNow = async () => {
    setIsChecking(true);
    try {
      await checkNow({ monitorId: monitorId as Id<"monitors"> });
      setTimeout(() => setIsChecking(false), 3000);
    } catch {
      setIsChecking(false);
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
          <h1 className="text-2xl font-black uppercase tracking-tighter">
            {monitor.name}
          </h1>
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
            <span className="text-xs text-[#888]">
              Next check:{" "}
              {monitor.nextCheckAt
                ? new Date(monitor.nextCheckAt).toLocaleString()
                : "N/A"}
            </span>
          </div>

          {/* Tab content */}
          {activeTab === "changes" ? (
            <div>
              {/* Export */}
              {exportData && exportData.length > 0 && (
                <div className="flex justify-end mb-4">
                  <div className="relative">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowExport(!showExport)}
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
                </div>
              )}

              {changes === undefined ? (
                <div className="text-center py-8 text-[#888]">Loading...</div>
              ) : changes.length === 0 ? (
                <div className="text-center py-16 text-[#888]">
                  <p className="text-sm font-bold">
                    No changes detected yet
                  </p>
                  <p className="text-xs mt-1">
                    Once changes are detected, they will appear here.
                  </p>
                </div>
              ) : (
                <ChangeTimeline changes={changes} />
              )}
            </div>
          ) : (
            <div>
              {/* Monitoring activity - show stats */}
              <div className="space-y-4">
                <div className="border-2 border-[#1a1a1a] p-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase text-[#888]">
                        Frequency
                      </p>
                      <p className="text-sm font-bold mt-1">
                        {intervalLabel(monitor.interval)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase text-[#888]">
                        Total Changes
                      </p>
                      <p className="text-sm font-bold mt-1">
                        {monitor.changeCount}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase text-[#888]">
                        Last Checked
                      </p>
                      <p className="text-sm font-bold mt-1">
                        {monitor.lastCheckedAt
                          ? formatRelativeTime(monitor.lastCheckedAt)
                          : "Never"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Screenshot preview */}
                {monitor.screenshotUrl && (
                  <div className="border-2 border-[#1a1a1a] p-4">
                    <p className="text-xs font-bold uppercase text-[#888] mb-3">
                      {monitor.selectionMode === "element"
                        ? "Monitored Element"
                        : "Monitored Zone"}
                    </p>
                    <div className="relative border-2 border-[#1a1a1a] inline-block">
                      <img
                        src={monitor.screenshotUrl}
                        alt="Page screenshot"
                        className="max-h-64 w-auto"
                      />
                      {monitor.selectionMode !== "element" && (
                        <div
                          className="absolute border-2 border-[#2d5a2d] bg-[#2d5a2d]/10"
                          style={{
                            left: `${monitor.zone.x}%`,
                            top: `${monitor.zone.y}%`,
                            width: `${monitor.zone.width}%`,
                            height: `${monitor.zone.height}%`,
                          }}
                        />
                      )}
                    </div>
                  </div>
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

          {/* Check now */}
          <div className="border-2 border-[#1a1a1a] p-4">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={handleCheckNow}
              disabled={isChecking}
            >
              <RefreshCw
                className={`w-4 h-4 ${isChecking ? "animate-spin" : ""}`}
              />
              {isChecking ? "Checking..." : "Check Now"}
            </Button>
          </div>

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
            <p className="text-sm font-bold mb-2">Info</p>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#888]">Status</span>
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
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

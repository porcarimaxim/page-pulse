import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useAction } from "convex/react";
import { useAuth } from "@clerk/tanstack-react-start";
import { api } from "@convex/_generated/api";
import { DashboardHeader } from "@/components/DashboardHeader";
import { ChangeTimeline } from "@/components/monitor/ChangeTimeline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatRelativeTime, intervalLabel } from "@/lib/utils";
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
} from "lucide-react";
import { useState } from "react";
import type { Id } from "@convex/_generated/dataModel";

export const Route = createFileRoute("/dashboard/$monitorId/")({
  component: MonitorDetailPage,
});

function MonitorDetailPage() {
  const { monitorId } = Route.useParams();
  const { isSignedIn, isLoaded } = useAuth();
  const navigate = useNavigate();

  const monitor = useQuery(
    api.monitors.get,
    isSignedIn ? { monitorId: monitorId as Id<"monitors"> } : "skip"
  );
  const changes = useQuery(
    api.changes.listByMonitor,
    isSignedIn ? { monitorId: monitorId as Id<"monitors"> } : "skip"
  );

  if (isLoaded && !isSignedIn) {
    navigate({ to: "/auth/sign-in", search: { redirect_url: `/dashboard/${monitorId}` } });
    return null;
  }

  const pauseMonitor = useMutation(api.monitors.pause);
  const resumeMonitor = useMutation(api.monitors.resume);
  const removeMonitor = useMutation(api.monitors.remove);

  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (monitor === undefined) {
    return (
      <div className="min-h-screen bg-[#f0f0e8]">
        <DashboardHeader />
        <div className="text-center py-20 text-[#888]">Loading...</div>
      </div>
    );
  }

  if (monitor === null) {
    return (
      <div className="min-h-screen bg-[#f0f0e8]">
        <DashboardHeader />
        <div className="text-center py-20">
          <h2 className="text-xl font-black uppercase">Monitor Not Found</h2>
        </div>
      </div>
    );
  }

  const statusConfig = {
    active: { variant: "success" as const, icon: Activity, label: "Active" },
    paused: { variant: "secondary" as const, icon: Pause, label: "Paused" },
    error: {
      variant: "destructive" as const,
      icon: AlertTriangle,
      label: "Error",
    },
  };
  const config = statusConfig[monitor.status];
  const StatusIcon = config.icon;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await removeMonitor({
        monitorId: monitorId as Id<"monitors">,
      });
      navigate({ to: "/dashboard" });
    } catch {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f0e8]">
      <DashboardHeader />

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Back */}
        <button
          onClick={() => navigate({ to: "/dashboard" })}
          className="flex items-center gap-2 text-sm text-[#888] hover:text-[#1a1a1a] font-bold uppercase mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to monitors
        </button>

        {/* Monitor header */}
        <div className="border-2 border-[#1a1a1a] p-6 shadow-[8px_8px_0px_0px_var(--shadow-color)] mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-black uppercase tracking-tighter">
                  {monitor.name}
                </h1>
                <Badge variant={config.variant}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {config.label}
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

            {/* Actions */}
            <div className="flex items-center gap-2">
              {monitor.status === "active" ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    pauseMonitor({
                      monitorId: monitorId as Id<"monitors">,
                    })
                  }
                >
                  <Pause className="w-4 h-4" />
                  Pause
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() =>
                    resumeMonitor({
                      monitorId: monitorId as Id<"monitors">,
                    })
                  }
                >
                  <Play className="w-4 h-4" />
                  Resume
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  navigate({
                    to: "/dashboard/$monitorId/settings",
                    params: { monitorId },
                  })
                }
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 border-t-2 border-[#ccc] pt-4">
            <div>
              <p className="text-xs font-bold uppercase text-[#888]">
                Frequency
              </p>
              <p className="text-sm font-bold">
                {intervalLabel(monitor.interval)}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-[#888]">
                Changes
              </p>
              <p className="text-sm font-bold">{monitor.changeCount}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-[#888]">
                Last Checked
              </p>
              <p className="text-sm font-bold">
                {monitor.lastCheckedAt
                  ? formatRelativeTime(monitor.lastCheckedAt)
                  : "Never"}
              </p>
            </div>
          </div>

          {/* Screenshot preview with zone */}
          {monitor.screenshotUrl && (
            <div className="mt-4 border-t-2 border-[#ccc] pt-4">
              <p className="text-xs font-bold uppercase text-[#888] mb-2">
                Monitored Zone
              </p>
              <div className="relative border-2 border-[#1a1a1a] inline-block">
                <img
                  src={monitor.screenshotUrl}
                  alt="Page screenshot"
                  className="max-h-48 w-auto"
                />
                <div
                  className="absolute border-2 border-[#2d5a2d] bg-[#2d5a2d]/10"
                  style={{
                    left: `${monitor.zone.x}%`,
                    top: `${monitor.zone.y}%`,
                    width: `${monitor.zone.width}%`,
                    height: `${monitor.zone.height}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Change history */}
        <div className="mb-8">
          <h2 className="text-xl font-black uppercase tracking-tighter mb-4">
            Change History
          </h2>
          {changes === undefined ? (
            <div className="text-center py-8 text-[#888]">Loading...</div>
          ) : (
            <ChangeTimeline changes={changes} />
          )}
        </div>

        {/* Danger zone */}
        <div className="border-2 border-[#dc2626] p-6">
          <h3 className="font-black text-base uppercase tracking-tighter text-[#dc2626] mb-2">
            Danger Zone
          </h3>
          {showDeleteConfirm ? (
            <div className="flex items-center gap-3">
              <p className="text-sm text-[#888]">
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
          ) : (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 className="w-4 h-4" />
              Delete Monitor
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}

import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { formatRelativeTime, intervalLabel } from "@/lib/utils";
import { Activity, Pause, AlertTriangle } from "lucide-react";

interface MonitorCardProps {
  monitor: {
    _id: string;
    name: string;
    url: string;
    status: "active" | "paused" | "error";
    interval: string;
    lastCheckedAt?: number;
    changeCount: number;
    screenshotUrl: string | null;
    zone: { x: number; y: number; width: number; height: number };
    selectionMode?: string;
    cssSelector?: string;
    tags?: string[];
  };
}

export function MonitorCard({ monitor }: MonitorCardProps) {
  const statusConfig = {
    active: { variant: "success" as const, icon: Activity, label: "Active" },
    paused: { variant: "secondary" as const, icon: Pause, label: "Paused" },
    error: { variant: "destructive" as const, icon: AlertTriangle, label: "Error" },
  };

  const config = statusConfig[monitor.status];
  const StatusIcon = config.icon;

  return (
    <Link
      to="/dashboard/$monitorId"
      params={{ monitorId: monitor._id }}
      className="block group"
    >
      <div className="border-2 border-[#1a1a1a] bg-[#f0f0e8] shadow-[8px_8px_0px_0px_var(--shadow-color)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[4px_4px_0px_0px_var(--shadow-color)] transition-all">
        {/* Screenshot preview */}
        <div className="relative h-40 bg-[#e8e8e0] border-b-2 border-[#1a1a1a] overflow-hidden">
          {monitor.screenshotUrl ? (
            <img
              src={monitor.screenshotUrl}
              alt={monitor.name}
              className="w-full h-full object-cover object-top"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-[#888] text-sm">
              No screenshot yet
            </div>
          )}
          {/* Zone overlay (only for zone mode) */}
          {monitor.screenshotUrl && monitor.selectionMode !== "element" && (
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
          {/* Element mode badge */}
          {monitor.selectionMode === "element" && (
            <div className="absolute top-2 right-2 text-[8px] uppercase font-bold text-[#f0f0e8] bg-[#2d5a2d] px-1.5 py-0.5">
              Element
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-black text-base uppercase tracking-tighter truncate">
              {monitor.name}
            </h3>
            <Badge variant={config.variant} className="shrink-0">
              <StatusIcon className="w-3 h-3 mr-1" />
              {config.label}
            </Badge>
          </div>

          <p className="text-xs text-[#888] truncate mb-3 font-mono">
            {monitor.url}
          </p>

          <div className="flex items-center justify-between text-xs text-[#888]">
            <span>{intervalLabel(monitor.interval)}</span>
            <span>
              {monitor.changeCount} change{monitor.changeCount !== 1 ? "s" : ""}
            </span>
          </div>

          {monitor.tags && monitor.tags.length > 0 && (
            <div className="flex gap-1 mt-2 flex-wrap">
              {monitor.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[9px] uppercase font-bold text-[#888] bg-[#e8e8e0] border border-[#ccc] px-1.5 py-0"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {monitor.lastCheckedAt && (
            <p className="text-xs text-[#888] mt-1">
              Last checked: {formatRelativeTime(monitor.lastCheckedAt)}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation } from "convex/react";
import { useAuth } from "@clerk/tanstack-react-start";
import { api } from "@convex/_generated/api";
import { formatRelativeTime, intervalLabel } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Eye,
  Zap,
  AlertTriangle,
  Plus,
  ArrowRight,
  Sparkles,
  Clock,
  CheckCheck,
  Check,
  ExternalLink,
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
function severityLabel(s: "low" | "medium" | "high") {
  return s === "low" ? "Minor" : s === "medium" ? "Moderate" : "Major";
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

  const { unreviewed, reviewed, errorMonitors } = useMemo(() => {
    const unrev = (recentChanges ?? []).filter((c) => !c.reviewed);
    const rev = (recentChanges ?? []).filter((c) => c.reviewed);
    const errMon = (monitors ?? []).filter((m) => m.status === "error");
    return { unreviewed: unrev, reviewed: rev, errorMonitors: errMon };
  }, [recentChanges, monitors]);

  const isLoading = monitors === undefined;

  return (
    <main className="px-8 py-8 max-w-[1100px]">
      {/* Header */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter">
            Inbox
          </h1>
          <p className="text-sm text-[#888] mt-1">
            {unreviewed.length > 0
              ? `${unreviewed.length} unreviewed change${unreviewed.length !== 1 ? "s" : ""} need your attention`
              : "All caught up"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreviewed.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => markAllReviewed({})}
            >
              <CheckCheck className="w-4 h-4" />
              Mark All Reviewed
            </Button>
          )}
          <Button asChild>
            <Link to="/dashboard/new">
              <Plus className="w-4 h-4" />
              New Monitor
            </Link>
          </Button>
        </div>
      </div>

      {/* ─── Errors (always top if any) ─── */}
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

      {/* ─── Inbox: Unreviewed changes ─── */}
      {recentChanges === undefined ? (
        <div className="text-center py-12 text-[#888]">Loading...</div>
      ) : unreviewed.length === 0 && reviewed.length === 0 ? (
        /* Truly empty — no changes at all */
        <div className="border-2 border-[#1a1a1a] border-dashed p-12 text-center mb-8">
          <Eye className="w-10 h-10 text-[#ccc] mx-auto mb-4" />
          <p className="text-lg font-black uppercase tracking-tighter mb-2">
            No changes yet
          </p>
          <p className="text-sm text-[#888] mb-6 max-w-sm mx-auto">
            When your monitors detect changes, they'll appear here. You can
            review each one and mark it as handled.
          </p>
          <Button asChild>
            <Link to="/dashboard/new">
              Create a Monitor <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
        </div>
      ) : (
        <div className="mb-8">
          {/* Unreviewed section */}
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

          {/* Reviewed section (collapsed, lighter) */}
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
        </div>
      )}

      {/* ─── Plan usage (only for limited plans) ─── */}
      {usage && usage.maxMonitors !== -1 && (
        <div className="flex items-center gap-4 mb-6 text-[10px] font-bold uppercase tracking-wider text-[#888]">
          <span>
            {usage.planName} — {usage.monitorCount} / {usage.maxMonitors} monitors
          </span>
          {usage.monitorCount >= usage.maxMonitors && (
            <Link
              to="/pricing"
              className="text-[#2d5a2d] hover:underline underline-offset-4"
            >
              Upgrade →
            </Link>
          )}
        </div>
      )}

      {/* ─── Monitors grid (compact) ─── */}
      {!isLoading && monitors!.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#888]">
              Your Monitors
            </h2>
            <Link
              to="/dashboard/monitors"
              className="text-[10px] font-bold uppercase tracking-wider text-[#2d5a2d] hover:underline underline-offset-4"
            >
              View All →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {monitors!.slice(0, 8).map((m) => (
              <Link
                key={m._id}
                to="/dashboard/$monitorId"
                params={{ monitorId: m._id } as any}
                className="block group"
              >
                <div className="border-2 border-[#1a1a1a] hover:shadow-[3px_3px_0px_0px_#1a1a1a] transition-all">
                  {/* Screenshot */}
                  <div className="relative h-20 bg-[#e8e8e0] border-b-2 border-[#1a1a1a] overflow-hidden">
                    {m.screenshotUrl ? (
                      <img
                        src={m.screenshotUrl}
                        alt=""
                        className="w-full h-full object-cover object-top"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Eye className="w-4 h-4 text-[#ccc]" />
                      </div>
                    )}
                    <div
                      className={`absolute top-1.5 right-1.5 w-2 h-2 border border-white ${
                        m.status === "active"
                          ? "bg-[#2d5a2d]"
                          : m.status === "error"
                            ? "bg-[#dc2626] animate-pulse"
                            : "bg-[#888]"
                      }`}
                    />
                  </div>
                  {/* Info */}
                  <div className="px-2.5 py-2">
                    <p className="text-[11px] font-black uppercase tracking-tighter truncate group-hover:text-[#2d5a2d] transition-colors">
                      {m.name}
                    </p>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="text-[9px] text-[#888]">
                        {intervalLabel(m.interval)}
                      </span>
                      {m.changeCount > 0 && (
                        <span className="text-[9px] font-bold text-[#dc2626]">
                          {m.changeCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
            {monitors!.length > 8 && (
              <Link
                to="/dashboard/monitors"
                className="border-2 border-[#ccc] border-dashed flex flex-col items-center justify-center hover:border-[#1a1a1a] transition-colors min-h-[120px]"
              >
                <p className="text-xl font-black text-[#ccc]">
                  +{monitors!.length - 8}
                </p>
                <p className="text-[9px] font-bold uppercase tracking-wider text-[#888] mt-0.5">
                  More
                </p>
              </Link>
            )}
          </div>
        </div>
      )}
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

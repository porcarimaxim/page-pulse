import { Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { diffSeverity, severityBg, severityText } from "@/lib/severity-utils";
import { formatRelativeTime } from "@/lib/utils";

export function InboxRow({
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
      <div
        className={`w-2.5 h-2.5 ${severityBg(severity)} mt-1.5 shrink-0 ${
          !change.reviewed ? "" : "opacity-40"
        }`}
      />

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

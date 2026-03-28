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
        !isLast ? "border-b border-gray-200" : ""
      } ${muted ? "opacity-60" : ""} hover:bg-gray-50 transition-colors`}
    >
      <div
        className={`w-2.5 h-2.5 rounded-full ${severityBg(severity)} mt-1.5 shrink-0 ${
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
            className={`text-sm font-semibold truncate ${
              muted ? "text-gray-500" : ""
            }`}
          >
            {change.monitorName}
          </span>
          <span
            className={`text-xs font-bold ${severityText(severity)}`}
          >
            {change.diffPercentage.toFixed(1)}%
          </span>
          <span className="text-xs text-gray-500 ml-auto shrink-0">
            {formatRelativeTime(change.detectedAt)}
          </span>
        </div>

        {change.aiSummary && !change.aiSummary.startsWith("[Error]") ? (
          <p className="text-xs text-gray-500 leading-snug line-clamp-1">
            {change.aiSummary}
          </p>
        ) : (
          <p className="text-xs text-gray-500 truncate">
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
        className={`shrink-0 mt-1 p-1.5 border rounded-lg transition-all ${
          change.reviewed
            ? "border-gray-200 text-gray-500 hover:border-gray-900 hover:text-gray-900"
            : "border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white"
        }`}
        title={change.reviewed ? "Mark as unreviewed" : "Mark as reviewed"}
      >
        <Check className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

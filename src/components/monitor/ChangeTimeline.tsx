import { useState, useEffect } from "react";
import { useAction } from "convex/react";
import { useAuth } from "@clerk/tanstack-react-start";
import { api } from "@convex/_generated/api";
import { formatRelativeTime } from "@/lib/utils";
import { diffSeverity } from "@/lib/severity-utils";
import { DiffViewer } from "@/components/diff/DiffViewer";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  AlertCircle,
  Info,
  Sparkles,
  Loader2,
  Lock,
} from "lucide-react";
import type { Id } from "@convex/_generated/dataModel";

interface Change {
  _id: string;
  diffPercentage: number;
  detectedAt: number;
  diffUrl: string | null;
  beforeUrl: string | null;
  afterUrl: string | null;
  beforeTextContent?: string | null;
  afterTextContent?: string | null;
  aiSummary?: string | null;
}

interface ChangeTimelineProps {
  changes: Change[];
}

function severityConfig(severity: "low" | "medium" | "high") {
  switch (severity) {
    case "low":
      return {
        bg: "bg-emerald-600",
        text: "text-emerald-600",
        border: "border-emerald-600",
        dotBg: "bg-emerald-400",
        label: "Minor",
        Icon: Info,
      };
    case "medium":
      return {
        bg: "bg-amber-500",
        text: "text-amber-500",
        border: "border-amber-500",
        dotBg: "bg-amber-500",
        label: "Moderate",
        Icon: AlertCircle,
      };
    case "high":
      return {
        bg: "bg-red-500",
        text: "text-red-500",
        border: "border-red-500",
        dotBg: "bg-red-500",
        label: "Major",
        Icon: AlertTriangle,
      };
  }
}

function AiSummaryBadge({
  changeId,
  summary,
  hasAiFeature,
}: {
  changeId: string;
  summary?: string | null;
  hasAiFeature: boolean;
}) {
  const generateSummary = useAction(api.aiActions.generateSummaryOnDemand);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Once summary arrives, clear pending state
  useEffect(() => {
    if (summary && pending) {
      setPending(false);
    }
  }, [summary, pending]);

  // Show existing summaries regardless of plan (they were already generated)
  if (summary) {
    const isError = summary.startsWith("[Error]");
    if (isError) {
      return (
        <div className="mt-2">
          <div className="flex items-start gap-2 px-4 py-2.5 border rounded-lg bg-red-50 border-red-200">
            <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5 text-red-500" />
            <p className="text-xs leading-relaxed text-red-500">{summary.slice(8)}</p>
          </div>
          {hasAiFeature && (
            <button
              onClick={async (e) => {
                e.stopPropagation();
                setPending(true);
                try {
                  await generateSummary({ changeId: changeId as Id<"changes"> });
                } catch (err: any) {
                  setPending(false);
                  setError(err.message ?? "Failed");
                }
              }}
              className="flex items-center gap-1.5 mt-1.5 text-xs font-bold text-violet-600 hover:text-violet-800 transition-colors"
            >
              <Sparkles className="w-3 h-3" />
              Retry
            </button>
          )}
        </div>
      );
    }
    return (
      <div className="mt-2">
        <div className="flex items-start gap-2 px-4 py-2.5 border rounded-lg bg-violet-50 border-violet-200">
          <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5 text-violet-600" />
          <p className="text-xs leading-relaxed text-violet-800">{summary}</p>
        </div>
        {hasAiFeature && (
          <button
            onClick={async (e) => {
              e.stopPropagation();
              setPending(true);
              try {
                await generateSummary({ changeId: changeId as Id<"changes"> });
              } catch (err: any) {
                setPending(false);
              }
            }}
            className="flex items-center gap-1.5 mt-1.5 text-xs font-bold text-gray-500 hover:text-violet-600 transition-colors"
          >
            <Sparkles className="w-3 h-3" />
            Regenerate
          </button>
        )}
      </div>
    );
  }

  // Loading state
  if (pending) {
    return (
      <div className="flex items-center gap-2 mt-2 text-xs font-bold text-violet-600">
        <Loader2 className="w-3 h-3 animate-spin" />
        Generating summary...
      </div>
    );
  }

  // No summary yet — show button or locked state
  if (!hasAiFeature) {
    return (
      <div className="mt-2 relative group/ai">
        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-300 cursor-not-allowed">
          <Lock className="w-3 h-3" />
          AI Summary
        </div>
        <div className="absolute left-0 bottom-full mb-1 hidden group-hover/ai:block z-10">
          <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-1.5 whitespace-nowrap">
            Upgrade to Pro or Business to use AI Summaries
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-2">
      <button
        onClick={async (e) => {
          e.stopPropagation();
          setError(null);
          setPending(true);
          try {
            await generateSummary({
              changeId: changeId as Id<"changes">,
            });
          } catch (err: any) {
            setPending(false);
            setError(err.message ?? "Failed to generate summary");
          }
        }}
        className="flex items-center gap-1.5 text-xs font-bold text-violet-600 hover:text-violet-800 transition-colors"
      >
        <Sparkles className="w-3 h-3" />
        AI Summary
      </button>
      {error && (
        <p className="text-xs text-red-500 mt-1">
          {error}
        </p>
      )}
    </div>
  );
}

export function ChangeTimeline({ changes }: ChangeTimelineProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { has } = useAuth();
  const hasAiFeature = has?.({ feature: "ai_summaries" }) ?? false;

  if (changes.length === 0) {
    return (
      <div className="border border-gray-200 border-dashed rounded-xl p-8 text-center">
        <p className="text-sm text-gray-500">No changes detected yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {changes.map((change) => {
        const isExpanded = expandedId === change._id;
        const severity = diffSeverity(change.diffPercentage);
        const config = severityConfig(severity);
        const SeverityIcon = config.Icon;

        return (
          <div
            key={change._id}
            className={`border border-gray-200 rounded-xl transition-shadow ${
              isExpanded ? "shadow-md" : ""
            }`}
          >
            <div>
              <button
                onClick={() =>
                  setExpandedId(isExpanded ? null : change._id)
                }
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left"
              >
                <div className="flex items-center gap-4 flex-1">
                  {/* Severity dot */}
                  <div className={`w-3 h-3 ${config.dotBg} rounded-full shrink-0`} />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <SeverityIcon className={`w-3.5 h-3.5 ${config.text}`} />
                      <span className={`text-xs font-bold ${config.text}`}>
                        {config.label} Change
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {new Date(change.detectedAt).toLocaleString()} ({formatRelativeTime(change.detectedAt)})
                    </p>
                  </div>

                  {/* Diff bar + percentage */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="w-20 h-2 bg-gray-50 overflow-hidden border border-gray-200 rounded-full">
                      <div
                        className={`h-full ${config.bg} transition-all`}
                        style={{
                          width: `${Math.min(100, change.diffPercentage * 2)}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-bold tabular-nums w-14 text-right">
                      {change.diffPercentage.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-gray-500 ml-3" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-500 ml-3" />
                )}
              </button>

              {/* AI Summary — always visible */}
              <div className="px-4 pb-3 -mt-1">
                <AiSummaryBadge
                  changeId={change._id}
                  summary={change.aiSummary}
                  hasAiFeature={hasAiFeature}
                />
              </div>
            </div>

            {isExpanded && (
              <div className="border-t border-gray-200">
                <div className="p-4 bg-white">
                  <DiffViewer
                    beforeUrl={change.beforeUrl}
                    afterUrl={change.afterUrl}
                    diffUrl={change.diffUrl}
                    beforeTextContent={change.beforeTextContent}
                    afterTextContent={change.afterTextContent}
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

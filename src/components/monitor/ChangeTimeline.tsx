import { useState, useEffect } from "react";
import { useAction } from "convex/react";
import { api } from "@convex/_generated/api";
import { formatRelativeTime } from "@/lib/utils";
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

function diffSeverity(pct: number): "low" | "medium" | "high" {
  if (pct < 5) return "low";
  if (pct < 20) return "medium";
  return "high";
}

function severityConfig(severity: "low" | "medium" | "high") {
  switch (severity) {
    case "low":
      return {
        bg: "bg-[#2d5a2d]",
        text: "text-[#2d5a2d]",
        border: "border-[#2d5a2d]",
        dotBg: "bg-[#7cb87c]",
        label: "Minor",
        Icon: Info,
      };
    case "medium":
      return {
        bg: "bg-[#ca8a04]",
        text: "text-[#ca8a04]",
        border: "border-[#ca8a04]",
        dotBg: "bg-[#ca8a04]",
        label: "Moderate",
        Icon: AlertCircle,
      };
    case "high":
      return {
        bg: "bg-[#dc2626]",
        text: "text-[#dc2626]",
        border: "border-[#dc2626]",
        dotBg: "bg-[#dc2626]",
        label: "Major",
        Icon: AlertTriangle,
      };
  }
}

function AiSummaryBadge({
  changeId,
  summary,
}: {
  changeId: string;
  summary?: string | null;
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

  // Show loading state first (takes priority over stale summary)
  if (pending) {
    return (
      <div className="flex items-center gap-2 mt-2 text-[10px] font-bold uppercase tracking-wider text-[#7c3aed]">
        <Loader2 className="w-3 h-3 animate-spin" />
        Generating summary...
      </div>
    );
  }

  if (summary) {
    const isError = summary.startsWith("[Error]");
    if (isError) {
      return (
        <div className="mt-2">
          <div className="flex items-start gap-2 px-4 py-2.5 border bg-[#fff5f5] border-[#f0d4d4]">
            <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#dc2626]" />
            <p className="text-xs leading-relaxed text-[#dc2626]">{summary.slice(8)}</p>
          </div>
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
            className="flex items-center gap-1.5 mt-1.5 text-[10px] font-bold uppercase tracking-wider text-[#7c3aed] hover:text-[#5b21b6] transition-colors"
          >
            <Sparkles className="w-3 h-3" />
            Retry
          </button>
        </div>
      );
    }
    return (
      <div className="mt-2">
        <div className="flex items-start gap-2 px-4 py-2.5 border bg-[#f5f0ff] border-[#d4c8f0]">
          <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#7c3aed]" />
          <p className="text-xs leading-relaxed text-[#4a3272]">{summary}</p>
        </div>
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
          className="flex items-center gap-1.5 mt-1.5 text-[10px] font-bold uppercase tracking-wider text-[#888] hover:text-[#7c3aed] transition-colors"
        >
          <Sparkles className="w-3 h-3" />
          Regenerate
        </button>
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
        className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#7c3aed] hover:text-[#5b21b6] transition-colors"
      >
        <Sparkles className="w-3 h-3" />
        AI Summary
      </button>
      {error && (
        <p className="text-[11px] text-[#dc2626] mt-1">
          {error}
        </p>
      )}
    </div>
  );
}

export function ChangeTimeline({ changes }: ChangeTimelineProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (changes.length === 0) {
    return (
      <div className="border-2 border-[#1a1a1a] border-dashed p-8 text-center">
        <p className="text-sm text-[#888]">No changes detected yet.</p>
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
            className={`border-2 border-[#1a1a1a] transition-shadow ${
              isExpanded ? "shadow-[4px_4px_0px_0px_#1a1a1a]" : ""
            }`}
          >
            <div>
              <button
                onClick={() =>
                  setExpandedId(isExpanded ? null : change._id)
                }
                className="w-full flex items-center justify-between p-4 hover:bg-[#e8e8e0] transition-colors text-left"
              >
                <div className="flex items-center gap-4 flex-1">
                  {/* Severity dot */}
                  <div className={`w-3 h-3 ${config.dotBg} border-2 border-[#1a1a1a] shrink-0`} />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <SeverityIcon className={`w-3.5 h-3.5 ${config.text}`} />
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${config.text}`}>
                        {config.label} Change
                      </span>
                    </div>
                    <p className="text-xs text-[#888]">
                      {new Date(change.detectedAt).toLocaleString()} ({formatRelativeTime(change.detectedAt)})
                    </p>
                  </div>

                  {/* Diff bar + percentage */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="w-20 h-2 bg-[#e8e8e0] overflow-hidden border border-[#ccc]">
                      <div
                        className={`h-full ${config.bg} transition-all`}
                        style={{
                          width: `${Math.min(100, change.diffPercentage * 2)}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-black tabular-nums w-14 text-right">
                      {change.diffPercentage.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-[#888] ml-3" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#888] ml-3" />
                )}
              </button>

              {/* AI Summary — always visible */}
              <div className="px-4 pb-3 -mt-1">
                <AiSummaryBadge
                  changeId={change._id}
                  summary={change.aiSummary}
                />
              </div>
            </div>

            {isExpanded && (
              <div className="border-t-2 border-[#1a1a1a]">
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

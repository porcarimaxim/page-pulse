import { useState } from "react";
import { formatRelativeTime } from "@/lib/utils";
import { DiffViewer } from "@/components/diff/DiffViewer";
import { ChevronDown, ChevronUp } from "lucide-react";

interface Change {
  _id: string;
  diffPercentage: number;
  detectedAt: number;
  diffUrl: string | null;
  beforeUrl: string | null;
  afterUrl: string | null;
}

interface ChangeTimelineProps {
  changes: Change[];
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
        return (
          <div
            key={change._id}
            className="border-2 border-[#1a1a1a]"
          >
            <button
              onClick={() =>
                setExpandedId(isExpanded ? null : change._id)
              }
              className="w-full flex items-center justify-between p-4 hover:bg-[#e8e8e0] transition-colors text-left"
            >
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 bg-[#dc2626] border-2 border-[#1a1a1a]" />
                <div>
                  <p className="text-sm font-bold">
                    {change.diffPercentage}% changed
                  </p>
                  <p className="text-xs text-[#888]">
                    {formatRelativeTime(change.detectedAt)}
                  </p>
                </div>
              </div>
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-[#888]" />
              ) : (
                <ChevronDown className="w-4 h-4 text-[#888]" />
              )}
            </button>

            {isExpanded && (
              <div className="border-t-2 border-[#1a1a1a] p-4">
                <DiffViewer
                  beforeUrl={change.beforeUrl}
                  afterUrl={change.afterUrl}
                  diffUrl={change.diffUrl}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

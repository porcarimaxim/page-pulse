import { useMemo, useState } from "react";
import { createTwoFilesPatch } from "diff";
import { html as diff2html } from "diff2html";
import "diff2html/bundles/css/diff2html.min.css";

interface TextDiffViewProps {
  beforeText: string;
  afterText: string;
}

type DiffMode = "line-by-line" | "side-by-side";

export function TextDiffView({ beforeText, afterText }: TextDiffViewProps) {
  const [diffMode, setDiffMode] = useState<DiffMode>("line-by-line");

  const diffHtml = useMemo(() => {
    if (!beforeText && !afterText) return null;

    const patch = createTwoFilesPatch(
      "before",
      "after",
      beforeText,
      afterText,
      "",
      "",
      { context: 3 }
    );

    return diff2html(patch, {
      outputFormat: diffMode,
      drawFileList: false,
      matching: "lines",
      diffStyle: "word",
    });
  }, [beforeText, afterText, diffMode]);

  if (!diffHtml) {
    return (
      <div className="border-2 border-[#1a1a1a] border-dashed p-8 text-center">
        <p className="text-sm text-[#888]">No text content to compare.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Mode toggle */}
      <div className="flex gap-0">
        <button
          onClick={() => setDiffMode("line-by-line")}
          className={`border-2 border-[#1a1a1a] px-3 py-1.5 text-xs font-bold uppercase transition-all ${
            diffMode === "line-by-line"
              ? "bg-[#1a1a1a] text-[#f0f0e8]"
              : "bg-transparent text-[#1a1a1a] hover:bg-[#e8e8e0]"
          }`}
        >
          Unified
        </button>
        <button
          onClick={() => setDiffMode("side-by-side")}
          className={`border-2 border-[#1a1a1a] border-l-0 px-3 py-1.5 text-xs font-bold uppercase transition-all ${
            diffMode === "side-by-side"
              ? "bg-[#1a1a1a] text-[#f0f0e8]"
              : "bg-transparent text-[#1a1a1a] hover:bg-[#e8e8e0]"
          }`}
        >
          Split
        </button>
      </div>

      {/* Diff output */}
      <div
        className="pp-text-diff border-2 border-[#1a1a1a] overflow-x-auto"
        dangerouslySetInnerHTML={{ __html: diffHtml }}
      />

      {/* Style overrides for diff2html to match brutalist design */}
      <style>{`
        .pp-text-diff .d2h-wrapper {
          border: none;
          border-radius: 0;
          font-family: var(--font-geist-mono, 'Geist Mono', monospace);
        }
        .pp-text-diff .d2h-file-wrapper {
          border: none;
          border-radius: 0;
          margin-bottom: 0;
        }
        .pp-text-diff .d2h-file-header {
          display: none;
        }
        .pp-text-diff .d2h-diff-table {
          font-family: var(--font-geist-mono, 'Geist Mono', monospace);
          font-size: 12px;
        }
        .pp-text-diff .d2h-code-linenumber {
          background-color: #e8e8e0;
          color: #888;
          border-right: 2px solid #ccc;
        }
        .pp-text-diff .d2h-code-line {
          padding: 0 8px;
        }
        .pp-text-diff .d2h-code-side-line {
          padding: 0 8px;
        }
        .pp-text-diff .d2h-del {
          background-color: #fecaca;
          border-color: #dc2626;
        }
        .pp-text-diff .d2h-ins {
          background-color: #dcfce7;
          border-color: #2d5a2d;
        }
        .pp-text-diff .d2h-del .d2h-code-line-ctn {
          background-color: transparent;
        }
        .pp-text-diff .d2h-ins .d2h-code-line-ctn {
          background-color: transparent;
        }
        .pp-text-diff del.d2h-change {
          background-color: #fca5a5;
          text-decoration: none;
          border-radius: 0;
        }
        .pp-text-diff ins.d2h-change {
          background-color: #86efac;
          text-decoration: none;
          border-radius: 0;
        }
        .pp-text-diff .d2h-info {
          background-color: #e8e8e0;
          color: #888;
          border-bottom: 1px solid #ccc;
        }
        .pp-text-diff .d2h-file-diff .d2h-del.d2h-change {
          background-color: #fecaca;
        }
        .pp-text-diff .d2h-file-diff .d2h-ins.d2h-change {
          background-color: #dcfce7;
        }
        .pp-text-diff .d2h-file-side-diff {
          border-right: 2px solid #1a1a1a;
        }
        .pp-text-diff .d2h-diff-tbody tr:last-child td {
          border-bottom: none;
        }
        .pp-text-diff .d2h-code-linenumber,
        .pp-text-diff .d2h-code-line,
        .pp-text-diff .d2h-code-side-linenumber,
        .pp-text-diff .d2h-code-side-line {
          border-radius: 0;
        }
      `}</style>
    </div>
  );
}

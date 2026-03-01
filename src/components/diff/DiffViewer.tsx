import { useState } from "react";

interface DiffViewerProps {
  beforeUrl: string | null;
  afterUrl: string | null;
  diffUrl: string | null;
}

type ViewMode = "side-by-side" | "diff" | "before" | "after";

export function DiffViewer({ beforeUrl, afterUrl, diffUrl }: DiffViewerProps) {
  const [mode, setMode] = useState<ViewMode>("side-by-side");

  const modes: { value: ViewMode; label: string }[] = [
    { value: "side-by-side", label: "Side by Side" },
    { value: "diff", label: "Diff" },
    { value: "before", label: "Before" },
    { value: "after", label: "After" },
  ];

  return (
    <div className="space-y-4">
      {/* Mode selector */}
      <div className="flex gap-1">
        {modes.map((m) => (
          <button
            key={m.value}
            onClick={() => setMode(m.value)}
            className={`px-3 py-1.5 text-xs font-bold uppercase border-2 border-[#1a1a1a] transition-all ${
              mode === m.value
                ? "bg-[#1a1a1a] text-[#f0f0e8]"
                : "bg-transparent text-[#1a1a1a] hover:bg-[#e8e8e0]"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* View */}
      {mode === "side-by-side" && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-bold uppercase text-[#888] mb-2">Before</p>
            {beforeUrl ? (
              <img
                src={beforeUrl}
                alt="Before"
                className="w-full border-2 border-[#1a1a1a]"
              />
            ) : (
              <div className="border-2 border-[#1a1a1a] bg-[#e8e8e0] h-40 flex items-center justify-center text-[#888] text-sm">
                No image
              </div>
            )}
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-[#888] mb-2">After</p>
            {afterUrl ? (
              <img
                src={afterUrl}
                alt="After"
                className="w-full border-2 border-[#1a1a1a]"
              />
            ) : (
              <div className="border-2 border-[#1a1a1a] bg-[#e8e8e0] h-40 flex items-center justify-center text-[#888] text-sm">
                No image
              </div>
            )}
          </div>
        </div>
      )}

      {mode === "diff" && (
        <div>
          <p className="text-xs font-bold uppercase text-[#888] mb-2">
            Changes highlighted in pink
          </p>
          {diffUrl ? (
            <img
              src={diffUrl}
              alt="Diff"
              className="w-full border-2 border-[#dc2626]"
            />
          ) : (
            <div className="border-2 border-[#1a1a1a] bg-[#e8e8e0] h-40 flex items-center justify-center text-[#888] text-sm">
              No diff image
            </div>
          )}
        </div>
      )}

      {mode === "before" && (
        <div>
          {beforeUrl ? (
            <img
              src={beforeUrl}
              alt="Before"
              className="w-full border-2 border-[#1a1a1a]"
            />
          ) : (
            <div className="border-2 border-[#1a1a1a] bg-[#e8e8e0] h-40 flex items-center justify-center text-[#888] text-sm">
              No image
            </div>
          )}
        </div>
      )}

      {mode === "after" && (
        <div>
          {afterUrl ? (
            <img
              src={afterUrl}
              alt="After"
              className="w-full border-2 border-[#1a1a1a]"
            />
          ) : (
            <div className="border-2 border-[#1a1a1a] bg-[#e8e8e0] h-40 flex items-center justify-center text-[#888] text-sm">
              No image
            </div>
          )}
        </div>
      )}
    </div>
  );
}

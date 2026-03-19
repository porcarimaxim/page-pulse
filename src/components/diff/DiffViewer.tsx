import { useRef, useState, useCallback } from "react";
import { TextDiffView } from "./TextDiffView";

interface DiffViewerProps {
  beforeUrl: string | null;
  afterUrl: string | null;
  diffUrl: string | null;
  beforeTextContent?: string | null;
  afterTextContent?: string | null;
}

type ViewMode = "slider" | "side-by-side" | "diff" | "before" | "after" | "text-diff";

export function DiffViewer({
  beforeUrl,
  afterUrl,
  diffUrl,
  beforeTextContent,
  afterTextContent,
}: DiffViewerProps) {
  const hasTextData = !!(beforeTextContent || afterTextContent);
  const hasBothImages = !!(beforeUrl && afterUrl);
  const [mode, setMode] = useState<ViewMode>(hasBothImages ? "slider" : "side-by-side");

  const modes: { value: ViewMode; label: string }[] = [
    ...(hasBothImages
      ? [{ value: "slider" as ViewMode, label: "Slider" }]
      : []),
    { value: "side-by-side", label: "Side by Side" },
    { value: "diff", label: "Diff" },
    { value: "before", label: "Before" },
    { value: "after", label: "After" },
    ...(hasTextData
      ? [{ value: "text-diff" as ViewMode, label: "Text Diff" }]
      : []),
  ];

  return (
    <div className="space-y-4">
      {/* Mode selector */}
      <div className="flex gap-1 flex-wrap">
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

      {/* Slider view */}
      {mode === "slider" && hasBothImages && (
        <BeforeAfterSlider beforeUrl={beforeUrl!} afterUrl={afterUrl!} />
      )}

      {/* Side by side view */}
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

      {mode === "text-diff" && hasTextData && (
        <TextDiffView
          beforeText={beforeTextContent ?? ""}
          afterText={afterTextContent ?? ""}
        />
      )}
    </div>
  );
}

/* ─── Before/After Slider ─── */

function BeforeAfterSlider({
  beforeUrl,
  afterUrl,
}: {
  beforeUrl: string;
  afterUrl: string;
}) {
  const [position, setPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const updatePosition = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    setPosition(Math.max(2, Math.min(98, x)));
  }, []);

  const handleMouseDown = useCallback(() => {
    isDragging.current = true;

    const onMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      e.preventDefault();
      updatePosition(e.clientX);
    };
    const onUp = () => {
      isDragging.current = false;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [updatePosition]);

  const handleTouchStart = useCallback(() => {
    isDragging.current = true;

    const onMove = (e: TouchEvent) => {
      if (!isDragging.current) return;
      updatePosition(e.touches[0].clientX);
    };
    const onEnd = () => {
      isDragging.current = false;
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
    };

    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("touchend", onEnd);
  }, [updatePosition]);

  return (
    <div
      ref={containerRef}
      className="relative w-full border-2 border-[#1a1a1a] overflow-hidden select-none"
      onClick={(e) => updatePosition(e.clientX)}
    >
      {/* After image (full, underneath) */}
      <img
        src={afterUrl}
        alt="After"
        className="block w-full"
        draggable={false}
      />

      {/* Before image (clipped to left of slider) */}
      <div
        className="absolute inset-0"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      >
        <img
          src={beforeUrl}
          alt="Before"
          className="block w-full h-full object-cover"
          draggable={false}
        />
      </div>

      {/* Slider line + handle */}
      <div
        className="absolute top-0 bottom-0 z-10 cursor-col-resize"
        style={{ left: `${position}%`, transform: "translateX(-50%)", width: "40px" }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        {/* Vertical line */}
        <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-0.5 bg-[#1a1a1a]" />

        {/* Drag handle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-[#1a1a1a] flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(26,26,26,0.3)]">
          <span className="text-[#f0f0e8] text-sm font-bold tracking-tighter">⟨ ⟩</span>
        </div>
      </div>

      {/* Labels */}
      <div className="absolute top-3 left-3 px-2 py-1 bg-[#1a1a1a] text-[#f0f0e8] text-[10px] font-bold uppercase tracking-wider z-20">
        Before
      </div>
      <div className="absolute top-3 right-3 px-2 py-1 bg-[#2d5a2d] text-[#f0f0e8] text-[10px] font-bold uppercase tracking-wider z-20">
        After
      </div>
    </div>
  );
}

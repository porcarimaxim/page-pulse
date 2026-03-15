import { useState, useRef, useCallback, useEffect } from "react";
import { useAction } from "convex/react";
import { api } from "@convex/_generated/api";
import { Loader2, MousePointer, RotateCcw, List } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ElementBox {
  selector: string;
  x: number; // percentage
  y: number;
  w: number;
  h: number;
}

interface ElementPickerProps {
  url: string;
  screenshotUrl: string;
  mobileViewport?: boolean;
  onElementSelect: (selector: string) => void;
}

export function ElementPicker({
  url,
  screenshotUrl,
  mobileViewport,
  onElementSelect,
}: ElementPickerProps) {
  const getElementMap = useAction(api.screenshotActions.getPageElementMap);

  const [elements, setElements] = useState<ElementBox[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedSelector, setSelectedSelector] = useState<string | null>(null);
  const [hoveredSelector, setHoveredSelector] = useState<string | null>(null);
  const [customSelector, setCustomSelector] = useState("");

  const containerRef = useRef<HTMLDivElement>(null);

  // Load element map on mount
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setLoadError(null);

    getElementMap({ url, mobileViewport })
      .then((result) => {
        if (cancelled) return;
        const all = result as ElementBox[];

        // Filter out elements that are outside the visible page area
        const inBounds = all.filter(
          (el) => el.x >= 0 && el.y >= 0 && el.x < 100 && el.y < 100 && el.w > 0 && el.h > 0
        );

        // Filter out popup/dropdown/overlay elements.
        // Strategy: identify popup containers (menu-list, popover-content, etc.)
        // and also remove elements that heavily overlap with them.
        // Additionally, remove stacked duplicate-area elements (nav wrappers).
        const popupPatterns = /^#menu-list|^#popover-content|^#tooltip|^\[data-popper|^\[data-radix-popper/i;

        // First pass: collect popup containers
        const popupBoxes = inBounds.filter((el) => popupPatterns.test(el.selector));

        const visible = inBounds.filter((el) => {
          // Skip popup containers themselves
          if (popupPatterns.test(el.selector)) return false;

          const elR = el.x + el.w;
          const elB = el.y + el.h;

          // Skip elements fully inside a popup container
          for (const p of popupBoxes) {
            if (
              el.x >= p.x - 1 && el.y >= p.y - 1 &&
              elR <= p.x + p.w + 1 && elB <= p.y + p.h + 1
            ) {
              return false;
            }
          }

          // Skip generic wrapper elements (div/span) that heavily overlap with a popup.
          // Only applies to wrappers — keeps interactive elements like links, buttons, headings.
          const isWrapper = /^div\b|^span\b/i.test(el.selector);
          if (isWrapper) {
            for (const p of popupBoxes) {
              const overlapX = Math.max(0, Math.min(elR, p.x + p.w) - Math.max(el.x, p.x));
              const overlapY = Math.max(0, Math.min(elB, p.y + p.h) - Math.max(el.y, p.y));
              const overlapArea = overlapX * overlapY;
              const elArea = el.w * el.h;
              if (elArea > 0 && overlapArea / elArea > 0.5) {
                return false;
              }
            }
          }

          return true;
        });

        setElements(visible);
        setIsLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setLoadError(err instanceof Error ? err.message : "Failed to load elements");
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [url, mobileViewport, getElementMap]);

  const handleElementClick = useCallback(
    (selector: string) => {
      setSelectedSelector(selector);
      onElementSelect(selector);
    },
    [onElementSelect]
  );

  const handleReset = useCallback(() => {
    setSelectedSelector(null);
  }, []);

  const handleCustomSubmit = () => {
    const sel = customSelector.trim();
    if (!sel) return;
    setSelectedSelector(sel);
    onElementSelect(sel);
  };

  // Hit-test: find smallest element under a mouse event on the image container
  const hitTest = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const img = e.currentTarget.querySelector("img");
      if (!img) return null;
      const rect = img.getBoundingClientRect();
      const xPct = ((e.clientX - rect.left) / rect.width) * 100;
      const yPct = ((e.clientY - rect.top) / rect.height) * 100;
      let best: ElementBox | null = null;
      let bestArea = Infinity;
      for (const el of elements) {
        if (xPct >= el.x && xPct <= el.x + el.w && yPct >= el.y && yPct <= el.y + el.h) {
          const area = el.w * el.h;
          if (area < bestArea) {
            bestArea = area;
            best = el;
          }
        }
      }
      return best;
    },
    [elements]
  );

  // Format selector for display in the list
  const formatSelector = (selector: string): { tag: string; detail: string } => {
    if (selector.startsWith("#")) {
      return { tag: "id", detail: selector };
    }
    const dotIndex = selector.indexOf(".");
    if (dotIndex > 0) {
      return { tag: selector.substring(0, dotIndex), detail: selector };
    }
    return { tag: selector, detail: selector };
  };

  return (
    <div className="flex flex-col">
      {/* Screenshot area — mouse handlers on the container, no overlay div */}
      <div
        className="relative"
        ref={containerRef}
        style={{ cursor: !isLoading && !selectedSelector ? "pointer" : undefined }}
        onMouseMove={(e) => {
          if (isLoading || selectedSelector) return;
          const best = hitTest(e);
          setHoveredSelector(best ? best.selector : null);
        }}
        onMouseLeave={() => setHoveredSelector(null)}
        onClick={(e) => {
          if (isLoading || selectedSelector) return;
          const best = hitTest(e);
          if (best) handleElementClick(best.selector);
        }}
      >
        <div className="relative inline-block w-full">
          <img
            src={screenshotUrl}
            alt="Page screenshot"
            className="w-full h-auto block"
            draggable={false}
          />

          {/* Hover highlight — pointer-events:none so it never blocks scroll */}
          {hoveredSelector && !selectedSelector && (() => {
            const el = elements.find((e) => e.selector === hoveredSelector);
            if (!el) return null;
            return (
              <div
                className="absolute border-2 border-dashed border-[#2d5a2d] bg-[#2d5a2d]/10 pointer-events-none"
                style={{
                  left: `${el.x}%`,
                  top: `${el.y}%`,
                  width: `${el.w}%`,
                  height: `${el.h}%`,
                  zIndex: 9999,
                }}
              />
            );
          })()}

          {/* Selected element highlight */}
          {selectedSelector && (() => {
            const sel = elements.find((e) => e.selector === selectedSelector);
            if (!sel) return null;
            return (
              <div
                className="absolute border-2 border-[#2d5a2d] bg-[#2d5a2d]/15 pointer-events-none"
                style={{
                  left: `${sel.x}%`,
                  top: `${sel.y}%`,
                  width: `${sel.w}%`,
                  height: `${sel.h}%`,
                }}
              />
            );
          })()}

          {/* Loading overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-[#1a1a1a]/40 flex items-center justify-center">
              <div className="bg-[#f0f0e8] border-2 border-[#1a1a1a] px-4 py-3 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm font-bold uppercase">Loading elements...</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Error message */}
      {loadError && (
        <div className="border-t-2 border-[#dc2626] bg-[#dc2626]/10 px-4 py-2">
          <p className="text-xs text-[#dc2626] font-bold">{loadError}</p>
        </div>
      )}

      {/* Bottom bar */}
      <div className="border-t-2 border-[#ccc] p-3 space-y-3 bg-[#f0f0e8]">
        {/* Selected element display */}
        {selectedSelector && (
          <div className="border-2 border-[#2d5a2d] bg-[#2d5a2d]/10 p-2 flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase text-[#888] mb-0.5">
                Selected Element
              </p>
              <p className="text-sm font-mono text-[#2d5a2d] font-bold break-all">
                {selectedSelector}
              </p>
            </div>
            <button
              onClick={handleReset}
              className="shrink-0 p-1 hover:bg-[#2d5a2d]/10"
              title="Pick a different element"
            >
              <RotateCcw className="w-4 h-4 text-[#888]" />
            </button>
          </div>
        )}

        {/* Instruction text */}
        {!selectedSelector && !isLoading && (
          <p className="text-xs text-[#888] font-bold uppercase">
            Click an element to select it
          </p>
        )}

        {/* Element list */}
        {!isLoading && !selectedSelector && elements.length > 0 && (
          <div>
            <p className="text-xs font-bold uppercase text-[#888] mb-1.5 flex items-center gap-1.5">
              <List className="w-3 h-3" />
              Detected elements ({elements.length})
            </p>
            <div className="max-h-40 overflow-y-auto border-2 border-[#ccc]">
              {elements.map((el, i) => {
                const { tag, detail } = formatSelector(el.selector);
                return (
                  <button
                    key={`list-${el.selector}-${i}`}
                    type="button"
                    onClick={() => handleElementClick(el.selector)}
                    onMouseEnter={() => setHoveredSelector(el.selector)}
                    onMouseLeave={() => setHoveredSelector(null)}
                    className={`w-full text-left px-2 py-1.5 text-xs font-mono border-b border-[#ccc] last:border-b-0 transition-colors ${
                      hoveredSelector === el.selector
                        ? "bg-[#2d5a2d]/10 text-[#2d5a2d]"
                        : "hover:bg-[#1a1a1a]/5"
                    }`}
                  >
                    <span className="font-bold">{tag}</span>
                    {tag !== detail && (
                      <span className="text-[#888] ml-1">
                        {detail.substring(tag.length)}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Manual CSS selector input */}
        <div>
          <p className="text-xs font-bold uppercase text-[#888] mb-1.5">
            Or enter CSS selector
          </p>
          <div className="flex gap-2">
            <Input
              value={customSelector}
              onChange={(e) => setCustomSelector(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCustomSubmit()}
              placeholder="#price, .product-title, h1"
              className="flex-1 font-mono text-sm"
            />
            <Button
              variant="outline"
              onClick={handleCustomSubmit}
              disabled={!customSelector.trim()}
            >
              <MousePointer className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

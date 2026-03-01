import { useState, useRef, useEffect, useCallback } from "react";
import { useAction } from "convex/react";
import { api } from "@convex/_generated/api";
import { Loader2, MousePointer } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const VIEWPORT_WIDTH = 1280;
const VIEWPORT_HEIGHT = 800;
const SKIP_TAGS = new Set([
  "html",
  "head",
  "body",
  "script",
  "style",
  "link",
  "meta",
  "br",
  "hr",
  "noscript",
  "title",
  "base",
]);

interface ElementCoord {
  selector: string;
  tag: string;
  depth: number;
  rect: { top: number; left: number; width: number; height: number };
  text: string;
}

interface ElementPickerProps {
  url: string;
  screenshotUrl: string;
  onElementSelect: (selector: string) => void;
}

/** Generate a CSS selector for a DOM element (runs in the iframe's document context). */
function generateCssSelector(el: Element, doc: Document): string {
  const tag = el.tagName.toLowerCase();

  // ID-based selector
  if (el.id && !el.id.match(/^\d/) && !el.id.includes(" ") && !el.id.includes(":")) {
    try {
      const sel = `#${CSS.escape(el.id)}`;
      if (doc.querySelectorAll(sel).length === 1) return sel;
    } catch {
      /* skip invalid */
    }
  }

  // Tag + class combo
  const classes = [...el.classList].filter(
    (c) =>
      c.length > 0 &&
      c.length < 40 &&
      !c.match(/^\d/) &&
      !c.includes(":") &&
      !c.includes("[") &&
      !c.includes("/") &&
      !c.includes("!")
  );

  if (classes.length > 0) {
    const escaped = classes.slice(0, 2).map((c) => CSS.escape(c));
    const twoClass = `${tag}.${escaped.join(".")}`;
    try {
      if (doc.querySelectorAll(twoClass).length <= 3) return twoClass;
    } catch {
      /* skip */
    }

    const oneClass = `${tag}.${escaped[0]}`;
    try {
      if (doc.querySelectorAll(oneClass).length <= 3) return oneClass;
    } catch {
      /* skip */
    }
  }

  // Semantic tags
  const semanticTags = [
    "header",
    "nav",
    "main",
    "article",
    "section",
    "aside",
    "footer",
    "h1",
    "h2",
    "h3",
    "h4",
    "form",
    "table",
  ];
  if (semanticTags.includes(tag)) {
    try {
      if (doc.querySelectorAll(tag).length <= 3) return tag;
    } catch {
      /* skip */
    }
  }

  // Fallback: tag + first class (even if not unique)
  if (classes.length > 0) {
    return `${tag}.${CSS.escape(classes[0])}`;
  }
  return tag;
}

function getDepth(el: Element): number {
  let depth = 0;
  let current: Element | null = el;
  while (current) {
    depth++;
    current = current.parentElement;
  }
  return depth;
}

export function ElementPicker({
  url,
  screenshotUrl,
  onElementSelect,
}: ElementPickerProps) {
  const fetchPageHtml = useAction(api.elementDetection.fetchPageHtml);

  const [elements, setElements] = useState<ElementCoord[]>([]);
  const [pageHtml, setPageHtml] = useState<string | null>(null);
  const [selectedSelector, setSelectedSelector] = useState<string | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [customSelector, setCustomSelector] = useState("");
  const [imgDimensions, setImgDimensions] = useState({ width: 0, height: 0 });

  const imgRef = useRef<HTMLImageElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Track image dimensions for coordinate scaling
  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    const updateDimensions = () => {
      if (img.offsetWidth > 0 && img.offsetHeight > 0) {
        setImgDimensions({ width: img.offsetWidth, height: img.offsetHeight });
      }
    };

    if (img.complete) updateDimensions();
    img.addEventListener("load", updateDimensions);

    const observer = new ResizeObserver(updateDimensions);
    observer.observe(img);

    return () => {
      img.removeEventListener("load", updateDimensions);
      observer.disconnect();
    };
  }, [screenshotUrl]);

  // Fetch page HTML on mount
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setIsLoading(true);
        setError(null);
        const html = await fetchPageHtml({ url });
        if (cancelled) return;
        setPageHtml(html);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load page for element detection"
          );
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  // Set iframe srcdoc when HTML is ready
  useEffect(() => {
    if (pageHtml && iframeRef.current) {
      iframeRef.current.srcdoc = pageHtml;
    }
  }, [pageHtml]);

  // Extract element coordinates from the iframe DOM
  const extractElements = useCallback((doc: Document) => {
    const allElements = doc.querySelectorAll("*");
    const extracted: ElementCoord[] = [];
    const seenKeys = new Set<string>();

    allElements.forEach((el) => {
      const tag = el.tagName.toLowerCase();
      if (SKIP_TAGS.has(tag)) return;

      const rect = el.getBoundingClientRect();

      // Skip tiny elements
      if (rect.width < 20 || rect.height < 10) return;
      // Skip elements outside viewport
      if (rect.top >= VIEWPORT_HEIGHT || rect.left >= VIEWPORT_WIDTH) return;
      if (rect.top + rect.height < 0 || rect.left + rect.width < 0) return;
      // Skip elements covering >90% of viewport (body wrappers)
      if (rect.width * rect.height > VIEWPORT_WIDTH * VIEWPORT_HEIGHT * 0.9)
        return;

      const selector = generateCssSelector(el, doc);
      const depth = getDepth(el);

      // Deduplicate by selector + approximate position
      const key = `${selector}:${Math.round(rect.top)}:${Math.round(rect.left)}:${Math.round(rect.width)}`;
      if (seenKeys.has(key)) return;
      seenKeys.add(key);

      extracted.push({
        selector,
        tag,
        depth,
        rect: {
          top: Math.max(0, rect.top),
          left: Math.max(0, rect.left),
          width: Math.min(rect.width, VIEWPORT_WIDTH - Math.max(0, rect.left)),
          height: Math.min(
            rect.height,
            VIEWPORT_HEIGHT - Math.max(0, rect.top)
          ),
        },
        text: (el.textContent?.trim() || "").substring(0, 60),
      });
    });

    // Sort by depth ascending (deeper = higher z-index = on top)
    extracted.sort((a, b) => a.depth - b.depth);

    setElements(extracted.slice(0, 300));
    setIsLoading(false);
  }, []);

  // Iframe load handler
  const handleIframeLoad = useCallback(() => {
    // Small delay to let CSS apply
    setTimeout(() => {
      const doc = iframeRef.current?.contentDocument;
      if (doc) {
        extractElements(doc);
      } else {
        setIsLoading(false);
        setError("Could not access page content for element detection.");
      }
    }, 300);
  }, [extractElements]);

  // Fallback timeout if iframe load is slow
  useEffect(() => {
    if (!isLoading || !pageHtml) return;
    const timeout = setTimeout(() => {
      if (isLoading && iframeRef.current?.contentDocument) {
        extractElements(iframeRef.current.contentDocument);
      }
    }, 10_000);
    return () => clearTimeout(timeout);
  }, [isLoading, pageHtml, extractElements]);

  const handleSelect = (el: ElementCoord) => {
    if (selectedSelector === el.selector) {
      // Deselect
      setSelectedSelector(null);
      return;
    }
    setSelectedSelector(el.selector);
    onElementSelect(el.selector);
  };

  const handleCustomSubmit = () => {
    const sel = customSelector.trim();
    if (sel) {
      setSelectedSelector(sel);
      onElementSelect(sel);
    }
  };

  // Scale factors: displayed image size / viewport size
  const scaleX = imgDimensions.width > 0 ? imgDimensions.width / VIEWPORT_WIDTH : 0;
  const scaleY = imgDimensions.height > 0 ? imgDimensions.height / VIEWPORT_HEIGHT : 0;

  const hoveredElement = hoveredIndex !== null ? elements[hoveredIndex] : null;

  return (
    <div className="space-y-4">
      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-4 gap-2 text-[#888]">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm font-bold">Scanning page elements...</span>
        </div>
      )}

      {error && (
        <div className="border-2 border-[#dc2626] bg-[#dc2626]/10 p-3">
          <p className="text-xs text-[#dc2626] font-bold">{error}</p>
        </div>
      )}

      {/* Screenshot with element overlay */}
      <div className="relative select-none">
        <img
          ref={imgRef}
          src={screenshotUrl}
          alt="Page screenshot"
          className="w-full border-2 border-[#1a1a1a]"
          draggable={false}
        />

        {/* Overlay container - exact same size as the displayed image */}
        {!isLoading && scaleX > 0 && elements.length > 0 && (
          <div
            className="absolute overflow-hidden"
            style={{
              top: 2,
              left: 2,
              width: imgDimensions.width,
              height: imgDimensions.height,
            }}
          >
            {elements.map((el, i) => (
              <div
                key={i}
                className={`absolute cursor-pointer border-2 transition-all duration-150 ${
                  selectedSelector === el.selector
                    ? "bg-[#2d5a2d]/30 border-[#2d5a2d]"
                    : hoveredIndex === i
                      ? "bg-[#7cb87c]/40 border-[#7cb87c]"
                      : "border-transparent"
                }`}
                style={{
                  top: el.rect.top * scaleY,
                  left: el.rect.left * scaleX,
                  width: el.rect.width * scaleX,
                  height: el.rect.height * scaleY,
                  zIndex: el.depth,
                }}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => handleSelect(el)}
              />
            ))}

            {/* Hover tooltip showing CSS selector */}
            {hoveredElement && (
              <div
                className="absolute bg-[#1a1a1a] text-[#f0f0e8] px-2 py-1 text-xs font-mono pointer-events-none whitespace-nowrap max-w-[80%] truncate"
                style={{
                  top: Math.max(
                    0,
                    Math.min(
                      hoveredElement.rect.top * scaleY - 26,
                      imgDimensions.height - 26
                    )
                  ),
                  left: Math.max(
                    0,
                    Math.min(
                      hoveredElement.rect.left * scaleX,
                      imgDimensions.width - 120
                    )
                  ),
                  zIndex: 9999,
                }}
              >
                {hoveredElement.selector}
              </div>
            )}
          </div>
        )}

        {/* Element count badge */}
        {!isLoading && elements.length > 0 && (
          <div className="absolute top-4 right-4 bg-[#1a1a1a] text-[#f0f0e8] px-2 py-1 text-xs font-bold z-[9999]">
            {elements.length} elements
          </div>
        )}

        {/* No elements detected message */}
        {!isLoading && elements.length === 0 && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#1a1a1a]/50">
            <div className="bg-[#f0f0e8] border-2 border-[#1a1a1a] p-4 text-center max-w-sm">
              <p className="text-sm font-bold mb-1">No elements detected</p>
              <p className="text-xs text-[#888]">
                This page may require JavaScript to render. Use the CSS selector
                input below instead.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Selected element info */}
      {selectedSelector && (
        <div className="border-2 border-[#2d5a2d] bg-[#2d5a2d]/10 p-3">
          <p className="text-xs font-bold uppercase text-[#888] mb-1">
            Selected Element
          </p>
          <p className="text-sm font-mono text-[#2d5a2d] font-bold">
            {selectedSelector}
          </p>
          {hoveredElement?.text && (
            <p className="text-xs text-[#888] mt-1 truncate">
              {hoveredElement.text}
            </p>
          )}
        </div>
      )}

      {/* Custom selector input */}
      <div>
        <p className="text-xs font-bold uppercase text-[#888] mb-2">
          Or enter CSS selector manually
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

      {/* Hidden iframe for element coordinate extraction */}
      {pageHtml && (
        <iframe
          ref={iframeRef}
          sandbox="allow-same-origin"
          onLoad={handleIframeLoad}
          title="Element detection"
          style={{
            position: "fixed",
            left: -9999,
            top: -9999,
            width: VIEWPORT_WIDTH,
            height: VIEWPORT_HEIGHT,
            border: "none",
            opacity: 0,
            pointerEvents: "none",
          }}
        />
      )}
    </div>
  );
}

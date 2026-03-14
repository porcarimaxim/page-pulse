import { useState, useRef, useEffect, useCallback } from "react";
import { useAction } from "convex/react";
import { api } from "@convex/_generated/api";
import { Loader2, MousePointer } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ElementPickerProps {
  url: string;
  onElementSelect: (selector: string) => void;
}

/** Generate a CSS selector for a DOM element (runs against the iframe's document). */
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
    "header", "nav", "main", "article", "section", "aside", "footer",
    "h1", "h2", "h3", "h4", "form", "table",
  ];
  if (semanticTags.includes(tag)) {
    try {
      if (doc.querySelectorAll(tag).length <= 3) return tag;
    } catch {
      /* skip */
    }
  }

  // Fallback: tag + first class
  if (classes.length > 0) {
    return `${tag}.${CSS.escape(classes[0])}`;
  }
  return tag;
}

const SKIP_TAGS = new Set([
  "html", "head", "body", "script", "style", "link", "meta",
  "br", "hr", "noscript", "title", "base",
]);

const HIGHLIGHT_CLASS = "__pp-highlight";
const SELECTED_CLASS = "__pp-selected";

const INJECTED_STYLES = `
  .__pp-highlight {
    outline: 2px solid #7cb87c !important;
    outline-offset: -1px;
    background-color: rgba(124, 184, 124, 0.15) !important;
    cursor: pointer !important;
  }
  .__pp-selected {
    outline: 2px solid #2d5a2d !important;
    outline-offset: -1px;
    background-color: rgba(45, 90, 45, 0.15) !important;
  }
  * {
    cursor: default;
  }
`;

export function ElementPicker({ url, onElementSelect }: ElementPickerProps) {
  const fetchPageHtml = useAction(api.elementDetection.fetchPageHtml);

  const [pageHtml, setPageHtml] = useState<string | null>(null);
  const [selectedSelector, setSelectedSelector] = useState<string | null>(null);
  const [selectedText, setSelectedText] = useState<string | null>(null);
  const [hoveredSelector, setHoveredSelector] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [customSelector, setCustomSelector] = useState("");
  const [iframeReady, setIframeReady] = useState(false);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const prevHighlightRef = useRef<Element | null>(null);
  const selectedElementRef = useRef<Element | null>(null);

  // Fetch page HTML
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

  // Find the closest meaningful element (skip tiny inline elements)
  const findTargetElement = useCallback((el: Element): Element | null => {
    let current: Element | null = el;
    while (current) {
      const tag = current.tagName.toLowerCase();
      if (SKIP_TAGS.has(tag)) return null;

      // Don't select very large wrapper elements
      const rect = current.getBoundingClientRect();
      if (rect.width * rect.height > 1280 * 800 * 0.9) return null;

      return current;
    }
    return null;
  }, []);

  // Attach interactive listeners to iframe
  const handleIframeLoad = useCallback(() => {
    setTimeout(() => {
      const iframe = iframeRef.current;
      if (!iframe) return;

      const doc = iframe.contentDocument;
      if (!doc) {
        setError("Could not access page content.");
        setIsLoading(false);
        return;
      }

      // Inject highlight styles
      const style = doc.createElement("style");
      style.textContent = INJECTED_STYLES;
      doc.head.appendChild(style);

      // Prevent all links and form submissions
      doc.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
      }, true);

      // Mouseover: highlight element
      doc.addEventListener("mouseover", (e) => {
        const target = e.target as Element;
        const el = findTargetElement(target);
        if (!el) return;

        // Remove previous highlight
        if (prevHighlightRef.current && prevHighlightRef.current !== el) {
          prevHighlightRef.current.classList.remove(HIGHLIGHT_CLASS);
        }

        // Don't highlight if it's the selected element
        if (el !== selectedElementRef.current) {
          el.classList.add(HIGHLIGHT_CLASS);
        }
        prevHighlightRef.current = el;

        // Update hovered selector
        const selector = generateCssSelector(el, doc);
        setHoveredSelector(selector);
      }, true);

      // Mouseout: remove highlight
      doc.addEventListener("mouseout", (e) => {
        const target = e.target as Element;
        if (target !== selectedElementRef.current) {
          target.classList.remove(HIGHLIGHT_CLASS);
        }
        setHoveredSelector(null);
      }, true);

      // Click: select element
      doc.addEventListener("mousedown", (e) => {
        e.preventDefault();
        e.stopPropagation();

        const target = e.target as Element;
        const el = findTargetElement(target);
        if (!el) return;

        // Deselect previous
        if (selectedElementRef.current) {
          selectedElementRef.current.classList.remove(SELECTED_CLASS);
        }

        const selector = generateCssSelector(el, doc);
        const text = (el.textContent?.trim() || "").substring(0, 100);

        // If clicking the same element, deselect
        if (selectedElementRef.current === el) {
          selectedElementRef.current = null;
          setSelectedSelector(null);
          setSelectedText(null);
          return;
        }

        el.classList.add(SELECTED_CLASS);
        el.classList.remove(HIGHLIGHT_CLASS);
        selectedElementRef.current = el;

        setSelectedSelector(selector);
        setSelectedText(text);
        onElementSelect(selector);
      }, true);

      setIframeReady(true);
      setIsLoading(false);
    }, 500); // Wait for CSS to load
  }, [findTargetElement, onElementSelect]);

  const handleCustomSubmit = () => {
    const sel = customSelector.trim();
    if (!sel) return;

    // Try to highlight custom selector in iframe
    const doc = iframeRef.current?.contentDocument;
    if (doc) {
      // Deselect previous
      if (selectedElementRef.current) {
        selectedElementRef.current.classList.remove(SELECTED_CLASS);
      }

      try {
        const el = doc.querySelector(sel);
        if (el) {
          el.classList.add(SELECTED_CLASS);
          selectedElementRef.current = el;
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      } catch {
        /* invalid selector */
      }
    }

    setSelectedSelector(sel);
    setSelectedText(null);
    onElementSelect(sel);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-8 gap-2 text-[#888]">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm font-bold">Loading page...</span>
        </div>
      )}

      {error && (
        <div className="mx-4 mt-4 border-2 border-[#dc2626] bg-[#dc2626]/10 p-3">
          <p className="text-xs text-[#dc2626] font-bold">{error}</p>
        </div>
      )}

      {/* Hovered selector tooltip */}
      {hoveredSelector && iframeReady && (
        <div className="sticky top-0 z-10 bg-[#1a1a1a] text-[#f0f0e8] px-3 py-1.5 text-xs font-mono truncate">
          {hoveredSelector}
        </div>
      )}

      {/* Live iframe */}
      {pageHtml && (
        <div className="flex-1 relative">
          <iframe
            ref={iframeRef}
            sandbox="allow-same-origin"
            onLoad={handleIframeLoad}
            title="Element picker"
            style={{
              width: "100%",
              height: "calc(100vh - 160px)",
              border: "none",
              display: isLoading ? "none" : "block",
              background: "#fff",
            }}
          />
        </div>
      )}

      {/* Selected element info + custom input */}
      {iframeReady && (
        <div className="border-t-2 border-[#ccc] p-3 space-y-3 bg-[#f0f0e8]">
          {selectedSelector && (
            <div className="border-2 border-[#2d5a2d] bg-[#2d5a2d]/10 p-2">
              <p className="text-xs font-bold uppercase text-[#888] mb-0.5">
                Selected
              </p>
              <p className="text-sm font-mono text-[#2d5a2d] font-bold break-all">
                {selectedSelector}
              </p>
              {selectedText && (
                <p className="text-xs text-[#888] mt-1 truncate">
                  {selectedText}
                </p>
              )}
            </div>
          )}

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
      )}
    </div>
  );
}

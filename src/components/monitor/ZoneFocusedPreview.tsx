import { useRef, useState, useEffect } from "react";

/**
 * ZoneFocusedPreview — crops and zooms the screenshot around the selected zone.
 * Uses a wrapper div scaled/translated so the zone is centered, with both the
 * image and the overlay inside the same transformed space for perfect alignment.
 */
export function ZoneFocusedPreview({
  screenshotUrl,
  zone,
  selectionMode,
  className = "",
}: {
  screenshotUrl?: string | null;
  zone: { x: number; y: number; width: number; height: number };
  selectionMode?: string;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [imgAspect, setImgAspect] = useState(16 / 9);

  useEffect(() => {
    if (!screenshotUrl) return;
    const img = new Image();
    img.onload = () => {
      setImgAspect(img.naturalWidth / img.naturalHeight);
      setReady(true);
    };
    img.src = screenshotUrl;
  }, [screenshotUrl]);

  if (!screenshotUrl) {
    return (
      <div className={`relative bg-gray-50 overflow-hidden ${className}`}>
        <div className="flex items-center justify-center h-full text-gray-500 text-xs">
          No screenshot yet
        </div>
      </div>
    );
  }

  const isElement = selectionMode === "element";
  // Full-page zone means no real bounding box stored (legacy element monitors)
  const isFullPage = zone.x === 0 && zone.y === 0 && zone.width === 100 && zone.height === 100;
  const hasZoneOverlay = !isFullPage;

  // Padding around the zone (percentage of image)
  const padX = Math.max(zone.width * 0.3, 5);
  const padY = Math.max(zone.height * 0.3, 5);

  // View window in image-percentage space
  const vx = Math.max(0, zone.x - padX);
  const vy = Math.max(0, zone.y - padY);
  const vw = Math.min(100 - vx, zone.width + padX * 2);
  const vh = Math.min(100 - vy, zone.height + padY * 2);

  // Scale to fill the container width with the view window
  // We scale based on width: container shows vw% of the image width
  const scale = 100 / vw;

  // For element monitors with legacy full-page zone, the screenshot from the
  // capture API is already cropped to the element — just show it without zoom.
  if (isElement && isFullPage) {
    return (
      <div ref={containerRef} className={`relative bg-gray-50 overflow-hidden ${className}`}>
        {ready && (
          <img
            src={screenshotUrl}
            alt="Screenshot preview"
            style={{ display: "block", width: "100%", height: "auto" }}
          />
        )}
        <div className="absolute top-2 right-2 text-xs font-bold text-white bg-emerald-600 rounded px-1.5 py-0.5 z-10">
          Element
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`relative bg-gray-50 overflow-hidden ${className}`}>
      {ready && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            transformOrigin: "0 0",
            transform: `scale(${scale}) translate(-${vx}%, -${vy}%)`,
          }}
        >
          <img
            src={screenshotUrl}
            alt="Screenshot preview"
            style={{ display: "block", width: "100%", height: "auto" }}
          />

          {/* Zone overlay — same coordinate space as the image */}
          <div
            style={{
              position: "absolute",
              left: `${zone.x}%`,
              top: `${zone.y}%`,
              width: `${zone.width}%`,
              height: `${zone.height}%`,
              border: isElement ? "2px dashed #059669" : "2px solid #059669",
              backgroundColor: "rgba(5, 150, 105, 0.1)",
              pointerEvents: "none",
            }}
          />
        </div>
      )}

      {/* Element mode badge */}
      {isElement && (
        <div className="absolute top-2 right-2 text-xs font-bold text-white bg-emerald-600 rounded px-1.5 py-0.5 z-10">
          Element
        </div>
      )}
    </div>
  );
}

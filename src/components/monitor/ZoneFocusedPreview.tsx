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
      <div className={`relative bg-[#e8e8e0] overflow-hidden ${className}`}>
        <div className="flex items-center justify-center h-full text-[#888] text-xs">
          No screenshot yet
        </div>
      </div>
    );
  }

  const isElement = selectionMode === "element";

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

  return (
    <div ref={containerRef} className={`relative bg-[#e8e8e0] overflow-hidden ${className}`}>
      {ready && (
        <div
          style={{
            // This wrapper is 100% of the image at container width
            // We scale it up and translate so the zone area is visible
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            transformOrigin: "0 0",
            transform: `scale(${scale}) translate(-${vx}%, -${vy}%)`,
          }}
        >
          {/* Image fills the wrapper width, height is natural */}
          <img
            src={screenshotUrl}
            alt="Screenshot preview"
            style={{ display: "block", width: "100%", height: "auto" }}
          />

          {/* Zone overlay — same coordinate space as the image */}
          {!isElement && (
            <div
              style={{
                position: "absolute",
                left: `${zone.x}%`,
                top: `${zone.y}%`,
                width: `${zone.width}%`,
                height: `${zone.height}%`,
                border: "2px solid #2d5a2d",
                backgroundColor: "rgba(45, 90, 45, 0.1)",
                pointerEvents: "none",
              }}
            />
          )}
        </div>
      )}

      {/* Element mode badge */}
      {isElement && (
        <div className="absolute top-2 right-2 text-[8px] uppercase font-bold text-[#f0f0e8] bg-[#2d5a2d] px-1.5 py-0.5 z-10">
          Element
        </div>
      )}
    </div>
  );
}

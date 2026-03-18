import { useRef, useState, useEffect } from "react";

/**
 * ZoneFocusedPreview — shows a screenshot zoomed/cropped around the selected zone
 * with padding, preserving the image's natural aspect ratio.
 *
 * Uses an <img> with CSS transform to zoom + translate to the zone area,
 * inside an overflow:hidden container.
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
  const [dims, setDims] = useState<{
    imgW: number;
    imgH: number;
    contW: number;
    contH: number;
  } | null>(null);

  useEffect(() => {
    if (!screenshotUrl || !containerRef.current) return;

    const img = new Image();
    img.onload = () => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        setDims({
          imgW: img.naturalWidth,
          imgH: img.naturalHeight,
          contW: rect.width,
          contH: rect.height,
        });
      }
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

  // Add padding around the zone
  const padX = Math.max(zone.width * 0.3, 5);
  const padY = Math.max(zone.height * 0.3, 5);

  const viewX = Math.max(0, zone.x - padX);
  const viewY = Math.max(0, zone.y - padY);
  const viewW = Math.min(100 - viewX, zone.width + padX * 2);
  const viewH = Math.min(100 - viewY, zone.height + padY * 2);

  // Zone position relative to the visible crop (for the overlay)
  const zoneRelX = ((zone.x - viewX) / viewW) * 100;
  const zoneRelY = ((zone.y - viewY) / viewH) * 100;
  const zoneRelW = (zone.width / viewW) * 100;
  const zoneRelH = (zone.height / viewH) * 100;

  // Compute image transform to show the zone area while preserving aspect ratio
  let imgStyle: React.CSSProperties = {};

  if (dims) {
    const { imgW, imgH, contW, contH } = dims;
    const imgAspect = imgW / imgH;
    const contAspect = contW / contH;

    // First, figure out how the image would be sized to fill container width
    // Then calculate the scale needed to zoom into the view area
    const scaleX = 100 / viewW;
    const scaleY = 100 / viewH;
    // Use the smaller scale so the full view area is visible
    const scale = Math.min(scaleX, scaleY, 4);

    // Image is rendered at container width, so its rendered height = contW / imgAspect
    const renderedH = contW / imgAspect;

    // Translate: move the viewX/viewY portion to top-left of container
    // viewX% of image width = viewX/100 * contW * scale ... but we use transform
    const tx = -(viewX / 100) * contW * scale;
    const ty = -(viewY / 100) * renderedH * scale;

    imgStyle = {
      position: "absolute" as const,
      top: 0,
      left: 0,
      width: "100%",
      height: "auto",
      transformOrigin: "0 0",
      transform: `scale(${scale}) translate(${(tx / scale)}px, ${(ty / scale)}px)`,
    };
  }

  return (
    <div ref={containerRef} className={`relative bg-[#e8e8e0] overflow-hidden ${className}`}>
      {dims && (
        <>
          <img
            src={screenshotUrl}
            alt="Screenshot preview"
            style={imgStyle}
          />

          {/* Zone border overlay */}
          {!isElement && (
            <div
              className="absolute pointer-events-none z-10"
              style={{
                left: `${zoneRelX}%`,
                top: `${zoneRelY}%`,
                width: `${zoneRelW}%`,
                height: `${zoneRelH}%`,
                border: "2px solid #2d5a2d",
                backgroundColor: "rgba(45, 90, 45, 0.1)",
              }}
            />
          )}
        </>
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

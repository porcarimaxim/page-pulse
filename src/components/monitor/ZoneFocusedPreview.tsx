/**
 * ZoneFocusedPreview — shows a screenshot zoomed/cropped around the selected zone
 * with some padding, so the zone area is clearly visible even on large pages.
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

  // Add padding around the zone (15% of zone size on each side, min 5% of page)
  const padX = Math.max(zone.width * 0.3, 5);
  const padY = Math.max(zone.height * 0.3, 5);

  // Visible area in percentage coordinates
  const viewX = Math.max(0, zone.x - padX);
  const viewY = Math.max(0, zone.y - padY);
  const viewW = Math.min(100 - viewX, zone.width + padX * 2);
  const viewH = Math.min(100 - viewY, zone.height + padY * 2);

  // Scale: how much to zoom the image so the view area fills the container
  // Use the larger dimension to ensure the zone fits
  const scaleX = 100 / viewW;
  const scaleY = 100 / viewH;
  const scale = Math.min(scaleX, scaleY, 4); // cap at 4x zoom

  // Zone position relative to the visible crop area
  const zoneRelX = ((zone.x - viewX) / viewW) * 100;
  const zoneRelY = ((zone.y - viewY) / viewH) * 100;
  const zoneRelW = (zone.width / viewW) * 100;
  const zoneRelH = (zone.height / viewH) * 100;

  return (
    <div className={`relative bg-[#e8e8e0] overflow-hidden ${className}`}>
      {/* Scaled + translated image to focus on zone area */}
      <img
        src={screenshotUrl}
        alt="Screenshot preview"
        className="absolute top-0 left-0 w-full"
        style={{
          transformOrigin: "0 0",
          transform: `scale(${scale}) translate(-${viewX}%, -${viewY}%)`,
        }}
      />

      {/* Zone border overlay */}
      {!isElement && (
        <div
          className="absolute border-2 border-[#2d5a2d] bg-[#2d5a2d]/10 pointer-events-none"
          style={{
            left: `${zoneRelX}%`,
            top: `${zoneRelY}%`,
            width: `${zoneRelW}%`,
            height: `${zoneRelH}%`,
          }}
        />
      )}

      {/* Element mode badge */}
      {isElement && (
        <div className="absolute top-2 right-2 text-[8px] uppercase font-bold text-[#f0f0e8] bg-[#2d5a2d] px-1.5 py-0.5">
          Element
        </div>
      )}
    </div>
  );
}

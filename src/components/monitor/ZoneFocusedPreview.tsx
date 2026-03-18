/**
 * ZoneFocusedPreview — shows a screenshot zoomed/cropped around the selected zone
 * with some padding, so the zone area is clearly visible even on large pages.
 *
 * Uses a background-image approach so the zone overlay aligns perfectly.
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

  // Add padding around the zone (30% of zone size, min 5% of page)
  const padX = Math.max(zone.width * 0.3, 5);
  const padY = Math.max(zone.height * 0.3, 5);

  // Visible area in percentage coordinates (what portion of the full image to show)
  const viewX = Math.max(0, zone.x - padX);
  const viewY = Math.max(0, zone.y - padY);
  const viewW = Math.min(100 - viewX, zone.width + padX * 2);
  const viewH = Math.min(100 - viewY, zone.height + padY * 2);

  // background-size: scale so that viewW% of image width = 100% of container width
  const bgSizeX = (100 / viewW) * 100;
  const bgSizeY = (100 / viewH) * 100;

  // background-position: offset so viewX% of image aligns to left edge
  // When bg-size is S%, position P% means: (P / 100) * (S - 100)% = viewX% of image
  const bgPosX = viewW < 100 ? (viewX / (100 - viewW)) * 100 : 0;
  const bgPosY = viewH < 100 ? (viewY / (100 - viewH)) * 100 : 0;

  // Zone position relative to the visible area (as % of container)
  const zoneRelX = ((zone.x - viewX) / viewW) * 100;
  const zoneRelY = ((zone.y - viewY) / viewH) * 100;
  const zoneRelW = (zone.width / viewW) * 100;
  const zoneRelH = (zone.height / viewH) * 100;

  return (
    <div
      className={`relative bg-[#e8e8e0] overflow-hidden ${className}`}
      style={{
        backgroundImage: `url(${screenshotUrl})`,
        backgroundSize: `${bgSizeX}% ${bgSizeY}%`,
        backgroundPosition: `${bgPosX}% ${bgPosY}%`,
        backgroundRepeat: "no-repeat",
      }}
    >
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

      {/* Element mode badge */}
      {isElement && (
        <div className="absolute top-2 right-2 text-[8px] uppercase font-bold text-[#f0f0e8] bg-[#2d5a2d] px-1.5 py-0.5 z-10">
          Element
        </div>
      )}
    </div>
  );
}

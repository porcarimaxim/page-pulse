import { useRef, useState, useCallback, useEffect } from "react";

export interface Zone {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ZoneSelectorProps {
  screenshotUrl: string;
  initialZone?: Zone;
  onZoneSelect: (zone: Zone) => void;
}

export function ZoneSelector({
  screenshotUrl,
  initialZone,
  onZoneSelect,
}: ZoneSelectorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [currentPoint, setCurrentPoint] = useState<{ x: number; y: number } | null>(null);
  const [zone, setZone] = useState<Zone | null>(initialZone ?? null);
  const [imageLoaded, setImageLoaded] = useState(false);

  const getRelativeCoords = useCallback(
    (e: React.MouseEvent) => {
      const container = containerRef.current;
      if (!container) return { x: 0, y: 0 };

      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      return {
        x: Math.max(0, Math.min(100, x)),
        y: Math.max(0, Math.min(100, y)),
      };
    },
    []
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      const coords = getRelativeCoords(e);
      setStartPoint(coords);
      setCurrentPoint(coords);
      setIsDrawing(true);
      setZone(null);
    },
    [getRelativeCoords]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDrawing) return;
      const coords = getRelativeCoords(e);
      setCurrentPoint(coords);
    },
    [isDrawing, getRelativeCoords]
  );

  const handleMouseUp = useCallback(() => {
    if (!isDrawing || !startPoint || !currentPoint) return;
    setIsDrawing(false);

    const x = Math.min(startPoint.x, currentPoint.x);
    const y = Math.min(startPoint.y, currentPoint.y);
    const width = Math.abs(currentPoint.x - startPoint.x);
    const height = Math.abs(currentPoint.y - startPoint.y);

    // Minimum zone size: 2% x 2%
    if (width < 2 || height < 2) {
      setZone(null);
      return;
    }

    const newZone = {
      x: Math.round(x * 100) / 100,
      y: Math.round(y * 100) / 100,
      width: Math.round(width * 100) / 100,
      height: Math.round(height * 100) / 100,
    };

    setZone(newZone);
    onZoneSelect(newZone);
  }, [isDrawing, startPoint, currentPoint, onZoneSelect]);

  // Calculate the drawing rectangle
  const drawRect =
    isDrawing && startPoint && currentPoint
      ? {
          x: Math.min(startPoint.x, currentPoint.x),
          y: Math.min(startPoint.y, currentPoint.y),
          width: Math.abs(currentPoint.x - startPoint.x),
          height: Math.abs(currentPoint.y - startPoint.y),
        }
      : null;

  const activeZone = drawRect || zone;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-[#888] uppercase font-bold">
          {zone ? "Zone selected — drag to redraw" : "Click and drag to select a zone"}
        </p>
        {zone && (
          <button
            onClick={() => {
              setZone(null);
            }}
            className="text-xs text-[#dc2626] font-bold uppercase hover:underline"
          >
            Clear
          </button>
        )}
      </div>

      <div
        ref={containerRef}
        className="relative border-2 border-[#1a1a1a] cursor-crosshair select-none overflow-hidden"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <img
          src={screenshotUrl}
          alt="Page screenshot"
          className="w-full block"
          onLoad={() => setImageLoaded(true)}
          draggable={false}
        />

        {/* Dark overlay outside the zone */}
        {imageLoaded && activeZone && (
          <>
            {/* Semi-transparent overlay */}
            <div className="absolute inset-0 bg-[#1a1a1a]/40 pointer-events-none" />
            {/* Clear zone cutout */}
            <div
              className="absolute pointer-events-none border-2 border-[#2d5a2d] bg-transparent"
              style={{
                left: `${activeZone.x}%`,
                top: `${activeZone.y}%`,
                width: `${activeZone.width}%`,
                height: `${activeZone.height}%`,
                boxShadow: `0 0 0 9999px rgba(26, 26, 26, 0.4)`,
              }}
            >
              {/* Corner indicators */}
              <div className="absolute -top-1 -left-1 w-3 h-3 bg-[#2d5a2d]" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#2d5a2d]" />
              <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-[#2d5a2d]" />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-[#2d5a2d]" />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

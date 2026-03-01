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
  const [isMoving, setIsMoving] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [currentPoint, setCurrentPoint] = useState<{ x: number; y: number } | null>(null);
  const [moveOffset, setMoveOffset] = useState<{ x: number; y: number } | null>(null);
  const [zone, setZone] = useState<Zone | null>(initialZone ?? null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [spaceHeld, setSpaceHeld] = useState(false);

  // Use refs so document listeners always see the latest state
  const isDrawingRef = useRef(false);
  const isMovingRef = useRef(false);
  const startPointRef = useRef<{ x: number; y: number } | null>(null);
  const currentPointRef = useRef<{ x: number; y: number } | null>(null);
  const moveOffsetRef = useRef<{ x: number; y: number } | null>(null);
  const zoneRef = useRef<Zone | null>(initialZone ?? null);
  const onZoneSelectRef = useRef(onZoneSelect);

  useEffect(() => {
    onZoneSelectRef.current = onZoneSelect;
  }, [onZoneSelect]);

  const getRelativeCoords = useCallback(
    (e: { clientX: number; clientY: number }) => {
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

  // Spacebar tracking
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !e.repeat) {
        e.preventDefault();
        setSpaceHeld(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        setSpaceHeld(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Document-level mouse move/up during drawing or moving
  useEffect(() => {
    if (!isDrawing && !isMoving) return;

    const handleDocMouseMove = (e: MouseEvent) => {
      const coords = getRelativeCoords(e);

      if (isDrawingRef.current) {
        currentPointRef.current = coords;
        setCurrentPoint(coords);
      }

      if (isMovingRef.current && moveOffsetRef.current && zoneRef.current) {
        const z = zoneRef.current;
        let newX = coords.x - moveOffsetRef.current.x;
        let newY = coords.y - moveOffsetRef.current.y;

        // Clamp within bounds
        newX = Math.max(0, Math.min(100 - z.width, newX));
        newY = Math.max(0, Math.min(100 - z.height, newY));

        const movedZone = { ...z, x: newX, y: newY };
        zoneRef.current = movedZone;
        setZone(movedZone);
      }
    };

    const handleDocMouseUp = () => {
      if (isDrawingRef.current) {
        isDrawingRef.current = false;
        setIsDrawing(false);

        const sp = startPointRef.current;
        const cp = currentPointRef.current;
        if (!sp || !cp) return;

        const x = Math.min(sp.x, cp.x);
        const y = Math.min(sp.y, cp.y);
        const width = Math.abs(cp.x - sp.x);
        const height = Math.abs(cp.y - sp.y);

        // Minimum zone size: 2% x 2%
        if (width < 2 || height < 2) {
          zoneRef.current = null;
          setZone(null);
          return;
        }

        const newZone = {
          x: Math.round(x * 100) / 100,
          y: Math.round(y * 100) / 100,
          width: Math.round(width * 100) / 100,
          height: Math.round(height * 100) / 100,
        };

        zoneRef.current = newZone;
        setZone(newZone);
        onZoneSelectRef.current(newZone);
      }

      if (isMovingRef.current) {
        isMovingRef.current = false;
        setIsMoving(false);
        setMoveOffset(null);
        moveOffsetRef.current = null;

        if (zoneRef.current) {
          const finalZone = {
            x: Math.round(zoneRef.current.x * 100) / 100,
            y: Math.round(zoneRef.current.y * 100) / 100,
            width: Math.round(zoneRef.current.width * 100) / 100,
            height: Math.round(zoneRef.current.height * 100) / 100,
          };
          zoneRef.current = finalZone;
          setZone(finalZone);
          onZoneSelectRef.current(finalZone);
        }
      }
    };

    document.addEventListener("mousemove", handleDocMouseMove);
    document.addEventListener("mouseup", handleDocMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleDocMouseMove);
      document.removeEventListener("mouseup", handleDocMouseUp);
    };
  }, [isDrawing, isMoving, getRelativeCoords]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      const coords = getRelativeCoords(e);

      // Space + existing zone = move mode
      if (spaceHeld && zoneRef.current) {
        const z = zoneRef.current;
        moveOffsetRef.current = { x: coords.x - z.x, y: coords.y - z.y };
        setMoveOffset(moveOffsetRef.current);
        isMovingRef.current = true;
        setIsMoving(true);
        return;
      }

      // Normal draw mode
      startPointRef.current = coords;
      currentPointRef.current = coords;
      setStartPoint(coords);
      setCurrentPoint(coords);
      isDrawingRef.current = true;
      setIsDrawing(true);
      zoneRef.current = null;
      setZone(null);
    },
    [getRelativeCoords, spaceHeld]
  );

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

  // Cursor logic
  const getCursor = () => {
    if (isMoving) return "cursor-grabbing";
    if (spaceHeld && zone) return "cursor-grab";
    return "cursor-crosshair";
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-[#888] uppercase font-bold">
          {zone
            ? spaceHeld
              ? "Drag to move zone"
              : "Zone selected — drag to redraw · hold space to move"
            : "Click and drag to select a zone"}
        </p>
        {zone && (
          <button
            onClick={() => {
              zoneRef.current = null;
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
        className={`relative border-2 border-[#1a1a1a] ${getCursor()} select-none overflow-hidden`}
        onMouseDown={handleMouseDown}
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

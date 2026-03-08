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

type ResizeHandle =
  | "nw" | "n" | "ne"
  | "w"  |       "e"
  | "sw" | "s" | "se";

type InteractionMode = "idle" | "drawing" | "moving" | "resizing";

const HANDLE_THRESHOLD = 1.5; // % distance to detect edge/corner

function getHandle(coords: { x: number; y: number }, zone: Zone): ResizeHandle | null {
  const { x, y } = coords;
  const zr = zone.x + zone.width;
  const zb = zone.y + zone.height;

  const nearLeft = Math.abs(x - zone.x) < HANDLE_THRESHOLD;
  const nearRight = Math.abs(x - zr) < HANDLE_THRESHOLD;
  const nearTop = Math.abs(y - zone.y) < HANDLE_THRESHOLD;
  const nearBottom = Math.abs(y - zb) < HANDLE_THRESHOLD;

  const withinX = x >= zone.x - HANDLE_THRESHOLD && x <= zr + HANDLE_THRESHOLD;
  const withinY = y >= zone.y - HANDLE_THRESHOLD && y <= zb + HANDLE_THRESHOLD;

  // Corners first (higher priority)
  if (nearTop && nearLeft) return "nw";
  if (nearTop && nearRight) return "ne";
  if (nearBottom && nearLeft) return "sw";
  if (nearBottom && nearRight) return "se";

  // Edges
  if (nearTop && withinX) return "n";
  if (nearBottom && withinX) return "s";
  if (nearLeft && withinY) return "w";
  if (nearRight && withinY) return "e";

  return null;
}

const HANDLE_CURSORS: Record<ResizeHandle, string> = {
  nw: "cursor-nw-resize", ne: "cursor-ne-resize",
  sw: "cursor-sw-resize", se: "cursor-se-resize",
  n: "cursor-n-resize", s: "cursor-s-resize",
  w: "cursor-w-resize", e: "cursor-e-resize",
};

export function ZoneSelector({
  screenshotUrl,
  initialZone,
  onZoneSelect,
}: ZoneSelectorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<InteractionMode>("idle");
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [currentPoint, setCurrentPoint] = useState<{ x: number; y: number } | null>(null);
  const [zone, setZone] = useState<Zone | null>(initialZone ?? null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [spaceHeld, setSpaceHeld] = useState(false);
  const [hoveredHandle, setHoveredHandle] = useState<ResizeHandle | null>(null);

  // Refs so document listeners always see the latest state
  const modeRef = useRef<InteractionMode>("idle");
  const startPointRef = useRef<{ x: number; y: number } | null>(null);
  const currentPointRef = useRef<{ x: number; y: number } | null>(null);
  const moveOffsetRef = useRef<{ x: number; y: number } | null>(null);
  const zoneRef = useRef<Zone | null>(initialZone ?? null);
  const resizeHandleRef = useRef<ResizeHandle | null>(null);
  const resizeAnchorRef = useRef<Zone | null>(null); // zone snapshot at resize start
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

  const finalizeZone = useCallback((z: Zone) => {
    const finalZone = {
      x: Math.round(z.x * 100) / 100,
      y: Math.round(z.y * 100) / 100,
      width: Math.round(z.width * 100) / 100,
      height: Math.round(z.height * 100) / 100,
    };
    zoneRef.current = finalZone;
    setZone(finalZone);
    onZoneSelectRef.current(finalZone);
  }, []);

  // Document-level mouse move/up during drawing, moving, or resizing
  useEffect(() => {
    if (mode === "idle") return;

    const handleDocMouseMove = (e: MouseEvent) => {
      const coords = getRelativeCoords(e);

      if (modeRef.current === "drawing") {
        currentPointRef.current = coords;
        setCurrentPoint(coords);
      }

      if (modeRef.current === "moving" && moveOffsetRef.current && zoneRef.current) {
        const z = zoneRef.current;
        let newX = coords.x - moveOffsetRef.current.x;
        let newY = coords.y - moveOffsetRef.current.y;
        newX = Math.max(0, Math.min(100 - z.width, newX));
        newY = Math.max(0, Math.min(100 - z.height, newY));

        const movedZone = { ...z, x: newX, y: newY };
        zoneRef.current = movedZone;
        setZone(movedZone);
      }

      if (modeRef.current === "resizing" && resizeHandleRef.current && resizeAnchorRef.current) {
        const anchor = resizeAnchorRef.current;
        const handle = resizeHandleRef.current;

        let x = anchor.x;
        let y = anchor.y;
        let r = anchor.x + anchor.width;
        let b = anchor.y + anchor.height;

        // Move the relevant edges based on handle
        if (handle.includes("w")) x = Math.min(coords.x, r - 2);
        if (handle.includes("e")) r = Math.max(coords.x, x + 2);
        if (handle.includes("n")) y = Math.min(coords.y, b - 2);
        if (handle.includes("s")) b = Math.max(coords.y, y + 2);

        // Clamp
        x = Math.max(0, x);
        y = Math.max(0, y);
        r = Math.min(100, r);
        b = Math.min(100, b);

        const resized = { x, y, width: r - x, height: b - y };
        zoneRef.current = resized;
        setZone(resized);
      }
    };

    const handleDocMouseUp = () => {
      if (modeRef.current === "drawing") {
        const sp = startPointRef.current;
        const cp = currentPointRef.current;

        if (sp && cp) {
          const x = Math.min(sp.x, cp.x);
          const y = Math.min(sp.y, cp.y);
          const width = Math.abs(cp.x - sp.x);
          const height = Math.abs(cp.y - sp.y);

          if (width >= 2 && height >= 2) {
            finalizeZone({ x, y, width, height });
          } else {
            zoneRef.current = null;
            setZone(null);
          }
        }
      }

      if (modeRef.current === "moving" && zoneRef.current) {
        finalizeZone(zoneRef.current);
      }

      if (modeRef.current === "resizing" && zoneRef.current) {
        finalizeZone(zoneRef.current);
      }

      // Reset
      modeRef.current = "idle";
      setMode("idle");
      moveOffsetRef.current = null;
      resizeHandleRef.current = null;
      resizeAnchorRef.current = null;
    };

    document.addEventListener("mousemove", handleDocMouseMove);
    document.addEventListener("mouseup", handleDocMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleDocMouseMove);
      document.removeEventListener("mouseup", handleDocMouseUp);
    };
  }, [mode, getRelativeCoords, finalizeZone]);

  // Track hovered handle for cursor
  const handleContainerMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (mode !== "idle") return;
      if (!zoneRef.current || spaceHeld) {
        setHoveredHandle(null);
        return;
      }
      const coords = getRelativeCoords(e);
      setHoveredHandle(getHandle(coords, zoneRef.current));
    },
    [mode, spaceHeld, getRelativeCoords]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      const coords = getRelativeCoords(e);

      // Space + existing zone = move mode
      if (spaceHeld && zoneRef.current) {
        const z = zoneRef.current;
        moveOffsetRef.current = { x: coords.x - z.x, y: coords.y - z.y };
        modeRef.current = "moving";
        setMode("moving");
        return;
      }

      // Check for resize handle on existing zone
      if (zoneRef.current) {
        const handle = getHandle(coords, zoneRef.current);
        if (handle) {
          resizeHandleRef.current = handle;
          resizeAnchorRef.current = { ...zoneRef.current };
          modeRef.current = "resizing";
          setMode("resizing");
          return;
        }
      }

      // Normal draw mode
      startPointRef.current = coords;
      currentPointRef.current = coords;
      setStartPoint(coords);
      setCurrentPoint(coords);
      zoneRef.current = null;
      setZone(null);
      modeRef.current = "drawing";
      setMode("drawing");
    },
    [getRelativeCoords, spaceHeld]
  );

  // Calculate the drawing rectangle
  const drawRect =
    mode === "drawing" && startPoint && currentPoint
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
    if (mode === "moving") return "cursor-grabbing";
    if (mode === "resizing" && resizeHandleRef.current) return HANDLE_CURSORS[resizeHandleRef.current];
    if (spaceHeld && zone) return "cursor-grab";
    if (hoveredHandle && zone) return HANDLE_CURSORS[hoveredHandle];
    return "cursor-crosshair";
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-[#888] uppercase font-bold">
          {zone
            ? spaceHeld
              ? "Drag to move zone"
              : "Zone selected — drag edges to resize · hold space to move"
            : "Click and drag to select a zone — scroll to see full page"}
        </p>
        {zone && (
          <button
            onClick={() => {
              zoneRef.current = null;
              setZone(null);
              setHoveredHandle(null);
            }}
            className="text-xs text-[#dc2626] font-bold uppercase hover:underline"
          >
            Clear
          </button>
        )}
      </div>

      <div className="max-h-[600px] overflow-y-auto border-2 border-[#1a1a1a]">
        <div
          ref={containerRef}
          className={`relative ${getCursor()} select-none`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleContainerMouseMove}
          onMouseLeave={() => mode === "idle" && setHoveredHandle(null)}
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
                {/* Corner handles */}
                <div className="absolute -top-1 -left-1 w-3 h-3 bg-[#2d5a2d]" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#2d5a2d]" />
                <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-[#2d5a2d]" />
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-[#2d5a2d]" />
                {/* Edge handles (midpoints) */}
                <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-4 h-1 bg-[#2d5a2d]" />
                <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-1 bg-[#2d5a2d]" />
                <div className="absolute top-1/2 -left-0.5 -translate-y-1/2 w-1 h-4 bg-[#2d5a2d]" />
                <div className="absolute top-1/2 -right-0.5 -translate-y-1/2 w-1 h-4 bg-[#2d5a2d]" />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

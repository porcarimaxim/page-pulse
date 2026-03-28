import type { Zone } from "@/components/zone-selector/ZoneSelector";

export function MonitorSelectionInfo({
  selectionMode,
  cssSelector,
  zone,
}: {
  selectionMode: "zone" | "element";
  cssSelector: string | null;
  zone: Zone | null;
}) {
  const isComplete = selectionMode === "zone" ? !!zone : !!cssSelector;
  if (!isComplete) return null;

  return (
    <div className="border-t-2 border-[#ccc] pt-4">
      <p className="text-xs font-bold uppercase text-[#888] mb-1">Selection</p>
      <p className="text-sm">
        {selectionMode === "element" ? (
          <span className="font-mono text-[#2d5a2d] text-xs break-all">
            {cssSelector}
          </span>
        ) : (
          <span className="text-[#1a1a1a]">
            Zone: {zone ? `${zone.width.toFixed(0)}% × ${zone.height.toFixed(0)}%` : "—"}
          </span>
        )}
      </p>
    </div>
  );
}

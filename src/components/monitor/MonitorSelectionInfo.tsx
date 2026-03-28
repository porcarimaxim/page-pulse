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
    <div className="border-t border-gray-200 pt-4">
      <p className="text-xs font-bold uppercase text-gray-500 mb-1">Selection</p>
      <p className="text-sm">
        {selectionMode === "element" ? (
          <span className="font-mono text-emerald-600 text-xs break-all">
            {cssSelector}
          </span>
        ) : (
          <span className="text-gray-900">
            Zone: {zone ? `${zone.width.toFixed(0)}% × ${zone.height.toFixed(0)}%` : "—"}
          </span>
        )}
      </p>
    </div>
  );
}

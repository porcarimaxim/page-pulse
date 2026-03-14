import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAction, useMutation, useConvexAuth } from "convex/react";
import { useAuth } from "@clerk/tanstack-react-start";
import { api } from "@convex/_generated/api";
import { ZoneSelector, type Zone } from "@/components/zone-selector/ZoneSelector";
import { ElementPicker } from "@/components/element-picker/ElementPicker";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Loader2,
  Check,
  MousePointer,
  Crop,
  Image as ImageIcon,
} from "lucide-react";
import {
  INTERVALS,
  SENSITIVITY_PRESETS,
  COMPARE_TYPES,
} from "@/lib/monitor-constants";

export const Route = createFileRoute("/dashboard/new")({
  component: NewMonitorPage,
});

type SelectionMode = "zone" | "element";

function NewMonitorPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const { isAuthenticated: isConvexAuthed } = useConvexAuth();
  const navigate = useNavigate();
  const captureScreenshot = useAction(api.screenshotActions.captureScreenshot);
  const createMonitor = useMutation(api.monitors.create);

  if (isLoaded && !isSignedIn) {
    navigate({ to: "/auth/sign-in", search: { redirect_url: "/dashboard/new" } as any });
    return null;
  }

  const [url, setUrl] = useState("");
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [screenshotStorageId, setScreenshotStorageId] = useState<string | null>(null);
  const [zone, setZone] = useState<Zone | null>(null);
  const [selectionMode, setSelectionMode] = useState<SelectionMode>("zone");
  const [cssSelector, setCssSelector] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [interval, setInterval] = useState<string>("daily");
  const [tags, setTags] = useState("");
  const [sensitivityThreshold, setSensitivityThreshold] = useState(0);
  const [compareType, setCompareType] = useState<"all" | "visual" | "text">("all");
  const [isCapturing, setIsCapturing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCapture = async () => {
    if (!url) return;
    setIsCapturing(true);
    setError(null);

    try {
      let finalUrl = url;
      if (!finalUrl.startsWith("http://") && !finalUrl.startsWith("https://")) {
        finalUrl = "https://" + finalUrl;
        setUrl(finalUrl);
      }

      const result = await captureScreenshot({ url: finalUrl });
      setScreenshotStorageId(result.storageId);
      setScreenshotUrl(result.url);

      if (!name) {
        try {
          const urlObj = new URL(finalUrl);
          setName(urlObj.hostname);
        } catch {
          setName(finalUrl);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to capture screenshot");
    } finally {
      setIsCapturing(false);
    }
  };

  const handleElementSelect = (selector: string) => {
    setCssSelector(selector);
  };

  const isSelectionComplete =
    selectionMode === "zone" ? !!zone : !!cssSelector;

  const canCreate = !!name && !!screenshotStorageId && isSelectionComplete && !isCreating && isConvexAuthed;

  const handleCreate = async () => {
    if (!name || !screenshotStorageId) return;
    if (selectionMode === "zone" && !zone) return;
    if (selectionMode === "element" && !cssSelector) return;
    setIsCreating(true);

    try {
      const parsedTags = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const monitorId = await createMonitor({
        url,
        name,
        zone: selectionMode === "zone" && zone
          ? zone
          : { x: 0, y: 0, width: 100, height: 100 },
        interval: interval as any,
        fullScreenshotStorageId: screenshotStorageId as any,
        cssSelector: selectionMode === "element" ? (cssSelector ?? undefined) : undefined,
        selectionMode,
        tags: parsedTags.length > 0 ? parsedTags : undefined,
        sensitivityThreshold,
        compareType,
      });

      navigate({
        to: "/dashboard/$monitorId",
        params: { monitorId } as any,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create monitor");
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar — pinned */}
      <div className="sticky top-0 z-20 bg-[#f0f0e8] border-b-2 border-[#1a1a1a]">
        <div className="flex items-center gap-4 px-6 py-3">
          <button
            onClick={() => navigate({ to: "/dashboard/monitors" })}
            className="flex items-center gap-1.5 text-xs text-[#888] hover:text-[#1a1a1a] font-bold uppercase transition-colors shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="flex-1 flex gap-3">
            <Input
              type="url"
              placeholder="Enter website URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCapture()}
              className="flex-1 !border-2 !border-[#1a1a1a] !bg-white"
            />
            <button
              onClick={handleCapture}
              disabled={!url || isCapturing || !isConvexAuthed}
              className="px-6 py-2 bg-[#2d5a2d] text-[#f0f0e8] font-bold uppercase text-sm border-2 border-[#2d5a2d] hover:bg-[#3a6a3a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
            >
              {isCapturing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Go"
              )}
            </button>
          </div>
        </div>

        {/* Mode toggles */}
        <div className="flex items-center gap-4 px-6 py-2 border-t border-[#ccc]">
          <button
            onClick={() => setSelectionMode("zone")}
            className={`flex items-center gap-1.5 text-xs font-bold uppercase transition-colors ${
              selectionMode === "zone"
                ? "text-[#2d5a2d]"
                : "text-[#888] hover:text-[#1a1a1a]"
            }`}
          >
            <Crop className="w-3.5 h-3.5" />
            Area
          </button>
          <button
            onClick={() => setSelectionMode("element")}
            className={`flex items-center gap-1.5 text-xs font-bold uppercase transition-colors ${
              selectionMode === "element"
                ? "text-[#2d5a2d]"
                : "text-[#888] hover:text-[#1a1a1a]"
            }`}
          >
            <MousePointer className="w-3.5 h-3.5" />
            Element
          </button>
        </div>
      </div>

      {error && (
        <div className="mx-6 mt-4 border-2 border-[#dc2626] bg-[#dc2626]/10 p-3">
          <p className="text-sm text-[#dc2626] font-bold">{error}</p>
        </div>
      )}

      {/* Main content: screenshot + sidebar */}
      <div className="flex flex-1 min-h-0">
        {/* Left: Screenshot area */}
        <div className="flex-1 min-w-0 overflow-hidden">
          <div className="overflow-y-auto h-[calc(100vh-105px)]">
            {screenshotUrl ? (
              selectionMode === "zone" ? (
                <ZoneSelector
                  screenshotUrl={screenshotUrl}
                  onZoneSelect={setZone}
                />
              ) : (
                <ElementPicker
                  url={url}
                  onElementSelect={handleElementSelect}
                />
              )
            ) : (
              <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-[#ccc]">
                <ImageIcon className="w-20 h-20 mb-4 stroke-1" />
                <p className="text-sm font-bold uppercase text-[#888]">
                  Enter website URL and click Go
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Config sidebar — sticky */}
        <div className="w-80 shrink-0 border-l-2 border-[#1a1a1a]">
          <div className="sticky top-[105px] h-[calc(100vh-105px)] overflow-y-auto">
            <div className="p-6 space-y-6">
              <h2 className="font-black text-lg uppercase tracking-tighter">
                Setup
              </h2>

              {/* Monitor name */}
              <div>
                <label className="block text-xs font-bold uppercase text-[#888] mb-2">
                  Monitor Name
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="My Website Monitor"
                />
              </div>

              {/* Check frequency */}
              <div>
                <label className="block text-xs font-bold uppercase text-[#888] mb-2">
                  Check Frequency
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {INTERVALS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setInterval(opt.value)}
                      className={`border-2 border-[#1a1a1a] px-2 py-1.5 text-xs font-bold uppercase transition-all ${
                        interval === opt.value
                          ? "bg-[#1a1a1a] text-[#f0f0e8]"
                          : "bg-transparent text-[#1a1a1a] hover:bg-[#e8e8e0]"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sensitivity */}
              <div>
                <label className="block text-xs font-bold uppercase text-[#888] mb-2">
                  Sensitivity
                </label>
                <div className="space-y-1.5">
                  {SENSITIVITY_PRESETS.map((preset) => (
                    <button
                      key={preset.value}
                      onClick={() => setSensitivityThreshold(preset.value)}
                      className={`w-full border-2 border-[#1a1a1a] px-2 py-1.5 text-left transition-all ${
                        sensitivityThreshold === preset.value
                          ? "bg-[#1a1a1a] text-[#f0f0e8]"
                          : "bg-transparent text-[#1a1a1a] hover:bg-[#e8e8e0]"
                      }`}
                    >
                      <span className="text-xs font-bold uppercase">
                        {preset.label}
                      </span>
                      <span className={`text-[10px] ml-2 ${
                        sensitivityThreshold === preset.value
                          ? "text-[#ccc]"
                          : "text-[#888]"
                      }`}>
                        {preset.description}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Compare Type */}
              <div>
                <label className="block text-xs font-bold uppercase text-[#888] mb-2">
                  Compare Type
                </label>
                <div className="flex gap-0">
                  {COMPARE_TYPES.map((t, i) => (
                    <button
                      key={t.value}
                      onClick={() => setCompareType(t.value as typeof compareType)}
                      className={`flex-1 border-2 border-[#1a1a1a] px-2 py-1.5 text-xs font-bold uppercase transition-all ${
                        i > 0 ? "border-l-0" : ""
                      } ${
                        compareType === t.value
                          ? "bg-[#1a1a1a] text-[#f0f0e8]"
                          : "bg-transparent text-[#1a1a1a] hover:bg-[#e8e8e0]"
                      }`}
                    >
                      <div>{t.label}</div>
                      <div className={`text-[10px] font-normal ${
                        compareType === t.value ? "text-[#ccc]" : "text-[#888]"
                      }`}>{t.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-bold uppercase text-[#888] mb-2">
                  Tags
                </label>
                <Input
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="pricing, competitor"
                />
                <p className="text-xs text-[#888] mt-1">
                  Comma-separated
                </p>
              </div>

              {/* Selection info */}
              {isSelectionComplete && (
                <div className="border-t-2 border-[#ccc] pt-4">
                  <p className="text-xs font-bold uppercase text-[#888] mb-1">
                    Selection
                  </p>
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
              )}
            </div>

            {/* Bottom actions — pinned to bottom of sidebar */}
            <div className="sticky bottom-0 bg-[#f0f0e8] border-t-2 border-[#1a1a1a] p-4 flex gap-3">
              <button
                onClick={() => navigate({ to: "/dashboard/monitors" })}
                className="flex-1 border-2 border-[#1a1a1a] px-4 py-2.5 text-sm font-bold uppercase hover:bg-[#e8e8e0] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!canCreate}
                className="flex-1 bg-[#2d5a2d] text-[#f0f0e8] border-2 border-[#2d5a2d] px-4 py-2.5 text-sm font-bold uppercase hover:bg-[#3a6a3a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Start Monitoring
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

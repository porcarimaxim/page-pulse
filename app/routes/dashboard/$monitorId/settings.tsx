import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useAction } from "convex/react";
import { useAuth } from "@clerk/tanstack-react-start";
import { api } from "@convex/_generated/api";
import { ZoneSelector, type Zone } from "@/components/zone-selector/ZoneSelector";
import { ElementPicker } from "@/components/element-picker/ElementPicker";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { CollapsibleSection } from "@/components/ui/CollapsibleSection";
import { MonitorKeywordsField } from "@/components/monitor/MonitorKeywordsField";
import { MonitorAdvancedSettings } from "@/components/monitor/MonitorAdvancedSettings";
import { MonitorWebhookConfig } from "@/components/monitor/MonitorWebhookConfig";
import { MonitorSelectionInfo } from "@/components/monitor/MonitorSelectionInfo";
import { useWebhookTest } from "@/hooks/useWebhookTest";
import {
  ArrowLeft,
  Loader2,
  Save,
  Crop,
  MousePointer,
  RefreshCw,
  Lock,
} from "lucide-react";
import { useState, useEffect } from "react";
import type { Id } from "@convex/_generated/dataModel";
import {
  INTERVALS,
  SENSITIVITY_PRESETS,
  COMPARE_TYPES,
  type MonitorInterval,
} from "@/lib/monitor-constants";

export const Route = createFileRoute("/dashboard/$monitorId/settings")({
  component: MonitorSettingsPage,
});

type SelectionMode = "zone" | "element";

function MonitorSettingsPage() {
  const { monitorId } = Route.useParams();
  const { isSignedIn, isLoaded } = useAuth();
  const navigate = useNavigate();

  const monitor = useQuery(
    api.monitors.get,
    isSignedIn ? { monitorId: monitorId as Id<"monitors"> } : "skip"
  );
  const usage = useQuery(api.monitors.usage, isSignedIn ? {} : "skip");

  if (isLoaded && !isSignedIn) {
    navigate({ to: "/auth/sign-in", search: { redirect_url: `/dashboard/${monitorId}/settings` } as any });
    return null;
  }

  const updateMonitor = useMutation(api.monitors.update);
  const captureScreenshot = useAction(api.screenshotActions.captureScreenshot);
  const { isTesting, testResult, handleTestWebhook } = useWebhookTest();

  const [name, setName] = useState("");
  const [interval, setInterval] = useState("daily");
  const [sensitivityThreshold, setSensitivityThreshold] = useState(0.1);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [webhookType, setWebhookType] = useState<"generic" | "slack" | "discord">("generic");
  const [tags, setTags] = useState("");
  const [selectionMode, setSelectionMode] = useState<SelectionMode>("zone");
  const [zone, setZone] = useState<Zone | null>(null);
  const [cssSelector, setCssSelector] = useState<string | null>(null);
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [screenshotStorageId, setScreenshotStorageId] = useState<string | null>(null);

  const [compareType, setCompareType] = useState<"all" | "visual" | "text">("all");
  const [keywords, setKeywords] = useState("");
  const [keywordMode, setKeywordMode] = useState<"added" | "deleted" | "any">("any");
  const [activeDays, setActiveDays] = useState<number[]>([]);
  const [delay, setDelay] = useState(3);
  const [mobileViewport, setMobileViewport] = useState(false);
  const [blockAds, setBlockAds] = useState(true);
  const [alertOnError, setAlertOnError] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isRecapturing, setIsRecapturing] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showWebhook, setShowWebhook] = useState(false);

  useEffect(() => {
    if (monitor && !initialized) {
      setName(monitor.name);
      setInterval(monitor.interval);
      setSensitivityThreshold(monitor.sensitivityThreshold ?? 0.1);
      setWebhookUrl(monitor.webhookUrl ?? "");
      setWebhookType(monitor.webhookType ?? "generic");
      setTags((monitor.tags ?? []).join(", "));
      setSelectionMode(monitor.selectionMode ?? "zone");
      setZone(monitor.zone);
      setCssSelector(monitor.cssSelector ?? null);
      setScreenshotUrl(monitor.screenshotUrl ?? null);
      setScreenshotStorageId(
        monitor.fullScreenshotStorageId
          ? String(monitor.fullScreenshotStorageId)
          : null
      );
      setCompareType(monitor.compareType ?? "all");
      setKeywords((monitor.keywords ?? []).join(", "));
      setKeywordMode(monitor.keywordMode ?? "any");
      setActiveDays(monitor.activeDays ?? []);
      setDelay(monitor.delay ?? 3);
      setMobileViewport(monitor.mobileViewport ?? false);
      setBlockAds(monitor.blockAds ?? true);
      setAlertOnError(monitor.alertOnError ?? false);
      setInitialized(true);
    }
  }, [monitor, initialized]);

  if (monitor === undefined) {
    return (
      <main className="px-8 py-8">
        <div className="text-center py-20 text-[#888]">Loading...</div>
      </main>
    );
  }

  if (monitor === null) {
    return (
      <main className="px-8 py-8">
        <div className="text-center py-20">
          <h2 className="text-xl font-black uppercase">Monitor Not Found</h2>
        </div>
      </main>
    );
  }

  const handleRecapture = async () => {
    setIsRecapturing(true);
    try {
      const result = await captureScreenshot({ url: monitor.url });
      setScreenshotStorageId(result.storageId);
      setScreenshotUrl(result.url);
    } catch (err) {
      console.error("Failed to recapture screenshot:", err);
    } finally {
      setIsRecapturing(false);
    }
  };

  const handleElementSelect = (selector: string, box?: { x: number; y: number; w: number; h: number }) => {
    setCssSelector(selector);
    if (box) {
      setZone({ x: box.x, y: box.y, width: box.w, height: box.h });
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaved(false);
    setSaveError(null);

    try {
      const parsedTags = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const parsedKeywords = keywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean);

      await updateMonitor({
        monitorId: monitorId as Id<"monitors">,
        name,
        interval: interval as MonitorInterval,
        sensitivityThreshold,
        webhookUrl: webhookUrl || undefined,
        webhookType: webhookUrl ? webhookType : undefined,
        tags: parsedTags,
        zone: selectionMode === "zone" && zone
          ? zone
          : { x: 0, y: 0, width: 100, height: 100 },
        cssSelector: selectionMode === "element" ? (cssSelector ?? undefined) : undefined,
        selectionMode,
        fullScreenshotStorageId: screenshotStorageId
          ? (screenshotStorageId as Id<"_storage">)
          : undefined,
        compareType,
        keywords: parsedKeywords.length > 0 ? parsedKeywords : undefined,
        keywordMode: parsedKeywords.length > 0 ? keywordMode : undefined,
        activeDays: activeDays.length > 0 ? activeDays : undefined,
        delay,
        mobileViewport,
        blockAds,
        alertOnError,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("Failed to save:", err);
      setSaveError(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar -- pinned */}
      <div className="sticky top-0 z-20 bg-[#f0f0e8] border-b-2 border-[#1a1a1a]">
        <div className="flex items-center gap-4 px-6 py-3">
          <button
            onClick={() =>
              navigate({
                to: "/dashboard/$monitorId",
                params: { monitorId } as any,
              })
            }
            className="flex items-center gap-1.5 text-xs text-[#888] hover:text-[#1a1a1a] font-bold uppercase transition-colors shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="flex-1 flex gap-3 items-center">
            <p className="flex-1 text-sm font-mono text-[#888] border-2 border-[#ccc] bg-[#e8e8e0] px-3 py-2 truncate">
              {monitor.url}
            </p>
            <button
              onClick={handleRecapture}
              disabled={isRecapturing}
              className="px-4 py-2 bg-[#2d5a2d] text-[#f0f0e8] font-bold uppercase text-sm border-2 border-[#2d5a2d] hover:bg-[#3a6a3a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0 flex items-center gap-2"
            >
              {isRecapturing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              Recapture
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

      {/* Main content: screenshot + sidebar */}
      <div className="flex flex-1 min-h-0">
        {/* Left: Screenshot area */}
        <div className="flex-1 min-w-0 overflow-hidden">
          <div className="overflow-y-auto h-[calc(100vh-105px)]">
            {screenshotUrl ? (
              selectionMode === "zone" ? (
                <ZoneSelector
                  screenshotUrl={screenshotUrl}
                  initialZone={zone ?? undefined}
                  onZoneSelect={setZone}
                />
              ) : (
                <ElementPicker
                  url={monitor.url}
                  screenshotUrl={screenshotUrl!}
                  mobileViewport={mobileViewport}
                  onElementSelect={handleElementSelect}
                />
              )
            ) : (
              <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-[#ccc]">
                <RefreshCw className="w-20 h-20 mb-4 stroke-1" />
                <p className="text-sm font-bold uppercase text-[#888]">
                  No screenshot available
                </p>
                <button
                  onClick={handleRecapture}
                  disabled={isRecapturing}
                  className="mt-4 px-6 py-2 bg-[#2d5a2d] text-[#f0f0e8] font-bold uppercase text-sm border-2 border-[#2d5a2d] hover:bg-[#3a6a3a] disabled:opacity-50 transition-colors"
                >
                  {isRecapturing ? "Capturing..." : "Capture Screenshot"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right: Config sidebar -- sticky */}
        <div className="w-80 shrink-0 border-l-2 border-[#1a1a1a]">
          <div className="sticky top-[105px] h-[calc(100vh-105px)] overflow-y-auto">
            <div className="p-6 space-y-6">
              <h2 className="font-black text-lg uppercase tracking-tighter">
                Settings
              </h2>

              {/* Monitor name */}
              <div>
                <label className="block text-xs font-bold uppercase text-[#888] mb-2">
                  Monitor Name
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              {/* Check frequency */}
              <div>
                <label className="block text-xs font-bold uppercase text-[#888] mb-2">
                  Check Frequency
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {INTERVALS.map((opt) => {
                    const allowed = usage?.allowedIntervals?.includes(opt.value) ?? true;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => allowed && setInterval(opt.value)}
                        disabled={!allowed}
                        className={`border-2 border-[#1a1a1a] px-2 py-1.5 text-xs font-bold uppercase transition-all relative ${
                          !allowed
                            ? "opacity-40 cursor-not-allowed bg-[#e8e8e0] text-[#888]"
                            : interval === opt.value
                              ? "bg-[#1a1a1a] text-[#f0f0e8]"
                              : "bg-transparent text-[#1a1a1a] hover:bg-[#e8e8e0]"
                        }`}
                        title={!allowed ? `Upgrade to Pro for ${opt.label} checks` : ""}
                      >
                        {opt.label}
                        {!allowed && (
                          <Lock className="w-2.5 h-2.5 absolute top-0.5 right-0.5 text-[#888]" />
                        )}
                      </button>
                    );
                  })}
                </div>
                {usage && usage.planId === "free" && (
                  <p className="text-[10px] text-[#888] mt-1.5">
                    Free plan: daily checks only.{" "}
                    <a href="/pricing" className="text-[#2d5a2d] hover:underline">
                      Upgrade for faster checks →
                    </a>
                  </p>
                )}
              </div>

              {/* Sensitivity */}
              <div>
                <label className="block text-xs font-bold uppercase text-[#888] mb-2">
                  Sensitivity
                </label>
                <Select
                  value={String(sensitivityThreshold)}
                  onValueChange={(val) => setSensitivityThreshold(Number(val))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SENSITIVITY_PRESETS.map((preset) => (
                      <SelectItem key={preset.value} value={String(preset.value)}>
                        <span>{preset.label}</span>
                        <span className="ml-2 text-[10px] font-normal normal-case tracking-normal text-[#888]">
                          {preset.description}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Compare Type */}
              <div>
                <label className="block text-xs font-bold uppercase text-[#888] mb-2">
                  Compare Type
                </label>
                <Select
                  value={compareType}
                  onValueChange={(val) => setCompareType(val as typeof compareType)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COMPARE_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        <span>{t.label}</span>
                        <span className="ml-2 text-[10px] font-normal normal-case tracking-normal text-[#888]">
                          {t.description}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Keywords */}
              <MonitorKeywordsField
                keywords={keywords}
                onKeywordsChange={setKeywords}
                keywordMode={keywordMode}
                onKeywordModeChange={setKeywordMode}
              />

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

              {/* Advanced Settings */}
              <CollapsibleSection
                title="Advanced"
                open={showAdvanced}
                onToggle={() => setShowAdvanced(!showAdvanced)}
              >
                <MonitorAdvancedSettings
                  activeDays={activeDays}
                  onActiveDaysChange={setActiveDays}
                  delay={delay}
                  onDelayChange={setDelay}
                  mobileViewport={mobileViewport}
                  onMobileViewportChange={setMobileViewport}
                  blockAds={blockAds}
                  onBlockAdsChange={setBlockAds}
                  alertOnError={alertOnError}
                  onAlertOnErrorChange={setAlertOnError}
                />
              </CollapsibleSection>

              {/* Webhook */}
              <CollapsibleSection
                title="Webhook Notifications"
                open={showWebhook}
                onToggle={() => setShowWebhook(!showWebhook)}
              >
                <MonitorWebhookConfig
                  webhookUrl={webhookUrl}
                  onWebhookUrlChange={setWebhookUrl}
                  webhookType={webhookType}
                  onWebhookTypeChange={setWebhookType}
                  isTesting={isTesting}
                  testResult={testResult}
                  onTest={() => handleTestWebhook(webhookUrl, webhookType)}
                />
              </CollapsibleSection>

              {/* Selection info */}
              <MonitorSelectionInfo
                selectionMode={selectionMode}
                cssSelector={cssSelector}
                zone={zone}
              />
            </div>

            {/* Bottom actions -- pinned to bottom of sidebar */}
            <div className="sticky bottom-0 bg-[#f0f0e8] border-t-2 border-[#1a1a1a] p-4 flex items-center gap-3">
              <div className="flex-1">
                {saved && (
                  <span className="text-sm text-[#2d5a2d] font-bold">
                    Saved!
                  </span>
                )}
                {saveError && (
                  <span className="text-sm text-[#dc2626] font-bold">
                    {saveError}
                  </span>
                )}
              </div>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-[#2d5a2d] text-[#f0f0e8] border-2 border-[#2d5a2d] px-4 py-2.5 text-sm font-bold uppercase hover:bg-[#3a6a3a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
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

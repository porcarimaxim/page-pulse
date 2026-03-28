import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAction, useMutation, useQuery, useConvexAuth } from "convex/react";
import { useAuth } from "@clerk/tanstack-react-start";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
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
  Check,
  MousePointer,
  Crop,
  Image as ImageIcon,
  Lock,
} from "lucide-react";
import {
  INTERVALS,
  SENSITIVITY_PRESETS,
  type MonitorInterval,
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
  const usage = useQuery(api.monitors.usage, isSignedIn ? {} : "skip");
  const { isTesting, testResult, handleTestWebhook } = useWebhookTest();

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
  const [keywords, setKeywords] = useState("");
  const [keywordMode, setKeywordMode] = useState<"added" | "deleted" | "any">("any");
  const [activeDays, setActiveDays] = useState<number[]>([]);
  const [delay, setDelay] = useState(3);
  const [mobileViewport, setMobileViewport] = useState(false);
  const [blockAds, setBlockAds] = useState(true);
  const [alertOnError, setAlertOnError] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [webhookType, setWebhookType] = useState<"generic" | "slack" | "discord">("generic");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showWebhook, setShowWebhook] = useState(false);
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

      const result = await captureScreenshot({
        url: finalUrl,
      });
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

  const handleElementSelect = (selector: string, box?: { x: number; y: number; w: number; h: number }) => {
    setCssSelector(selector);
    if (box) {
      setZone({ x: box.x, y: box.y, width: box.w, height: box.h });
    }
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

      const parsedKeywords = keywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean);

      const monitorId = await createMonitor({
        url,
        name,
        zone: zone ?? { x: 0, y: 0, width: 100, height: 100 },
        interval: interval as MonitorInterval,
        fullScreenshotStorageId: screenshotStorageId as Id<"_storage">,
        cssSelector: selectionMode === "element" ? (cssSelector ?? undefined) : undefined,
        selectionMode,
        tags: parsedTags.length > 0 ? parsedTags : undefined,
        sensitivityThreshold,
        compareType,
        keywords: parsedKeywords.length > 0 ? parsedKeywords : undefined,
        keywordMode: parsedKeywords.length > 0 ? keywordMode : undefined,
        activeDays: activeDays.length > 0 ? activeDays : undefined,
        delay,
        mobileViewport,
        blockAds,
        alertOnError,
        webhookUrl: webhookUrl || undefined,
        webhookType: webhookUrl ? webhookType : undefined,
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
      {/* Top bar -- pinned */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200">
        <div className="flex items-center gap-4 px-6 py-3">
          <button
            onClick={() => navigate({ to: "/dashboard/monitors" })}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 font-bold transition-colors shrink-0"
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
              className="flex-1"
            />
            <button
              onClick={handleCapture}
              disabled={!url || isCapturing || !isConvexAuthed}
              className="px-6 py-2 bg-emerald-600 text-white font-bold text-sm rounded-lg border border-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
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
        <div className="flex items-center gap-4 px-6 py-2 border-t border-gray-200">
          <button
            onClick={() => setSelectionMode("zone")}
            className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${
              selectionMode === "zone"
                ? "text-emerald-600"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <Crop className="w-3.5 h-3.5" />
            Area
          </button>
          <button
            onClick={() => setSelectionMode("element")}
            className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${
              selectionMode === "element"
                ? "text-emerald-600"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <MousePointer className="w-3.5 h-3.5" />
            Element
          </button>
        </div>
      </div>

      {/* Monitor limit warning */}
      {usage && usage.maxMonitors !== -1 && usage.monitorCount >= usage.maxMonitors && (
        <div className="mx-6 mt-4 border border-amber-500 bg-amber-50 p-4 flex items-center justify-between rounded-lg">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-500" />
            <p className="text-sm font-bold text-amber-500">
              Monitor limit reached ({usage.monitorCount}/{usage.maxMonitors} on {usage.planName} plan)
            </p>
          </div>
          <a
            href="/pricing"
            className="text-xs font-bold text-emerald-600 hover:underline shrink-0"
          >
            Upgrade →
          </a>
        </div>
      )}

      {error && (
        <div className="mx-6 mt-4 border border-red-500 bg-red-50 p-3 rounded-lg">
          <p className="text-sm text-red-500 font-bold">{error}</p>
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
                  screenshotUrl={screenshotUrl!}
                  onElementSelect={handleElementSelect}
                />
              )
            ) : (
              <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-gray-200">
                <ImageIcon className="w-20 h-20 mb-4 stroke-1" />
                <p className="text-sm font-bold text-gray-500">
                  Enter website URL and click Go
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Config sidebar -- sticky */}
        <div className="w-80 shrink-0 border-l border-gray-200">
          <div className="sticky top-[105px] h-[calc(100vh-105px)] overflow-y-auto">
            <div className="p-6 space-y-6">
              <h2 className="font-bold text-lg">
                Setup
              </h2>

              {/* Monitor name */}
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2">
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
                <label className="block text-xs font-bold text-gray-500 mb-2">
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
                        className={`border border-gray-200 px-2 py-1.5 text-xs font-bold rounded-lg transition-all relative ${
                          !allowed
                            ? "opacity-40 cursor-not-allowed bg-gray-50 text-gray-500"
                            : interval === opt.value
                              ? "bg-gray-900 text-white border-gray-900"
                              : "bg-transparent text-gray-900 hover:bg-gray-50"
                        }`}
                        title={!allowed ? `Upgrade to Pro for ${opt.label} checks` : ""}
                      >
                        {opt.label}
                        {!allowed && (
                          <Lock className="w-2.5 h-2.5 absolute top-0.5 right-0.5 text-gray-500" />
                        )}
                      </button>
                    );
                  })}
                </div>
                {usage && usage.planId === "free" && (
                  <p className="text-xs text-gray-500 mt-1.5">
                    Free plan: daily checks only.{" "}
                    <a href="/pricing" className="text-emerald-600 hover:underline">
                      Upgrade for faster checks →
                    </a>
                  </p>
                )}
              </div>

              {/* Sensitivity */}
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2">
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
                        <span className="ml-2 text-xs font-normal text-gray-500">
                          {preset.description}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Compare Type */}
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2">
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
                        <span className="ml-2 text-xs font-normal text-gray-500">
                          {t.description}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2">
                  Tags
                </label>
                <Input
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="pricing, competitor"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Comma-separated
                </p>
              </div>

              {/* Keywords */}
              <MonitorKeywordsField
                keywords={keywords}
                onKeywordsChange={setKeywords}
                keywordMode={keywordMode}
                onKeywordModeChange={setKeywordMode}
              />

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
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 flex gap-3">
              <button
                onClick={() => navigate({ to: "/dashboard/monitors" })}
                className="flex-1 border border-gray-200 px-4 py-2.5 text-sm font-bold rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!canCreate}
                className="flex-1 bg-emerald-600 text-white border border-emerald-600 px-4 py-2.5 text-sm font-bold rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
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

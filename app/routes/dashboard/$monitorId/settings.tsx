import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useAction } from "convex/react";
import { useAuth } from "@clerk/tanstack-react-start";
import { api } from "@convex/_generated/api";
import { ZoneSelector, type Zone } from "@/components/zone-selector/ZoneSelector";
import { ElementPicker } from "@/components/element-picker/ElementPicker";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Loader2,
  Save,
  Send,
  Crop,
  MousePointer,
  RefreshCw,
  ChevronDown,
} from "lucide-react";
import { useState, useEffect } from "react";
import type { Id } from "@convex/_generated/dataModel";
import {
  INTERVALS,
  SENSITIVITY_PRESETS,
  COMPARE_TYPES,
  KEYWORD_MODES,
  DAYS_OF_WEEK,
  DELAY_OPTIONS,
} from "@/lib/monitor-constants";

export const Route = createFileRoute("/dashboard/$monitorId/settings")({
  component: MonitorSettingsPage,
});

type SelectionMode = "zone" | "element";

const WEBHOOK_TYPES = [
  { value: "generic", label: "Webhook" },
  { value: "slack", label: "Slack" },
  { value: "discord", label: "Discord" },
] as const;

function MonitorSettingsPage() {
  const { monitorId } = Route.useParams();
  const { isSignedIn, isLoaded } = useAuth();
  const navigate = useNavigate();

  const monitor = useQuery(
    api.monitors.get,
    isSignedIn ? { monitorId: monitorId as Id<"monitors"> } : "skip"
  );

  if (isLoaded && !isSignedIn) {
    navigate({ to: "/auth/sign-in", search: { redirect_url: `/dashboard/${monitorId}/settings` } as any });
    return null;
  }

  const updateMonitor = useMutation(api.monitors.update);
  const testWebhook = useAction(api.webhookActions.testWebhook);
  const captureScreenshot = useAction(api.screenshotActions.captureScreenshot);

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
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
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

  const handleElementSelect = (selector: string) => {
    setCssSelector(selector);
  };

  const isSelectionComplete =
    selectionMode === "zone" ? !!zone : !!cssSelector;

  const handleSave = async () => {
    setIsSaving(true);
    setSaved(false);

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
        interval: interval as any,
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
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestWebhook = async () => {
    if (!webhookUrl) return;
    setIsTesting(true);
    setTestResult(null);
    try {
      await testWebhook({ webhookUrl, webhookType });
      setTestResult("success");
    } catch {
      setTestResult("error");
    } finally {
      setIsTesting(false);
      setTimeout(() => setTestResult(null), 3000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar — pinned */}
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

        {/* Right: Config sidebar — sticky */}
        <div className="w-80 shrink-0 border-l-2 border-[#1a1a1a] bg-[#e4e4dc]">
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
                <Select value={interval} onValueChange={setInterval}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {INTERVALS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
              <div>
                <label className="block text-xs font-bold uppercase text-[#888] mb-2">
                  Keyword Alerts
                </label>
                <Input
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="price, sale, out of stock"
                />
                <p className="text-xs text-[#888] mt-1">
                  Comma-separated — only alert when these words change
                </p>
                {keywords.trim() && (
                  <div className="mt-2 flex gap-0">
                    {KEYWORD_MODES.map((m, i) => (
                      <button
                        key={m.value}
                        onClick={() => setKeywordMode(m.value as typeof keywordMode)}
                        className={`flex-1 border-2 border-[#1a1a1a] px-2 py-1.5 text-[10px] font-bold uppercase transition-all ${
                          i > 0 ? "border-l-0" : ""
                        } ${
                          keywordMode === m.value
                            ? "bg-[#1a1a1a] text-[#f0f0e8]"
                            : "bg-transparent text-[#1a1a1a] hover:bg-[#e8e8e0]"
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                )}
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

              {/* Advanced Settings */}
              <div className="border-t-2 border-[#ccc] pt-4 space-y-4">
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="w-full flex items-center justify-between group"
                >
                  <h3 className="font-black text-xs uppercase tracking-tighter group-hover:text-[#2d5a2d] transition-colors">
                    Advanced
                  </h3>
                  <ChevronDown
                    className={`w-4 h-4 text-[#888] transition-transform duration-200 ${
                      showAdvanced ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {showAdvanced && (<>
                {/* Active Days */}
                <div>
                  <label className="block text-xs font-bold uppercase text-[#888] mb-2">
                    Active Days
                  </label>
                  <div className="flex gap-1">
                    {DAYS_OF_WEEK.map((d) => (
                      <button
                        key={d.value}
                        onClick={() =>
                          setActiveDays((prev) =>
                            prev.includes(d.value)
                              ? prev.filter((v) => v !== d.value)
                              : [...prev, d.value]
                          )
                        }
                        className={`flex-1 border-2 border-[#1a1a1a] px-1 py-1.5 text-[10px] font-bold uppercase transition-all ${
                          activeDays.includes(d.value)
                            ? "bg-[#1a1a1a] text-[#f0f0e8]"
                            : "bg-transparent text-[#1a1a1a] hover:bg-[#e8e8e0]"
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-[#888] mt-1">
                    {activeDays.length === 0
                      ? "All days (default)"
                      : `${activeDays.length} day${activeDays.length > 1 ? "s" : ""} selected`}
                  </p>
                </div>

                {/* Delay */}
                <div>
                  <label className="block text-xs font-bold uppercase text-[#888] mb-2">
                    Page Load Delay
                  </label>
                  <div className="flex gap-0">
                    {DELAY_OPTIONS.map((d, i) => (
                      <button
                        key={d.value}
                        onClick={() => setDelay(d.value)}
                        className={`flex-1 border-2 border-[#1a1a1a] px-2 py-1.5 text-xs font-bold uppercase transition-all ${
                          i > 0 ? "border-l-0" : ""
                        } ${
                          delay === d.value
                            ? "bg-[#1a1a1a] text-[#f0f0e8]"
                            : "bg-transparent text-[#1a1a1a] hover:bg-[#e8e8e0]"
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-[#888] mt-1">
                    Wait before capturing
                  </p>
                </div>

                {/* Toggles */}
                <div className="space-y-2">
                  <label
                    className="flex items-center justify-between cursor-pointer group"
                    onClick={() => setMobileViewport(!mobileViewport)}
                  >
                    <span className="text-xs font-bold uppercase text-[#888] group-hover:text-[#1a1a1a] transition-colors">
                      Mobile Viewport
                    </span>
                    <span
                      className={`w-8 h-5 border-2 border-[#1a1a1a] flex items-center transition-colors ${
                        mobileViewport ? "bg-[#2d5a2d]" : "bg-transparent"
                      }`}
                    >
                      <span
                        className={`w-3 h-3 bg-[#1a1a1a] transition-transform ${
                          mobileViewport ? "translate-x-3" : "translate-x-0.5"
                        } ${mobileViewport ? "!bg-[#f0f0e8]" : ""}`}
                      />
                    </span>
                  </label>

                  <label
                    className="flex items-center justify-between cursor-pointer group"
                    onClick={() => setBlockAds(!blockAds)}
                  >
                    <span className="text-xs font-bold uppercase text-[#888] group-hover:text-[#1a1a1a] transition-colors">
                      Block Ads
                    </span>
                    <span
                      className={`w-8 h-5 border-2 border-[#1a1a1a] flex items-center transition-colors ${
                        blockAds ? "bg-[#2d5a2d]" : "bg-transparent"
                      }`}
                    >
                      <span
                        className={`w-3 h-3 bg-[#1a1a1a] transition-transform ${
                          blockAds ? "translate-x-3" : "translate-x-0.5"
                        } ${blockAds ? "!bg-[#f0f0e8]" : ""}`}
                      />
                    </span>
                  </label>

                  <label
                    className="flex items-center justify-between cursor-pointer group"
                    onClick={() => setAlertOnError(!alertOnError)}
                  >
                    <span className="text-xs font-bold uppercase text-[#888] group-hover:text-[#1a1a1a] transition-colors">
                      Alert on Error
                    </span>
                    <span
                      className={`w-8 h-5 border-2 border-[#1a1a1a] flex items-center transition-colors ${
                        alertOnError ? "bg-[#2d5a2d]" : "bg-transparent"
                      }`}
                    >
                      <span
                        className={`w-3 h-3 bg-[#1a1a1a] transition-transform ${
                          alertOnError ? "translate-x-3" : "translate-x-0.5"
                        } ${alertOnError ? "!bg-[#f0f0e8]" : ""}`}
                      />
                    </span>
                  </label>
                </div>
                </>)}
              </div>

              {/* Webhook */}
              <div className="border-t-2 border-[#ccc] pt-4 space-y-3">
                <button
                  onClick={() => setShowWebhook(!showWebhook)}
                  className="w-full flex items-center justify-between group"
                >
                  <h3 className="font-black text-xs uppercase tracking-tighter group-hover:text-[#2d5a2d] transition-colors">
                    Webhook Notifications
                  </h3>
                  <ChevronDown
                    className={`w-4 h-4 text-[#888] transition-transform duration-200 ${
                      showWebhook ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {showWebhook && (<>
                <div>
                  <label className="block text-xs font-bold uppercase text-[#888] mb-1.5">
                    Type
                  </label>
                  <div className="flex gap-0">
                    {WEBHOOK_TYPES.map((t) => (
                      <button
                        key={t.value}
                        onClick={() => setWebhookType(t.value as typeof webhookType)}
                        className={`border-2 border-[#1a1a1a] px-3 py-1.5 text-xs font-bold uppercase transition-all ${
                          t.value !== "generic" ? "border-l-0" : ""
                        } ${
                          webhookType === t.value
                            ? "bg-[#1a1a1a] text-[#f0f0e8]"
                            : "bg-transparent text-[#1a1a1a] hover:bg-[#e8e8e0]"
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-[#888] mb-1.5">
                    URL
                  </label>
                  <Input
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    placeholder={
                      webhookType === "slack"
                        ? "https://hooks.slack.com/..."
                        : webhookType === "discord"
                          ? "https://discord.com/api/..."
                          : "https://your-server.com/webhook"
                    }
                  />
                  <div className="flex items-center gap-2 mt-1.5">
                    <button
                      onClick={handleTestWebhook}
                      disabled={!webhookUrl || isTesting}
                      className="text-xs font-bold uppercase text-[#888] hover:text-[#1a1a1a] disabled:opacity-50 transition-colors flex items-center gap-1"
                    >
                      {isTesting ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Send className="w-3 h-3" />
                      )}
                      Test
                    </button>
                    {testResult === "success" && (
                      <span className="text-xs text-[#2d5a2d] font-bold">
                        Sent!
                      </span>
                    )}
                    {testResult === "error" && (
                      <span className="text-xs text-[#dc2626] font-bold">
                        Failed
                      </span>
                    )}
                  </div>
                </div>
                </>)}
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
            <div className="sticky bottom-0 bg-[#e4e4dc] border-t-2 border-[#1a1a1a] p-4 flex items-center gap-3">
              <div className="flex-1">
                {saved && (
                  <span className="text-sm text-[#2d5a2d] font-bold">
                    Saved!
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

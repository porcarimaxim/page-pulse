import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAction, useMutation, useQuery, useConvexAuth } from "convex/react";
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
import {
  ArrowLeft,
  Loader2,
  Check,
  MousePointer,
  Crop,
  Image as ImageIcon,
  Lock,
  ChevronDown,
  Send,
} from "lucide-react";
import {
  INTERVALS,
  SENSITIVITY_PRESETS,
  COMPARE_TYPES,
  KEYWORD_MODES,
  DAYS_OF_WEEK,
  DELAY_OPTIONS,
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
  const testWebhook = useAction(api.webhookActions.testWebhook);
  const usage = useQuery(api.monitors.usage, isSignedIn ? {} : "skip");

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
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
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

  const handleElementSelect = (selector: string) => {
    setCssSelector(selector);
  };

  const isSelectionComplete =
    selectionMode === "zone" ? !!zone : !!cssSelector;

  const canCreate = !!name && !!screenshotStorageId && isSelectionComplete && !isCreating && isConvexAuthed;

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

      {/* Monitor limit warning */}
      {usage && usage.maxMonitors !== -1 && usage.monitorCount >= usage.maxMonitors && (
        <div className="mx-6 mt-4 border-2 border-[#ca8a04] bg-[#fefce8] p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#ca8a04]" />
            <p className="text-sm font-bold text-[#ca8a04]">
              Monitor limit reached ({usage.monitorCount}/{usage.maxMonitors} on {usage.planName} plan)
            </p>
          </div>
          <a
            href="/pricing"
            className="text-xs font-bold uppercase tracking-wider text-[#2d5a2d] hover:underline shrink-0"
          >
            Upgrade →
          </a>
        </div>
      )}

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
                  screenshotUrl={screenshotUrl!}
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
                    {([
                      { value: "generic", label: "Webhook" },
                      { value: "slack", label: "Slack" },
                      { value: "discord", label: "Discord" },
                    ] as const).map((t) => (
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

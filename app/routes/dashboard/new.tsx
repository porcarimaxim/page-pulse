import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAction, useMutation, useConvexAuth } from "convex/react";
import { useAuth } from "@clerk/tanstack-react-start";
import { api } from "@convex/_generated/api";
import { DashboardHeader } from "@/components/DashboardHeader";
import { ZoneSelector, type Zone } from "@/components/zone-selector/ZoneSelector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  Camera,
  Check,
} from "lucide-react";

export const Route = createFileRoute("/dashboard/new")({
  component: NewMonitorPage,
});

type Step = "url" | "zone" | "configure";

const INTERVALS = [
  { value: "5min", label: "Every 5 min" },
  { value: "15min", label: "Every 15 min" },
  { value: "30min", label: "Every 30 min" },
  { value: "hourly", label: "Every hour" },
  { value: "daily", label: "Every day" },
  { value: "weekly", label: "Every week" },
] as const;

function NewMonitorPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const { isAuthenticated: isConvexAuthed } = useConvexAuth();
  const navigate = useNavigate();
  const captureScreenshot = useAction(api.screenshotActions.captureScreenshot);
  const createMonitor = useMutation(api.monitors.create);

  if (isLoaded && !isSignedIn) {
    navigate({ to: "/auth/sign-in", search: { redirect_url: "/dashboard/new" } });
    return null;
  }

  const [step, setStep] = useState<Step>("url");
  const [url, setUrl] = useState("");
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [screenshotStorageId, setScreenshotStorageId] = useState<string | null>(null);
  const [zone, setZone] = useState<Zone | null>(null);
  const [name, setName] = useState("");
  const [interval, setInterval] = useState<string>("daily");
  const [isCapturing, setIsCapturing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCapture = async () => {
    if (!url) return;
    setIsCapturing(true);
    setError(null);

    try {
      // Ensure URL has protocol
      let finalUrl = url;
      if (!finalUrl.startsWith("http://") && !finalUrl.startsWith("https://")) {
        finalUrl = "https://" + finalUrl;
        setUrl(finalUrl);
      }

      const result = await captureScreenshot({ url: finalUrl });
      setScreenshotStorageId(result.storageId);
      setScreenshotUrl(result.url);

      // Auto-generate name from URL
      if (!name) {
        try {
          const urlObj = new URL(finalUrl);
          setName(urlObj.hostname);
        } catch {
          setName(finalUrl);
        }
      }

      setStep("zone");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to capture screenshot");
    } finally {
      setIsCapturing(false);
    }
  };

  const handleCreate = async () => {
    if (!zone || !name || !screenshotStorageId) return;
    setIsCreating(true);

    try {
      const monitorId = await createMonitor({
        url,
        name,
        zone,
        interval: interval as any,
        fullScreenshotStorageId: screenshotStorageId as any,
      });

      navigate({
        to: "/dashboard/$monitorId",
        params: { monitorId },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create monitor");
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f0e8]">
      <DashboardHeader />

      <main className="max-w-3xl mx-auto px-6 py-8">
        {/* Back link */}
        <button
          onClick={() => navigate({ to: "/dashboard" })}
          className="flex items-center gap-2 text-sm text-[#888] hover:text-[#1a1a1a] font-bold uppercase mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to monitors
        </button>

        <h1 className="text-3xl font-black uppercase tracking-tighter mb-2">
          New Monitor
        </h1>

        {/* Progress steps */}
        <div className="flex items-center gap-2 mb-8">
          {(["url", "zone", "configure"] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 flex items-center justify-center text-xs font-bold border-2 border-[#1a1a1a] ${
                  step === s
                    ? "bg-[#1a1a1a] text-[#f0f0e8]"
                    : (["url", "zone", "configure"].indexOf(step) > i)
                      ? "bg-[#2d5a2d] text-[#f0f0e8] border-[#2d5a2d]"
                      : "bg-transparent text-[#888]"
                }`}
              >
                {["url", "zone", "configure"].indexOf(step) > i ? (
                  <Check className="w-4 h-4" />
                ) : (
                  i + 1
                )}
              </div>
              <span
                className={`text-xs font-bold uppercase ${
                  step === s ? "text-[#1a1a1a]" : "text-[#888]"
                }`}
              >
                {s === "url" ? "URL" : s === "zone" ? "Zone" : "Configure"}
              </span>
              {i < 2 && <div className="w-8 h-0.5 bg-[#ccc]" />}
            </div>
          ))}
        </div>

        {error && (
          <div className="border-2 border-[#dc2626] bg-[#dc2626]/10 p-4 mb-6">
            <p className="text-sm text-[#dc2626] font-bold">{error}</p>
          </div>
        )}

        {/* Step 1: URL */}
        {step === "url" && (
          <div className="border-2 border-[#1a1a1a] p-6 shadow-[8px_8px_0px_0px_var(--shadow-color)]">
            <h2 className="font-black text-lg uppercase tracking-tighter mb-4">
              Enter URL to Monitor
            </h2>
            <div className="flex gap-3">
              <Input
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCapture()}
                className="flex-1"
              />
              <Button onClick={handleCapture} disabled={!url || isCapturing || !isConvexAuthed}>
                {isCapturing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Capturing...
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4" />
                    Capture
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-[#888] mt-3">
              We'll take a screenshot of this page so you can select a zone to monitor.
            </p>
          </div>
        )}

        {/* Step 2: Zone Selection */}
        {step === "zone" && screenshotUrl && (
          <div className="space-y-6">
            <div className="border-2 border-[#1a1a1a] p-6 shadow-[8px_8px_0px_0px_var(--shadow-color)]">
              <h2 className="font-black text-lg uppercase tracking-tighter mb-4">
                Select Zone to Monitor
              </h2>
              <ZoneSelector
                screenshotUrl={screenshotUrl}
                onZoneSelect={setZone}
              />
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep("url")}>
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <Button onClick={() => setStep("configure")} disabled={!zone}>
                Continue
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Configure */}
        {step === "configure" && (
          <div className="space-y-6">
            <div className="border-2 border-[#1a1a1a] p-6 shadow-[8px_8px_0px_0px_var(--shadow-color)]">
              <h2 className="font-black text-lg uppercase tracking-tighter mb-4">
                Configure Monitor
              </h2>
              <div className="space-y-4">
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
                <div>
                  <label className="block text-xs font-bold uppercase text-[#888] mb-2">
                    Check Frequency
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {INTERVALS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setInterval(opt.value)}
                        className={`border-2 border-[#1a1a1a] px-3 py-2 text-sm font-bold uppercase transition-all ${
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
              </div>
            </div>

            {/* Summary */}
            <div className="border-2 border-[#1a1a1a] p-4 bg-[#e8e8e0]">
              <h3 className="text-xs font-bold uppercase text-[#888] mb-2">
                Summary
              </h3>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="text-[#888]">URL:</span> {url}
                </p>
                <p>
                  <span className="text-[#888]">Zone:</span>{" "}
                  {zone
                    ? `${zone.width.toFixed(0)}% x ${zone.height.toFixed(0)}%`
                    : "Not set"}
                </p>
                <p>
                  <span className="text-[#888]">Frequency:</span>{" "}
                  {INTERVALS.find((i) => i.value === interval)?.label}
                </p>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep("zone")}>
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <Button
                variant="primary"
                onClick={handleCreate}
                disabled={!name || !zone || isCreating || !isConvexAuthed}
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
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

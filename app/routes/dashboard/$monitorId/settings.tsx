import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useAction } from "convex/react";
import { useAuth } from "@clerk/tanstack-react-start";
import { api } from "@convex/_generated/api";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Save, Loader2, Send } from "lucide-react";
import { useState, useEffect } from "react";
import type { Id } from "@convex/_generated/dataModel";

export const Route = createFileRoute("/dashboard/$monitorId/settings")({
  component: MonitorSettingsPage,
});

const INTERVALS = [
  { value: "5min", label: "Every 5 min" },
  { value: "15min", label: "Every 15 min" },
  { value: "30min", label: "Every 30 min" },
  { value: "hourly", label: "Every hour" },
  { value: "daily", label: "Every day" },
  { value: "weekly", label: "Every week" },
] as const;

const SENSITIVITY_PRESETS = [
  { value: 1, label: "Low", description: "1% — ignore minor changes" },
  { value: 0.5, label: "Medium", description: "0.5% — balanced" },
  { value: 0.1, label: "High", description: "0.1% — catch small changes" },
] as const;

const WEBHOOK_TYPES = [
  { value: "generic", label: "Generic" },
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
    navigate({ to: "/auth/sign-in", search: { redirect_url: `/dashboard/${monitorId}/settings` } });
    return null;
  }
  const updateMonitor = useMutation(api.monitors.update);
  const testWebhook = useAction(api.webhookActions.testWebhook);

  const [name, setName] = useState("");
  const [interval, setInterval] = useState("daily");
  const [sensitivityThreshold, setSensitivityThreshold] = useState(0.1);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [webhookType, setWebhookType] = useState<"generic" | "slack" | "discord">("generic");
  const [tags, setTags] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  useEffect(() => {
    if (monitor) {
      setName(monitor.name);
      setInterval(monitor.interval);
      setSensitivityThreshold(monitor.sensitivityThreshold ?? 0.1);
      setWebhookUrl(monitor.webhookUrl ?? "");
      setWebhookType(monitor.webhookType ?? "generic");
      setTags((monitor.tags ?? []).join(", "));
    }
  }, [monitor]);

  if (monitor === undefined) {
    return (
      <div className="min-h-screen bg-[#f0f0e8]">
        <DashboardHeader />
        <div className="text-center py-20 text-[#888]">Loading...</div>
      </div>
    );
  }

  if (monitor === null) {
    return (
      <div className="min-h-screen bg-[#f0f0e8]">
        <DashboardHeader />
        <div className="text-center py-20">
          <h2 className="text-xl font-black uppercase">Monitor Not Found</h2>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    setIsSaving(true);
    setSaved(false);

    try {
      const parsedTags = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      await updateMonitor({
        monitorId: monitorId as Id<"monitors">,
        name,
        interval: interval as any,
        sensitivityThreshold,
        webhookUrl: webhookUrl || undefined,
        webhookType: webhookUrl ? webhookType : undefined,
        tags: parsedTags,
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
    <div className="min-h-screen bg-[#f0f0e8]">
      <DashboardHeader />

      <main className="max-w-2xl mx-auto px-6 py-8">
        {/* Back */}
        <button
          onClick={() =>
            navigate({
              to: "/dashboard/$monitorId",
              params: { monitorId },
            })
          }
          className="flex items-center gap-2 text-sm text-[#888] hover:text-[#1a1a1a] font-bold uppercase mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to monitor
        </button>

        <h1 className="text-3xl font-black uppercase tracking-tighter mb-8">
          Settings
        </h1>

        <div className="space-y-6">
          {/* Basic settings */}
          <div className="border-2 border-[#1a1a1a] p-6 shadow-[8px_8px_0px_0px_var(--shadow-color)] space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase text-[#888] mb-2">
                Monitor Name
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-[#888] mb-2">
                URL
              </label>
              <p className="text-sm font-mono text-[#888] border-2 border-[#ccc] bg-[#e8e8e0] px-3 py-2">
                {monitor.url}
              </p>
              <p className="text-xs text-[#888] mt-1">
                URL cannot be changed. Create a new monitor for a different URL.
              </p>
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

            <div>
              <label className="block text-xs font-bold uppercase text-[#888] mb-2">
                Sensitivity
              </label>
              <div className="grid grid-cols-3 gap-2">
                {SENSITIVITY_PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    onClick={() => setSensitivityThreshold(preset.value)}
                    className={`border-2 border-[#1a1a1a] px-3 py-2 text-left transition-all ${
                      sensitivityThreshold === preset.value
                        ? "bg-[#1a1a1a] text-[#f0f0e8]"
                        : "bg-transparent text-[#1a1a1a] hover:bg-[#e8e8e0]"
                    }`}
                  >
                    <span className="text-sm font-bold uppercase block">
                      {preset.label}
                    </span>
                    <span className={`text-[10px] ${
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

            <div>
              <label className="block text-xs font-bold uppercase text-[#888] mb-2">
                Tags
              </label>
              <Input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="pricing, competitor, news"
              />
              <p className="text-xs text-[#888] mt-1">
                Comma-separated. Used to organize and filter monitors.
              </p>
            </div>
          </div>

          {/* Webhook settings */}
          <div className="border-2 border-[#1a1a1a] p-6 shadow-[8px_8px_0px_0px_var(--shadow-color)] space-y-4">
            <h2 className="font-black text-base uppercase tracking-tighter">
              Webhook Notifications
            </h2>
            <p className="text-xs text-[#888]">
              Get notified via Slack, Discord, or any webhook when changes are detected.
            </p>

            <div>
              <label className="block text-xs font-bold uppercase text-[#888] mb-2">
                Type
              </label>
              <div className="flex gap-0">
                {WEBHOOK_TYPES.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setWebhookType(t.value as typeof webhookType)}
                    className={`border-2 border-[#1a1a1a] px-4 py-2 text-sm font-bold uppercase transition-all ${
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
              <label className="block text-xs font-bold uppercase text-[#888] mb-2">
                Webhook URL
              </label>
              <div className="flex gap-2">
                <Input
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder={
                    webhookType === "slack"
                      ? "https://hooks.slack.com/services/..."
                      : webhookType === "discord"
                        ? "https://discord.com/api/webhooks/..."
                        : "https://your-server.com/webhook"
                  }
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  onClick={handleTestWebhook}
                  disabled={!webhookUrl || isTesting}
                >
                  {isTesting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Test
                </Button>
              </div>
              {testResult === "success" && (
                <p className="text-xs text-[#2d5a2d] font-bold mt-1">
                  Test sent successfully!
                </p>
              )}
              {testResult === "error" && (
                <p className="text-xs text-[#dc2626] font-bold mt-1">
                  Test failed. Check the URL and try again.
                </p>
              )}
            </div>
          </div>

          {/* Save */}
          <div className="flex items-center justify-between">
            <div>
              {saved && (
                <span className="text-sm text-[#2d5a2d] font-bold">
                  Saved!
                </span>
              )}
            </div>
            <Button onClick={handleSave} disabled={isSaving}>
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
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

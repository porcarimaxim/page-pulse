import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation } from "convex/react";
import { useAuth } from "@clerk/tanstack-react-start";
import { api } from "@convex/_generated/api";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
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

  const [name, setName] = useState("");
  const [interval, setInterval] = useState("daily");
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (monitor) {
      setName(monitor.name);
      setInterval(monitor.interval);
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
      await updateMonitor({
        monitorId: monitorId as Id<"monitors">,
        name,
        interval: interval as any,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
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

          <div className="flex items-center justify-between border-t-2 border-[#ccc] pt-4">
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

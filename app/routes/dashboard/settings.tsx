import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Sparkles, Eye, EyeOff, Check, Loader2, CreditCard, ArrowRight, Lock } from "lucide-react";
import { PricingTable, useAuth } from "@clerk/tanstack-react-start";
import { Component, type ErrorInfo, type ReactNode } from "react";

class BillingErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; fallback: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.warn("Billing component error:", error.message);
  }
  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

export const Route = createFileRoute("/dashboard/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { has } = useAuth();
  const hasAiFeature = has?.({ feature: "ai_summaries" }) ?? false;
  const settings = useQuery(api.aiHelpers.getMySettings);
  const saveSettings = useMutation(api.aiHelpers.saveMySettings);

  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(true);

  // Sync incoming settings
  useEffect(() => {
    if (settings?.claudeApiKey) {
      setApiKey(settings.claudeApiKey);
    }
    if (settings?.aiEnabled !== undefined) {
      setAiEnabled(settings.aiEnabled !== false);
    }
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveSettings({
        claudeApiKey: apiKey || undefined,
        aiEnabled,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const hasKey = !!settings?.claudeApiKey;

  return (
    <main className="px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black uppercase tracking-tighter">
          Settings
        </h1>
        <p className="text-sm text-[#888] mt-1">
          Manage your account and preferences
        </p>
      </div>

      {/* Account */}
      <div className="border-2 border-[#1a1a1a] p-6 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] mb-6">
        <h2 className="text-lg font-black uppercase tracking-tighter mb-4">
          Account
        </h2>
        <p className="text-sm text-[#888]">
          Account settings are managed through your authentication provider.
        </p>
      </div>

      {/* Subscription / Billing */}
      <div className="border-2 border-[#1a1a1a] p-6 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 border-2 border-[#2d5a2d] flex items-center justify-center">
            <CreditCard className="w-4 h-4 text-[#2d5a2d]" />
          </div>
          <div>
            <h2 className="text-lg font-black uppercase tracking-tighter">
              Subscription
            </h2>
            <p className="text-xs text-[#888]">
              Manage your plan and billing
            </p>
          </div>
        </div>

        <BillingErrorBoundary
          fallback={
            <div className="border-2 border-[#ccc] border-dashed p-6 text-center">
              <p className="text-sm text-[#888] mb-2">
                Billing is not yet configured.
              </p>
              <p className="text-xs text-[#888]">
                Enable billing in your Clerk dashboard to manage subscriptions here.
              </p>
            </div>
          }
        >
          <div className="border-2 border-[#1a1a1a] bg-white p-4">
            <PricingTable />
          </div>
        </BillingErrorBoundary>
      </div>

      {/* AI Integration */}
      <div className={`border-2 border-[#1a1a1a] p-6 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] relative ${!hasAiFeature ? "opacity-70" : ""}`}>
        {!hasAiFeature && (
          <div className="absolute inset-0 bg-[#f0f0e8]/60 z-10 flex items-center justify-center">
            <div className="border-2 border-[#1a1a1a] bg-white p-6 text-center max-w-sm shadow-[4px_4px_0px_0px_#1a1a1a]">
              <Lock className="w-6 h-6 text-[#888] mx-auto mb-3" />
              <p className="text-sm font-black uppercase tracking-tighter mb-1">
                Upgrade to Unlock AI
              </p>
              <p className="text-xs text-[#888] mb-4">
                AI Summaries are available on the Pro and Business plans.
              </p>
              <Button asChild size="sm">
                <Link to="/pricing">
                  View Plans <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        )}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 border-2 border-[#7c3aed] flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-[#7c3aed]" />
          </div>
          <div>
            <h2 className="text-lg font-black uppercase tracking-tighter">
              AI Summaries
            </h2>
            <p className="text-xs text-[#888]">
              Powered by Claude
            </p>
          </div>
          {hasKey && aiEnabled && (
            <span className="ml-auto text-[10px] font-bold uppercase tracking-wider text-[#2d5a2d] bg-[#dcfce7] border border-[#2d5a2d] px-2 py-0.5">
              Active
            </span>
          )}
          {hasKey && !aiEnabled && (
            <span className="ml-auto text-[10px] font-bold uppercase tracking-wider text-[#888] bg-[#e8e8e0] border border-[#ccc] px-2 py-0.5">
              Disabled
            </span>
          )}
        </div>

        <p className="text-sm text-[#888] mb-6 leading-relaxed">
          Add your Claude API key to enable AI-powered summaries for detected
          changes. Each change will receive a plain-language explanation of what
          changed, so you can understand updates in seconds instead of reviewing
          full page comparisons.
        </p>

        {/* Features list */}
        <div className="grid sm:grid-cols-3 gap-3 mb-6">
          {[
            {
              title: "Auto-Summaries",
              desc: "Every new change gets a plain-language summary automatically",
            },
            {
              title: "On-Demand",
              desc: "Generate summaries for existing changes with one click",
            },
            {
              title: "Cost Efficient",
              desc: "Uses Claude Haiku — fast and inexpensive per summary",
            },
          ].map((f) => (
            <div key={f.title} className="border border-[#ccc] p-3">
              <p className="text-xs font-black uppercase tracking-tighter mb-1">
                {f.title}
              </p>
              <p className="text-[11px] text-[#888] leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Enable/Disable toggle */}
        <div className="flex items-center justify-between border-2 border-[#1a1a1a] p-4 mb-6">
          <div>
            <p className="text-sm font-bold">Enable AI Summaries</p>
            <p className="text-xs text-[#888] mt-0.5">
              {aiEnabled
                ? "New changes will automatically receive AI summaries"
                : "AI summaries are paused — no API calls will be made"}
            </p>
          </div>
          <button
            onClick={() => {
              const next = !aiEnabled;
              setAiEnabled(next);
              saveSettings({ aiEnabled: next });
            }}
            className={`w-12 h-6 relative transition-colors ${
              aiEnabled ? "bg-[#2d5a2d]" : "bg-[#ccc]"
            }`}
          >
            <div
              className={`absolute top-0.5 w-5 h-5 bg-[#f0f0e8] transition-transform ${
                aiEnabled ? "translate-x-6" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>

        {/* API Key input */}
        <div className="space-y-3">
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wider text-[#888]">
              Claude API Key
            </span>
            <div className="flex mt-1.5">
              <div className="flex-1 flex border-2 border-[#1a1a1a]">
                <input
                  type={showKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-ant-api03-..."
                  className="flex-1 px-4 py-2.5 text-sm bg-transparent outline-none placeholder:text-[#ccc] font-mono"
                />
                <button
                  onClick={() => setShowKey(!showKey)}
                  className="px-3 text-[#888] hover:text-[#1a1a1a] transition-colors border-l-2 border-[#1a1a1a]"
                >
                  {showKey ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="ml-2"
                size="sm"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : saved ? (
                  <>
                    <Check className="w-4 h-4" />
                    Saved
                  </>
                ) : (
                  "Save"
                )}
              </Button>
            </div>
          </label>

          <p className="text-[11px] text-[#888] leading-relaxed">
            Your API key is stored securely and only used server-side to generate
            change summaries. Get your key at{" "}
            <a
              href="https://console.anthropic.com/settings/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#2d5a2d] hover:underline"
            >
              console.anthropic.com
            </a>
            .
          </p>
        </div>
      </div>
    </main>
  );
}

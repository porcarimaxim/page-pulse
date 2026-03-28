import { Input } from "@/components/ui/input";
import { Loader2, Send } from "lucide-react";

const WEBHOOK_TYPES = [
  { value: "generic", label: "Webhook" },
  { value: "slack", label: "Slack" },
  { value: "discord", label: "Discord" },
] as const;

export function MonitorWebhookConfig({
  webhookUrl,
  onWebhookUrlChange,
  webhookType,
  onWebhookTypeChange,
  isTesting,
  testResult,
  onTest,
}: {
  webhookUrl: string;
  onWebhookUrlChange: (v: string) => void;
  webhookType: "generic" | "slack" | "discord";
  onWebhookTypeChange: (v: "generic" | "slack" | "discord") => void;
  isTesting: boolean;
  testResult: string | null;
  onTest: () => void;
}) {
  return (
    <>
      <div>
        <label className="block text-xs font-bold uppercase text-[#888] mb-1.5">
          Type
        </label>
        <div className="flex gap-0">
          {WEBHOOK_TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => onWebhookTypeChange(t.value)}
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
          onChange={(e) => onWebhookUrlChange(e.target.value)}
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
            onClick={onTest}
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
            <span className="text-xs text-[#2d5a2d] font-bold">Sent!</span>
          )}
          {testResult === "error" && (
            <span className="text-xs text-[#dc2626] font-bold">Failed</span>
          )}
        </div>
      </div>
    </>
  );
}

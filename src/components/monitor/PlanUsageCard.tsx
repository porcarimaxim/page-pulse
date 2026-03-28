import { Link } from "@tanstack/react-router";
import { Zap } from "lucide-react";

export function PlanUsageCard({
  usage,
}: {
  usage: {
    planName: string;
    monitorCount: number;
    maxMonitors: number;
    monthlyChecks: number;
    monthlyChecksUsed?: number;
  };
}) {
  const checksUsed = usage.monthlyChecksUsed ?? 0;

  return (
    <div className="border-2 border-[#ccc] p-4">
      <div className="flex items-center gap-2 mb-3">
        <Zap className="w-3.5 h-3.5 text-[#2d5a2d]" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#888]">
          {usage.planName} Plan
        </span>
      </div>

      {/* Monitors */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-bold uppercase text-[#888]">
            Monitors
          </span>
          <span className="text-[10px] font-bold text-[#888]">
            {usage.monitorCount}
            {usage.maxMonitors === -1 ? " / Unlimited" : ` / ${usage.maxMonitors}`}
          </span>
        </div>
        {usage.maxMonitors !== -1 && (
          <ProgressBar
            value={usage.monitorCount}
            max={usage.maxMonitors}
          />
        )}
      </div>

      {/* Monthly Checks */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-bold uppercase text-[#888]">
            Monthly Checks
          </span>
          <span className="text-[10px] font-bold text-[#888]">
            {checksUsed.toLocaleString()}
            {usage.monthlyChecks === -1
              ? " / Unlimited"
              : ` / ${usage.monthlyChecks.toLocaleString()}`}
          </span>
        </div>
        {usage.monthlyChecks !== -1 && (
          <ProgressBar value={checksUsed} max={usage.monthlyChecks} />
        )}
      </div>

      {usage.maxMonitors !== -1 &&
        (usage.monitorCount >= usage.maxMonitors ||
          (usage.monthlyChecks !== -1 && checksUsed >= usage.monthlyChecks)) && (
          <Link
            to="/pricing"
            className="block text-[10px] font-bold uppercase tracking-wider text-[#2d5a2d] hover:underline underline-offset-4"
          >
            Upgrade →
          </Link>
        )}
    </div>
  );
}

function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = Math.min(100, (value / max) * 100);
  const color =
    value >= max
      ? "bg-[#dc2626]"
      : value >= max * 0.8
        ? "bg-[#ca8a04]"
        : "bg-[#2d5a2d]";

  return (
    <div className="w-full h-1.5 bg-[#e8e8e0] border border-[#ccc]">
      <div
        className={`h-full transition-all ${color}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

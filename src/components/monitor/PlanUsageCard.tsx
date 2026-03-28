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
    <div className="border border-gray-200 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Zap className="w-3.5 h-3.5 text-emerald-600" />
        <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
          {usage.planName} Plan
        </span>
      </div>

      {/* Monitors */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-bold uppercase text-gray-500">
            Monitors
          </span>
          <span className="text-xs font-bold text-gray-500">
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
          <span className="text-xs font-bold uppercase text-gray-500">
            Monthly Checks
          </span>
          <span className="text-xs font-bold text-gray-500">
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
            className="block text-xs font-bold uppercase tracking-wider text-emerald-600 hover:underline underline-offset-4"
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
      ? "bg-red-500"
      : value >= max * 0.8
        ? "bg-amber-500"
        : "bg-emerald-600";

  return (
    <div className="w-full h-1.5 bg-gray-50 border border-gray-200 rounded-full overflow-hidden">
      <div
        className={`h-full transition-all ${color}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

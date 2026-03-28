import { Toggle } from "@/components/ui/Toggle";
import { DAYS_OF_WEEK, DELAY_OPTIONS } from "@/lib/monitor-constants";

export function MonitorAdvancedSettings({
  activeDays,
  onActiveDaysChange,
  delay,
  onDelayChange,
  mobileViewport,
  onMobileViewportChange,
  blockAds,
  onBlockAdsChange,
  alertOnError,
  onAlertOnErrorChange,
}: {
  activeDays: number[];
  onActiveDaysChange: (v: number[]) => void;
  delay: number;
  onDelayChange: (v: number) => void;
  mobileViewport: boolean;
  onMobileViewportChange: (v: boolean) => void;
  blockAds: boolean;
  onBlockAdsChange: (v: boolean) => void;
  alertOnError: boolean;
  onAlertOnErrorChange: (v: boolean) => void;
}) {
  return (
    <>
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
                onActiveDaysChange(
                  activeDays.includes(d.value)
                    ? activeDays.filter((v) => v !== d.value)
                    : [...activeDays, d.value]
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
              onClick={() => onDelayChange(d.value)}
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
        <p className="text-xs text-[#888] mt-1">Wait before capturing</p>
      </div>

      {/* Toggles */}
      <div className="space-y-2">
        <Toggle label="Mobile Viewport" checked={mobileViewport} onChange={onMobileViewportChange} />
        <Toggle label="Block Ads" checked={blockAds} onChange={onBlockAdsChange} />
        <Toggle label="Alert on Error" checked={alertOnError} onChange={onAlertOnErrorChange} />
      </div>
    </>
  );
}

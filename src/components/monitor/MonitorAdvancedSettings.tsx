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
        <label className="block text-xs font-bold uppercase text-gray-500 mb-2">
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
              className={`flex-1 border border-gray-200 px-1 py-1.5 text-xs font-bold uppercase transition-all ${
                activeDays.includes(d.value)
                  ? "bg-gray-900 text-white"
                  : "bg-transparent text-gray-900 hover:bg-gray-50"
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {activeDays.length === 0
            ? "All days (default)"
            : `${activeDays.length} day${activeDays.length > 1 ? "s" : ""} selected`}
        </p>
      </div>

      {/* Delay */}
      <div>
        <label className="block text-xs font-bold uppercase text-gray-500 mb-2">
          Page Load Delay
        </label>
        <div className="flex gap-0">
          {DELAY_OPTIONS.map((d, i) => (
            <button
              key={d.value}
              onClick={() => onDelayChange(d.value)}
              className={`flex-1 border border-gray-200 px-2 py-1.5 text-xs font-bold uppercase transition-all ${
                i > 0 ? "border-l-0" : ""
              } ${
                delay === d.value
                  ? "bg-gray-900 text-white"
                  : "bg-transparent text-gray-900 hover:bg-gray-50"
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-1">Wait before capturing</p>
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

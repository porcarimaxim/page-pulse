import { Activity, Eye, Clock, CheckCircle } from "lucide-react";

/**
 * CSS-only monitoring dashboard mockup.
 */
export function DashboardMockup({
  monitors = 3,
}: {
  monitors?: number;
}) {
  const monitorData = [
    { name: "Pricing Page", status: "changed", time: "2m ago", color: "#2d5a2d" },
    { name: "Product Updates", status: "watching", time: "15m ago", color: "#888" },
    { name: "Careers Page", status: "watching", time: "1h ago", color: "#888" },
    { name: "Blog / News", status: "changed", time: "3h ago", color: "#2d5a2d" },
    { name: "Homepage Hero", status: "watching", time: "6h ago", color: "#888" },
  ].slice(0, monitors);

  return (
    <div className="border-2 border-[#1a1a1a] shadow-[8px_8px_0px_0px_#1a1a1a] bg-white">
      {/* Dashboard header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#1a1a1a]">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#f0f0e8]">
          Dashboard
        </span>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Eye className="w-3 h-3 text-[#7cb87c]" />
            <span className="text-[9px] text-[#7cb87c] font-mono">
              {monitors} active
            </span>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 border-b border-[#eee]">
        {[
          { icon: Activity, label: "Changes", value: "12" },
          { icon: Clock, label: "Avg Response", value: "4m" },
          { icon: CheckCircle, label: "Uptime", value: "99.9%" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="px-3 py-2.5 border-r border-[#eee] last:border-r-0 text-center"
          >
            <stat.icon className="w-3 h-3 text-[#2d5a2d] mx-auto mb-1" />
            <div className="text-xs font-black text-[#1a1a1a]">
              {stat.value}
            </div>
            <div className="text-[8px] text-[#888] uppercase tracking-wider">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Monitor list */}
      <div>
        {monitorData.map((m, i) => (
          <div
            key={i}
            className="flex items-center gap-3 px-4 py-2.5 border-b border-[#eee] last:border-b-0"
          >
            <div
              className="w-1.5 h-1.5 shrink-0"
              style={{ backgroundColor: m.color }}
            />
            <span className="text-[10px] font-bold text-[#1a1a1a] flex-1 truncate">
              {m.name}
            </span>
            <span
              className={`text-[8px] uppercase tracking-wider font-bold px-1.5 py-0.5 ${
                m.status === "changed"
                  ? "bg-[#2d5a2d] text-white"
                  : "text-[#888]"
              }`}
            >
              {m.status}
            </span>
            <span className="text-[9px] text-[#888] font-mono">{m.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * A simple timeline showing change history.
 */
export function ChangeTimeline({
  events = 4,
}: {
  events?: number;
}) {
  const timelineData = [
    { label: "Price dropped to $199", time: "Today, 2:34 PM", active: true },
    { label: "New section added", time: "Yesterday, 9:12 AM", active: false },
    { label: "Text content updated", time: "Mar 12, 4:45 PM", active: false },
    { label: "Image replaced", time: "Mar 10, 11:20 AM", active: false },
    { label: "Layout changed", time: "Mar 8, 3:15 PM", active: false },
  ].slice(0, events);

  return (
    <div className="border-2 border-[#1a1a1a] shadow-[8px_8px_0px_0px_#1a1a1a] bg-white p-4">
      <div className="text-[10px] font-bold uppercase tracking-wider text-[#888] mb-3">
        Change History
      </div>
      <div className="space-y-0">
        {timelineData.map((event, i) => (
          <div key={i} className="flex gap-3">
            {/* Timeline line */}
            <div className="flex flex-col items-center">
              <div
                className={`w-2 h-2 shrink-0 ${
                  event.active ? "bg-[#2d5a2d]" : "bg-[#ccc]"
                }`}
              />
              {i < timelineData.length - 1 && (
                <div className="w-px h-8 bg-[#eee]" />
              )}
            </div>
            {/* Content */}
            <div className="pb-4">
              <div className="text-[10px] font-bold text-[#1a1a1a] leading-none">
                {event.label}
              </div>
              <div className="text-[9px] text-[#888] mt-0.5">{event.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

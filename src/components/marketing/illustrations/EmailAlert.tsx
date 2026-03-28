import { Bell } from "lucide-react";

/**
 * CSS-only email/notification alert mockup.
 */
export function EmailAlert({
  subject = "Change Detected",
  preview = "The page you're monitoring has changed.",
  from = "PagePulse Alerts",
  time = "Just now",
}: {
  subject?: string;
  preview?: string;
  from?: string;
  time?: string;
}) {
  return (
    <div className="border border-gray-200 shadow-lg rounded-xl bg-white">
      {/* Notification header */}
      <div className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white">
        <Bell className="w-3.5 h-3.5" />
        <span className="text-[10px] font-bold uppercase tracking-wider">
          Alert
        </span>
        <span className="ml-auto text-xs opacity-70">{time}</span>
      </div>

      {/* Email content */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
            <span className="text-white text-[10px] font-bold">PP</span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-gray-900">{from}</span>
            </div>
            <p className="text-xs font-bold text-gray-900 mb-1">{subject}</p>
            <p className="text-[10px] text-gray-500 leading-relaxed">
              {preview}
            </p>
          </div>
        </div>

        {/* Mini diff preview */}
        <div className="mt-3 border border-[#eee] p-2 space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="w-1 h-1 bg-[#ff4444]" />
            <div className="h-1.5 bg-[#ffcccc] flex-1" />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1 h-1 bg-emerald-600" />
            <div className="h-1.5 bg-[#ccffcc] flex-1" />
          </div>
        </div>

        <div className="mt-3 inline-block border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wider hover:bg-gray-900 hover:text-white transition-colors">
          View Changes
        </div>
      </div>
    </div>
  );
}

/**
 * Shows a stack of multiple notification cards.
 */
export function NotificationStack({
  notifications,
}: {
  notifications: { title: string; time: string; type?: "change" | "alert" }[];
}) {
  return (
    <div className="space-y-2">
      {notifications.map((n, i) => (
        <div
          key={i}
          className="flex items-center gap-3 border border-gray-200 rounded-lg p-3 bg-white"
          style={{
            transform: `translateX(${i * 4}px)`,
          }}
        >
          <div
            className={`w-2 h-2 shrink-0 ${
              n.type === "alert" ? "bg-[#ff4444]" : "bg-emerald-600"
            }`}
          />
          <span className="text-[10px] font-bold text-gray-900 truncate flex-1">
            {n.title}
          </span>
          <span className="text-xs text-gray-500 shrink-0">{n.time}</span>
        </div>
      ))}
    </div>
  );
}

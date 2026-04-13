import { Bell } from "lucide-react";

/**
 * CSS-only email/notification alert mockup.
 */
export function EmailAlert({
  subject = "Change Detected",
  preview = "The page you're monitoring has changed.",
  from = "Snaplert Alerts",
  time = "Just now",
}: {
  subject?: string;
  preview?: string;
  from?: string;
  time?: string;
}) {
  return (
    <div className="border-2 border-[#1a1a1a] shadow-[8px_8px_0px_0px_#1a1a1a] bg-white">
      {/* Notification header */}
      <div className="flex items-center gap-2 px-4 py-2 bg-[#2d5a2d] text-white">
        <Bell className="w-3.5 h-3.5" />
        <span className="text-[10px] font-bold uppercase tracking-wider">
          Alert
        </span>
        <span className="ml-auto text-[9px] opacity-70">{time}</span>
      </div>

      {/* Email content */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-[#2d5a2d] flex items-center justify-center shrink-0 mt-0.5">
            <span className="text-white text-[10px] font-black">SN</span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-[#1a1a1a]">{from}</span>
            </div>
            <p className="text-xs font-bold text-[#1a1a1a] mb-1">{subject}</p>
            <p className="text-[10px] text-[#888] leading-relaxed">
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
            <div className="w-1 h-1 bg-[#2d5a2d]" />
            <div className="h-1.5 bg-[#ccffcc] flex-1" />
          </div>
        </div>

        <div className="mt-3 inline-block border-2 border-[#1a1a1a] px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider hover:bg-[#1a1a1a] hover:text-white transition-colors">
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
          className="flex items-center gap-3 border-2 border-[#1a1a1a] p-3 bg-white"
          style={{
            transform: `translateX(${i * 4}px)`,
          }}
        >
          <div
            className={`w-2 h-2 shrink-0 ${
              n.type === "alert" ? "bg-[#ff4444]" : "bg-[#2d5a2d]"
            }`}
          />
          <span className="text-[10px] font-bold text-[#1a1a1a] truncate flex-1">
            {n.title}
          </span>
          <span className="text-[9px] text-[#888] shrink-0">{n.time}</span>
        </div>
      ))}
    </div>
  );
}

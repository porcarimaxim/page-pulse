export function StatusBadge({
  status,
  className = "",
}: {
  status: string;
  className?: string;
}) {
  return (
    <div
      className={`${className} px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider border ${
        status === "active"
          ? "bg-[#2d5a2d] text-[#f0f0e8] border-[#2d5a2d]"
          : status === "error"
            ? "bg-[#dc2626] text-white border-[#dc2626] animate-pulse"
            : "bg-[#f0f0e8] text-[#888] border-[#ccc]"
      }`}
    >
      {status}
    </div>
  );
}

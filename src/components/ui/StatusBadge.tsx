export function StatusBadge({
  status,
  className = "",
}: {
  status: string;
  className?: string;
}) {
  return (
    <div
      className={`${className} inline-flex items-center gap-1.5 px-2 py-1 text-[10px] font-medium rounded-full ${
        status === "active"
          ? "bg-emerald-50 text-emerald-700"
          : status === "error"
            ? "bg-red-50 text-red-600 animate-pulse"
            : "bg-gray-100 text-gray-500"
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          status === "active"
            ? "bg-emerald-500"
            : status === "error"
              ? "bg-red-500"
              : "bg-gray-400"
        }`}
      />
      {status}
    </div>
  );
}

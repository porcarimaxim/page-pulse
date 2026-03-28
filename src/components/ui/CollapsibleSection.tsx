import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";

export function CollapsibleSection({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <div className="border-t border-gray-200 pt-4 space-y-4">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between group"
      >
        <h3 className="font-semibold text-sm text-gray-700 group-hover:text-emerald-600 transition-colors">
          {title}
        </h3>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && <>{children}</>}
    </div>
  );
}

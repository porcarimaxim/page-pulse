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
    <div className="border-t-2 border-[#ccc] pt-4 space-y-4">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between group"
      >
        <h3 className="font-black text-xs uppercase tracking-tighter group-hover:text-[#2d5a2d] transition-colors">
          {title}
        </h3>
        <ChevronDown
          className={`w-4 h-4 text-[#888] transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && <>{children}</>}
    </div>
  );
}

import { Input } from "@/components/ui/input";
import { KEYWORD_MODES } from "@/lib/monitor-constants";

export function MonitorKeywordsField({
  keywords,
  onKeywordsChange,
  keywordMode,
  onKeywordModeChange,
}: {
  keywords: string;
  onKeywordsChange: (v: string) => void;
  keywordMode: "added" | "deleted" | "any";
  onKeywordModeChange: (v: "added" | "deleted" | "any") => void;
}) {
  return (
    <div>
      <label className="block text-xs font-bold uppercase text-[#888] mb-2">
        Keyword Alerts
      </label>
      <Input
        value={keywords}
        onChange={(e) => onKeywordsChange(e.target.value)}
        placeholder="price, sale, out of stock"
      />
      <p className="text-xs text-[#888] mt-1">
        Comma-separated — only alert when these words change
      </p>
      {keywords.trim() && (
        <div className="mt-2 flex gap-0">
          {KEYWORD_MODES.map((m, i) => (
            <button
              key={m.value}
              onClick={() => onKeywordModeChange(m.value as typeof keywordMode)}
              className={`flex-1 border-2 border-[#1a1a1a] px-2 py-1.5 text-[10px] font-bold uppercase transition-all ${
                i > 0 ? "border-l-0" : ""
              } ${
                keywordMode === m.value
                  ? "bg-[#1a1a1a] text-[#f0f0e8]"
                  : "bg-transparent text-[#1a1a1a] hover:bg-[#e8e8e0]"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

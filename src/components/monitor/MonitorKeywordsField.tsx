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
      <label className="block text-xs font-bold uppercase text-gray-500 mb-2">
        Keyword Alerts
      </label>
      <Input
        value={keywords}
        onChange={(e) => onKeywordsChange(e.target.value)}
        placeholder="price, sale, out of stock"
      />
      <p className="text-xs text-gray-500 mt-1">
        Comma-separated — only alert when these words change
      </p>
      {keywords.trim() && (
        <div className="mt-2 flex gap-0">
          {KEYWORD_MODES.map((m, i) => (
            <button
              key={m.value}
              onClick={() => onKeywordModeChange(m.value as typeof keywordMode)}
              className={`flex-1 border border-gray-200 px-2 py-1.5 text-xs font-bold uppercase transition-all ${
                i > 0 ? "border-l-0" : ""
              } ${
                keywordMode === m.value
                  ? "bg-gray-900 text-white"
                  : "bg-transparent text-gray-900 hover:bg-gray-50"
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

export type Severity = "low" | "medium" | "high";

export function diffSeverity(pct: number): Severity {
  if (pct < 5) return "low";
  if (pct < 20) return "medium";
  return "high";
}

export function severityBg(s: Severity) {
  return s === "low"
    ? "bg-[#2d5a2d]"
    : s === "medium"
      ? "bg-[#ca8a04]"
      : "bg-[#dc2626]";
}

export function severityText(s: Severity) {
  return s === "low"
    ? "text-[#2d5a2d]"
    : s === "medium"
      ? "text-[#ca8a04]"
      : "text-[#dc2626]";
}

export function severityColor(s: Severity) {
  return {
    bg: severityBg(s),
    text: severityText(s),
    border: s === "low"
      ? "border-[#2d5a2d]"
      : s === "medium"
        ? "border-[#ca8a04]"
        : "border-[#dc2626]",
  };
}

export function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className="flex items-center justify-between cursor-pointer group w-full"
    >
      <span className="text-xs font-bold uppercase text-[#888] group-hover:text-[#1a1a1a] transition-colors">
        {label}
      </span>
      <span
        className={`w-8 h-5 border-2 border-[#1a1a1a] flex items-center transition-colors ${
          checked ? "bg-[#2d5a2d]" : "bg-transparent"
        }`}
      >
        <span
          className={`w-3 h-3 transition-transform ${
            checked
              ? "translate-x-3 bg-[#f0f0e8]"
              : "translate-x-0.5 bg-[#1a1a1a]"
          }`}
        />
      </span>
    </button>
  );
}

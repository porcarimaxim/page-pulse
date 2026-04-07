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
      <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
        {label}
      </span>
      <span
        className={`w-9 h-5 rounded-full flex items-center transition-colors ${
          checked ? "bg-emerald-600" : "bg-gray-200"
        }`}
      >
        <span
          className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
            checked
              ? "translate-x-4.5"
              : "translate-x-0.5"
          }`}
        />
      </span>
    </button>
  );
}

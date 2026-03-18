import { useState } from "react";

/**
 * Interactive before/after diff slider.
 * Draggable divider showing original vs diff-highlighted version.
 */
export function DiffSlider() {
  const [position, setPosition] = useState(50);

  return (
    <div
      className="relative w-full h-full min-h-[200px] border-2 border-[#1a1a1a] overflow-hidden cursor-col-resize select-none bg-white"
      onMouseMove={(e) => {
        if (e.buttons === 1) {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * 100;
          setPosition(Math.max(10, Math.min(90, x)));
        }
      }}
      onTouchMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x =
          ((e.touches[0].clientX - rect.left) / rect.width) * 100;
        setPosition(Math.max(10, Math.min(90, x)));
      }}
    >
      {/* "After" layer (full width, underneath) */}
      <div className="absolute inset-0 p-4 md:p-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-16 h-3 bg-[#1a1a1a]" />
          <div className="ml-auto flex gap-2">
            <div className="w-8 h-2 bg-[#ddd]" />
            <div className="w-8 h-2 bg-[#ddd]" />
          </div>
        </div>
        <div className="space-y-2 mb-4">
          <div className="h-2.5 bg-[#eee] w-[65%]" />
          <div className="h-2 bg-[#eee] w-[80%]" />
        </div>
        {/* Changed area - highlighted green */}
        <div className="border-2 border-[#2d5a2d] bg-[#2d5a2d]/5 p-3 mb-3">
          <div className="space-y-1.5">
            <div className="h-2 bg-[#ccffcc] w-[75%]" />
            <div className="h-2 bg-[#ccffcc] w-[55%]" />
          </div>
          <div className="mt-2 flex items-center gap-2">
            <div className="h-5 px-2 bg-[#ccffcc] flex items-center">
              <span className="text-[8px] font-mono text-[#2d5a2d] font-bold">
                $39/mo
              </span>
            </div>
            <span className="text-[7px] font-bold text-[#2d5a2d] uppercase tracking-wider">
              New
            </span>
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-2 bg-[#eee] w-[90%]" />
          <div className="h-2 bg-[#eee] w-[70%]" />
          <div className="h-2 bg-[#eee] w-[85%]" />
        </div>
      </div>

      {/* "Before" layer (clipped to left of slider) */}
      <div
        className="absolute inset-0 p-4 md:p-6 bg-white"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="w-16 h-3 bg-[#1a1a1a]" />
          <div className="ml-auto flex gap-2">
            <div className="w-8 h-2 bg-[#ddd]" />
            <div className="w-8 h-2 bg-[#ddd]" />
          </div>
        </div>
        <div className="space-y-2 mb-4">
          <div className="h-2.5 bg-[#eee] w-[65%]" />
          <div className="h-2 bg-[#eee] w-[80%]" />
        </div>
        {/* Original area - no highlight */}
        <div className="p-3 mb-3 border-2 border-transparent">
          <div className="space-y-1.5">
            <div className="h-2 bg-[#eee] w-[75%]" />
            <div className="h-2 bg-[#eee] w-[55%]" />
          </div>
          <div className="mt-2 flex items-center gap-2">
            <div className="h-5 px-2 bg-[#eee] flex items-center">
              <span className="text-[8px] font-mono text-[#888]">$49/mo</span>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-2 bg-[#eee] w-[90%]" />
          <div className="h-2 bg-[#eee] w-[70%]" />
          <div className="h-2 bg-[#eee] w-[85%]" />
        </div>
      </div>

      {/* Slider handle */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-[#1a1a1a] z-10"
        style={{ left: `${position}%` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-[#1a1a1a] flex items-center justify-center">
          <span className="text-[#f0f0e8] text-[10px] font-bold">⟨⟩</span>
        </div>
      </div>

      {/* Labels */}
      <div className="absolute top-2 left-2 px-2 py-0.5 bg-[#1a1a1a] text-[#f0f0e8] text-[8px] font-bold uppercase tracking-wider z-20">
        Before
      </div>
      <div className="absolute top-2 right-2 px-2 py-0.5 bg-[#2d5a2d] text-[#f0f0e8] text-[8px] font-bold uppercase tracking-wider z-20">
        After
      </div>
    </div>
  );
}

/**
 * Element picker illustration - browser mockup with selection rectangle.
 */
export function ElementPicker() {
  return (
    <div className="border-2 border-[#1a1a1a] overflow-hidden bg-white">
      {/* Browser chrome */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-[#1a1a1a]">
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-[#ff5f57]" />
          <div className="w-2 h-2 bg-[#febc2e]" />
          <div className="w-2 h-2 bg-[#28c840]" />
        </div>
        <div className="flex-1 mx-2 px-2 py-0.5 bg-[#333] text-[9px] font-mono text-[#888]">
          shop.example.com/product
        </div>
      </div>

      {/* Page content */}
      <div className="p-4 relative">
        {/* Product layout */}
        <div className="flex gap-4">
          {/* Image placeholder */}
          <div className="w-24 h-20 bg-[#f5f5f0] border border-[#eee] flex items-center justify-center shrink-0">
            <div className="w-10 h-10 border-2 border-[#ddd]" />
          </div>
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-[#1a1a1a] w-[80%]" />
            <div className="h-2 bg-[#eee] w-[60%]" />
            {/* Selected element with dashed border */}
            <div className="relative border-2 border-dashed border-[#2d5a2d] bg-[#2d5a2d]/5 p-2 mt-1">
              <div className="h-5 bg-[#1a1a1a] w-16 flex items-center justify-center">
                <span className="text-[9px] font-bold text-white">$149</span>
              </div>
              {/* Selection tooltip */}
              <div className="absolute -top-6 left-0 px-2 py-0.5 bg-[#2d5a2d] text-[7px] font-mono text-white whitespace-nowrap">
                .product-price
              </div>
              {/* Corner handles */}
              <div className="absolute -top-1 -left-1 w-2 h-2 bg-[#2d5a2d]" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#2d5a2d]" />
              <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-[#2d5a2d]" />
              <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-[#2d5a2d]" />
            </div>
            <div className="h-2 bg-[#eee] w-[90%]" />
            <div className="h-2 bg-[#eee] w-[70%]" />
          </div>
        </div>

        {/* Cursor */}
        <div className="absolute bottom-6 right-12">
          <svg
            width="16"
            height="20"
            viewBox="0 0 16 20"
            fill="none"
            className="drop-shadow-sm"
          >
            <path d="M0 0L16 12L8 12L12 20L8 18L4 12L0 16V0Z" fill="#1a1a1a" />
            <path d="M0 0L16 12L8 12L12 20L8 18L4 12L0 16V0Z" stroke="white" strokeWidth="1" />
          </svg>
        </div>
      </div>
    </div>
  );
}

/**
 * Frequency selector UI mockup.
 */
export function FrequencySelector() {
  const [selected, setSelected] = useState(0);
  const frequencies = [
    { label: "5 MIN", sublabel: "Real-time", checks: "8,640/mo" },
    { label: "HOURLY", sublabel: "Standard", checks: "720/mo" },
    { label: "DAILY", sublabel: "Low priority", checks: "30/mo" },
    { label: "WEEKLY", sublabel: "Minimal", checks: "4/mo" },
  ];

  return (
    <div className="border-2 border-[#1a1a1a] bg-white overflow-hidden">
      <div className="px-4 py-2.5 bg-[#1a1a1a] text-[9px] font-bold uppercase tracking-wider text-[#f0f0e8]">
        Check Frequency
      </div>
      <div className="p-4 space-y-2">
        {frequencies.map((freq, i) => (
          <button
            key={freq.label}
            onClick={() => setSelected(i)}
            className={`w-full flex items-center gap-3 p-3 border-2 transition-all text-left ${
              selected === i
                ? "border-[#2d5a2d] bg-[#2d5a2d]/5"
                : "border-[#eee] hover:border-[#ccc]"
            }`}
          >
            <div
              className={`w-3 h-3 border-2 shrink-0 flex items-center justify-center ${
                selected === i ? "border-[#2d5a2d] bg-[#2d5a2d]" : "border-[#ccc]"
              }`}
            >
              {selected === i && (
                <div className="w-1.5 h-1.5 bg-white" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-black uppercase tracking-wider text-[#1a1a1a]">
                {freq.label}
              </div>
              <div className="text-[9px] text-[#888]">{freq.sublabel}</div>
            </div>
            <div className="text-[9px] font-mono text-[#888]">
              {freq.checks}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Rich email alert mockup showing what a PagePulse notification looks like.
 */
export function AlertEmailMockup() {
  return (
    <div className="border-2 border-[#1a1a1a] bg-[#f5f5f0] overflow-hidden">
      {/* Email app chrome */}
      <div className="px-3 py-2 bg-[#1a1a1a] flex items-center gap-2">
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-[#ff5f57]" />
          <div className="w-2 h-2 bg-[#febc2e]" />
          <div className="w-2 h-2 bg-[#28c840]" />
        </div>
        <div className="text-[9px] text-[#888] font-mono ml-2">Inbox — 1 new</div>
      </div>

      <div className="bg-white m-3 border border-[#eee]">
        {/* Email header */}
        <div className="p-3 border-b border-[#eee]">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-5 h-5 bg-[#2d5a2d] flex items-center justify-center shrink-0">
              <span className="text-[7px] font-black text-white">PP</span>
            </div>
            <span className="text-[10px] font-bold">PagePulse</span>
            <span className="text-[9px] text-[#888] ml-auto">2 min ago</span>
          </div>
          <div className="text-xs font-black text-[#1a1a1a]">
            Change Detected: competitor-site.com/pricing
          </div>
        </div>

        {/* Email body */}
        <div className="p-3">
          <div className="text-[9px] text-[#666] mb-3">
            We detected a change on a page you're monitoring.
          </div>

          {/* Before/After thumbnails */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div>
              <div className="text-[7px] font-bold uppercase tracking-wider text-[#888] mb-1">
                Before
              </div>
              <div className="border border-[#eee] bg-[#fff8f8] p-2 space-y-1">
                <div className="h-1.5 bg-[#ffcccc] w-[80%]" />
                <div className="h-1.5 bg-[#eee] w-[60%]" />
                <div className="h-3 bg-[#ffcccc] w-[40%] flex items-center justify-center">
                  <span className="text-[6px] font-mono text-[#cc0000] line-through">
                    $49
                  </span>
                </div>
              </div>
            </div>
            <div>
              <div className="text-[7px] font-bold uppercase tracking-wider text-[#2d5a2d] mb-1">
                After
              </div>
              <div className="border border-[#eee] bg-[#f8fff8] p-2 space-y-1">
                <div className="h-1.5 bg-[#ccffcc] w-[80%]" />
                <div className="h-1.5 bg-[#eee] w-[65%]" />
                <div className="h-3 bg-[#ccffcc] w-[40%] flex items-center justify-center">
                  <span className="text-[6px] font-mono text-[#2d5a2d] font-bold">
                    $39
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Diff badge */}
          <div className="flex items-center gap-2 mb-3">
            <div className="px-2 py-0.5 bg-[#2d5a2d] text-white text-[8px] font-bold">
              12% CHANGED
            </div>
            <span className="text-[8px] text-[#888]">
              Zone: .pricing-section
            </span>
          </div>

          {/* CTA */}
          <div className="inline-block bg-[#1a1a1a] text-white px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider">
            View Full Comparison →
          </div>
        </div>
      </div>
    </div>
  );
}

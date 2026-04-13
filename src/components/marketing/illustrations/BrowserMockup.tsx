/**
 * Polished CSS-only browser window mockup.
 * Designed to look like a real product UI screenshot.
 */
export function BrowserMockup({
  url = "snaplert.com",
  children,
  className = "",
}: {
  url?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`border-2 border-[#1a1a1a] shadow-[6px_6px_0px_0px_#1a1a1a] ${className}`}
    >
      <div className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a]">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 bg-[#ff5f57]" />
          <div className="w-2.5 h-2.5 bg-[#febc2e]" />
          <div className="w-2.5 h-2.5 bg-[#28c840]" />
        </div>
        <div className="flex-1 mx-3 px-3 py-1 bg-[#333] text-[10px] font-mono text-[#888] truncate">
          {url}
        </div>
      </div>
      <div className="bg-white">{children}</div>
    </div>
  );
}

/**
 * Rich product-like hero illustration showing layered UI:
 * A browser window with an overlay notification card and change highlight.
 */
export function HeroIllustration({
  useCaseTitle,
}: {
  useCaseTitle: string;
}) {
  return (
    <div className="relative">
      {/* Main browser window */}
      <BrowserMockup url="competitor-site.com/pricing">
        <div className="p-5 space-y-3">
          {/* Fake page header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#eee]">
            <div className="w-24 h-4 bg-[#1a1a1a]" />
            <div className="flex gap-4">
              <div className="w-12 h-2 bg-[#ddd]" />
              <div className="w-12 h-2 bg-[#ddd]" />
              <div className="w-12 h-2 bg-[#ddd]" />
            </div>
          </div>
          {/* Content with highlighted change area */}
          <div className="space-y-2 pt-1">
            <div className="h-3 bg-[#eee] w-[70%]" />
            <div className="h-2 bg-[#eee] w-[90%]" />
            <div className="h-2 bg-[#eee] w-[75%]" />
          </div>
          {/* Highlighted change zone */}
          <div className="border-2 border-dashed border-[#2d5a2d] bg-[#2d5a2d]/5 p-3 relative">
            <div className="absolute -top-2.5 left-3 px-2 bg-white text-[8px] font-bold text-[#2d5a2d] uppercase tracking-wider">
              Change Detected
            </div>
            <div className="space-y-1.5">
              <div className="h-2 bg-[#ccffcc] w-[80%]" />
              <div className="h-2 bg-[#ccffcc] w-[60%]" />
            </div>
            <div className="mt-2 flex items-center gap-2">
              <div className="h-5 px-2 bg-[#ffcccc] flex items-center">
                <span className="text-[8px] font-mono text-[#cc0000] line-through">$49/mo</span>
              </div>
              <span className="text-[10px] text-[#888]">→</span>
              <div className="h-5 px-2 bg-[#ccffcc] flex items-center">
                <span className="text-[8px] font-mono text-[#2d5a2d] font-bold">$39/mo</span>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-2 bg-[#eee] w-[85%]" />
            <div className="h-2 bg-[#eee] w-[65%]" />
          </div>
        </div>
      </BrowserMockup>

      {/* Floating notification card */}
      <div className="absolute -bottom-6 -left-4 md:-left-8 border-2 border-[#1a1a1a] bg-white shadow-[4px_4px_0px_0px_#1a1a1a] p-3 max-w-[220px]">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-5 h-5 bg-[#2d5a2d] flex items-center justify-center shrink-0">
            <span className="text-[7px] font-black text-white">SN</span>
          </div>
          <div>
            <div className="text-[9px] font-bold text-[#1a1a1a]">Snaplert Alert</div>
            <div className="text-[8px] text-[#888]">Just now</div>
          </div>
        </div>
        <p className="text-[9px] text-[#555] leading-relaxed">
          <span className="font-bold text-[#2d5a2d]">AI Summary:</span>{" "}
          {useCaseTitle} page updated — pricing reduced by 20%. New feature tier added.
        </p>
      </div>
    </div>
  );
}

/**
 * Before/after diff view with polished styling.
 */
export function DiffView({
  beforeLabel = "Before",
  afterLabel = "After",
}: {
  beforeLabel?: string;
  afterLabel?: string;
}) {
  return (
    <div className="border-2 border-[#1a1a1a] shadow-[6px_6px_0px_0px_#1a1a1a]">
      <div className="grid grid-cols-2">
        <div className="border-r border-[#1a1a1a]">
          <div className="px-3 py-1.5 bg-[#1a1a1a] text-[9px] font-bold uppercase tracking-wider text-[#888]">
            {beforeLabel}
          </div>
          <div className="p-3 space-y-2 bg-[#fff8f8]">
            <div className="h-2 bg-[#ffcccc] w-[80%]" />
            <div className="h-2 bg-[#ffcccc] w-[60%]" />
            <div className="h-2 bg-[#eee] w-[90%]" />
            <div className="h-2 bg-[#eee] w-[70%]" />
            <div className="h-6 bg-[#ffcccc] w-[40%] flex items-center justify-center">
              <span className="text-[8px] font-mono text-[#cc0000] line-through">
                $299
              </span>
            </div>
          </div>
        </div>
        <div>
          <div className="px-3 py-1.5 bg-[#1a1a1a] text-[9px] font-bold uppercase tracking-wider text-[#888]">
            {afterLabel}
          </div>
          <div className="p-3 space-y-2 bg-[#f8fff8]">
            <div className="h-2 bg-[#ccffcc] w-[80%]" />
            <div className="h-2 bg-[#ccffcc] w-[65%]" />
            <div className="h-2 bg-[#eee] w-[90%]" />
            <div className="h-2 bg-[#eee] w-[70%]" />
            <div className="h-6 bg-[#ccffcc] w-[40%] flex items-center justify-center">
              <span className="text-[8px] font-mono text-[#2d5a2d] font-bold">
                $199
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Unused — keeping for backwards compat.
 */
export function WebpageWithHighlight({
  siteName,
  highlightLabel,
  lines,
}: {
  siteName: string;
  highlightLabel?: string;
  lines?: number;
}) {
  return <HeroIllustration useCaseTitle={siteName} />;
}

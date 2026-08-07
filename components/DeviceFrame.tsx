import type { ReactNode } from "react";

export type DeviceVariant = "browser" | "phone";

/**
 * Wraps a project screenshot in device chrome so the work feed reads as
 * shipped software rather than flat images.
 *
 * Both variants own their outer border and pick up the parent block's
 * `group-hover` accent, so a caller only supplies the screen content. That
 * content is positioned absolutely against the screen area, so it should be
 * a `next/image` with `fill` or an equivalently absolute element.
 *
 * Corners: the browser frame stays square to match the site's hard-edged
 * language; the phone bezel is the one rounded element on the page, since a
 * square-cornered phone doesn't read as a phone.
 */
export default function DeviceFrame({
  variant,
  domain,
  children,
}: {
  variant: DeviceVariant;
  /** Address-bar text for the browser variant. Ignored by "phone". */
  domain?: string;
  children: ReactNode;
}) {
  if (variant === "phone") {
    return (
      // Stage: keeps the bordered footprint consistent with browser blocks
      // and gives the narrow portrait device room to breathe.
      <div className="flex justify-center border border-steel/40 bg-panel/40 px-6 py-12 transition-colors duration-300 group-hover:border-phosphor">
        <div className="w-full max-w-[15rem] rounded-[2rem] border border-steel bg-panel p-2 shadow-[0_0_0_1px_rgba(11,11,10,0.6)_inset] sm:max-w-[16rem]">
          <div className="relative aspect-[9/19.5] w-full overflow-hidden rounded-[1.6rem] bg-ink">
            {children}
            {/* Dynamic island — ink-on-screenshot cutout */}
            <div
              aria-hidden="true"
              className="absolute left-1/2 top-[0.55rem] z-10 h-[1.1rem] w-[4.5rem] -translate-x-1/2 rounded-full bg-ink"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden border border-steel/40 bg-panel transition-colors duration-300 group-hover:border-phosphor">
      <div className="flex h-9 items-center gap-3 border-b border-steel/40 px-3">
        <div aria-hidden="true" className="flex shrink-0 items-center gap-1.5">
          <span className="block h-2 w-2 rounded-full bg-steel" />
          <span className="block h-2 w-2 rounded-full bg-steel" />
          <span className="block h-2 w-2 rounded-full bg-steel" />
        </div>
        <div className="flex h-5 min-w-0 flex-1 items-center border border-steel/50 bg-ink px-2">
          <span className="truncate font-mono text-[0.6875rem] leading-none tracking-[0.08em] text-paper/40">
            {domain ?? ""}
          </span>
        </div>
      </div>

      {/*
        1.93:1, not 16:9 — that's the content aspect of a full-window macOS
        browser screenshot, which is what every site shot in /public/work is.
        Matching it means object-cover has nothing to crop, so edge-anchored
        nav items (VoiceLocal's "Buy", Holy Beliefs' cart) stay in frame.
      */}
      <div className="relative aspect-[193/100] w-full overflow-hidden bg-ink">
        {children}
      </div>
    </div>
  );
}

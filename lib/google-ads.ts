/**
 * Google Ads conversion tracking.
 *
 * Base tag (AW-…) loads in app/layout.tsx. ContactForm calls
 * trackGoogleAdsConversion() only after /api/contact returns OK.
 *
 * CONVERSION_LABEL: replace with the label from Google Ads → Goals →
 * Conversions → the conversion action → Tag setup. Until then the helper
 * still calls gtag with the placeholder send_to so the wiring is testable
 * in Tag Assistant; swap the string before relying on Ads reporting.
 */
export const GOOGLE_ADS_ID = "AW-18376948373";

/** Paste the real conversion label here (e.g. "AbCdEfGhIjKlMnOp"). */
export const GOOGLE_ADS_CONVERSION_LABEL = "CONVERSION_LABEL";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/** Fire the configured Google Ads conversion event, if gtag is available. */
export function trackGoogleAdsConversion(): void {
  if (typeof window === "undefined") return;
  if (typeof window.gtag !== "function") return;

  window.gtag("event", "conversion", {
    send_to: `${GOOGLE_ADS_ID}/${GOOGLE_ADS_CONVERSION_LABEL}`,
  });
}

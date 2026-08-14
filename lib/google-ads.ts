/**
 * Google Ads conversion tracking.
 *
 * Base tag (AW-…) shares gtag.js with GA4 in app/layout.tsx. ContactForm and
 * QuoteBuilder call trackGoogleAdsConversion() only after /api/contact
 * returns OK.
 *
 * Conversion label comes from Google Ads → Goals → Conversions → the
 * conversion action → Tag setup. It looks like a short token after the slash
 * in send_to (e.g. AW-18376948373/AbCdEfGhIjKlMnOp → label is AbCdEfGhIjKlMnOp).
 *
 * Prefer NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL in Vercel so you can rotate
 * it without a code change. The constant below is the code fallback.
 */
export const GOOGLE_ADS_ID = "AW-18376948373";

/**
 * Fallback only — set NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL in Vercel
 * (or .env.local) to the real label from Google Ads Tag setup.
 */
export const GOOGLE_ADS_CONVERSION_LABEL_FALLBACK = "";

export function googleAdsConversionLabel(): string {
  return (
    process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL?.trim() ||
    GOOGLE_ADS_CONVERSION_LABEL_FALLBACK
  );
}

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Fire the Google Ads conversion event once a form has actually succeeded.
 *
 * - No-ops if the conversion label isn't configured yet (placeholder would
 *   never report in Ads and would only pollute Tag Assistant).
 * - Queues briefly if gtag hasn't finished loading; abandons after ~3s so a
 *   permanently blocked script can't hang the success UI.
 */
export function trackGoogleAdsConversion(): void {
  if (typeof window === "undefined") return;

  const label = googleAdsConversionLabel();
  if (!label || label === "CONVERSION_LABEL") {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "[google-ads] Skipping conversion — set NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL"
      );
    }
    return;
  }

  const send_to = `${GOOGLE_ADS_ID}/${label}`;

  const fire = () => {
    if (typeof window.gtag !== "function") return false;
    window.gtag("event", "conversion", { send_to });
    return true;
  };

  if (fire()) return;

  const started = Date.now();
  const timer = window.setInterval(() => {
    if (fire() || Date.now() - started > 3000) {
      window.clearInterval(timer);
    }
  }, 100);
}

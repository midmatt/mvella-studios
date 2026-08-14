/**
 * Shared cookie-consent helpers for Consent Mode v2.
 *
 * Layout injects GOOGLE_CONSENT_DEFAULT_SCRIPT before gtag.js so the default
 * is denied on first paint. CookieConsentBanner reads/writes the same key and
 * payload so the stored choice cannot drift from what Google receives.
 */

export const COOKIE_CONSENT_KEY = "cookie-consent";

export type CookieConsentValue = "accepted" | "rejected";

export const CONSENT_DENIED = {
  ad_storage: "denied",
  analytics_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied",
} as const;

export const CONSENT_GRANTED = {
  ad_storage: "granted",
  analytics_storage: "granted",
  ad_user_data: "granted",
  ad_personalization: "granted",
} as const;

export const COOKIE_CONSENT_CHANGE_EVENT = "cookie-consent-change";

/** Inline script: default denied + restore granted from localStorage. Runs before gtag.js. */
export const GOOGLE_CONSENT_DEFAULT_SCRIPT = `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('consent', 'default', ${JSON.stringify({
  ...CONSENT_DENIED,
  wait_for_update: 500,
})});
try {
  if (localStorage.getItem(${JSON.stringify(COOKIE_CONSENT_KEY)}) === 'accepted') {
    gtag('consent', 'update', ${JSON.stringify(CONSENT_GRANTED)});
  }
} catch (e) {}
`.trim();

export function getStoredCookieConsent(): CookieConsentValue | null {
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(COOKIE_CONSENT_KEY);
    if (value === "accepted" || value === "rejected") return value;
  } catch {
    // private mode / blocked storage
  }
  return null;
}

export function storeCookieConsent(value: CookieConsentValue): void {
  try {
    window.localStorage.setItem(COOKIE_CONSENT_KEY, value);
  } catch {
    // private mode / blocked storage — still apply this session
  }
  window.dispatchEvent(new Event(COOKIE_CONSENT_CHANGE_EVENT));
}

/**
 * Queue a Consent Mode update even if gtag.js has not loaded yet.
 * Uses the same arguments-object stub as Google's snippet (not a rest-array push).
 */
export function updateGoogleConsent(
  state: typeof CONSENT_GRANTED | typeof CONSENT_DENIED
): void {
  if (typeof window === "undefined") return;

  window.dataLayer = window.dataLayer || [];

  if (typeof window.gtag !== "function") {
    window.gtag = function gtag() {
      // Google's stub pushes the Arguments object, not a rest-parameter array.
      window.dataLayer!.push(arguments);
    };
  }

  window.gtag("consent", "update", state);
}

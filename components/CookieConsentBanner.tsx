"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  CONSENT_DENIED,
  CONSENT_GRANTED,
  getStoredCookieConsent,
  storeCookieConsent,
  updateGoogleConsent,
} from "@/lib/cookie-consent";

/**
 * GDPR opt-in banner. Hidden when localStorage already has accepted|rejected.
 * Consent Mode default denied is set in layout before gtag.js — this component
 * only updates, persists, and shows UI.
 */
export default function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = getStoredCookieConsent();
    if (stored === "accepted") {
      updateGoogleConsent(CONSENT_GRANTED);
      return;
    }
    if (stored === "rejected") {
      return;
    }
    setVisible(true);
  }, []);

  const accept = () => {
    updateGoogleConsent(CONSENT_GRANTED);
    storeCookieConsent("accepted");
    setVisible(false);
  };

  const reject = () => {
    updateGoogleConsent(CONSENT_DENIED);
    storeCookieConsent("rejected");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-0 z-[70] border-t border-steel/40 bg-ink/95 px-4 pt-4 backdrop-blur-md md:px-6"
      style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-8">
        <div className="min-w-0">
          <p className="eyebrow eyebrow--slash">Cookies</p>
          <p className="mt-2 text-sm leading-relaxed text-paper/70 md:text-body">
            Analytics and ad cookies stay off until you choose.{" "}
            <Link
              href="/legal"
              className="text-paper underline decoration-steel underline-offset-4 transition-colors hover:text-phosphor hover:decoration-phosphor"
            >
              Privacy
            </Link>
          </p>
        </div>

        <div className="flex shrink-0 gap-3">
          <button
            type="button"
            onClick={reject}
            className="mono-label flex-1 border border-steel px-5 py-3 text-paper/80 transition-colors hover:border-paper hover:text-paper md:flex-none"
          >
            Reject
          </button>
          <button
            type="button"
            onClick={accept}
            className="mono-label flex-1 bg-phosphor px-5 py-3 text-ink transition-colors hover:bg-paper md:flex-none"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}

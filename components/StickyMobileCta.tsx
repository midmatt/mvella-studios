"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  COOKIE_CONSENT_CHANGE_EVENT,
  getStoredCookieConsent,
} from "@/lib/cookie-consent";

/**
 * Fixed bottom CTA for small screens only. Hidden on /contact and the
 * thank-you route so it never stacks on top of the form or the post-submit
 * confirmation. Also hidden on /ai-systems so the demo is not pulled into
 * the production contact pipeline. Safe-area padding clears the iOS home
 * indicator.
 *
 * Also hidden while the cookie banner is up (z-[70]) so the two bars
 * don't fight for the bottom edge.
 */
export default function StickyMobileCta() {
  const pathname = usePathname();
  const [consentBannerOpen, setConsentBannerOpen] = useState(false);
  const hidden =
    pathname === "/contact" ||
    pathname === "/contact/thank-you" ||
    pathname.startsWith("/contact/thank-you") ||
    pathname === "/support" ||
    pathname === "/feedback" ||
    pathname === "/hiring" ||
    pathname.startsWith("/ai-systems");

  useEffect(() => {
    const sync = () => setConsentBannerOpen(getStoredCookieConsent() === null);
    sync();
    window.addEventListener(COOKIE_CONSENT_CHANGE_EVENT, sync);
    return () => window.removeEventListener(COOKIE_CONSENT_CHANGE_EVENT, sync);
  }, []);

  if (hidden || consentBannerOpen) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[60] border-t border-steel/40 bg-ink/95 px-4 pt-3 backdrop-blur-md md:hidden"
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      <Link
        href="/contact"
        className="mono-label flex w-full items-center justify-center bg-phosphor px-6 py-3 text-ink transition-colors hover:bg-paper"
      >
        Start a Project
      </Link>
    </div>
  );
}

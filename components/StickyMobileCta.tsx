"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Fixed bottom CTA for small screens only. Hidden on /contact and the
 * thank-you route so it never stacks on top of the form or the post-submit
 * confirmation. Safe-area padding clears the iOS home indicator.
 */
export default function StickyMobileCta() {
  const pathname = usePathname();
  const hidden =
    pathname === "/contact" ||
    pathname === "/contact/thank-you" ||
    pathname.startsWith("/contact/thank-you");

  if (hidden) return null;

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

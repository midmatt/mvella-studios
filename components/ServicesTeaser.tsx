import type { ReactNode } from "react";
import Link from "next/link";
import { services } from "@/lib/services";

/**
 * Homepage services section — restyled to the reference's numbered card grid:
 * icon, title, one-liner, and a large faded index with a phosphor corner-cut.
 * The full cards, with descriptions and deliverables, live at /services.
 */

/** One glyph per service slug — inline so there's no icon dependency. */
const ICONS: Record<string, ReactNode> = {
  "web-development": (
    <path d="M8 6 2 12l6 6M16 6l6 6-6 6M13 4l-2 16" />
  ),
  "mobile-apps": (
    <>
      <rect x="7" y="2" width="10" height="20" rx="2" />
      <path d="M11 18h2" />
    </>
  ),
  "security-architecture": (
    <path d="M12 2 4 5v6c0 5 3.5 8.5 8 11 4.5-2.5 8-6 8-11V5l-8-3Z" />
  ),
  "seo-performance": (
    <>
      <path d="M12 12v-8" />
      <path d="M12 12 16 8" />
      <path d="M20.5 15a9 9 0 1 0-17 0" />
    </>
  ),
  "ai-systems": (
    <>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
    </>
  ),
};

export default function ServicesTeaser() {
  return (
    <section
      id="services"
      aria-label="Services"
      className="border-t border-steel/40 bg-ink"
    >
      <div className="mx-auto max-w-6xl px-6 py-24">
        <p className="eyebrow eyebrow--slash">What I do</p>
        <h2 className="mt-4 font-display text-h2 uppercase text-paper">
          Services<span className="text-phosphor">.</span>
        </h2>

        {/* gap-px over a steel wash = hairline divider grid */}
        <ul className="mt-14 grid gap-px overflow-hidden border border-steel/40 bg-steel/40 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, i) => {
            const href = service.href ?? `/services#${service.slug}`;
            return (
              <li key={service.slug}>
                <Link
                  href={href}
                  className="accent-corner group relative flex h-full flex-col bg-panel p-7 transition-colors duration-300 hover:bg-panel-raised"
                >
                  <svg
                    width="30"
                    height="30"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-phosphor"
                    aria-hidden="true"
                  >
                    {ICONS[service.slug]}
                  </svg>

                  <h3 className="mt-8 font-display text-h3 text-paper">
                    {service.title}
                  </h3>
                  <p className="mt-3 flex-1 text-[0.95rem] leading-relaxed text-paper/60">
                    {service.teaser}
                  </p>

                  <span
                    aria-hidden="true"
                    className="pointer-events-none mt-8 font-display text-5xl font-bold leading-none text-paper/10 transition-colors duration-300 group-hover:text-phosphor/25"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>

        <Link
          href="/services"
          className="mono-label mt-10 inline-block border border-steel px-6 py-3 text-paper transition-colors hover:border-phosphor hover:text-phosphor"
        >
          See Packages &amp; Pricing &rarr;
        </Link>
      </div>
    </section>
  );
}

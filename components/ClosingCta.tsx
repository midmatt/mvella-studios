import Link from "next/link";
import { DIRECT_EMAIL } from "@/lib/contact";

/**
 * Homepage closing section — restyled to the reference's "Have a Project in
 * Mind?" block: an angular phosphor panel with the headline and CTA on the
 * left, and a dark contact-detail panel on the right.
 */
const DETAILS = [
  { label: "Email", value: DIRECT_EMAIL, href: `mailto:${DIRECT_EMAIL}`, icon: <path d="M2 6h20v12H2zM2 7l10 7 10-7" /> },
  { label: "Location", value: "South Florida, USA", icon: <><path d="M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11Z" /><circle cx="12" cy="10" r="2.5" /></> },
  { label: "Response Time", value: "Within 24 hours", icon: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></> },
];

export default function ClosingCta() {
  return (
    <section
      id="contact"
      aria-label="Start a project"
      className="border-t border-steel/40 bg-ink"
    >
      <div className="mx-auto max-w-6xl px-6 py-24">
        <div className="grid overflow-hidden border border-steel/40 lg:grid-cols-[1.05fr_0.95fr]">
          {/* Left — angular phosphor panel */}
          <div className="relative overflow-hidden bg-phosphor p-10 md:p-14">
            <div
              aria-hidden="true"
              className="absolute -right-10 top-0 h-full w-24 bg-ink/10"
              style={{ clipPath: "polygon(40% 0, 100% 0, 60% 100%, 0 100%)" }}
            />
            <p className="font-mono text-label uppercase tracking-[0.18em] text-ink/60">
              Let&rsquo;s work together //////
            </p>
            <p className="mt-5 max-w-md font-display text-h2 uppercase leading-[1.05] text-ink">
              Have a project in mind<span className="text-ink/50">?</span>
            </p>
            <p className="mt-5 max-w-sm text-body text-ink/70">
              I&rsquo;m currently available for freelance work. Tell me what
              you&rsquo;re building and let&rsquo;s ship it.
            </p>
            <Link
              href="/contact"
              className="mono-label mt-8 inline-flex items-center gap-2 bg-ink px-6 py-3 text-paper transition-colors hover:bg-panel-raised"
            >
              Get In Touch
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M7 17 17 7M9 7h8v8" />
              </svg>
            </Link>
          </div>

          {/* Right — contact details */}
          <div className="flex flex-col justify-center gap-8 bg-panel p-10 md:p-14">
            {DETAILS.map((d) => {
              const body = (
                <>
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center border border-steel text-phosphor">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      {d.icon}
                    </svg>
                  </span>
                  <span>
                    <span className="mono-label block text-paper/50">{d.label}</span>
                    <span className="mt-1 block text-body text-paper">{d.value}</span>
                  </span>
                </>
              );
              return d.href ? (
                <a key={d.label} href={d.href} className="group flex items-center gap-4">
                  {body}
                </a>
              ) : (
                <div key={d.label} className="flex items-center gap-4">
                  {body}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

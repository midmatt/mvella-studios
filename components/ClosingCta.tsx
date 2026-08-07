import Link from "next/link";

/**
 * Homepage closing section — replaces the full contact form, which now lives
 * at /contact. One line and a button, nothing else.
 */
export default function ClosingCta() {
  return (
    <section
      id="contact"
      aria-label="Start a project"
      className="border-t border-steel/40 bg-ink"
    >
      <div className="mx-auto max-w-6xl px-6 py-24">
        <p className="max-w-2xl font-display text-h2 text-paper">
          Got something that needs building?
        </p>
        <Link
          href="/contact"
          className="mono-label mt-10 inline-block bg-phosphor px-6 py-3 text-ink transition-colors hover:bg-paper"
        >
          Start a Project
        </Link>
      </div>
    </section>
  );
}

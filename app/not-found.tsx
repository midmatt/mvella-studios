import Link from "next/link";

/**
 * Custom 404 — terminal voice matching the rest of the site.
 */
export default function NotFound() {
  return (
    <div className="pt-16">
      <section aria-label="Not found" className="bg-ink">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <p className="mono-label text-phosphor">&gt; error 404</p>
          <h1 className="mt-4 font-display text-h2 text-paper">
            404: route not found
          </h1>
          <p className="mt-6 max-w-xl text-body text-paper/70">
            That path doesn&rsquo;t resolve. The index and the work feed are
            still here.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-6">
            <Link
              href="/"
              className="mono-label bg-phosphor px-6 py-3 text-ink transition-colors hover:bg-paper"
            >
              Back to home
            </Link>
            <Link
              href="/work"
              className="mono-label text-paper/70 underline-offset-4 transition-colors hover:text-phosphor hover:underline"
            >
              View Work →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

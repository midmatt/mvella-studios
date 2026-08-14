import Link from "next/link";

/**
 * Homepage teaser for full-time / internship interest — sits near the bottom
 * of `/` so recruiters can peel off to /hiring without making About feel like
 * a career page.
 */
export default function HiringTeaser() {
  return (
    <section
      id="full-time"
      aria-label="Open to full-time roles"
      className="border-t border-steel/40 bg-ink"
    >
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-24">
        <p className="eyebrow eyebrow--slash">Availability</p>
        <h2 className="mt-4 max-w-2xl font-display text-h2 uppercase text-paper">
          Open to full-time roles<span className="text-phosphor">.</span>
        </h2>
        <p className="mt-6 max-w-2xl text-body text-paper/70">
          Freelance is the day job, but I&rsquo;m also looking at Software
          Engineering and Security Engineering opportunities — including a
          Summer 2027 internship. Resumes and project detail live on the hiring
          page.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href="/hiring"
            className="mono-label border border-phosphor px-6 py-3 text-phosphor transition-colors hover:bg-phosphor hover:text-ink"
          >
            View hiring packet →
          </Link>
          <Link
            href="/hiring#inquire"
            className="mono-label border border-steel px-6 py-3 text-paper transition-colors hover:border-phosphor hover:text-phosphor"
          >
            Get in touch about a role
          </Link>
        </div>
      </div>
    </section>
  );
}

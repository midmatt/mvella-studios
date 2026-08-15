import { publishedTestimonials } from "@/lib/testimonials";
import StarRating from "./StarRating";

/**
 * Testimonials — simple card grid: name / company / star row / quote.
 *
 * Reads only from `publishedTestimonials` so drafts (confirmed: false) never
 * reach the homepage. The section is mounted on `/` — see app/page.tsx.
 */
export default function Testimonials() {
  if (publishedTestimonials.length === 0) return null;

  return (
    <section
      id="testimonials"
      aria-label="Client testimonials"
      className="border-t border-steel/40 bg-ink"
    >
      <div className="mx-auto max-w-6xl px-6 py-28 md:py-32">
        <p className="eyebrow eyebrow--slash">Testimonials</p>
        <h2 className="mt-4 max-w-xl font-display text-h2 uppercase text-paper">
          Trusted by real businesses<span className="text-phosphor">.</span>
        </h2>

        <ul className="mt-16 grid gap-px overflow-hidden border border-steel/40 bg-steel/40 md:grid-cols-3">
          {publishedTestimonials.map((t) => (
            <li
              key={t.slug}
              className="accent-corner flex flex-col bg-panel p-8 sm:p-10 transition-colors duration-300 hover:bg-panel-raised"
            >
              <StarRating rating={t.rating} />
              <blockquote className="mt-8 flex-1 text-[1.1875rem] leading-relaxed text-paper/85">
                “{t.quote}”
              </blockquote>
              <footer className="mt-10 border-t border-steel/40 pt-6">
                <p className="mono-label text-paper">{t.name}</p>
                <p className="mono-label mt-1.5 leading-snug text-paper/50">
                  {t.company}
                </p>
              </footer>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

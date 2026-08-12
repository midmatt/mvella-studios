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
      <div className="mx-auto max-w-6xl px-6 py-24">
        <p className="mono-label text-phosphor">&gt; cat ./testimonials</p>
        <h2 className="mt-4 font-display text-h2 text-paper">
          What clients say
        </h2>

        <ul className="mt-14 grid gap-px bg-steel/40 md:grid-cols-3">
          {publishedTestimonials.map((t) => (
            <li
              key={t.slug}
              className="flex flex-col bg-panel p-8 transition-colors duration-300 hover:bg-panel-raised"
            >
              <StarRating rating={t.rating} />
              <blockquote className="mt-6 flex-1 text-body text-paper/80">
                “{t.quote}”
              </blockquote>
              <footer className="mt-8 border-t border-steel/40 pt-5">
                <p className="mono-label text-paper">{t.name}</p>
                <p className="mono-label mt-1.5 text-paper/50">{t.company}</p>
              </footer>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

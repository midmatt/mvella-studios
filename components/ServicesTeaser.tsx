import Link from "next/link";
import { services } from "@/lib/services";

/**
 * Homepage services section — titles and one-liners only. The full cards,
 * with descriptions and deliverables, live at /services.
 */
export default function ServicesTeaser() {
  return (
    <section
      id="services"
      aria-label="Services"
      className="border-t border-steel/40 bg-ink"
    >
      <div className="mx-auto max-w-6xl px-6 py-24">
        <p className="mono-label text-phosphor">&gt; ls ./services</p>
        <h2 className="mt-4 font-display text-h2 text-paper">What I build</h2>

        <dl className="mt-14 border-t border-steel/40">
          {services.map((service) => (
            <div
              key={service.slug}
              className="grid gap-2 border-b border-steel/40 py-6 md:grid-cols-[16rem_1fr] md:gap-8"
            >
              <dt className="font-display text-h3 text-paper">
                {service.title}
              </dt>
              <dd className="text-body text-paper/70">{service.teaser}</dd>
            </div>
          ))}
        </dl>

        <Link
          href="/services"
          className="mono-label mt-10 inline-block border border-steel px-5 py-3 text-paper transition-colors hover:border-phosphor hover:text-phosphor"
        >
          See Packages &amp; Pricing &rarr;
        </Link>
      </div>
    </section>
  );
}

import { services } from "@/lib/services";

/**
 * Full services list for /services (spec §4). The quote builder lives in its
 * own section below this one and owns the #quote-builder anchor the nav's
 * "> get a quote" button targets.
 */
export default function Services() {
  return (
    <section id="services" aria-label="Services" className="bg-ink">
      <div className="mx-auto max-w-6xl px-6 pb-16 pt-24">
        <p className="mono-label text-phosphor">&gt; ls ./services</p>
        <h1 className="mt-4 font-display text-h2 text-paper">
          What I build
        </h1>
        <p className="mt-6 max-w-xl text-body text-paper/70">
          Four things, done properly, by the person you actually talk to.
        </p>
      </div>

      {/* gap-px over a steel wash = hairline divider grid, as in Testimonials */}
      <ul className="mx-auto grid max-w-6xl gap-px bg-steel/40 md:grid-cols-2">
        {services.map((service, index) => (
          <li
            key={service.slug}
            className="flex flex-col bg-panel p-8 transition-colors duration-300 hover:bg-panel-raised md:p-10"
          >
            <p className="mono-label text-phosphor">
              &gt; {String(index + 1).padStart(2, "0")}
            </p>
            <h2 className="mt-4 font-display text-h3 text-paper">
              {service.title}
            </h2>
            <p className="mt-4 flex-1 text-body text-paper/70">
              {service.description}
            </p>

            <ul className="mt-8 space-y-2 border-t border-steel/40 pt-6">
              {service.deliverables.map((item) => (
                <li
                  key={item}
                  className="mono-label flex gap-3 text-paper/60"
                >
                  <span aria-hidden="true" className="text-phosphor">
                    ·
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </section>
  );
}

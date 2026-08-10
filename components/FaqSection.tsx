import { faqs } from "@/lib/faqs";

/**
 * FAQ block for /services — visible Q&As plus FAQPage JSON-LD for the same set.
 */
export default function FaqSection() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <section
      id="faq"
      aria-label="Frequently asked questions"
      className="border-t border-steel/40 bg-ink"
    >
      <div className="mx-auto max-w-6xl px-6 py-24">
        <p className="mono-label text-phosphor">&gt; cat ./faq.md</p>
        <h2 className="mt-4 font-display text-h2 text-paper">
          Common questions
        </h2>
        <p className="mt-6 max-w-xl text-body text-paper/70">
          Straight answers before you open the quote builder. Still unsure?
          Email beats guessing.
        </p>

        <dl className="mt-12 max-w-3xl space-y-8">
          {faqs.map((faq) => (
            <div key={faq.question} className="border-t border-steel/40 pt-8">
              <dt className="font-display text-h3 text-paper">{faq.question}</dt>
              <dd className="mt-3 text-body text-paper/70">{faq.answer}</dd>
            </div>
          ))}
        </dl>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
    </section>
  );
}

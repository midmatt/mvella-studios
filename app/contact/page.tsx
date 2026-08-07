import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact — MVella Studios",
  description:
    "Start a project with MVella Studios — freelance web and iOS development from South Florida. Response within 24 hours.",
};

const DETAILS: Array<[label: string, value: string]> = [
  ["LOCATION", "SOUTH FLORIDA, USA"],
  ["RESPONSE", "< 24 HRS"],
  ["EMAIL", "mvella303@gmail.com"],
];

export default function ContactPage() {
  /* pt-16 clears the fixed 4rem nav, matching the other routes */
  return (
    <div className="pt-16">
      <section aria-label="Contact" className="bg-ink">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <p className="mono-label text-phosphor">&gt; ./start-project</p>
          <h1 className="mt-4 font-display text-h2 text-paper">
            Start a project
          </h1>

          <div className="mt-14 grid gap-12 md:grid-cols-[minmax(0,1fr)_16rem] md:gap-16">
            <div className="order-2 md:order-1">
              <ContactForm />
            </div>

            <div className="order-1 md:order-2">
              <dl className="border-y border-steel/40 py-6">
                {DETAILS.map(([label, value]) => (
                  <div key={label} className="py-2.5">
                    <dt className="mono-label text-paper/50">{label}</dt>
                    <dd className="mono-label mt-1.5 text-paper/80">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

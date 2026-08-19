import type { Metadata } from "next";
import Link from "next/link";
import Services from "@/components/Services";
import QuoteBuilder from "@/components/QuoteBuilder";
import FaqSection from "@/components/FaqSection";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Services — MVella Studios",
  description:
    "Web development, mobile apps, security-minded architecture, SEO audits, and AI Speed-to-Lead systems — freelance packages and a live quote builder from South Florida.",
};

export default function ServicesPage() {
  /* pt-16 clears the fixed 4rem nav, matching /about and /work */
  return (
    <div className="pt-16">
      <div className="mx-auto max-w-6xl px-6 pt-10">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Services" },
          ]}
        />
      </div>
      <Services />
      <FaqSection />
      <QuoteBuilder />

      <section
        aria-label="Start a project"
        className="border-t border-steel/40 bg-ink"
      >
        <div className="mx-auto max-w-6xl px-6 py-24">
          <p className="max-w-xl text-body text-paper/70">
            Not sure which of these you need? Describe the problem and I&rsquo;ll
            tell you what it actually takes.
          </p>
          <Link
            href="/contact"
            className="mono-label mt-8 inline-block bg-phosphor px-6 py-3 text-ink transition-colors hover:bg-paper"
          >
            Start a Project
          </Link>
        </div>
      </section>
    </div>
  );
}

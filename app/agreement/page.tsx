import type { Metadata } from "next";
import AgreementForm from "@/components/AgreementForm";
import { Placeholder } from "@/components/LegalDocument";
import { AGREEMENT_VERSION } from "@/lib/agreement";

export const metadata: Metadata = {
  title: "Service Agreement — MVella Studios",
  description:
    "Read and electronically sign the MVella Studios service agreement.",
  /** A signing page for engaged clients, not a page to rank. */
  robots: { index: false },
};

export default function AgreementPage() {
  /* pt-16 clears the fixed 4rem nav, matching the other routes */
  return (
    <div className="pt-16">
      <section aria-label="Client Service Agreement" className="bg-ink">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <h1 className="font-display text-h2 text-paper">
            MVella Studios &mdash; Service Agreement
          </h1>
          {/* The source document marks its own version line REPLACE, so it
              is flagged here like every other unresolved marker. The string
              itself is live data — it is written into each consent record. */}
          <p className="mt-4 text-body text-paper/50">
            Version {AGREEMENT_VERSION}{" "}
            <Placeholder>
              REPLACE with a real version number, and bump it every time this
              document&rsquo;s terms change
            </Placeholder>
          </p>
          <p className="mt-6 max-w-xl text-body text-paper/70">
            Read the agreement below, then sign it electronically. Signing
            unlocks once you&rsquo;ve scrolled to the end.
          </p>

          <div className="mt-12 max-w-3xl">
            <AgreementForm />
          </div>
        </div>
      </section>
    </div>
  );
}

import type { Metadata } from "next";
import AgreementForm from "@/components/AgreementForm";
import { AGREEMENT_VERSION, resolveQuote } from "@/lib/agreement";

export const metadata: Metadata = {
  title: "Service Agreement — MVella Studios",
  description:
    "Read and electronically sign the MVella Studios service agreement.",
  /** A signing page for engaged clients, not a page to rank. */
  robots: { index: false },
};

/**
 * Accepts ?package=<slug>&addons=<slug,slug> — the link format built into
 * quote-notification emails, which Matthew forwards to clients after
 * reviewing the request. Slugs are validated and priced server-side by
 * resolveQuote; garbage params degrade to the no-quote flow rather than
 * erroring. Without params the page works exactly as before: sign with no
 * pre-filled amount, no invoice.
 */
export default async function AgreementPage({
  searchParams,
}: {
  searchParams: Promise<{ package?: string; addons?: string }>;
}) {
  const params = await searchParams;
  const quote = resolveQuote(
    params.package ?? null,
    params.addons?.split(",").filter(Boolean) ?? []
  );

  /* pt-16 clears the fixed 4rem nav, matching the other routes */
  return (
    <div className="pt-16">
      <section aria-label="Client Service Agreement" className="bg-ink">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <h1 className="font-display text-h2 text-paper">
            MVella Studios &mdash; Service Agreement
          </h1>
          {/* Live data — this string is written into each consent record. */}
          <p className="mt-4 text-body text-paper/50">
            Version {AGREEMENT_VERSION}
          </p>
          <p className="mt-6 max-w-xl text-body text-paper/70">
            Read the agreement below, then sign it electronically. Signing
            unlocks once you&rsquo;ve scrolled to the end.
          </p>

          <div className="mt-12 max-w-3xl">
            <AgreementForm quote={quote} />
          </div>
        </div>
      </section>
    </div>
  );
}

import type { Metadata } from "next";
import LegalDocument from "@/components/LegalDocument";
import { LEGAL_EMAIL } from "@/lib/contact";

/**
 * Transcribed from legal-privacy-policy.md, all REPLACE markers resolved to
 * what Matthew confirmed on 2026-08-07: effective date Aug 7 2026, Vercel
 * Web Analytics (installed in app/layout.tsx the same day — the section
 * describes what actually runs), and agreement-record retention of
 * engagement + 5 years (chosen to outlast Florida's 5-year statute of
 * limitations on written contracts).
 *
 * The source's author-facing instruction sentence ("fix the copy to match
 * reality before publishing") was removed in this finalization pass — it
 * was an instruction for this exact step, not client-facing policy.
 */
export const metadata: Metadata = {
  title: "Legal & Privacy — MVella Studios",
  description:
    "What information MVella Studios collects through this website, how it is used, and which third-party services process it.",
};

export default function LegalPage() {
  return (
    <LegalDocument
      title="Legal &amp; Privacy"
      meta="Effective date: August 7, 2026"
    >
      <p>
        This page explains what information MVella Studios (&ldquo;we,&rdquo;
        &ldquo;us&rdquo;) collects through this website, how it&rsquo;s used,
        and who it&rsquo;s shared with.
      </p>

      <h2>Information We Collect</h2>
      <p>
        <strong>Information you provide directly</strong>, through the contact
        form or quote builder:
      </p>
      <ul>
        <li>Name and email address</li>
        <li>Message content</li>
        <li>
          Project type, budget range, and (if using the quote builder) selected
          package and add-ons
        </li>
        <li>
          If you sign a Service Agreement through this site: your typed
          signature, the date, and the IP address and browser/device
          information recorded at the time of signing (kept as evidence that
          the agreement was actually reviewed and accepted)
        </li>
      </ul>
      <p>
        <strong>Information collected automatically:</strong>
      </p>
      <p>
        This site uses Vercel Web Analytics to understand how it&rsquo;s used.
        It collects aggregate, non-identifying data — page views, referrers,
        and general browser, device, and country information. It does not use
        cookies, does not track you across other sites, and visitor
        identifiers are anonymized and discarded daily. Beyond that, the only
        automatic collection is what&rsquo;s strictly necessary for hosting to
        function (standard server request logs).
      </p>

      <h2>How We Use This Information</h2>
      <ul>
        <li>To respond to inquiries and prepare quotes</li>
        <li>To deliver and administer signed Service Agreements</li>
        <li>
          To improve the site (only if analytics are actually in use — see
          above)
        </li>
      </ul>
      <p>
        We do not sell your information. We do not use it for advertising.
      </p>

      <h2>Third-Party Services</h2>
      <p>
        This site relies on a small number of third-party services to function:
      </p>
      <ul>
        <li>
          <strong>Resend</strong> — delivers emails sent through the contact
          form and quote builder.
        </li>
        <li>
          <strong>Vercel</strong> — hosts the site and its serverless
          functions.
        </li>
        <li>
          <strong>Supabase</strong> — stores records of signed Service
          Agreements (name, email, agreement version, timestamp, IP address).
        </li>
      </ul>
      <p>
        Each of these providers processes data on our behalf and has its own
        privacy policy governing how it handles that data.
      </p>

      <h2>Data Retention</h2>
      <p>
        Contact form and quote submissions are retained as needed to respond to
        your inquiry and for reasonable business record-keeping. Signed Service
        Agreement records are retained for as long as needed to support the
        underlying engagement and for a reasonable period afterward for
        legal/business record purposes — for the duration of the engagement
        plus five (5) years.
      </p>

      <h2>Your Rights</h2>
      <p>
        You can request a copy of the information we hold about you, ask us to
        correct it, or ask us to delete it (subject to any records we&rsquo;re
        required to keep for legal or contractual reasons) by emailing{" "}
        <a href={`mailto:${LEGAL_EMAIL}`}>{LEGAL_EMAIL}</a>.
      </p>

      <h2>Changes to This Policy</h2>
      <p>
        This policy may be updated as the site changes. Material changes will
        be reflected with a new effective date at the top of this page.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about this policy:{" "}
        <strong>
          <a href={`mailto:${LEGAL_EMAIL}`}>{LEGAL_EMAIL}</a>
        </strong>
      </p>
    </LegalDocument>
  );
}

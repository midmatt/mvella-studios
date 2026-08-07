import type { Metadata } from "next";
import Link from "next/link";
import LegalDocument from "@/components/LegalDocument";
import { LEGAL_EMAIL } from "@/lib/contact";

/**
 * Transcribed from terms-of-use.md, all REPLACE markers resolved to what
 * Matthew confirmed on 2026-08-07: effective date Aug 7 2026, Florida
 * governing law.
 *
 * ⚠️ NOT ATTORNEY-REVIEWED. The source flagged the liability limitation as
 * jurisdiction-sensitive and needing review against Florida law. Matthew
 * chose to remove that note from the public page and track it privately —
 * this comment and the README launch checklist are that tracking.
 */
export const metadata: Metadata = {
  title: "Terms of Use — MVella Studios",
  description:
    "Terms governing use of the MVella Studios website, including intellectual property, quote estimates, and limitation of liability.",
};

export default function TermsPage() {
  return (
    <LegalDocument
      title="Terms of Use"
      meta="Effective date: August 7, 2026"
    >
      <p>
        These Terms of Use govern your use of the MVella Studios website (the
        &ldquo;Site&rdquo;), operated by Matthew Vella. By using the Site, you
        agree to these terms. This document covers use of the{" "}
        <em>website</em> — it is separate from the Service Agreement that
        governs any actual development work (see{" "}
        <Link href="/agreement">/agreement</Link>).
      </p>

      <h2>Use of the Site</h2>
      <p>
        You may browse the Site, review its content, and use the contact form
        and quote builder to reach out about a project. You agree not to:
      </p>
      <ul>
        <li>
          Use the Site to transmit anything unlawful, harmful, or fraudulent
        </li>
        <li>
          Attempt to gain unauthorized access to the Site, its underlying code,
          or any connected service
        </li>
        <li>
          Scrape, copy, or republish the Site&rsquo;s content or design at
          scale without permission
        </li>
      </ul>

      <h2>Intellectual Property</h2>
      <p>
        The design, wordmark, and original written content on this Site belong
        to Matthew Vella / MVella Studios. Client project screenshots and
        descriptions shown on the Site are displayed as portfolio examples;
        underlying client products, brands, and trademarks remain the property
        of their respective owners.
      </p>

      <h2>No Warranty on Site Content</h2>
      <p>
        The Site, including its portfolio descriptions, pricing estimates, and
        general content, is provided &ldquo;as is.&rdquo; Pricing shown through
        the quote builder is an <strong>estimate</strong>, not a binding offer
        — actual project cost and scope are only fixed once a Service Agreement
        is signed. We make reasonable efforts to keep information accurate but
        don&rsquo;t guarantee the Site is error-free or current at all times.
      </p>

      <h2>Limitation of Liability</h2>
      {/* The source's attorney-review note lived here; removed from the
          public page per Matthew (2026-08-07), tracked in the header
          comment and README launch checklist. */}
      <p>
        To the fullest extent permitted by law, Matthew Vella / MVella Studios
        is not liable for any indirect, incidental, or consequential damages
        arising from your use of the Site.
      </p>

      <h2>Third-Party Links</h2>
      <p>
        The Site links to live client projects and third-party platforms (App
        Store listings, client websites). We aren&rsquo;t responsible for the
        content, availability, or practices of those external sites.
      </p>

      <h2>Governing Law</h2>
      <p>
        These Terms are governed by the laws of the State of Florida, without
        regard to its conflict-of-laws principles.
      </p>

      <h2>Changes to These Terms</h2>
      <p>
        These terms may be updated as the Site changes. Continued use of the
        Site after changes are posted constitutes acceptance of the updated
        terms.
      </p>

      <h2>Contact</h2>
      <p>
        <strong>
          <a href={`mailto:${LEGAL_EMAIL}`}>{LEGAL_EMAIL}</a>
        </strong>
      </p>
    </LegalDocument>
  );
}

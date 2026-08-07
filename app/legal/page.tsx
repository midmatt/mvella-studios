import type { Metadata } from "next";
import LegalDocument, { Placeholder } from "@/components/LegalDocument";

/**
 * Transcribed from legal-privacy-policy.md. This is the real MVella Studios
 * policy — it describes the contact form, quote builder, Resend, Vercel, and
 * the Supabase agreement records, all of which this site actually does. It
 * replaces the VoiceLocal app policy that stood in here previously.
 *
 * Three REPLACE markers from the source are rendered as phosphor
 * placeholders and must be resolved before publishing. One of them (the
 * automatic-collection section) is answerable today: no analytics package is
 * installed, so nothing beyond strictly-necessary function is collected —
 * but that is Matthew's line to write, not mine to quietly insert into a
 * legal document.
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
      meta={
        <>
          Effective date:{" "}
          <Placeholder>REPLACE — set when this page goes live</Placeholder>
        </>
      }
    >
      <p>
        This page explains what information MVella Studios (&ldquo;we,&rdquo;
        &ldquo;us&rdquo;) collects through this website, how it&rsquo;s used,
        and who it&rsquo;s shared with. If anything here doesn&rsquo;t match
        how the site actually works, fix the copy to match reality before
        publishing — this document should describe what the site does, not
        what it aspires to do.
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
        <Placeholder>
          REPLACE — this section depends on what&rsquo;s actually running. If
          the site uses Vercel Analytics, confirm and describe what it collects
          (typically aggregate, non-identifying page-view data). If no
          analytics/cookies are in use beyond what&rsquo;s strictly necessary
          for the site to function, say so plainly instead of describing
          tracking that doesn&rsquo;t exist.
        </Placeholder>
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
        legal/business record purposes —{" "}
        <Placeholder>
          REPLACE with a specific retention period once decided (e.g.,
          &ldquo;for the duration of the engagement plus 3 years&rdquo;)
        </Placeholder>
        .
      </p>

      <h2>Your Rights</h2>
      <p>
        You can request a copy of the information we hold about you, ask us to
        correct it, or ask us to delete it (subject to any records we&rsquo;re
        required to keep for legal or contractual reasons) by emailing{" "}
        <a href="mailto:matthewvella.dev@gmail.com">
          matthewvella.dev@gmail.com
        </a>
        .
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
          <a href="mailto:matthewvella.dev@gmail.com">
            matthewvella.dev@gmail.com
          </a>
        </strong>
      </p>
    </LegalDocument>
  );
}

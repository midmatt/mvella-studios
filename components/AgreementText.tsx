import { Placeholder } from "./LegalDocument";

/**
 * Transcribed from client-service-agreement.md — the real document. This
 * replaces the draft that was authored here when the file didn't yet exist.
 *
 * Sections 1–14 are verbatim. The source's trailing signature block (the
 * "- [ ] I have read…" checkbox and the blank Full name / Company / Date
 * rules) is intentionally NOT rendered as text: those are the paper-form
 * stand-ins for the live form directly below this document, and printing
 * empty underscores beside real inputs would read as a broken page. The
 * consent paragraph that introduces them IS rendered, since it is the
 * operative language, and the checkbox label in AgreementForm reuses the
 * source's exact wording.
 *
 * ⚠️ SEVEN REPLACE markers remain, rendered as phosphor placeholders —
 * payment terms, late-payment window, revision rounds, hourly rate,
 * liability review, termination notice, and governing law. Section 8 also
 * carries an explicit instruction to have an attorney review it. Until these
 * are resolved, AGREEMENT_VERSION stays suffixed "-draft".
 *
 * Styling comes from .legal-prose (globals.css) via the parent.
 */
export default function AgreementText() {
  return (
    <>
      <p>
        This Service Agreement (&ldquo;Agreement&rdquo;) is between{" "}
        <strong>Matthew Vella, operating as MVella Studios</strong>{" "}
        (&ldquo;Developer&rdquo;) and the client identified at the time of
        signing (&ldquo;Client&rdquo;), and governs the specific project
        described in the accompanying quote or statement of work.
      </p>

      <h2>1. Scope of Work</h2>
      <p>
        The specific package, add-ons, and deliverables covered by this
        Agreement are as selected in the associated quote (package type,
        add-ons, and estimated total). Any work outside that scope is a change
        order, priced and agreed to separately in writing (including email)
        before work begins.
      </p>

      <h2>2. Timeline</h2>
      <p>
        Delivery timelines are estimates communicated at the time of quoting
        and are contingent on the Client providing requested content, feedback,
        and access in a timely manner (see Section 4). Delays caused by the
        Client do not obligate the Developer to the original timeline.
      </p>

      {/* Deposit percentage confirmed by Matthew (2026-08-07). Keep in sync
          with DEPOSIT_PERCENT in lib/agreement.ts — the invoice generated at
          signing charges what this section promises. */}
      <h2>3. Payment Terms</h2>
      <ul>
        <li>
          A 50% deposit is due before work begins. Where this Agreement is
          signed against a quote, the deposit is invoiced at signing.
        </li>
        <li>
          The remaining 50% is due before final deliverables (site launch,
          source code transfer, app submission) are handed over
        </li>
        <li>
          Late payments beyond <Placeholder>REPLACE (e.g., 15 days)</Placeholder>{" "}
          may pause work until resolved
        </li>
      </ul>

      <h2>4. Client Responsibilities</h2>
      <p>
        The Client agrees to provide, in a timely manner: necessary content
        (text, images, branding assets), access to relevant accounts (domain
        registrar, hosting, third-party APIs) where needed, and feedback on
        deliverables within a reasonable window. Delays in any of the above may
        extend the project timeline correspondingly.
      </p>

      <h2>5. Revisions</h2>
      <p>
        This Agreement includes{" "}
        <Placeholder>REPLACE (e.g., &ldquo;two rounds of revisions&rdquo;)</Placeholder>{" "}
        on delivered work. Additional revision rounds are billed at{" "}
        <Placeholder>REPLACE</Placeholder> hourly rate.
      </p>

      <h2>6. Intellectual Property</h2>
      <p>
        Upon receipt of full and final payment, ownership of the custom code
        and deliverables created specifically for this project transfers to the
        Client. The Developer retains the right to:
      </p>
      <ul>
        <li>
          Reuse general knowledge, techniques, and non-client-specific code
          patterns in future work
        </li>
        <li>
          Display the completed project in the Developer&rsquo;s portfolio
          (including on this website) unless the Client requests otherwise in
          writing
        </li>
      </ul>
      <p>
        Pre-existing tools, libraries, and frameworks used in the project
        remain under their own respective licenses and are not owned by either
        party.
      </p>

      <h2>7. Warranties &amp; Disclaimers</h2>
      <p>
        The Developer will perform the work in a professional manner consistent
        with generally accepted industry practices.{" "}
        <strong>
          The Developer does not warrant that the deliverable will be
          error-free, uninterrupted, or immune to all security
          vulnerabilities.
        </strong>{" "}
        No software can be guaranteed 100% secure; the Developer will apply
        reasonable, industry-standard security practices appropriate to the
        scope of the engagement, but the Client is responsible for ongoing
        security maintenance after project handoff unless an ongoing Care Plan
        is separately agreed to.
      </p>
      <p>
        EXCEPT AS EXPRESSLY STATED IN THIS AGREEMENT, THE DELIVERABLES ARE
        PROVIDED &ldquo;AS IS&rdquo; WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR
        IMPLIED, INCLUDING MERCHANTABILITY OR FITNESS FOR A PARTICULAR PURPOSE.
      </p>

      <h2>8. Limitation of Liability</h2>
      <p>
        To the fullest extent permitted by law, the Developer&rsquo;s total
        liability arising out of this Agreement is limited to the total amount
        actually paid by the Client under this Agreement. The Developer is not
        liable for indirect, incidental, special, or consequential damages,
        including lost profits or lost data, even if advised of the possibility
        of such damages.
      </p>
      <p>
        <Placeholder>
          REPLACE/CONFIRM before use: liability caps are not enforceable in
          every circumstance (e.g., many jurisdictions won&rsquo;t let a cap
          apply to gross negligence or willful misconduct) — this clause should
          be reviewed by an attorney familiar with your state&rsquo;s law
          before you rely on it.
        </Placeholder>
      </p>

      <h2>9. Client&rsquo;s Own Responsibilities &amp; Liabilities</h2>
      <p>
        The Client is responsible for: the legality and accuracy of content
        they provide, compliance of their own business/product with applicable
        laws (e.g., accessibility, data privacy, industry-specific regulations)
        beyond what&rsquo;s explicitly scoped into this Agreement, maintaining
        their own backups of data after handoff, and costs of third-party
        services (domain registration, hosting, paid APIs) unless explicitly
        included in the quoted price.
      </p>

      <h2>10. Independent Contractor Status</h2>
      <p>
        The Developer is an independent contractor, not an employee, partner,
        or agent of the Client. The Developer is responsible for their own
        taxes on payments received under this Agreement; the Client is not
        required to provide benefits, withhold taxes, or treat the Developer as
        an employee.
      </p>

      <h2>11. Confidentiality</h2>
      <p>
        Each party agrees to keep confidential any non-public business
        information shared by the other party in the course of this engagement,
        and not to use it for any purpose outside this Agreement.
      </p>

      <h2>12. Termination</h2>
      <p>
        Either party may terminate this Agreement with{" "}
        <Placeholder>REPLACE (e.g., &ldquo;14 days&rdquo;)</Placeholder>{" "}
        written notice. Upon termination, the Client pays for all work
        completed up to the termination date; the Developer delivers all work
        completed to that point.
      </p>

      <h2>13. Governing Law &amp; Disputes</h2>
      <p>
        <Placeholder>
          REPLACE — typically the state where the Developer operates (e.g.,
          Florida). Confirm with an attorney before publishing.
        </Placeholder>
      </p>

      <h2>14. Entire Agreement</h2>
      <p>
        This Agreement, together with the specific quote it references,
        constitutes the entire agreement between the parties regarding the
        project and supersedes any prior discussions. Changes to this Agreement
        must be made in writing and agreed to by both parties.
      </p>

      <h2>Signature</h2>
      <p>
        By checking the box below and typing your name, you confirm that you
        have read, understood, and agree to the terms of this Service
        Agreement, including the Limitation of Liability and Warranties
        sections above.
      </p>
      <p>
        <em>
          (This site records the IP address, timestamp, and agreement version
          at the moment of signing as a record of consent.)
        </em>
      </p>
    </>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AGREEMENT_VERSION, DEPOSIT_PERCENT, type Quote } from "@/lib/agreement";
import { findAddOn, findPackage, formatUsd } from "@/lib/packages";
import AgreementText from "./AgreementText";
import { fieldClass, labelClass } from "./form-styles";
import { DIRECT_EMAIL } from "@/lib/contact";

/**
 * Scroll-gated signing flow for /agreement (spec item list, this pass):
 * the document renders in a fixed-height scrollbox, the "I agree" checkbox
 * stays disabled until the reader reaches the bottom, and submit stays
 * disabled until the box is checked and name + email are filled.
 *
 * This creates a legal consent record, so the success state is shown ONLY
 * after the server confirms the database insert — a failed insert surfaces
 * as an error with the direct email, never as success.
 */
type Status = "idle" | "submitting" | "success" | "error";

/** Px of slack before the bottom still counting as "read to the end" —
 *  fractional scroll positions and zoom make an exact match unreliable. */
const BOTTOM_TOLERANCE = 24;

/**
 * `quote` arrives resolved and priced by the server component (never from
 * client input). When present, the quoted scope renders above the document
 * and the slugs travel with the signature — the API re-prices them again on
 * its side. When null, the flow is the original: sign, no amounts, no
 * invoice.
 */
export default function AgreementForm({ quote }: { quote: Quote | null }) {
  const scrollboxRef = useRef<HTMLDivElement>(null);
  const [readToEnd, setReadToEnd] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [agreedAt, setAgreedAt] = useState<string | null>(null);

  const checkScroll = useCallback(() => {
    const el = scrollboxRef.current;
    if (!el) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - BOTTOM_TOLERANCE) {
      setReadToEnd(true); // one-way latch — scrolling back up doesn't re-lock
    }
  }, []);

  /**
   * Run once on mount: if the document happens to fit inside the box (large
   * viewport, browser zoom-out), there is no bottom to scroll to and the
   * checkbox would be permanently locked. Re-checked on resize for the same
   * reason.
   */
  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [checkScroll]);

  const canSubmit =
    agreed && name.trim().length > 0 && email.trim().length > 0;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit || status === "submitting") return;
    const form = event.currentTarget;
    const fields = Object.fromEntries(new FormData(form).entries());

    // Honeypot — same off-screen pattern as the other forms.
    if (fields.website) return;

    setStatus("submitting");
    try {
      const res = await fetch("/api/agreement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fields.fullName,
          company: fields.company || undefined,
          email: fields.email,
          website: fields.website,
          agreementVersion: AGREEMENT_VERSION,
          packageType: quote?.packageSlug,
          addOns: quote?.addOnSlugs,
        }),
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      // Success only on the server's say-so, with its recorded timestamp.
      const data = (await res.json()) as { agreedAt?: string };
      setAgreedAt(data.agreedAt ?? null);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="border border-phosphor bg-panel p-8">
        <p className="mono-label text-phosphor">&gt; agreement recorded</p>
        <p className="mt-4 text-body text-paper/80">
          Signed and recorded{agreedAt ? ` at ${agreedAt}` : ""} against
          version {AGREEMENT_VERSION}. A copy has been emailed to you for your
          records.
          {quote &&
            ` The email also includes the ${formatUsd(quote.deposit)} deposit invoice (${DEPOSIT_PERCENT}% of ${formatUsd(quote.total)}), payable by card or bank transfer.`}
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* The quoted scope this signature is for — same terminal-readout
          voice as the quote builder's quote.sh panel. */}
      {quote && (
        <div className="mb-8 border border-steel bg-panel/90 p-6 font-mono">
          <p className="mono-label text-phosphor">&gt; quote.sh --signed-for</p>
          <div className="mt-4 space-y-1.5 text-[14px] text-paper/80">
            <p>
              {findPackage(quote.packageSlug)?.name} —{" "}
              {formatUsd(findPackage(quote.packageSlug)?.price ?? 0)}
            </p>
            {quote.addOnSlugs.map((slug) => {
              const a = findAddOn(slug);
              if (!a) return null;
              return (
                <p key={slug} className="text-paper/60">
                  + {a.name} — {formatUsd(a.price)}
                  {a.recurring ? "/mo" : ""}
                </p>
              );
            })}
            <p className="!mt-4 border-t border-steel/60 pt-3 text-paper">
              TOTAL {formatUsd(quote.total)} ·{" "}
              <span className="text-phosphor">
                {formatUsd(quote.deposit)} deposit ({DEPOSIT_PERCENT}%)
                invoiced at signing
              </span>
            </p>
          </div>
        </div>
      )}
      {/* The document, gated behind its own scrollbox */}
      <div
        ref={scrollboxRef}
        onScroll={checkScroll}
        tabIndex={0}
        role="region"
        aria-label="Client Service Agreement — scroll to the end to enable signing"
        className="h-[28rem] overflow-y-auto border border-steel bg-panel p-6 md:p-8"
      >
        {/* Trim only the leading element's top margin — the document opens
            with a paragraph, so targeting the first h2 instead collapsed the
            gap between that paragraph and section 1. */}
        <div className="legal-prose [&>*:first-child]:mt-0">
          <AgreementText />
        </div>
      </div>

      <p aria-live="polite" className="mono-label mt-3 text-paper/40">
        {readToEnd
          ? "> document read — signing unlocked"
          : "> scroll to the end of the document to unlock signing"}
      </p>

      <form onSubmit={handleSubmit} className="mt-10 space-y-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="agreement-name" className={labelClass}>
              Full name
            </label>
            <input
              id="agreement-name"
              name="fullName"
              type="text"
              required
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={fieldClass}
            />
          </div>
          <div>
            <label htmlFor="agreement-company" className={labelClass}>
              Company (optional)
            </label>
            <input
              id="agreement-company"
              name="company"
              type="text"
              autoComplete="organization"
              className={fieldClass}
            />
          </div>
        </div>

        <div>
          <label htmlFor="agreement-email" className={labelClass}>
            Email
          </label>
          <input
            id="agreement-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={fieldClass}
          />
        </div>

        {/* Honeypot */}
        <div aria-hidden="true" className="absolute left-[-9999px] top-0">
          <label htmlFor="agreement-website">Website (leave blank)</label>
          <input
            id="agreement-website"
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        <label
          className={`flex items-start gap-3 border border-steel bg-panel p-5 ${
            readToEnd ? "" : "opacity-50"
          }`}
        >
          <input
            type="checkbox"
            name="agree"
            disabled={!readToEnd}
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-1 h-4 w-4 accent-[#E8A33D] disabled:cursor-not-allowed"
          />
          {/* Wording taken from the source document's own checkbox line. */}
          <span className="text-body text-paper/80">
            I have read and agree to this Service Agreement.{" "}
            <span className="text-paper/50">(version {AGREEMENT_VERSION})</span>
          </span>
        </label>

        <div className="flex flex-wrap items-center gap-6">
          <button
            type="submit"
            disabled={!canSubmit || status === "submitting"}
            className="mono-label bg-phosphor px-6 py-3 text-ink transition-colors hover:bg-paper disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === "submitting" ? "Recording…" : "Sign Agreement"}
          </button>

          {status === "error" && (
            <p role="alert" className="mono-label text-paper/70">
              Couldn&rsquo;t record the agreement &mdash; nothing was saved.
              Email{" "}
              <a
                href={`mailto:${DIRECT_EMAIL}`}
                className="text-phosphor underline-offset-4 hover:underline"
              >
                {DIRECT_EMAIL}
              </a>{" "}
              to sign directly.
            </p>
          )}
        </div>
      </form>
    </div>
  );
}

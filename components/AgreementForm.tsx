"use client";

import { useEffect, useRef, useState } from "react";
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


/**
 * `quote` arrives resolved and priced by the server component (never from
 * client input). When present, the quoted scope renders above the document
 * and the slugs travel with the signature — the API re-prices them again on
 * its side. When null, the flow is the original: sign, no amounts, no
 * invoice.
 */
export default function AgreementForm({ quote }: { quote: Quote | null }) {
  const scrollboxRef = useRef<HTMLDivElement>(null);
  const endMarkerRef = useRef<HTMLDivElement>(null);
  const [readToEnd, setReadToEnd] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [agreedAt, setAgreedAt] = useState<string | null>(null);

  /**
   * Unlocks only once the end-of-document marker has genuinely been reached.
   *
   * This replaces a scrollTop/scrollHeight calculation that had a hole: the
   * expression "scrollTop + clientHeight >= scrollHeight" is trivially TRUE
   * whenever the box isn't clipping its content, and it ran on mount and on
   * every window resize. Any layout state where the box didn't constrain the
   * document — the height class not applying, reader/accessibility modes, a
   * measurement taken before layout settled — unlocked signing instantly,
   * with no scrolling at all.
   *
   * An IntersectionObserver on a real end-of-document element can't be fooled
   * that way, but the root has to match how the document is actually being
   * scrolled:
   *
   *   - Box clips its content (normal): root is the BOX. Reaching the marker
   *     inside it is exactly "scrolled to the end". Rooting at the viewport
   *     instead would strand mobile users, whose box bottom sits below the
   *     fold even after they've scrolled it fully.
   *   - Box doesn't clip (the bug above): the document flows in the page, so
   *     root is the VIEWPORT — the marker has to be scrolled to on the page
   *     like any other content. Never unlocks for free.
   *
   * Re-attached on resize because clipping can change with the viewport.
   * Latches one-way — scrolling back up doesn't re-lock.
   */
  useEffect(() => {
    const marker = endMarkerRef.current;
    const box = scrollboxRef.current;
    if (!marker || !box) return;

    // Fail open on browsers without IntersectionObserver rather than making
    // the agreement impossible to sign.
    if (typeof IntersectionObserver === "undefined") {
      setReadToEnd(true);
      return;
    }

    let observer: IntersectionObserver | undefined;

    const attach = () => {
      observer?.disconnect();
      // 8px of slack absorbs sub-pixel rounding on fractional zoom levels.
      const clips = box.scrollHeight - box.clientHeight > 8;
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            setReadToEnd(true);
            observer?.disconnect();
          }
        },
        { root: clips ? box : null, threshold: 1 }
      );
      observer.observe(marker);
    };

    attach();
    window.addEventListener("resize", attach);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", attach);
    };
  }, []);

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
        tabIndex={0}
        role="region"
        aria-label="Service Agreement — scroll to the end to enable signing"
        className="h-[28rem] overflow-y-auto border border-steel bg-panel p-6 md:p-8"
      >
        {/* Trim only the leading element's top margin — the document opens
            with a paragraph, so targeting the first h2 instead collapsed the
            gap between that paragraph and section 1. */}
        <div className="legal-prose [&>*:first-child]:mt-0">
          <AgreementText />
        </div>

        {/*
          End-of-document marker watched by the IntersectionObserver above.
          Given height so `threshold: 1` has a real box to fully reveal —
          a zero-height element can never be "100% visible" in some engines.
          mt-6 keeps it below the last line, so the observer fires only once
          the closing paragraph has actually been read past.
        */}
        <div ref={endMarkerRef} aria-hidden="true" className="mt-6 h-2 w-full" />
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

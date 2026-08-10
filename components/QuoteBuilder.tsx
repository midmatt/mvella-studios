"use client";

import { useRef, useState } from "react";
import {
  addOns,
  computeTotal,
  findAddOn,
  findPackage,
  formatUsd,
  packageTypes,
} from "@/lib/packages";
import { fieldClass, labelClass } from "./form-styles";
import { DIRECT_EMAIL } from "@/lib/contact";
import { trackGoogleAdsConversion } from "@/lib/google-ads";

/**
 * Quote builder for /services (spec §4): pick a package, stack add-ons,
 * watch a terminal readout price it live, then send it with the same
 * contact fields as /contact.
 *
 * The selection travels to /api/contact as structured JSON assembled from
 * React state (packageType, addOns[], estimatedTotal) — not as user-editable
 * inputs. The server re-prices everything from lib/packages.ts and flags any
 * total that doesn't match, so the client number is a courtesy copy, not the
 * source of truth.
 */
type Status = "idle" | "submitting" | "success" | "error";

/** Card chrome shared by both steps; selection state varies the border. */
function cardClass(selected: boolean): string {
  return `block cursor-pointer border p-5 transition-colors ${
    selected
      ? "border-phosphor bg-panel-raised"
      : "border-steel bg-panel hover:border-steel hover:bg-panel-raised"
  }`;
}

/** Dotted leader between a readout label and its price. */
function Leader() {
  return (
    <span
      aria-hidden="true"
      className="mx-2 mb-1 flex-1 self-end border-b border-dotted border-steel"
    />
  );
}

export default function QuoteBuilder() {
  const [pkg, setPkg] = useState<string | null>(null);
  const [selectedAddOns, setSelectedAddOns] = useState<Set<string>>(new Set());
  const [status, setStatus] = useState<Status>("idle");
  /** Guards against firing the Ads conversion more than once per mount. */
  const conversionSent = useRef(false);

  const selectedPackage = pkg ? findPackage(pkg) : undefined;
  // Array.from, not spread — tsconfig targets es5, where Set isn't iterable.
  const addOnSlugs = Array.from(selectedAddOns);
  const total = computeTotal(pkg, addOnSlugs);
  const monthly = addOnSlugs
    .map(findAddOn)
    .filter((a) => a?.recurring)
    .reduce((sum, a) => sum + (a?.price ?? 0), 0);

  function toggleAddOn(slug: string) {
    setSelectedAddOns((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = Object.fromEntries(new FormData(form).entries());

    // Client-side honeypot check; the server repeats it.
    if (fields.website) return;

    setStatus("submitting");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fields.name,
          email: fields.email,
          message: fields.message,
          website: fields.website,
          packageType: pkg,
          addOns: addOnSlugs,
          estimatedTotal: total,
        }),
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);

      if (!conversionSent.current) {
        conversionSent.current = true;
        trackGoogleAdsConversion();
      }

      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  return (
    <section
      id="quote-builder"
      aria-label="Build a quote"
      className="border-t border-steel/40 bg-ink"
    >
      <div className="mx-auto max-w-6xl px-6 py-24">
        <p className="mono-label text-phosphor">&gt; ./quote --interactive</p>
        <h2 className="mt-4 font-display text-h2 text-paper">Build a quote</h2>
        <p className="mt-6 max-w-xl text-body text-paper/70">
          Rough numbers up front, so neither of us wastes a call finding out
          we&rsquo;re an order of magnitude apart.
        </p>

        <div className="mt-14 grid gap-12 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-16">
          {/* Steps */}
          <div>
            <fieldset>
              <legend className="mono-label text-paper/50">
                &gt; step_01 // choose a package
              </legend>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {packageTypes.map((p) => (
                  <label key={p.slug} className={cardClass(pkg === p.slug)}>
                    <input
                      type="radio"
                      name="packageType"
                      value={p.slug}
                      checked={pkg === p.slug}
                      onChange={() => setPkg(p.slug)}
                      className="sr-only"
                    />
                    <span className="flex items-baseline justify-between gap-3">
                      <span className="font-display text-h3 text-paper">
                        {p.name}
                      </span>
                      <span className="mono-label shrink-0 text-phosphor">
                        {formatUsd(p.price)}
                      </span>
                    </span>
                    <span className="mt-2 block text-body text-paper/60">
                      {p.blurb}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className="mt-12">
              <legend className="mono-label text-paper/50">
                &gt; step_02 // stack add-ons
              </legend>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {addOns.map((a) => {
                  const selected = selectedAddOns.has(a.slug);
                  return (
                    <label key={a.slug} className={cardClass(selected)}>
                      <input
                        type="checkbox"
                        name="addOns"
                        value={a.slug}
                        checked={selected}
                        onChange={() => toggleAddOn(a.slug)}
                        className="sr-only"
                      />
                      <span className="flex items-baseline justify-between gap-3">
                        <span className="text-body font-semibold text-paper">
                          {a.name}
                        </span>
                        <span className="mono-label shrink-0 text-phosphor">
                          {formatUsd(a.price)}
                          {a.recurring ? "/mo" : ""}
                        </span>
                      </span>
                      <span className="mt-2 block text-body text-paper/60">
                        {a.blurb}
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          </div>

          {/* Terminal readout — sticky so the total stays visible while
              selections change above the fold on tall step lists. */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div
              aria-live="polite"
              className="border border-steel bg-panel/90 p-6 font-mono"
            >
              <p className="mono-label text-phosphor">&gt; quote.sh</p>

              {selectedPackage ? (
                <div className="mt-5 space-y-2 text-[14px]">
                  <p className="flex text-paper/80">
                    <span className="shrink-0">{selectedPackage.name}</span>
                    <Leader />
                    <span className="shrink-0">
                      {formatUsd(selectedPackage.price)}
                    </span>
                  </p>
                  {addOnSlugs.map((slug) => {
                    const a = findAddOn(slug);
                    if (!a) return null;
                    return (
                      <p key={slug} className="flex text-paper/60">
                        <span className="shrink-0">+ {a.name}</span>
                        <Leader />
                        <span className="shrink-0">
                          {formatUsd(a.price)}
                          {a.recurring ? "/mo" : ""}
                        </span>
                      </p>
                    );
                  })}

                  <div className="!mt-5 border-t border-steel/60 pt-4">
                    <p className="flex text-paper">
                      <span className="mono-label shrink-0 self-center text-paper/50">
                        TOTAL
                      </span>
                      <Leader />
                      <span className="shrink-0 text-[16px] text-phosphor">
                        {formatUsd(total)}
                        {monthly > 0 && (
                          <span className="text-paper/60">
                            {" "}
                            + {formatUsd(monthly)}/mo
                          </span>
                        )}
                      </span>
                    </p>
                  </div>
                </div>
              ) : (
                <p className="mt-5 text-[14px] text-paper/40">
                  # select a package to begin
                </p>
              )}
            </div>

            <p className="mono-label mt-4 text-paper/40">
              Estimate, not an invoice — scope confirmed before any work.
            </p>
          </div>
        </div>

        {/* Send it */}
        <div className="mt-16 max-w-2xl">
          <p className="mono-label text-paper/50">
            &gt; step_03 // send it over
          </p>

          {status === "success" ? (
            <div className="mt-6 border border-phosphor bg-panel p-8">
              <p className="mono-label text-phosphor">&gt; quote sent</p>
              <p className="mt-4 text-body text-paper/80">
                Thanks — I&rsquo;ll get back to you within 24 hours with a
                confirmed scope.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="quote-name" className={labelClass}>
                    Name
                  </label>
                  <input
                    id="quote-name"
                    name="name"
                    type="text"
                    required
                    autoComplete="name"
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label htmlFor="quote-email" className={labelClass}>
                    Email
                  </label>
                  <input
                    id="quote-email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    className={fieldClass}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="quote-message" className={labelClass}>
                  Message
                </label>
                <textarea
                  id="quote-message"
                  name="message"
                  required
                  rows={4}
                  placeholder="What are you building, and what's the deadline?"
                  className={`${fieldClass} resize-y`}
                />
              </div>

              {/* Honeypot — same off-screen pattern as ContactForm. */}
              <div aria-hidden="true" className="absolute left-[-9999px] top-0">
                <label htmlFor="quote-website">Website (leave blank)</label>
                <input
                  id="quote-website"
                  name="website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              <div className="flex flex-wrap items-center gap-6">
                <button
                  type="submit"
                  disabled={!pkg || status === "submitting"}
                  className="mono-label bg-phosphor px-6 py-3 text-ink transition-colors hover:bg-paper disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {status === "submitting"
                    ? "Sending…"
                    : pkg
                      ? `Request quote — ${formatUsd(total)}`
                      : "Select a package first"}
                </button>

                {status === "error" && (
                  <p role="alert" className="mono-label text-paper/70">
                    Couldn&rsquo;t send &mdash; email{" "}
                    <a
                      href={`mailto:${DIRECT_EMAIL}`}
                      className="text-phosphor underline-offset-4 hover:underline"
                    >
                      {DIRECT_EMAIL}
                    </a>{" "}
                    directly.
                  </p>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

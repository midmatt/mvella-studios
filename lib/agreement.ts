import { computeTotal, findAddOn, findPackage } from "./packages";

/**
 * Version identifier stored with every consent record in the `agreements`
 * table, so a signature can always be matched to the exact text that was on
 * screen when it was given.
 *
 * ⚠️ BUMP THIS whenever the wording in components/AgreementText.tsx changes
 * in any substantive way — records pointing at a stale version are evidence
 * of agreement to text that no longer exists.
 *
 * 1.1 — finalized 2026-08-07: every REPLACE marker resolved to terms
 * Matthew confirmed (50/50 payment, 15-day late window, two revision
 * rounds, $45/hr beyond, 14-day termination notice, Florida law).
 * Signatures from here are against finished wording. The liability
 * clauses remain un-reviewed by an attorney — tracked in the README
 * launch checklist, not on the public page, per Matthew's call.
 */
export const AGREEMENT_VERSION = "1.1";

/**
 * Deposit charged when a quoted agreement is signed, as confirmed by
 * Matthew. Section 3 of the agreement text states the same 50/50 split —
 * if one changes, change both, or the invoice contradicts the signed terms.
 */
export const DEPOSIT_PERCENT = 50;

/** Site origin for links built server-side (emails, invoices). */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://portfolio-vella-os.vercel.app";

export interface Quote {
  packageSlug: string;
  addOnSlugs: string[];
  /** One-time total in whole USD, priced from lib/packages.ts. */
  total: number;
  /** Deposit due at signing, in whole USD (rounded up to the dollar). */
  deposit: number;
}

/**
 * Validates a package slug + add-on slugs into a priced Quote, or null if
 * the package is missing/unknown. Unknown add-on slugs are dropped rather
 * than failing the whole quote — the total is always priced from what's
 * actually recognized, never from client-supplied numbers.
 */
export function resolveQuote(
  packageSlug: string | null | undefined,
  addOnSlugs: string[] | null | undefined
): Quote | null {
  if (!packageSlug || !findPackage(packageSlug)) return null;
  const validAddOns = (addOnSlugs ?? []).filter((slug) => findAddOn(slug));
  const total = computeTotal(packageSlug, validAddOns);
  return {
    packageSlug,
    addOnSlugs: validAddOns,
    total,
    deposit: Math.ceil((total * DEPOSIT_PERCENT) / 100),
  };
}

/**
 * The /agreement?package=...&addons=... link for a quote. Included in the
 * quote-notification email so Matthew can review the request and forward
 * this exact link to the client when ready — clients are never auto-sent
 * to it (his call, per review flow decided 2026-08-07).
 */
export function agreementLink(quote: Quote): string {
  const params = new URLSearchParams({ package: quote.packageSlug });
  if (quote.addOnSlugs.length > 0) {
    params.set("addons", quote.addOnSlugs.join(","));
  }
  return `${SITE_URL}/agreement?${params.toString()}`;
}

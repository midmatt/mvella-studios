/**
 * Single source of truth for quote-builder pricing, following the same
 * pattern as lib/projects.ts and lib/services.ts.
 *
 * ⚠️ EVERY PRICE IN THIS FILE IS A DRAFT pending Matthew's review before
 * launch. The numbers were chosen to be plausible for South Florida
 * small-business freelance work, not quoted from real engagements. The
 * package/add-on lineup itself is also draft — the spec on disk has no §3
 * packages content, so this file authored it from the services list.
 *
 * Both the quote builder UI and /api/contact import from here, so the
 * server always prices a submission from this table rather than trusting
 * whatever total the client posted.
 */
export interface PackageType {
  slug: string;
  name: string;
  price: number; // USD, one-time
  blurb: string;
}

export interface AddOn {
  slug: string;
  name: string;
  price: number; // USD — one-time unless `recurring`
  blurb: string;
  /** Priced per month; kept out of the one-time total and shown as "/mo". */
  recurring?: boolean;
}

export const packageTypes: PackageType[] = [
  {
    slug: "marketing-site",
    name: "Marketing Website",
    price: 1150,
    blurb: "3–5 pages, contact flow, SEO basics — the OOT Tastings build.",
  },
  {
    slug: "storefront",
    name: "Storefront",
    price: 2200,
    blurb: "E-commerce with cart and checkout — the Holy Beliefs build.",
  },
  {
    slug: "web-app",
    name: "Web App",
    price: 3500,
    blurb: "Auth, dashboard, database — software, not just pages.",
  },
  {
    slug: "mobile-app",
    name: "Mobile App",
    price: 4300,
    blurb:
      "React Native for iOS and Android, carried through store review to a live listing.",
  },
];

export const addOns: AddOn[] = [
  {
    slug: "seo-performance-audit",
    name: "SEO & Performance Audit",
    price: 350,
    blurb: "The repeatable audit, run against the finished build.",
  },
  {
    slug: "security-hardening",
    name: "Security Hardening Pass",
    price: 475,
    blurb: "Threat model, auth review, input validation, secret handling.",
  },
  {
    slug: "cms-setup",
    name: "Content Editing Setup",
    price: 300,
    blurb: "Edit your own copy and images without calling a developer.",
  },
  {
    slug: "priority-delivery",
    name: "Priority Delivery",
    price: 750,
    blurb: "Your project jumps the queue; tightest turnaround I can commit to.",
  },
  {
    slug: "care-plan",
    name: "Care Plan",
    price: 125,
    recurring: true,
    blurb: "Updates, monitoring, and small fixes after launch.",
  },
];

export const findPackage = (slug: string) =>
  packageTypes.find((p) => p.slug === slug) ??
  // Old quote/agreement links used ios-app before the package was renamed.
  (slug === "ios-app"
    ? packageTypes.find((p) => p.slug === "mobile-app")
    : undefined);

export const findAddOn = (slug: string) => addOns.find((a) => a.slug === slug);

export const formatUsd = (n: number) => `$${n.toLocaleString("en-US")}`;

/**
 * One-time total for a selection — package plus non-recurring add-ons.
 * Unknown slugs are skipped rather than throwing; the API route reports
 * them instead of pricing them.
 */
export function computeTotal(
  packageSlug: string | null,
  addOnSlugs: string[]
): number {
  const pkg = packageSlug ? findPackage(packageSlug) : undefined;
  const addOnSum = addOnSlugs.reduce((sum, slug) => {
    const addOn = findAddOn(slug);
    return addOn && !addOn.recurring ? sum + addOn.price : sum;
  }, 0);
  return (pkg?.price ?? 0) + addOnSum;
}

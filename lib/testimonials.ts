/**
 * Client testimonials, rendered by components/Testimonials.tsx on `/`.
 *
 * Published to the homepage so visitors see social proof without hunting.
 * `confirmed` still gates production: only `true` entries ship. Flip back to
 * `false` (or delete) if a client asks for their quote to come down.
 */
export interface Testimonial {
  /** Stable key — ties the quote back to the project it refers to. */
  slug: string;
  name: string;
  company: string;
  /** 0–5, rendered with the shared StarRating component. */
  rating: number;
  quote: string;
  /**
   * Has this client approved these exact words for publication?
   * Only `true` entries appear on the production site.
   */
  confirmed: boolean;
  /** Slug from lib/projects.ts this testimonial relates to, if any. */
  projectSlug?: string;
}

export const testimonials: Testimonial[] = [
  {
    slug: "jovell",
    name: "Joseph",
    company: "JoVell Hospitality Group",
    rating: 5,
    quote:
      "Matthew got our site live fast, exactly the way we pictured it, no back and forth.",
    confirmed: true,
    // No projectSlug — JoVell is not currently in lib/projects.ts.
  },
  {
    slug: "holy-beliefs",
    name: "Julien",
    company: "Holy Beliefs",
    rating: 5,
    quote:
      "He built out our store with real thought behind it, flash sales and all, and made it easy for us to run.",
    confirmed: true,
    projectSlug: "holy-beliefs",
  },
  {
    slug: "adele-farina",
    name: "Adele Farina",
    company: "adelefarina.com",
    rating: 5,
    quote:
      "Matthew handled everything, from the site to my email, and it all just worked.",
    confirmed: true,
    // No projectSlug — Adele Farina is not currently in lib/projects.ts.
  },
];

/** A testimonial is only renderable once the client has approved the wording. */
export function isReady(t: Testimonial): boolean {
  return t.confirmed;
}

/** Only the testimonials cleared to appear on the live page. */
export const publishedTestimonials = testimonials.filter(isReady);

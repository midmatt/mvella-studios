/**
 * Single source of truth for service content, following the same pattern as
 * lib/projects.ts and lib/testimonials.ts.
 *
 * Two surfaces read this: the homepage teaser (title + `teaser` only) and the
 * full /services cards (everything). Adding a service here adds it to both.
 *
 * NOTE: this content is new — there was no Services section anywhere in the
 * codebase to relocate. It's written from spec §4's list of four cards, using
 * the stacks and roles actually recorded in lib/projects.ts, so nothing here
 * claims capability the shipped work doesn't already demonstrate. Tune the
 * voice before launch the same way the hero headline was.
 */
export interface Service {
  slug: string;
  title: string;
  /** One-liner — used verbatim by the homepage teaser. Keep it to one line. */
  teaser: string;
  /** Longer copy for the /services card. */
  description: string;
  deliverables: string[];
  /** Project slugs from lib/projects.ts to link as related case studies. */
  relatedProjectSlugs?: string[];
}

export const services: Service[] = [
  {
    slug: "web-development",
    title: "Web Development",
    teaser:
      "Marketing sites and storefronts in Next.js — fast, indexable, yours to keep.",
    description:
      "Next.js and TypeScript, deployed on Vercel. The same stack behind OOT Tastings and Holy Beliefs: server-rendered so it indexes properly, and built as a codebase you own rather than a page-builder subscription you rent.",
    deliverables: [
      "Next.js App Router + TypeScript",
      "Responsive down to 360px",
      "Contact and booking flows wired to real email",
      "Deployed with a custom domain",
    ],
    relatedProjectSlugs: ["oot-tastings", "holy-beliefs"],
  },
  {
    slug: "mobile-apps",
    title: "Mobile Apps",
    teaser:
      "React Native apps for iOS and Android, taken through store review to a live listing.",
    description:
      "React Native and Expo for iOS and Android, from first build to an approved store listing. AlarmQR and CyberSimply are both shipped and live on the App Store — including the review process, which is where most first-time submissions stall.",
    deliverables: [
      "React Native + Expo (iOS and Android)",
      "Native integrations where they matter",
      "App Store and Play Store submission and review handling",
      "Post-launch updates",
    ],
    relatedProjectSlugs: ["alarmqr", "cybersimply"],
  },
  {
    slug: "security-architecture",
    title: "Security-Minded Architecture",
    teaser:
      "The questions an attacker would ask, asked before the code gets written.",
    description:
      "What's exposed, what's trusted, and what happens when something fails — answered at design time instead of after an incident. Practically: auth and session review, input validation, secret handling, and dependency hygiene.",
    deliverables: [
      "Threat model for the actual feature set",
      "Auth, session, and access-control review",
      "Input validation and secret-handling pass",
      "Dependency and configuration audit",
    ],
    relatedProjectSlugs: ["alarmqr", "cybersimply"],
  },
  {
    slug: "seo-performance",
    title: "SEO & Performance Audits",
    teaser: "A repeatable audit that ends in a ranked fix list, not a PDF.",
    description:
      "Run against a reusable audit template rather than improvised each time, so the same checks run every engagement and results are comparable run to run. You get findings ordered by impact against effort, with the fixes scoped.",
    deliverables: [
      "Technical SEO crawl and metadata pass",
      "Core Web Vitals against field data",
      "Findings ranked by impact vs. effort",
      "Fixes scoped so they can be actioned",
    ],
    relatedProjectSlugs: ["oot-tastings", "holy-beliefs"],
  },
];

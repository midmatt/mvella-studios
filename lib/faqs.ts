/**
 * FAQ content for /services — mirrored into FAQPage JSON-LD by FaqSection.
 */
export interface FaqItem {
  question: string;
  answer: string;
}

export const faqs: FaqItem[] = [
  {
    question: "How long does a typical project take?",
    answer:
      "Most marketing sites ship in 2–3 weeks once content and feedback are moving. Storefronts and web apps usually take 3–6 weeks. Mobile apps vary with App Store / Play Store review, but a focused React Native build commonly lands in 4–8 weeks. Tight deadlines are possible with the Priority Delivery add-on.",
  },
  {
    question: "What does a project usually cost?",
    answer:
      "Package starting points on the quote builder run from $1,150 for a marketing website to $4,300 for a mobile app, with optional add-ons (SEO audit, security hardening, care plan, and others). Those are starting scopes — unusual requirements get a written quote before any work begins.",
  },
  {
    question: "What tech stack do you use?",
    answer:
      "Web: Next.js, TypeScript, Tailwind, and Vercel. Mobile: React Native and Expo for iOS and Android. Backend pieces as needed — Supabase, Stripe, Resend. You get a real codebase you own, not a page-builder subscription.",
  },
  {
    question: "Do you handle ongoing maintenance after launch?",
    answer:
      "Yes. The Care Plan add-on covers updates, monitoring, and small fixes after launch. Without it, I'm still available for scoped follow-up work — just not on a standing retainer.",
  },
  {
    question: "How is a \"security-minded\" build different from a typical freelancer?",
    answer:
      "Security questions get asked before the first commit, not after a scare: what's exposed, what's trusted, and what happens when something fails. Practically that means auth and session review, input validation, secret handling, and dependency hygiene baked into the architecture — the same habits I use as a cybersecurity student, applied to client work.",
  },
];

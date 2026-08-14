/**
 * Single source of truth for all project content (spec §3).
 * To add a new project: append one object to this array — the homepage feed,
 * stats counters, and /work/[slug] all read from here.
 *
 * Order is display order: the three products first, then client work.
 */
export type ProjectStatus = "live" | "shipped" | "in_development";

/** A rating left against a specific project. Shape not yet in the spec. */
export interface Review {
  rating: number; // 0–5
  author: string;
  company?: string;
  quote?: string;
}

export interface Project {
  slug: string;
  name: string;
  tagline: string; // one-line hook, shown big
  /** Longer "what it does" copy for /work/[slug]. Not shown on the homepage cards. */
  about: string;
  role: string;
  stack: string[];
  status: ProjectStatus;
  year: number;
  heroImage: string; // /public/work/<slug>.jpg
  /**
   * Extra App Store–style screenshots for the work feed. When present,
   * ProjectBlock shows a horizontal phone gallery; heroImage stays the
   * featured-card / OG thumbnail.
   */
  previewImages?: string[];
  liveUrl?: string;
  /**
   * Optional marketing / product site shown alongside an App Store (or other)
   * download link — e.g. CyberSimply's store listing + cybersimply.com.
   */
  websiteUrl?: string;
  caseStudyUrl?: string; // internal /work/[slug]
  featured: boolean;
  category: "product" | "client";
  /** Matching service slug from lib/services.ts for in-content cross-links. */
  relatedServiceSlug?: string;
  /**
   * Optional — no project has reviews yet. When populated, the work feed
   * renders an averaged star row; when absent it renders nothing.
   */
  reviews?: Review[];
}

export interface ProjectCta {
  label: string;
  href: string;
  external: boolean;
}

/**
 * Placeholder URLs from the spec ("REPLACE…") count as missing, so a
 * half-filled entry never ships a dead link.
 */
export function resolvedUrl(project: Project): string | undefined {
  return project.liveUrl?.startsWith("REPLACE") ? undefined : project.liveUrl;
}

/** Same REPLACE guard for the optional marketing-site URL. */
export function resolvedWebsiteUrl(project: Project): string | undefined {
  return project.websiteUrl?.startsWith("REPLACE")
    ? undefined
    : project.websiteUrl;
}

/**
 * Whether a project ships through the App Store — i.e. whether its hero image
 * is a portrait phone screenshot. Derived from the destination rather than a
 * slug list, so it stays correct as projects are appended.
 *
 * Both the work feed (phone bezel vs. browser chrome) and the homepage grid
 * (contain vs. cover) branch on this, so it lives here rather than being
 * reimplemented in each.
 */
export function isAppStoreProject(project: Project): boolean {
  const url = resolvedUrl(project);
  if (!url) return false;
  try {
    return /(^|\.)apps\.apple\.com$/i.test(new URL(url).hostname);
  } catch {
    return false;
  }
}

export function getProject(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}

/**
 * App Store and/or website buttons. Label follows the destination: an iOS
 * listing reads as the store, everything else as a website. When both URLs
 * exist (CyberSimply), both buttons ship.
 */
export function projectCtas(project: Project): ProjectCta[] {
  const ctas: ProjectCta[] = [];
  const liveUrl = resolvedUrl(project);
  const websiteUrl = resolvedWebsiteUrl(project);

  if (liveUrl) {
    ctas.push({
      label: isAppStoreProject(project)
        ? "View on the App Store"
        : "View website",
      href: liveUrl,
      external: true,
    });
  }

  if (websiteUrl && websiteUrl !== liveUrl) {
    ctas.push({
      label: "View website",
      href: websiteUrl,
      external: true,
    });
  }

  if (ctas.length > 0) return ctas;
  if (project.category === "client") return [];
  if (project.caseStudyUrl) {
    return [
      {
        label: "Read the case study",
        href: project.caseStudyUrl,
        external: false,
      },
    ];
  }
  return [];
}

export const projects: Project[] = [
  {
    slug: "cybersimply",
    name: "CyberSimply",
    tagline: "Cybersecurity news, summarized by AI and stripped of the jargon.",
    about:
      "CyberSimply is an iOS app that takes cybersecurity headlines and turns them into short, plain-language briefs. AI does the summarizing so you can follow what actually happened without wading through vendor jargon or 2,000-word incident writeups. The feed, saved stories, and archive are built for catching up in a few minutes — not for living in a newsreader. Live on the App Store, with a product site at cybersimply.com.",
    role: "Solo developer",
    stack: ["React Native", "Expo"],
    status: "live", // now shipping on the App Store
    year: 2026,
    // Nested under /work/cybersimply/ so the file does not collide with that
    // directory (Next fails to serve public/work/cybersimply.jpg when the
    // folder public/work/cybersimply/ exists — homepage onError fallback).
    heroImage: "/work/cybersimply/01-news.jpg",
    previewImages: [
      "/work/cybersimply/01-news.jpg",
      "/work/cybersimply/02-article.jpg",
      "/work/cybersimply/03-favorites.jpg",
      "/work/cybersimply/04-archive.jpg",
    ],
    liveUrl: "https://apps.apple.com/us/app/cyber-simply/id6752630267",
    websiteUrl: "https://cybersimply.com",
    featured: true,
    category: "product",
    relatedServiceSlug: "mobile-apps",
  },
  {
    slug: "alarmqr",
    name: "AlarmQR",
    tagline: "An alarm you can't sleep through — and can't fake dismissing.",
    about:
      "AlarmQR is an iOS alarm you have to get out of bed to shut off. Dismissing it means scanning a QR code you placed across the room — snoozing from under the pillow doesn't work, and faking the scan doesn't either. AlarmKit keeps the alarm firing when the app isn't open; VisionKit reads the code; Supabase handles the account side. Live on the App Store.",
    role: "Solo developer",
    stack: ["React Native", "Expo", "AlarmKit", "VisionKit", "Supabase"],
    status: "live",
    year: 2026,
    heroImage: "/work/alarmqr.jpg",
    liveUrl: "https://apps.apple.com/us/app/alarm-qr/id6755059776",
    featured: true,
    category: "product",
    relatedServiceSlug: "mobile-apps",
  },
  {
    slug: "voicelocal",
    name: "VoiceLocal",
    tagline: "Local, private, on-device dictation for macOS.",
    about:
      "VoiceLocal is on-device dictation for macOS. Audio never leaves the machine: a Tauri 2.0 shell, Rust, and a native Swift piece do the listening locally, with a Chrome extension for dropping text into the browser. It's for people who want voice input without a cloud speech API in the middle.",
    role: "Solo developer",
    stack: ["Tauri 2.0", "Rust", "Swift", "Chrome Extension"],
    status: "shipped",
    year: 2026,
    heroImage: "/work/voicelocal.jpg",
    liveUrl: "https://www.voicelocalapp.com",
    featured: true,
    category: "product",
    relatedServiceSlug: "web-development",
  },
  {
    slug: "oot-tastings",
    name: "OOT Tastings",
    tagline: "An olive oil tasting room, sold as an experience and booked online.",
    about:
      "OOT Tastings is the booking site for an olive oil tasting room — the visit is the product, not a bottle grid. Guests pick a time, get confirmation by email, and the business gets a site that loads fast enough to convert from a phone. Next.js, TypeScript, and Resend, hosted on Vercel.",
    role: "Freelance developer",
    stack: ["Next.js 16", "TypeScript", "Tailwind CSS v4", "Resend", "Vercel"],
    year: 2026, // confirm launch year
    status: "live",
    heroImage: "/work/oot-tastings.jpg",
    liveUrl: "https://www.ootastings.com",
    featured: true,
    category: "client",
    relatedServiceSlug: "web-development",
  },
  {
    slug: "holy-beliefs",
    name: "Holy Beliefs",
    tagline: "Faith-led streetwear on a custom storefront built to sell the drop.",
    about:
      "Holy Beliefs is a custom storefront for a faith-led streetwear label. The shop is built to sell the drop: a cart that isn't a rented theme, flash-sale behavior the owner can actually run, and a Next.js storefront they keep. Tailwind on the front, Vercel in production.",
    role: "Freelance developer",
    stack: ["Next.js", "Tailwind CSS", "Custom cart", "Vercel"],
    year: 2026, // confirm launch year
    status: "live",
    heroImage: "/work/holy-beliefs.jpg",
    liveUrl: "https://www.holybeliefs.com",
    featured: true,
    category: "client",
    relatedServiceSlug: "web-development",
  },
];

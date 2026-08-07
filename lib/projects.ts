/**
 * Single source of truth for all project content (spec §3).
 * To add a new project: append one object to this array — the homepage feed,
 * stats counters, and /work/[slug] (if wired up) all read from here.
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
  role: string;
  stack: string[];
  status: ProjectStatus;
  year: number;
  heroImage: string; // /public/work/<slug>.jpg
  liveUrl?: string;
  caseStudyUrl?: string; // internal /work/[slug]
  featured: boolean;
  category: "product" | "client";
  /**
   * Optional — no project has reviews yet. When populated, the work feed
   * renders an averaged star row; when absent it renders nothing.
   */
  reviews?: Review[];
}

/**
 * Placeholder URLs from the spec ("REPLACE…") count as missing, so a
 * half-filled entry never ships a dead link.
 */
export function resolvedUrl(project: Project): string | undefined {
  return project.liveUrl?.startsWith("REPLACE") ? undefined : project.liveUrl;
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

export const projects: Project[] = [
  {
    slug: "cybersimply",
    name: "CyberSimply",
    tagline: "Cybersecurity news, summarized by AI and stripped of the jargon.",
    role: "Solo developer",
    stack: ["React Native", "Expo"],
    status: "live", // now shipping on the App Store
    year: 2026,
    heroImage: "/work/cybersimply.jpg",
    liveUrl: "https://apps.apple.com/us/app/cyber-simply/id6752630267",
    featured: true,
    category: "product",
  },
  {
    slug: "alarmqr",
    name: "AlarmQR",
    tagline: "An alarm you can't sleep through — and can't fake dismissing.",
    role: "Solo developer",
    stack: ["React Native", "Expo", "AlarmKit", "VisionKit", "Supabase"],
    status: "live",
    year: 2026,
    heroImage: "/work/alarmqr.jpg",
    liveUrl: "https://apps.apple.com/us/app/alarm-qr/id6755059776",
    featured: true,
    category: "product",
  },
  {
    slug: "voicelocal",
    name: "VoiceLocal",
    tagline: "Local, private, on-device dictation for macOS.",
    role: "Solo developer",
    stack: ["Tauri 2.0", "Rust", "Swift", "Chrome Extension"],
    status: "shipped",
    year: 2026,
    heroImage: "/work/voicelocal.jpg",
    liveUrl: "https://www.voicelocalapp.com",
    featured: true,
    category: "product",
  },
  {
    slug: "oot-tastings",
    name: "OOT Tastings",
    tagline: "An olive oil tasting room, sold as an experience and booked online.",
    role: "Freelance developer",
    stack: ["Next.js 16", "TypeScript", "Tailwind CSS v4", "Resend", "Vercel"],
    year: 2026, // confirm launch year
    status: "live",
    heroImage: "/work/oot-tastings.jpg",
    liveUrl: "https://www.ootastings.com",
    featured: true,
    category: "client",
  },
  {
    slug: "holy-beliefs",
    name: "Holy Beliefs",
    tagline: "Faith-led streetwear on a custom storefront built to sell the drop.",
    role: "Freelance developer",
    stack: ["Next.js", "Tailwind CSS", "Custom cart", "Vercel"],
    year: 2026, // confirm launch year
    status: "live",
    heroImage: "/work/holy-beliefs.jpg",
    liveUrl: "https://www.holybeliefs.com",
    featured: true,
    category: "client",
  },
];

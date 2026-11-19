/**
 * Employer / internship packet for /hiring.
 *
 * Two tracks (Software Engineering + Security Engineering), each with its own
 * resume PDF, summary, and project emphasis. Resume downloads only — no cover
 * letters on the public site.
 */
export type CareerTrack = "software" | "security";

export interface BulletSection {
  title: string;
  items: string[];
}

export interface ProjectEntry {
  name: string;
  role: string;
  timeframe: string;
  bullets: string[];
}

export interface HiringTrack {
  id: CareerTrack;
  title: string;
  /** Short card blurb on the track picker. */
  tagline: string;
  seeking: string;
  summary: string;
  resumeHref: string;
  resumeDownloadAs: string;
  highlights: string[];
  skills: BulletSection[];
  projects: ProjectEntry[];
}

const SHARED_EDUCATION = [
  "Florida International University — Honors College (in progress): B.S. Cybersecurity, Minor in Artificial Intelligence · GPA 3.76 · Coursework: Discrete Mathematics, Java Programming",
  "McFatter Technical College (graduated): CTE Degree in Applied Cybersecurity",
];

const SHARED_EXPERIENCE: BulletSection = {
  title: "Freelance PC Builder & IT Support / AI Automation Consultant — Ongoing",
  items: [
    "Build custom PCs end-to-end (component selection, assembly, OS install, performance tuning) and provide ongoing remote/hands-on IT support for clients.",
    "Teach clients to build and run AI automations and agentic coding workflows for their own business use cases.",
  ],
};

export const hiringEducation = SHARED_EDUCATION;
export const hiringExperience = [SHARED_EXPERIENCE];

export const hiringTracks: HiringTrack[] = [
  {
    id: "software",
    title: "Software Engineering",
    tagline:
      "App Store apps, freelance full-stack, production ownership from architecture through monitoring.",
    seeking: "Summer 2027 Software Engineering internship",
    summary:
      "Cybersecurity undergraduate at FIU Honors College (Minor: Artificial Intelligence) with two applications shipped and maintained on the Apple App Store, a live NFC attendance SaaS (Checkerd), and a freelance web development practice serving paying clients end-to-end. Builds security-first, production-grade software — from architecture and backend design through deployment and monitoring.",
    resumeHref: "/resume/matthew-vella-resume-software-engineering.pdf",
    resumeDownloadAs: "Matthew_Vella_Resume_Software_Engineering.pdf",
    highlights: [
      "Studying for CompTIA Security+ (SY0-701) — target exam December 2026",
      "CyberPatriot National Youth Cyber Defense Competition — Platinum Tier, Linux Team Lead",
      "Silver Knight Award Nominee — Vocational-Technical, Miami Herald",
    ],
    skills: [
      {
        title: "Languages",
        items: ["TypeScript, JavaScript, Java, Swift, Rust"],
      },
      {
        title: "Frameworks & Runtime",
        items: ["Next.js, React Native / Expo, Node.js, Tauri 2.0"],
      },
      {
        title: "Backend & Infrastructure",
        items: [
          "Supabase (Postgres, RLS), Cloudflare Workers (D1, Queues, R2), Vercel, Stripe API, Resend, REST APIs, Webhooks, MCP",
        ],
      },
      {
        title: "Security & Systems",
        items: [
          "Linux hardening (Ubuntu, Kali, Mint), Wireshark, Cisco Packet Tracer, OAuth / token-based auth, Tailscale",
        ],
      },
      {
        title: "Tools",
        items: ["Xcode, App Store Connect, Git/GitHub, Cursor, CI/CD"],
      },
    ],
    projects: [
      {
        name: "Checkerd",
        role: "Founder & Solo Developer",
        timeframe: "2026 – Present",
        bullets: [
          "Built and launched an NFC tap-to-check-in SaaS for clubs and campus orgs (no app to install), live at checkerd.com with student organizations at FIU: Next.js 16 on Cloudflare Workers with D1, Queues, and R2.",
          "Made check-ins race-safe with atomic SQL and unique indexes so simultaneous taps can't double count; mirrored every check-in to Google Sheets through a queue with backoff retries, a dead-letter queue, and cron re-queueing.",
          "Shipped Stripe subscription billing, a versioned REST API with webhooks, Apple/Google Wallet member cards, Claude-powered attendance insights, and a remote MCP server with OAuth sign-in.",
        ],
      },
      {
        name: "CyberSimply",
        role: "Founder & Solo Developer",
        timeframe: "2025 – Present",
        bullets: [
          "Architected and shipped an automated breaking-news pipeline for cybersecurity news — RSS ingestion → LLM classification (Claude) → Supabase-backed deduplication → rate-limited push delivery — live on the Apple App Store.",
          "Led a full UI redesign (card-based feed, trending carousel, category browsing) and hardened the production pipeline with provider-migration fixes, failure alerting, and automated health checks.",
          "Built with React Native, Expo, TypeScript, and Supabase.",
        ],
      },
      {
        name: "AlarmQR",
        role: "Founder & Solo Developer",
        timeframe: "2025 – Present",
        bullets: [
          "Built a tamper-resistant alarm app requiring a physical QR scan to dismiss, using a native Swift bridge (VisionKit) for scanning and AlarmKit for scheduling.",
          "Shipped a re-engagement notification system (streak-risk, milestone, and win-back alerts) and a post-scan review-prompt flow; App Store analytics show 204% download growth and 15.8% install-to-scan conversion following launch.",
          "Built with React Native, Expo, Swift, and Supabase.",
        ],
      },
      {
        name: "VoiceLocal",
        role: "Founder & Solo Developer",
        timeframe: "2026",
        bullets: [
          "Built a fully on-device macOS dictation app (zero cloud processing of audio or text) with a Tauri 2.0 + Rust backend and a native Swift sidecar for system-wide text injection.",
          "Designed a hallucination-detection guard combining content-novelty checks and sentiment filtering to suppress false transcriptions in real time; shipped with a companion Chrome extension and Stripe-based licensing.",
        ],
      },
      {
        name: "MVella Studios",
        role: "Founder, Freelance Web Development",
        timeframe: "2025 – Present",
        bullets: [
          "Design and ship production Next.js/TypeScript web applications for small-business clients, owning full-stack architecture, payments, and deployment.",
          "Delivered e-commerce platforms including a streetwear storefront (Holy Beliefs) and a reservations platform for a tasting room (OOT Tastings), both with Stripe-driven checkout and transactional email via Resend.",
          "Manage client-facing infrastructure: custom domain email (Cloudflare + Resend SMTP), Google Ads search campaigns with conversion tracking, and recurring SEO/performance audits.",
        ],
      },
    ],
  },
  {
    id: "security",
    title: "Security Engineering",
    tagline:
      "CyberPatriot Platinum Linux Team Lead, RLS/auth by design, studying Security+ (SY0-701).",
    seeking: "Summer 2027 Security Engineering internship",
    summary:
      "Cybersecurity undergraduate at FIU Honors College (Minor: Artificial Intelligence), Platinum-tier CyberPatriot Linux Team Lead, with six production applications shipped end-to-end — including two live on the Apple App Store and a multi-tenant SaaS (Checkerd). Approaches software with security built in from the first design decision, not bolted on afterward.",
    resumeHref: "/resume/matthew-vella-resume-security-engineering.pdf",
    resumeDownloadAs: "Matthew_Vella_Resume_Security_Engineering.pdf",
    highlights: [
      "CyberPatriot National Youth Cyber Defense Competition — Platinum Tier, Linux Team Lead: hardened Ubuntu, Kali, and Mint systems against live-fire red-team scoring",
      "Studying for CompTIA Security+ (SY0-701) — target exam December 2026",
      "Hands-on practice via TryHackMe — network security, Linux administration, threat-detection fundamentals",
      "Silver Knight Award Nominee — Vocational-Technical, Miami Herald",
    ],
    skills: [
      {
        title: "Security & Systems",
        items: [
          "Linux hardening (Ubuntu, Kali, Mint), Wireshark, Cisco Packet Tracer, OAuth / token-based auth, TOTP 2FA, Content Security Policy, Row-Level Security (RLS) policy design, Tailscale",
        ],
      },
      {
        title: "Languages",
        items: ["TypeScript, JavaScript, Java, Swift, Rust"],
      },
      {
        title: "Frameworks & Runtime",
        items: ["Next.js, React Native / Expo, Node.js, Tauri 2.0"],
      },
      {
        title: "Backend & Infrastructure",
        items: [
          "Supabase (Postgres, RLS), Cloudflare Workers (D1, Queues, R2), Vercel, Stripe API, Resend, REST APIs, Webhooks, MCP",
        ],
      },
      {
        title: "Tools",
        items: ["Xcode, App Store Connect, Git/GitHub, Cursor, CI/CD"],
      },
    ],
    projects: [
      {
        name: "Checkerd",
        role: "Founder & Solo Developer",
        timeframe: "2026 – Present",
        bullets: [
          "Built and launched a multi-tenant NFC attendance SaaS for clubs and campus orgs, live at checkerd.com with student organizations at FIU, on Cloudflare Workers (D1, Queues, R2).",
          "Designed the auth and data-protection model: invite-only officer accounts with PBKDF2 password hashing and optional TOTP 2FA (secrets encrypted at rest), device tokens stored only as SHA-256 hashes, per-request CSP nonces, and rate limits on taps, sign-ins, and lookups.",
          "Exposed a versioned REST API, webhooks, and an OAuth-protected remote MCP server behind staff approval; enforced check-in rules with atomic SQL and unique indexes so concurrent taps can't double count.",
        ],
      },
      {
        name: "CyberSimply",
        role: "Founder & Solo Developer",
        timeframe: "2025 – Present",
        bullets: [
          "Architected a security-conscious content pipeline for cybersecurity news — RSS ingestion → LLM classification → Supabase-backed deduplication → rate-limited push delivery — live on the Apple App Store.",
          "Enforced per-user data isolation with Supabase Row-Level Security (RLS) policies and rate-limited delivery to prevent notification abuse; hardened the pipeline against silent failures with automated health checks and alerting.",
          "Built with React Native, Expo, TypeScript, and Supabase.",
        ],
      },
      {
        name: "AlarmQR",
        role: "Founder & Solo Developer",
        timeframe: "2025 – Present",
        bullets: [
          "Designed a tamper-resistant, anti-spoof dismissal control: a physical QR scan gated by a unique per-install token, preventing accidental or fraudulent alarm dismissal — built on a native Swift bridge (VisionKit) and AlarmKit.",
          "Shipped a re-engagement notification system (streak-risk, milestone, and win-back alerts); App Store analytics show 204% download growth and 15.8% install-to-scan conversion following launch.",
          "Built with React Native, Expo, Swift, and Supabase.",
        ],
      },
      {
        name: "VoiceLocal",
        role: "Founder & Solo Developer",
        timeframe: "2026",
        bullets: [
          "Built a privacy-first macOS dictation app with zero cloud processing of audio or text — all transcription and injection handled on-device via a Tauri 2.0 + Rust backend and a native Swift sidecar.",
          "Secured the companion Chrome extension with token-based WebSocket/HTTP authentication and designed a hallucination-detection guard (content-novelty checks + sentiment filtering) to suppress false transcriptions in real time.",
        ],
      },
      {
        name: "MVella Studios",
        role: "Founder, Freelance Web Development",
        timeframe: "2025 – Present",
        bullets: [
          "Design and ship production Next.js/TypeScript web applications for small-business clients, owning full-stack architecture, authentication, and secure payment integration end-to-end.",
          "Delivered e-commerce platforms (Holy Beliefs, OOT Tastings) with Stripe-driven checkout — no raw card data ever touches client infrastructure — and Supabase RLS policies enforcing per-tenant data isolation.",
          "Own client-facing infrastructure: custom domain email (Cloudflare + Resend SMTP) and recurring security/SEO audits.",
        ],
      },
    ],
  },
];

export function hiringTrack(id: CareerTrack): HiringTrack {
  const found = hiringTracks.find((t) => t.id === id);
  if (!found) throw new Error(`Unknown hiring track: ${id}`);
  return found;
}

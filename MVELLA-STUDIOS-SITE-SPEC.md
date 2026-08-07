# MVella Studios — Site Rebuild Spec

Rebuild of Matthew Vella's portfolio into a studio-style freelance site. Direction: **dark, technical, terminal-coded** — pulling structural ideas from Coffee Stain (project cards as "mini-launches"), Voodoo (huge type statement + hard stat counters, minimal chrome), and Rockstar (near-black, art-forward, almost no UI noise).

Goal of the site: generate freelance leads (via a quote form → Resend), showcase shipped products credibly like a real studio, and reinforce Matthew's "security-aware developer" positioning for his federal cybersecurity career track.

---

## 1. Design System

### Color tokens — updated to match the chosen logo (mirrored-text wordmark)
Colors pulled directly from the logo file (sampled, not eyeballed) so the site and the mark are one system, not two:

| Name | Hex | Source | Use |
|---|---|---|---|
| `ink` | `#0B0B0A` | logo's black, slightly softened for a full-page background | page background |
| `panel` | `#171715` | tint of ink | card/section surfaces |
| `panel-raised` | `#1F1F1C` | tint of ink | hovered/elevated surfaces |
| `steel` | `#3D3B3A` | sampled from the runner-up logo's charcoal | borders, dividers, muted text — a deliberate small nod to the concept that didn't get picked |
| `paper` | `#F6F5EF` | logo's exact cream, used as light text on dark bg (inverted from the logo's original light-bg/dark-text orientation) | primary text |
| `phosphor` (accent) | `#E8A33D` | warmed slightly from the earlier amber to sit better against the cream instead of a cooler ink+black palette | CTAs, active states, case-file status dots — **the one accent color, used sparingly** |

Dropped the second "signal" cyan accent from the earlier draft — the logo is monochrome by design (that restraint is *why* the mirror device reads as premium), so the site should stay black/cream with exactly one warm accent rather than reintroducing a second cool color that has nothing to do with the mark.

### Type
- **Display** (headlines): a geometric grotesk with some character — `General Sans` or `Cabinet Grotesk` (use `next/font/google` or self-host if using Cabinet Grotesk). Bold/semibold weights only.
- **Body**: `Inter` — for readability in paragraphs and form copy.
- **Mono** (system/label voice): `JetBrains Mono` — used specifically for eyebrows, project metadata, nav labels, stat labels, and the case-file readouts. This is a *content* choice, not decoration — it's the "system voice" of the site, distinct from the human voice of headlines/body.

Scale (desktop): hero display 72–96px / h2 40px / h3 24px / body 17px / mono label 13px, uppercase, letter-spacing 0.08–0.12em.

### Motion
- Hero: on load, the mono eyebrow line types itself out once (`> whoami`), then the headline fades/rises in. One orchestrated moment, not looped.
- Project cards: scroll-triggered reveal, staggered fade + 12px rise. Case-file metadata line types itself in as the card enters viewport.
- Hover: card border shifts from `steel` to `phosphor`, subtle 1.01 scale, background art gets a slight parallax/zoom.
- Respect `prefers-reduced-motion`: disable typing effects and parallax, keep simple fades.

### Signature element
Every project is presented like a pulled security case file, not a portfolio thumbnail:
```
> case_03 // voicelocal
STACK   Tauri 2.0 · Rust · Swift · Chrome Ext
ROLE    Solo developer
STATUS  ● SHIPPED
YEAR    2026
```
This readout renders in mono, top-left of each full-bleed project block, before the title/art. It's the one recurring device tying the "developer" and "security" identity together — use it consistently, don't add other decorative devices (no gratuitous numbered steps, no fake terminal windows everywhere).

---

## 2. Site Architecture (Next.js 14, App Router, TypeScript, Tailwind)

```
/                     → home (single long scroll: hero, stats, work feed, services, about, contact)
/work/[slug]          → optional deeper case-study page per project (only build if content warrants it)
/api/contact           → POST route, Resend integration
```

Keep it a single-page scroll for the main experience (matches the reference sites) — `/work/[slug]` pages are optional add-ons for the 1–2 projects with enough story to justify a deeper page (AlarmQR is the strongest candidate).

---

## 3. Content model — `lib/projects.ts` (make this the single source of truth)

```ts
export type ProjectStatus = "live" | "shipped" | "in_development";

export interface Project {
  slug: string;
  name: string;
  tagline: string;          // one-line hook, shown big
  role: string;
  stack: string[];
  status: ProjectStatus;
  year: number;
  heroImage: string;        // /public/work/<slug>.jpg
  liveUrl?: string;
  caseStudyUrl?: string;    // internal /work/[slug]
  featured: boolean;
  category: "product" | "client";
}

export const projects: Project[] = [
  {
    slug: "alarmqr",
    name: "AlarmQR",
    tagline: "An alarm you can't sleep through — and can't fake dismissing.",
    role: "Solo developer",
    stack: ["React Native", "Expo", "AlarmKit", "VisionKit", "Supabase"],
    status: "live",
    year: 2026,
    heroImage: "/work/alarmqr.jpg",
    liveUrl: "REPLACE_WITH_APP_STORE_URL",
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
    featured: true,
    category: "product",
  },
  {
    slug: "cybersimply",
    name: "CyberSimply",
    tagline: "REPLACE — confirm one-line description with Matthew",
    role: "Solo developer",
    stack: ["REPLACE"],
    status: "in_development",
    year: 2026,
    heroImage: "/work/cybersimply.jpg",
    featured: true,
    category: "product",
  },
  {
    slug: "jovell-hospitality",
    name: "JoVell Hospitality Group",
    tagline: "Marketing site for a hospitality group — booked for launch, built for speed.",
    role: "Freelance developer",
    stack: ["Next.js 14", "Tailwind", "Framer Motion", "Resend"],
    status: "live",
    year: 2026,
    heroImage: "/work/jovell.jpg",
    liveUrl: "https://jovellhg.com",
    featured: true,
    category: "client",
  },
  {
    slug: "chased-but-not-chosen",
    name: "Chased But Not Chosen",
    tagline: "E-commerce site with Stripe-powered digital delivery.",
    role: "Freelance developer",
    stack: ["Next.js", "Stripe", "Vercel Blob"],
    status: "live",
    year: 2026,
    heroImage: "/work/chasedbutnotchosen.jpg",
    liveUrl: "https://chasedbutnotchosen.com",
    featured: false,
    category: "client",
  },
  {
    slug: "adele-farina",
    name: "Adele Farina",
    tagline: "Clean static site with custom email deliverability setup.",
    role: "Freelance developer",
    stack: ["Next.js", "Vercel"],
    status: "live",
    year: 2026,
    heroImage: "/work/adelefarina.jpg",
    liveUrl: "https://adelefarina.com",
    featured: false,
    category: "client",
  },
];
```

**To add a new project later: append one object to this array.** The homepage feed, the stats counters, and (if wired up) the `/work/[slug]` route all read from this file — nothing else needs to change. Flag to Matthew: double check client sites are OK to publicly showcase before launch (usually fine, but worth a quick confirm with Joseph/Danielle/Adele).

---

## 4. Section-by-section

**Nav** — fixed, minimal. Logo (horizontal lockup) left. Links: `Work` `Services` `About` `Contact`. Small phosphor-outlined button, right: `> get a quote`.

**Hero**
- Mono eyebrow, typed on load: `> whoami`
- Display headline: something like *"Security-minded software, built and shipped."* (Matthew should tune to his voice)
- Subhead: one sentence — freelance web + app development, built by someone who thinks about security by default.
- Two CTAs: `View Work` (scrolls to feed) / `Start a Project` (scrolls to contact)

**Stats bar** (Voodoo-style hard numbers, pull real counts from `projects.ts` where possible)
- e.g. products shipped, client sites launched, "Security+ in progress", years building.

**Work feed** — the core of the page. Loop `projects.ts`, full-bleed alternating blocks, case-file readout → hero art → title/tagline → stack tags → CTA (`Visit Site` for client work, `View on App Store` / `Read the case study` for products).

**Services** — 3–4 cards: Web Development, iOS/Mobile Apps, Security-Minded Architecture, SEO & Performance Audits (Matthew already has a reusable SEO audit prompt template — reference it here as a real differentiator, not generic copy).

**About** — short bio: cybersecurity sophomore at FIU's Honors College, prior technical degree, has shipped real apps, freelances for small businesses, working toward Security+. Positioning line: builds software the way he'd want it secured.

**Contact / quote form**
Fields: Name, Email, Project type (select: Website / Web App / iOS App / Other), Budget range (select), Message, hidden honeypot field.
Submit → `/api/contact`.

**Footer** — wordmark, social/LinkedIn/GitHub, direct email, © year, "Based in South Florida."

---

## 5. Contact form — Resend implementation

`app/api/contact/route.ts`:
- Validate body with `zod`.
- Reject if honeypot field is filled (spam bot).
- Send via Resend:
  1. Notification email to Matthew with the submission.
  2. Auto-reply confirmation to the sender (reuse the pattern from the jovellhg.com/chasedbutnotchosen.com contact forms).
- Return a typed success/error JSON response; show inline success/error state on the form (no page reload).

Env vars needed:
```
RESEND_API_KEY=
CONTACT_TO_EMAIL=
NEXT_PUBLIC_SITE_URL=
```

Future hardening (not required for launch): basic IP rate limiting if spam becomes an issue.

---

## 6. Stack
Next.js 14 (App Router) · TypeScript · Tailwind (extend `theme` with the tokens above) · Framer Motion for scroll reveals and the hero type-in sequence · `next/font` for the three typefaces · `next/image` for hero art · Resend for the contact flow · Vercel for deploy.

---

## 7. Logo assets (delivered separately)
Final pick: the mirrored wordmark — **MVELLA** set normally over **STUDIOS** rotated 180°, so the second line reads upside-down beneath the first. No icon/symbol, wordmark-only mark.

- `mvella-wordmark-dark.svg` — paper-on-transparent recreation of the mark, ready to sit on the site's dark background. This is a hand-recreated vector (matched font weight/proportions, not a 1:1 trace) — if Matthew has the original vector/Figma/Canva source file, export the real one at the same orientation/colors and swap it in; use this file only as a placeholder if not.
- Use in the nav (small, ~32–40px tall) and larger in the footer.
- **Open gap: there's no compact icon-only mark for the favicon/app share image**, since this logo is wordmark-only. Simplest fix: crop just the "M" from "MVELLA" as a temporary favicon glyph, or ask Matthew if he wants a proper compact icon designed to pair with this wordmark before launch.
- Usage: keep the two-line mirror relationship intact — never split the lines apart or use "MVELLA" without "STUDIOS" underneath, the flip *is* the identity. Clear space around the mark ≈ the cap-height of "MVELLA."

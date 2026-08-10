/**
 * Canonical public site origin — used by sitemap, robots, JSON-LD, and OG.
 * Prefer NEXT_PUBLIC_SITE_URL in Vercel; fall back to the live domain.
 */
export const SITE_ORIGIN =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  "https://www.mvella.com";

export const STUDIO_NAME = "MVella Studios";
export const STUDIO_AREA = "South Florida";

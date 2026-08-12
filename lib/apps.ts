import { projects } from "@/lib/projects";

/**
 * Apps that accept Support / Feedback inquiries from the public site.
 * Derived from shipped product projects so the dropdown stays in sync
 * with the work feed (AlarmQR, CyberSimply, VoiceLocal, …).
 */
export interface StudioApp {
  slug: string;
  name: string;
}

export const studioApps: StudioApp[] = projects
  .filter((p) => p.category === "product")
  .map((p) => ({ slug: p.slug, name: p.name }));

export function findStudioApp(slug: string): StudioApp | undefined {
  return studioApps.find((app) => app.slug === slug);
}

export function isStudioAppSlug(slug: string): boolean {
  return studioApps.some((app) => app.slug === slug);
}

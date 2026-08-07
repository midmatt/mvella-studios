import type { ReactNode } from "react";

/**
 * Shared shell for the legal routes, so /legal and /terms can't drift apart
 * typographically. Body styling lives in the `.legal-prose` component class
 * in globals.css; this owns the page frame and the "Last updated" line.
 *
 * There is no markdown pipeline in this project (no MDX, remark, or marked —
 * see the note in app/about/page.tsx), so the source documents are
 * transcribed to JSX rather than rendered at build time.
 */
export default function LegalDocument({
  title,
  meta,
  children,
}: {
  title: string;
  /**
   * The document's own dateline, rendered verbatim beneath the title —
   * "Effective date: …" for the legal pages, "Version: …" for others.
   * A ReactNode so an unresolved REPLACE can render as a <Placeholder>.
   */
  meta: ReactNode;
  children: ReactNode;
}) {
  return (
    /* pt-16 clears the fixed 4rem nav, matching the other routes */
    <div className="pt-16">
      <section aria-label={title} className="bg-ink">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <h1 className="font-display text-h2 text-paper">{title}</h1>
          <p className="mt-4 text-body text-paper/50">{meta}</p>

          <div className="legal-prose mt-12">{children}</div>
        </div>
      </section>
    </div>
  );
}

/**
 * An unfilled placeholder carried over from the source document — e.g.
 * "[YOUR CONTACT EMAIL]". Rendered with a visible marker so a review pass
 * can't scroll past one: these must all be resolved before launch.
 */
export function Placeholder({ children }: { children: ReactNode }) {
  return (
    <mark className="border border-phosphor/60 bg-phosphor/10 px-1.5 py-0.5 font-mono text-[0.9em] text-phosphor">
      {children}
    </mark>
  );
}

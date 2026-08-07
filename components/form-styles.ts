/**
 * Shared input styling for ContactForm and QuoteBuilder, so the two forms
 * can't drift apart. Mono labels, steel borders, panel surfaces, phosphor
 * focus — the site's existing control language.
 */
export const fieldClass =
  "w-full border border-steel bg-panel px-4 py-3 text-body text-paper transition-colors placeholder:text-paper/30 hover:border-steel focus:border-phosphor focus:outline-none";

export const labelClass = "mono-label mb-2 block text-paper/60";

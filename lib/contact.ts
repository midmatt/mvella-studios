/**
 * Studio email addresses — single source of truth.
 *
 * All mail is on mvella.com. Role-based local parts keep the public site,
 * legal pages, and internal notifications clear without requiring separate
 * inboxes (aliases / catch-all can land them wherever you prefer).
 *
 * CONTACT_TO_EMAIL / CONTACT_FROM_EMAIL env vars still override the API
 * routes when set in Vercel.
 */

/** Public-facing contact shown in the footer, contact page, and form fallbacks. */
export const DIRECT_EMAIL = "hello@mvella.com";

/** Privacy / Terms contact address. */
export const LEGAL_EMAIL = "info@mvella.com";

/** Where form + agreement notifications land (Matthew). */
export const NOTIFY_EMAIL = "matthew@mvella.com";

/**
 * Default Resend sender. Must be a verified mvella.com address — Resend
 * rejects gmail.com (and any other domain you don't own) as From.
 */
export const FROM_EMAIL = "MVella Studios <hello@mvella.com>";

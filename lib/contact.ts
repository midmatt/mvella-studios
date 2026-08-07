/**
 * The studio's contact address — single source of truth.
 *
 * Previously this string was hardcoded in six places (four form components,
 * the footer, and the /contact sidebar) and drifted out of sync with the
 * address the API routes actually notify. Everything imports from here now.
 *
 * Note this is the FROM-address's opposite number: it's where mail is sent
 * TO. The Resend sender is configured separately via CONTACT_FROM_EMAIL and
 * must be a domain you own — a gmail.com address is rejected as a sender.
 */
export const DIRECT_EMAIL = "matthewvella.dev@gmail.com";

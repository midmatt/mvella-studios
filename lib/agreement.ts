/**
 * Version identifier stored with every consent record in the `agreements`
 * table, so a signature can always be matched to the exact text that was on
 * screen when it was given.
 *
 * ⚠️ BUMP THIS whenever the wording in components/AgreementText.tsx changes
 * in any substantive way — records pointing at a stale version are evidence
 * of agreement to text that no longer exists.
 *
 * client-service-agreement.md states "Version: 1.0" but marks it REPLACE,
 * and the document still carries seven unresolved REPLACE markers plus an
 * explicit instruction to have Section 8 reviewed by an attorney. The
 * "-draft" suffix stays until those are resolved: no record captured against
 * a draft version should be treated as a signed engagement. Drop it — to a
 * plain "1.0" — once the text is final.
 */
export const AGREEMENT_VERSION = "1.0-draft";

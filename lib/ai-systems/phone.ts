/**
 * Demo intake only — US-first E.164 for Vapi/Twilio. Not a general
 * libphonenumber replacement; international numbers with a leading +
 * and 10–15 digits are accepted as-is.
 */
export function toE164(input: string): string | null {
  const trimmed = input.trim();
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  if (trimmed.startsWith("+") && digits.length >= 10 && digits.length <= 15) {
    return `+${digits}`;
  }
  return null;
}

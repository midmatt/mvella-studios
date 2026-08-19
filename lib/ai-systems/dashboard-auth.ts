/**
 * Cookie session for /ai-systems/dashboard. HMAC over an expiry timestamp,
 * using DEMO_DASHBOARD_SECRET (or the dashboard password) as the key.
 * Edge-safe — Web Crypto only, so middleware can verify it.
 */

export const DASHBOARD_COOKIE = "mvella_demo_dashboard";
export const DASHBOARD_MAX_AGE_SECONDS = 60 * 60 * 12;
export const DASHBOARD_LOGIN_PATH = "/ai-systems/dashboard/login";
export const DASHBOARD_HOME_PATH = "/ai-systems/dashboard";

function encoder() {
  return new TextEncoder();
}

function toHex(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function fromHex(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i += 1) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

export function dashboardSecret(): string | null {
  return (
    process.env.DEMO_DASHBOARD_SECRET ||
    process.env.DEMO_DASHBOARD_PASSWORD ||
    null
  );
}

export function dashboardPassword(): string | null {
  return process.env.DEMO_DASHBOARD_PASSWORD || null;
}

async function hmacHex(secret: string, payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder().encode(payload));
  return toHex(sig);
}

function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  const left = fromHex(a);
  const right = fromHex(b);
  if (left.length !== right.length) return false;
  let diff = 0;
  for (let i = 0; i < left.length; i += 1) {
    diff |= left[i] ^ right[i];
  }
  return diff === 0;
}

export async function signDashboardSession(secret: string): Promise<string> {
  const exp = Date.now() + DASHBOARD_MAX_AGE_SECONDS * 1000;
  const payload = String(exp);
  const sig = await hmacHex(secret, payload);
  return `${payload}.${sig}`;
}

export async function verifyDashboardSession(
  secret: string,
  token: string | undefined
): Promise<boolean> {
  if (!token) return false;
  const dot = token.indexOf(".");
  if (dot <= 0) return false;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const exp = Number(payload);
  if (!Number.isFinite(exp) || Date.now() > exp) return false;
  const expected = await hmacHex(secret, payload);
  return timingSafeEqualHex(sig, expected);
}

export async function passwordsMatch(
  provided: string,
  expected: string
): Promise<boolean> {
  const a = await hmacHex("mvella-demo-password-cmp", provided);
  const b = await hmacHex("mvella-demo-password-cmp", expected);
  return timingSafeEqualHex(a, b);
}

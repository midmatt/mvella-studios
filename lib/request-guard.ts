import { NextResponse } from "next/server";
import { SITE_ORIGIN } from "@/lib/site";

/**
 * Shared guards for public POST routes (/api/contact, /api/agreement,
 * /api/app-inquiry). Honeypots still sit in each route; this layer stops
 * cross-origin form posts and slows down volumetric spam.
 *
 * Rate-limit state is in-process. On Vercel each isolate has its own map,
 * so this is a first line, not a global quota. Upgrade to Upstash if abuse
 * starts costing Resend/Stripe money.
 */

const WINDOW_MS = 10 * 60 * 1000;
const DEFAULT_MAX = 8;

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

function allowedOrigins(): Set<string> {
  const allowed = new Set<string>([SITE_ORIGIN]);
  const vercel = process.env.VERCEL_URL;
  if (vercel) allowed.add(`https://${vercel.replace(/^https?:\/\//, "")}`);
  if (process.env.NODE_ENV !== "production") {
    for (const port of ["3000", "3001", "3002"]) {
      allowed.add(`http://localhost:${port}`);
      allowed.add(`http://127.0.0.1:${port}`);
    }
  }
  return allowed;
}

/** Reject browser POSTs whose Origin is not this site. */
export function rejectIfCrossOrigin(request: Request): NextResponse | null {
  const origin = request.headers.get("origin");
  if (!origin) return null;

  try {
    const normalized = new URL(origin).origin;
    if (allowedOrigins().has(normalized)) return null;
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

/** Sliding-window cap per IP per route. Returns 429 when exceeded. */
export function rejectIfRateLimited(
  request: Request,
  route: string,
  max = DEFAULT_MAX
): NextResponse | null {
  const key = `${route}:${clientIp(request)}`;
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return null;
  }

  bucket.count += 1;
  if (bucket.count > max) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  return null;
}

/** Origin check then rate limit. First non-null response should be returned. */
export function guardPublicPost(
  request: Request,
  route: string,
  max?: number
): NextResponse | null {
  return (
    rejectIfCrossOrigin(request) ?? rejectIfRateLimited(request, route, max)
  );
}

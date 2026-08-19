import { NextResponse } from "next/server";

export const DEMO_INTERNAL_HEADER = "x-demo-leads-secret";

export function demoInternalSecret(): string | null {
  return process.env.DEMO_LEADS_WEBHOOK_SECRET ?? null;
}

export function rejectIfUnauthorizedInternal(
  request: Request
): NextResponse | null {
  const expected = demoInternalSecret();
  if (!expected) {
    return NextResponse.json(
      { error: "Demo internal auth is not configured" },
      { status: 503 }
    );
  }
  const header = request.headers.get(DEMO_INTERNAL_HEADER);
  const bearer = request.headers.get("authorization");
  const token = header ?? (bearer?.startsWith("Bearer ") ? bearer.slice(7) : null);
  if (!token || token !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export function newWatchToken(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function secondsBetween(startIso: string, endIso: string): number {
  const start = Date.parse(startIso);
  const end = Date.parse(endIso);
  if (!Number.isFinite(start) || !Number.isFinite(end)) return 0;
  return Math.max(0, (end - start) / 1000);
}

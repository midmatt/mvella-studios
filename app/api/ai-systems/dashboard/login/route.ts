import { NextResponse } from "next/server";
import {
  DASHBOARD_COOKIE,
  DASHBOARD_HOME_PATH,
  DASHBOARD_MAX_AGE_SECONDS,
  dashboardPassword,
  dashboardSecret,
  passwordsMatch,
  signDashboardSession,
} from "@/lib/ai-systems/dashboard-auth";
import { rejectIfCrossOrigin, rejectIfRateLimited } from "@/lib/request-guard";

export async function POST(request: Request) {
  const blocked = rejectIfCrossOrigin(request) ?? rejectIfRateLimited(request, "demo-dashboard-login", 8);
  if (blocked) return blocked;

  const expected = dashboardPassword();
  const secret = dashboardSecret();
  if (!expected || !secret) {
    return NextResponse.json(
      { error: "Dashboard password is not configured" },
      { status: 503 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const password =
    typeof body === "object" && body && "password" in body
      ? String((body as { password: unknown }).password)
      : "";

  if (!(await passwordsMatch(password, expected))) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const token = await signDashboardSession(secret);
  const response = NextResponse.json({ ok: true, redirect: DASHBOARD_HOME_PATH });
  response.cookies.set({
    name: DASHBOARD_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/ai-systems/dashboard",
    maxAge: DASHBOARD_MAX_AGE_SECONDS,
  });
  return response;
}

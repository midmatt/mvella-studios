import { NextResponse } from "next/server";
import {
  DASHBOARD_COOKIE,
  DASHBOARD_LOGIN_PATH,
} from "@/lib/ai-systems/dashboard-auth";
import { rejectIfCrossOrigin } from "@/lib/request-guard";

export async function POST(request: Request) {
  const blocked = rejectIfCrossOrigin(request);
  if (blocked) return blocked;

  const response = NextResponse.json({
    ok: true,
    redirect: DASHBOARD_LOGIN_PATH,
  });
  response.cookies.set({
    name: DASHBOARD_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/ai-systems/dashboard",
    maxAge: 0,
  });
  return response;
}

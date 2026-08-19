import { NextRequest, NextResponse } from "next/server";
import {
  DASHBOARD_COOKIE,
  DASHBOARD_HOME_PATH,
  DASHBOARD_LOGIN_PATH,
  dashboardSecret,
  verifyDashboardSession,
} from "@/lib/ai-systems/dashboard-auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith("/ai-systems/dashboard")) {
    return NextResponse.next();
  }
  if (pathname === DASHBOARD_LOGIN_PATH) {
    return NextResponse.next();
  }

  const secret = dashboardSecret();
  const token = request.cookies.get(DASHBOARD_COOKIE)?.value;
  const ok = secret ? await verifyDashboardSession(secret, token) : false;
  if (ok) return NextResponse.next();

  const login = request.nextUrl.clone();
  login.pathname = DASHBOARD_LOGIN_PATH;
  login.search = "";
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/ai-systems/dashboard", "/ai-systems/dashboard/:path*"],
};

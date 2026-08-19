import { NextResponse } from "next/server";
import { getDemoLeadByWatchToken } from "@/lib/ai-systems/supabase";
import type { DemoLeadWatch } from "@/lib/ai-systems/types";
import { rejectIfRateLimited } from "@/lib/request-guard";

type RouteContext = { params: Promise<{ token: string }> };

export async function GET(request: Request, context: RouteContext) {
  const limited = rejectIfRateLimited(request, "ai-systems-watch", 60);
  if (limited) return limited;

  const { token } = await context.params;
  if (!token || token.length < 16) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const lead = await getDemoLeadByWatchToken(token);
    if (!lead) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const watch: DemoLeadWatch = {
      id: lead.id,
      name: lead.name,
      call_status: lead.call_status,
      booked: lead.booked,
      response_time_seconds: lead.response_time_seconds,
      contact_channel: lead.contact_channel,
      submitted_at: lead.submitted_at,
    };

    return NextResponse.json(watch);
  } catch (err) {
    console.error("demo_leads watch failed:", err);
    return NextResponse.json({ error: "Watch lookup failed" }, { status: 502 });
  }
}

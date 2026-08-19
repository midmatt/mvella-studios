import { NextResponse } from "next/server";
import { z } from "zod";
import { rejectIfUnauthorizedInternal } from "@/lib/ai-systems/internal";
import { demoLeadsClient, getDemoLeadById } from "@/lib/ai-systems/supabase";
import {
  DEMO_CALL_STATUSES,
  DEMO_LEAD_PATCH_FIELDS,
  type DemoLeadPatch,
} from "@/lib/ai-systems/types";

const patchSchema = z
  .object({
    first_contact_at: z.string().nullable().optional(),
    response_time_seconds: z.number().finite().nonnegative().nullable().optional(),
    call_status: z.enum(DEMO_CALL_STATUSES).optional(),
    booked: z.boolean().optional(),
    booked_at: z.string().nullable().optional(),
    qualification_score: z.number().int().min(1).max(10).nullable().optional(),
    qualification_summary: z.string().max(4000).nullable().optional(),
    qualification_urgency: z.string().max(40).nullable().optional(),
    contact_channel: z.enum(["voice", "sms", "none"]).nullable().optional(),
    vapi_call_id: z.string().max(120).nullable().optional(),
    cal_com_booking_uid: z.string().max(200).nullable().optional(),
    sms_sent_at: z.string().nullable().optional(),
    recording_consent: z
      .enum(["granted", "declined", "unknown"])
      .nullable()
      .optional(),
    n8n_fired_at: z.string().nullable().optional(),
    n8n_error: z.string().max(1000).nullable().optional(),
  })
  .strict();

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  const denied = rejectIfUnauthorizedInternal(request);
  if (denied) return denied;

  const { id } = await context.params;
  const lead = await getDemoLeadById(id);
  if (!lead) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(lead);
}

export async function PATCH(request: Request, context: RouteContext) {
  const denied = rejectIfUnauthorizedInternal(request);
  if (denied) return denied;

  const { id } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const existing = await getDemoLeadById(id);
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const patch: DemoLeadPatch = { updated_at: new Date().toISOString() };
  for (const key of DEMO_LEAD_PATCH_FIELDS) {
    if (key === "updated_at") continue;
    if (key in parsed.data) {
      const value = parsed.data[key as keyof typeof parsed.data];
      if (value !== undefined) {
        (patch as Record<string, unknown>)[key] = value;
      }
    }
  }

  if (patch.sms_sent_at && !existing.first_contact_at && !patch.first_contact_at) {
    patch.first_contact_at = patch.sms_sent_at;
    patch.response_time_seconds = secondsSince(existing.submitted_at, patch.sms_sent_at);
  }
  if (patch.first_contact_at && existing.first_contact_at) {
    delete patch.first_contact_at;
    if (existing.response_time_seconds != null) {
      delete patch.response_time_seconds;
    }
  }
  if (patch.first_contact_at && patch.response_time_seconds == null) {
    patch.response_time_seconds = secondsSince(
      existing.submitted_at,
      patch.first_contact_at
    );
  }
  if (patch.booked === true && !patch.booked_at && !existing.booked_at) {
    patch.booked_at = new Date().toISOString();
    patch.call_status = patch.call_status ?? "booked";
  }

  const { data, error } = await demoLeadsClient()
    .from("demo_leads")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();

  if (error || !data) {
    console.error("demo_leads patch failed:", error?.message);
    return NextResponse.json({ error: "Failed to update lead" }, { status: 502 });
  }

  return NextResponse.json(data);
}

function secondsSince(startIso: string, endIso: string): number {
  return Math.max(0, (Date.parse(endIso) - Date.parse(startIso)) / 1000);
}

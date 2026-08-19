import { NextResponse } from "next/server";
import { z } from "zod";
import { calComBookingUrl } from "@/lib/ai-systems/calcom";
import {
  FLORIDA_RECORDING_CONSENT_SCRIPT,
  speedToLeadSystemPrompt,
} from "@/lib/ai-systems/consent";
import { newWatchToken } from "@/lib/ai-systems/internal";
import { toE164 } from "@/lib/ai-systems/phone";
import { demoLeadsClient } from "@/lib/ai-systems/supabase";
import { DEMO_SERVICE_TYPES } from "@/lib/ai-systems/types";
import { guardPublicPost } from "@/lib/request-guard";
import { SITE_ORIGIN } from "@/lib/site";

/**
 * Speed-to-Lead demo intake. Writes ONLY to demo_leads, then fires the
 * n8n webhook. Does not touch /api/contact, Resend, or agreements.
 */
const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  phone: z.string().trim().min(7, "Phone is required").max(40),
  serviceType: z.enum(DEMO_SERVICE_TYPES),
  description: z.string().trim().min(1, "Description is required").max(2000),
  consent: z.literal(true, {
    error: "Call and SMS consent is required",
  }),
  website: z.string().max(1000).optional(),
});

export async function POST(request: Request) {
  const blocked = guardPublicPost(request, "ai-systems-leads", 3);
  if (blocked) return blocked;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  if (parsed.data.website) {
    return NextResponse.json({ ok: true, watchToken: newWatchToken() });
  }

  const phone = toE164(parsed.data.phone);
  if (!phone) {
    return NextResponse.json(
      { error: "Enter a valid US phone number" },
      { status: 400 }
    );
  }

  let supabase;
  try {
    supabase = demoLeadsClient();
  } catch {
    return NextResponse.json(
      { error: "Demo storage is not configured (Supabase env vars missing)" },
      { status: 503 }
    );
  }

  const watchToken = newWatchToken();
  const { data: row, error: insertError } = await supabase
    .from("demo_leads")
    .insert({
      name: parsed.data.name,
      phone,
      service_type: parsed.data.serviceType,
      description: parsed.data.description,
      watch_token: watchToken,
      call_status: "pending",
    })
    .select(
      "id, name, phone, service_type, description, submitted_at, call_status"
    )
    .single();

  if (insertError || !row) {
    console.error("demo_leads insert failed:", insertError?.message);
    return NextResponse.json(
      { error: "Failed to record the demo lead" },
      { status: 502 }
    );
  }

  const webhookUrl = process.env.N8N_WEBHOOK_URL;
  let n8nOk = false;
  let n8nError: string | null = null;

  if (!webhookUrl) {
    n8nError = "N8N_WEBHOOK_URL is not set";
  } else {
    const bookingUrl = calComBookingUrl();
    const payload = {
      lead: {
        id: row.id,
        name: row.name,
        phone: row.phone,
        service_type: row.service_type,
        description: row.description,
        submitted_at: row.submitted_at,
      },
      api: {
        leadUrl: `${SITE_ORIGIN}/api/ai-systems/leads/${row.id}`,
        vapiCallbackUrl: `${SITE_ORIGIN}/api/ai-systems/vapi`,
      },
      vapi: {
        firstMessage: FLORIDA_RECORDING_CONSENT_SCRIPT,
        systemPrompt: speedToLeadSystemPrompt({
          name: row.name,
          serviceType: row.service_type,
          description: row.description,
          bookingUrl,
        }),
        serverUrl: `${SITE_ORIGIN}/api/ai-systems/vapi`,
        bookingUrl,
      },
    };

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      const secret = process.env.DEMO_LEADS_WEBHOOK_SECRET;
      if (secret) {
        headers["x-demo-leads-secret"] = secret;
        headers.Authorization = `Bearer ${secret}`;
      }

      const n8nResponse = await fetch(webhookUrl, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });
      n8nOk = n8nResponse.ok;
      if (!n8nOk) {
        n8nError = `n8n answered ${n8nResponse.status}`;
      }
    } catch (err) {
      n8nError = err instanceof Error ? err.message : "n8n request failed";
    }
  }

  const { error: updateError } = await supabase
    .from("demo_leads")
    .update({
      n8n_fired_at: n8nOk ? new Date().toISOString() : null,
      n8n_error: n8nError,
      call_status: n8nOk ? "qualifying" : "pending",
      updated_at: new Date().toISOString(),
    })
    .eq("id", row.id);

  if (updateError) {
    console.error("demo_leads n8n status update failed:", updateError.message);
  }

  return NextResponse.json({
    ok: true,
    id: row.id,
    watchToken,
    n8n: n8nOk,
  });
}

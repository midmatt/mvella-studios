import { NextResponse } from "next/server";
import { createCalComBooking } from "@/lib/ai-systems/calcom";
import { demoLeadsClient, getDemoLeadById } from "@/lib/ai-systems/supabase";
import type {
  DemoCallStatus,
  DemoLead,
  DemoLeadPatch,
  RecordingConsent,
} from "@/lib/ai-systems/types";

/**
 * Public Vapi server URL. n8n cannot receive these while it is only on
 * localhost; this route updates demo_leads and books Cal.com when the
 * assistant extracted a slot.
 */
export async function POST(request: Request) {
  const denied = rejectIfVapiUnauthorized(request);
  if (denied) return denied;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const message = (body as { message?: VapiMessage }).message;
  if (!message || typeof message !== "object") {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const leadId = extractLeadId(message);
  const callId = message.call?.id ?? null;
  if (!leadId) {
    return NextResponse.json({ ok: true, ignored: "no-lead-id" });
  }

  const lead = await getDemoLeadById(leadId);
  if (!lead) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const patch = patchFromVapi(lead, message, callId);
  const structured = extractStructured(message);

  if (structured?.recording_consent) {
    patch.recording_consent = structured.recording_consent;
  }
  if (structured?.recording_consent === "declined") {
    patch.call_status = "consent_declined";
  }

  if (
    message.type === "end-of-call-report" &&
    structured?.booked_intent &&
    structured.preferred_start_iso &&
    structured.attendee_email &&
    !lead.booked
  ) {
    const booked = await createCalComBooking({
      startIso: structured.preferred_start_iso,
      name: lead.name,
      email: structured.attendee_email,
      phone: lead.phone,
      notes: lead.description,
    });
    if ("uid" in booked) {
      patch.booked = true;
      patch.booked_at = new Date().toISOString();
      patch.cal_com_booking_uid = booked.uid;
      patch.call_status = "booked";
      patch.contact_channel = lead.contact_channel ?? "voice";
    } else {
      console.error("demo_leads Cal.com booking failed:", booked.error);
    }
  }

  if (Object.keys(patch).length <= 1) {
    return NextResponse.json({ ok: true, unchanged: true });
  }

  const { error } = await demoLeadsClient()
    .from("demo_leads")
    .update(patch)
    .eq("id", leadId);

  if (error) {
    console.error("demo_leads vapi update failed:", error.message);
    return NextResponse.json({ error: "Failed to update lead" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}

function rejectIfVapiUnauthorized(request: Request): NextResponse | null {
  const vapiSecret = process.env.VAPI_SERVER_SECRET;
  const demoSecret = process.env.DEMO_LEADS_WEBHOOK_SECRET;
  const header =
    request.headers.get("x-vapi-secret") ??
    request.headers.get("x-demo-leads-secret");
  const bearer = request.headers.get("authorization");
  const token =
    header ?? (bearer?.startsWith("Bearer ") ? bearer.slice(7) : null);

  if (!vapiSecret && !demoSecret) {
    return NextResponse.json(
      { error: "Vapi webhook secret is not configured" },
      { status: 503 }
    );
  }
  const allowed = [vapiSecret, demoSecret].filter(Boolean) as string[];
  if (!token || !allowed.includes(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

interface VapiCall {
  id?: string;
  metadata?: Record<string, unknown>;
  endedReason?: string;
}

interface VapiMessage {
  type?: string;
  status?: string;
  endedReason?: string;
  call?: VapiCall;
  metadata?: Record<string, unknown>;
  analysis?: {
    structuredData?: Record<string, unknown>;
  };
  artifact?: {
    structuredOutputs?: Record<string, unknown>;
  };
}

function extractLeadId(message: VapiMessage): string | null {
  const fromCall = message.call?.metadata?.leadId;
  const fromMeta = message.metadata?.leadId;
  if (typeof fromCall === "string" && fromCall) return fromCall;
  if (typeof fromMeta === "string" && fromMeta) return fromMeta;
  return null;
}

function extractStructured(message: VapiMessage): {
  recording_consent?: RecordingConsent;
  preferred_start_iso?: string;
  attendee_email?: string;
  booked_intent?: boolean;
} | null {
  const raw =
    message.analysis?.structuredData ??
    message.artifact?.structuredOutputs ??
    null;
  if (!raw || typeof raw !== "object") return null;

  const consent = raw.recording_consent;
  const start = raw.preferred_start_iso;
  const email = raw.attendee_email;
  return {
    recording_consent:
      consent === "granted" || consent === "declined" || consent === "unknown"
        ? consent
        : undefined,
    preferred_start_iso: typeof start === "string" ? start : undefined,
    attendee_email: typeof email === "string" ? email : undefined,
    booked_intent: raw.booked_intent === true,
  };
}

function patchFromVapi(
  lead: DemoLead,
  message: VapiMessage,
  callId: string | null
): DemoLeadPatch {
  const now = new Date().toISOString();
  const patch: DemoLeadPatch = { updated_at: now };
  if (callId && !lead.vapi_call_id) patch.vapi_call_id = callId;

  const status = message.status;
  const ended = message.endedReason ?? message.call?.endedReason;
  const type = message.type;

  if (status === "ringing") {
    applyStatus(lead, patch, "ringing", now);
    patch.contact_channel = lead.contact_channel ?? "voice";
  }

  if (status === "in-progress") {
    applyStatus(lead, patch, "answered", now);
    patch.contact_channel = "voice";
    patch.recording_consent = lead.recording_consent ?? "unknown";
  }

  if (type === "end-of-call-report" || status === "ended") {
    const mapped = mapEndedReason(ended);
    if (mapped) applyStatus(lead, patch, mapped, now);
  }

  return patch;
}

function applyStatus(
  lead: DemoLead,
  patch: DemoLeadPatch,
  status: DemoCallStatus,
  now: string
) {
  if (lead.booked || patch.call_status === "booked") return;
  if (lead.call_status === "sms_sent" && isNoAnswerStatus(status)) return;
  if (lead.call_status === "consent_declined") return;

  patch.call_status = status;

  const countsAsContact =
    status === "ringing" ||
    status === "answered" ||
    status === "sms_sent" ||
    status === "booked";
  if (countsAsContact && !lead.first_contact_at) {
    patch.first_contact_at = now;
    patch.response_time_seconds =
      Math.max(0, (Date.parse(now) - Date.parse(lead.submitted_at)) / 1000);
  }
}

function isNoAnswerStatus(status: DemoCallStatus): boolean {
  return (
    status === "no_answer" ||
    status === "voicemail" ||
    status === "busy" ||
    status === "failed"
  );
}

function mapEndedReason(reason: string | undefined): DemoCallStatus | null {
  if (!reason) return null;
  if (reason === "customer-did-not-answer") return "no_answer";
  if (reason === "voicemail") return "voicemail";
  if (reason === "customer-busy") return "busy";
  if (reason.includes("error") || reason.startsWith("call.start.error")) {
    return "failed";
  }
  if (
    reason === "assistant-ended-call" ||
    reason === "customer-ended-call" ||
    reason === "silence-timed-out" ||
    reason === "exceeded-max-duration"
  ) {
    return "answered";
  }
  return null;
}

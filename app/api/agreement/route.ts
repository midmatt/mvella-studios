import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { z } from "zod";
import { AGREEMENT_VERSION } from "@/lib/agreement";

/**
 * Signing endpoint for /agreement. This writes a legal consent record, so
 * the ordering is strict and the failure modes are loud:
 *
 *   1. Validate. Reject anything malformed.
 *   2. Insert into Supabase `agreements` and CONFIRM the row came back.
 *      Any insert failure → 5xx → the form shows an error, never success.
 *   3. Only after the row exists, send the notification and the client's
 *      confirmation copy. Email failures do NOT roll back or fail the
 *      request — the database row is the legal record, and a delivered
 *      consent must not be reported as failed because SMTP hiccuped.
 *      Whether each email sent is reported in the response for the logs.
 *
 * Uses the SECRET key server-side only: the table has RLS enabled with no
 * policies, so this route is the only writer and nothing client-side can
 * read the records back.
 */
const TO_EMAIL = process.env.CONTACT_TO_EMAIL ?? "matthewvella.dev@gmail.com";
const FROM_EMAIL =
  process.env.CONTACT_FROM_EMAIL ?? "MVella Studios <onboarding@resend.dev>";

const schema = z.object({
  fullName: z.string().trim().min(1, "Full name is required").max(200),
  company: z.string().trim().max(200).optional(),
  email: z.string().trim().email("Valid email required").max(320),
  /** Honeypot — bots that fill every field trip this. */
  website: z.string().max(1000).optional(),
  /**
   * Version the client saw. Must match the server's current version —
   * a stale tab signing text that has since changed must not produce a
   * record claiming consent to the new text.
   */
  agreementVersion: z.literal(AGREEMENT_VERSION, {
    error: "Agreement version is out of date — reload the page",
  }),
});

function clientIp(request: Request): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip");
}

export async function POST(request: Request) {
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
  const data = parsed.data;

  // Honeypot: pretend success, record nothing, send nothing.
  if (data.website) {
    return NextResponse.json({ ok: true });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SECRET_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json(
      { error: "Signing is not configured (Supabase env vars missing)" },
      { status: 503 }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
  });

  // ── The consent record. `.select().single()` makes the insert prove
  // itself: if no row comes back, the client sees an error, not success.
  const { data: row, error: insertError } = await supabase
    .from("agreements")
    .insert({
      full_name: data.fullName,
      company: data.company ?? null,
      email: data.email,
      agreement_version: data.agreementVersion,
      ip_address: clientIp(request),
      user_agent: request.headers.get("user-agent"),
      // agreed_at: column default now() — server clock, never the client's
    })
    .select("id, agreed_at")
    .single();

  if (insertError || !row) {
    console.error("agreements insert failed:", insertError?.message);
    return NextResponse.json(
      { error: "Failed to record the agreement" },
      { status: 502 }
    );
  }

  // ── Row exists; emails are best-effort from here.
  const emails = { notification: false, confirmation: false };
  const apiKey = process.env.RESEND_API_KEY;

  if (apiKey) {
    const resend = new Resend(apiKey);
    const stamp = `${row.agreed_at} · version ${data.agreementVersion} · record ${row.id}`;

    try {
      const { error } = await resend.emails.send({
        from: FROM_EMAIL,
        to: TO_EMAIL,
        replyTo: data.email,
        subject: `Agreement signed — ${data.fullName}`,
        text: [
          "> agreement recorded",
          "",
          `NAME      ${data.fullName}`,
          ...(data.company ? [`COMPANY   ${data.company}`] : []),
          `EMAIL     ${data.email}`,
          `VERSION   ${data.agreementVersion}`,
          `SIGNED    ${row.agreed_at}`,
          `RECORD    ${row.id}`,
        ].join("\n"),
      });
      if (error) {
        console.error("agreement notification failed:", JSON.stringify(error));
      }
      emails.notification = !error;
    } catch (err) {
      /* row is the record; see header comment */
      console.error("agreement notification threw:", err);
    }

    try {
      const { error } = await resend.emails.send({
        from: FROM_EMAIL,
        to: data.email,
        subject: "Your signed agreement — MVella Studios",
        text: [
          `Hi ${data.fullName},`,
          "",
          "This confirms you signed the MVella Studios Client Service Agreement.",
          "",
          stamp,
          "",
          "The full text you agreed to is available at:",
          `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/agreement`,
          "",
          "Keep this email for your records.",
          "",
          "— Matthew",
          "MVella Studios · South Florida",
        ].join("\n"),
      });
      if (error) {
        console.error("agreement confirmation failed:", JSON.stringify(error));
      }
      emails.confirmation = !error;
    } catch (err) {
      /* as above */
      console.error("agreement confirmation threw:", err);
    }
  }

  return NextResponse.json({
    ok: true,
    agreedAt: row.agreed_at,
    emails,
  });
}

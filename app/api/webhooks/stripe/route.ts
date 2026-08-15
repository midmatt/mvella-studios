import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

/**
 * Stripe → this origin. Verifies Stripe-Signature, then records deposit
 * payment on the matching `agreements` row.
 *
 * Do not run guardPublicPost here — Stripe's origin is not ours, and the
 * signature is the auth. Node runtime so we can read the raw body; App
 * Router would otherwise consume the stream before constructEvent.
 */
export const runtime = "nodejs";

export async function POST(request: Request) {
  const webhookSecret =
    process.env.VERCEL_ENV === "production"
      ? process.env.STRIPE_WEBHOOK_SECRET
      : process.env.STRIPE_TEST_WEBHOOK_SECRET ??
        process.env.STRIPE_WEBHOOK_SECRET;

  const stripeKey =
    process.env.VERCEL_ENV === "production"
      ? process.env.STRIPE_SECRET_KEY
      : process.env.STRIPE_TEST_SECRET_KEY;

  if (!webhookSecret || !stripeKey) {
    console.error("stripe webhook: missing signing secret or API key");
    return NextResponse.json(
      { error: "Webhook is not configured" },
      { status: 503 }
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    console.error("stripe webhook: missing Stripe-Signature header");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const rawBody = await request.text();
  const stripe = new Stripe(stripeKey);

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error(
      "stripe webhook: signature verification failed:",
      err instanceof Error ? err.message : err
    );
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (
    event.type !== "invoice.paid" &&
    event.type !== "invoice.payment_failed"
  ) {
    return NextResponse.json({ received: true });
  }

  const invoice = event.data.object as Stripe.Invoice;
  const patch =
    event.type === "invoice.paid"
      ? {
          payment_status: "paid" as const,
          paid_at: new Date().toISOString(),
        }
      : { payment_status: "failed" as const };

  try {
    await applyInvoiceStatus(invoice, patch);
  } catch (err) {
    console.error(
      "stripe webhook: agreements update failed:",
      err instanceof Error ? err.message : err
    );
    return NextResponse.json({ error: "Update failed" }, { status: 502 });
  }

  return NextResponse.json({ received: true });
}

async function applyInvoiceStatus(
  invoice: Stripe.Invoice,
  patch: { payment_status: "paid" | "failed"; paid_at?: string }
): Promise<void> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SECRET_KEY;
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase env vars missing");
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
  });

  const agreementId = invoice.metadata?.agreement_id?.trim();
  if (agreementId) {
    const { data, error } = await supabase
      .from("agreements")
      .update(patch)
      .eq("id", agreementId)
      .select("id")
      .maybeSingle();
    if (error) throw error;
    if (data) return;
  }

  const { data, error } = await supabase
    .from("agreements")
    .update(patch)
    .eq("stripe_invoice_id", invoice.id)
    .select("id")
    .maybeSingle();
  if (error) throw error;
  if (!data) {
    // Unknown invoice — acknowledge so Stripe does not retry forever.
    console.error(
      "stripe webhook: no agreements row for invoice",
      invoice.id
    );
  }
}

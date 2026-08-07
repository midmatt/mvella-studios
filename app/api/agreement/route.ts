import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { z } from "zod";
import Stripe from "stripe";
import {
  AGREEMENT_VERSION,
  DEPOSIT_PERCENT,
  resolveQuote,
  SITE_URL,
  type Quote,
} from "@/lib/agreement";
import { DIRECT_EMAIL } from "@/lib/contact";
import { esc, link, renderEmail, type EmailBlock } from "@/lib/email";
import { findAddOn, findPackage, formatUsd } from "@/lib/packages";

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
const TO_EMAIL = process.env.CONTACT_TO_EMAIL ?? DIRECT_EMAIL;
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
  /**
   * Present when signing via a quote link. Slugs only — everything is
   * re-priced server-side by resolveQuote, so a tampered request can change
   * WHAT is quoted (visible in the record) but never what it costs.
   */
  packageType: z.string().max(100).optional(),
  addOns: z.array(z.string().max(100)).max(20).optional(),
});

/**
 * Creates (or reuses, matched by email) a Stripe customer and issues the
 * deposit invoice for a quoted signing. Returns null on any failure — the
 * signature is already recorded and must not be voided by billing trouble;
 * a missing invoice is Matthew's to chase from the notification email.
 *
 * ACH note: us_bank_account is requested alongside card because ACH fees
 * are far lower on invoices this size. If the Stripe account doesn't have
 * ACH enabled, Stripe rejects the invoice — so on that failure it retries
 * once as card-only rather than losing the invoice entirely.
 */
async function createDepositInvoice(
  stripe: Stripe,
  quote: Quote,
  client: { fullName: string; company?: string; email: string },
  agreementId: string
): Promise<{ customerId: string; invoiceId: string; url: string | null } | null> {
  try {
    const existing = await stripe.customers.list({
      email: client.email,
      limit: 1,
    });
    const customer =
      existing.data[0] ??
      (await stripe.customers.create({
        email: client.email,
        name: client.fullName,
        ...(client.company ? { description: client.company } : {}),
      }));

    const pkg = findPackage(quote.packageSlug);
    const description = [
      `Deposit (${DEPOSIT_PERCENT}%) — ${pkg?.name ?? quote.packageSlug}`,
      ...quote.addOnSlugs.map((s) => findAddOn(s)?.name ?? s),
    ].join(" + ");

    const build = async (methods: Array<"card" | "us_bank_account">) => {
      const invoice = await stripe.invoices.create({
        customer: customer.id,
        collection_method: "send_invoice",
        days_until_due: 14,
        auto_advance: false, // we deliver the link ourselves via Resend
        payment_settings: { payment_method_types: methods },
        metadata: { agreement_id: agreementId },
      });
      await stripe.invoiceItems.create({
        customer: customer.id,
        invoice: invoice.id,
        // Stripe amounts are integer cents; quote.deposit is whole USD.
        amount: quote.deposit * 100,
        currency: "usd",
        description,
      });
      return stripe.invoices.finalizeInvoice(invoice.id);
    };

    let finalized: Stripe.Invoice;
    try {
      finalized = await build(["card", "us_bank_account"]);
    } catch (err) {
      console.error(
        "invoice with ACH failed, retrying card-only:",
        err instanceof Error ? err.message : err
      );
      finalized = await build(["card"]);
    }

    return {
      customerId: customer.id,
      invoiceId: finalized.id,
      url: finalized.hosted_invoice_url ?? null,
    };
  } catch (err) {
    console.error(
      "deposit invoice failed:",
      err instanceof Error ? err.message : err
    );
    return null;
  }
}

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

  // Re-priced from lib/packages.ts; null when signing without a quote link.
  const quote = resolveQuote(data.packageType, data.addOns);

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
      package_type: quote?.packageSlug ?? null,
      add_ons: quote?.addOnSlugs ?? null,
      quoted_total_usd: quote?.total ?? null,
      deposit_usd: quote?.deposit ?? null,
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

  // ── Row exists; invoicing and emails are best-effort from here.
  //
  // Order matters: the invoice is created BEFORE the emails so its hosted
  // payment link can ride in the client's confirmation. Requires
  // STRIPE_SECRET_KEY (not connected at build time — the key's own
  // sk_test_/sk_live_ prefix decides mode; nothing here assumes either).
  let invoice: Awaited<ReturnType<typeof createDepositInvoice>> = null;

  /**
   * Key selection by environment: STRIPE_SECRET_KEY is the LIVE key and is
   * used only on the production deployment; previews and local dev use
   * STRIPE_TEST_SECRET_KEY so a test signing can never issue a real
   * invoice. Falls back to the live key when no test key exists, so a
   * missing test key degrades to prod behavior rather than silently
   * skipping invoices.
   */
  const stripeKey =
    process.env.VERCEL_ENV === "production"
      ? process.env.STRIPE_SECRET_KEY
      : process.env.STRIPE_TEST_SECRET_KEY ?? process.env.STRIPE_SECRET_KEY;

  if (quote && stripeKey) {
    invoice = await createDepositInvoice(
      new Stripe(stripeKey),
      quote,
      { fullName: data.fullName, company: data.company, email: data.email },
      row.id
    );

    if (invoice) {
      // Best-effort back-reference; the invoice also carries agreement_id
      // in its metadata, so the linkage survives even if this update fails.
      const { error: updateError } = await supabase
        .from("agreements")
        .update({
          stripe_customer_id: invoice.customerId,
          stripe_invoice_id: invoice.invoiceId,
        })
        .eq("id", row.id);
      if (updateError) {
        console.error("failed to record invoice id:", updateError.message);
      }
    }
  } else if (quote && !stripeKey) {
    console.error(
      "quoted signing without STRIPE_SECRET_KEY — no deposit invoice created"
    );
  }

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
          ...(quote
            ? [
                `QUOTED    ${formatUsd(quote.total)} (${
                  findPackage(quote.packageSlug)?.name ?? quote.packageSlug
                }${quote.addOnSlugs.length ? " + add-ons" : ""})`,
                `DEPOSIT   ${formatUsd(quote.deposit)} (${DEPOSIT_PERCENT}%)`,
                invoice
                  ? `INVOICE   ${invoice.invoiceId}${invoice.url ? `\n          ${invoice.url}` : ""}`
                  : `INVOICE   NOT CREATED — ${stripeKey ? "Stripe error, see logs" : "STRIPE_SECRET_KEY missing"}; invoice manually`,
              ]
            : []),
        ].join("\n"),
        html: renderEmail({
          eyebrow: "agreement recorded",
          blocks: [
            {
              kind: "rows",
              rows: [
                ["NAME", esc(data.fullName)],
                ...(data.company
                  ? [["COMPANY", esc(data.company)] as [string, string]]
                  : []),
                ["EMAIL", link(`mailto:${esc(data.email)}`, esc(data.email))],
                ["VERSION", esc(data.agreementVersion)],
                ["SIGNED", esc(row.agreed_at)],
                ["RECORD", esc(row.id)],
                ...(quote
                  ? [
                      [
                        "QUOTED",
                        `${esc(formatUsd(quote.total))} (${esc(
                          findPackage(quote.packageSlug)?.name ??
                            quote.packageSlug
                        )}${quote.addOnSlugs.length ? " + add-ons" : ""})`,
                      ] as [string, string],
                      [
                        "DEPOSIT",
                        `${esc(formatUsd(quote.deposit))} (${DEPOSIT_PERCENT}%)`,
                      ] as [string, string],
                      [
                        "INVOICE",
                        invoice
                          ? esc(invoice.invoiceId)
                          : `NOT CREATED — ${stripeKey ? "Stripe error, see logs" : "STRIPE_SECRET_KEY missing"}; invoice manually`,
                      ] as [string, string],
                    ]
                  : []),
              ],
            },
            ...(invoice?.url
              ? ([
                  { kind: "button", label: "View invoice", url: invoice.url },
                ] as EmailBlock[])
              : []),
          ],
        }),
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
          "This confirms you signed the MVella Studios Service Agreement.",
          "",
          stamp,
          "",
          "The full text you agreed to is available at:",
          `${SITE_URL}/agreement`,
          ...(quote && invoice?.url
            ? [
                "",
                `Your ${formatUsd(quote.deposit)} deposit invoice (${DEPOSIT_PERCENT}% of ${formatUsd(quote.total)}) is ready — payable by card or ACH bank transfer:`,
                invoice.url,
              ]
            : quote
              ? [
                  "",
                  `A ${formatUsd(quote.deposit)} deposit invoice (${DEPOSIT_PERCENT}% of ${formatUsd(quote.total)}) will follow separately.`,
                ]
              : []),
          "",
          "Keep this email for your records.",
          "",
          "— Matthew",
          "MVella Studios · South Florida",
        ].join("\n"),
        html: renderEmail({
          eyebrow: "agreement signed",
          blocks: [
            { kind: "p", html: `Hi ${esc(data.fullName)},` },
            {
              kind: "p",
              html: "This confirms you signed the MVella Studios Service Agreement.",
            },
            {
              kind: "rows",
              rows: [
                ["SIGNED", esc(row.agreed_at)],
                ["VERSION", esc(data.agreementVersion)],
                ["RECORD", esc(row.id)],
              ],
            },
            {
              kind: "p",
              html: `The full text you agreed to: ${link(`${SITE_URL}/agreement`)}`,
            },
            ...(quote && invoice?.url
              ? ([
                  {
                    kind: "p",
                    html: `Your ${esc(formatUsd(quote.deposit))} deposit invoice (${DEPOSIT_PERCENT}% of ${esc(formatUsd(quote.total))}) is ready — payable by card or ACH bank transfer:`,
                  },
                  {
                    kind: "button",
                    label: "Pay deposit invoice",
                    url: invoice.url,
                  },
                ] as EmailBlock[])
              : quote
                ? ([
                    {
                      kind: "p",
                      html: `A ${esc(formatUsd(quote.deposit))} deposit invoice (${DEPOSIT_PERCENT}% of ${esc(formatUsd(quote.total))}) will follow separately.`,
                    },
                  ] as EmailBlock[])
                : []),
            {
              kind: "p",
              html: "Keep this email for your records.<br><br>— Matthew",
            },
          ],
        }),
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

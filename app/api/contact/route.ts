import { NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";
import {
  computeTotal,
  findAddOn,
  findPackage,
  formatUsd,
} from "@/lib/packages";

/**
 * Contact endpoint (spec §5). Serves both forms:
 *  - /contact sends projectType + budget.
 *  - /services#quote-builder sends packageType + addOns + estimatedTotal.
 *
 * NOTE: this route was CREATED in this pass, not extended — it did not exist
 * before (ContactForm was posting into a 404). The quote fields arrived with
 * it rather than being bolted on.
 *
 * Env (spec §5): RESEND_API_KEY required to send; CONTACT_TO_EMAIL overrides
 * the notification recipient; CONTACT_FROM_EMAIL overrides the sender.
 * Without a key the route answers 503 and both forms fall back to showing
 * the direct email — a failed submission is never dressed up as a sent one.
 *
 * ⚠️ CONTACT_TO_EMAIL defaults to matthewvella.dev@gmail.com as specified
 * for this pass — note the rest of the site (footer, /contact sidebar)
 * still shows mvella303@gmail.com. Reconcile before launch.
 */
const TO_EMAIL = process.env.CONTACT_TO_EMAIL ?? "matthewvella.dev@gmail.com";

/**
 * Resend's shared onboarding sender works without domain verification but
 * only delivers to the account owner's own address — enough for the
 * notification, and the auto-reply is best-effort until a real domain is
 * verified and set here.
 */
const FROM_EMAIL =
  process.env.CONTACT_FROM_EMAIL ?? "MVella Studios <onboarding@resend.dev>";

const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  email: z.string().trim().email("Valid email required").max(320),
  message: z.string().trim().min(1, "Message is required").max(5000),
  /**
   * Honeypot — anything here means a bot filled the off-screen field.
   *
   * Named `website`, matching /api/agreement. It was `company` until the
   * hiring form needed Company as a REAL field: a genuine employer filling
   * that in would have been silently discarded as spam. Every form now
   * posts `website` as its honeypot; `company` is real data.
   */
  website: z.string().max(1000).optional(),

  /** Which form this came from. Absent on older/simpler submissions. */
  inquiryType: z.enum(["project", "employment"]).optional(),

  // /contact fields
  projectType: z.string().max(100).optional(),
  budget: z.string().max(100).optional(),

  // Hiring form fields — present only on /about employment submissions
  company: z.string().trim().max(200).optional(),
  role: z.string().trim().max(200).optional(),

  // Quote-builder fields — present only on /services submissions
  packageType: z.string().max(100).optional(),
  addOns: z.array(z.string().max(100)).max(20).optional(),
  estimatedTotal: z.number().finite().nonnegative().optional(),
});

type Submission = z.infer<typeof schema>;

/** True when the submission came from the hiring form on /about. */
function isEmployment(data: Submission): boolean {
  return data.inquiryType === "employment";
}

/** True when the submission came from the quote builder. */
function isQuote(data: Submission): boolean {
  return Boolean(data.packageType || data.addOns?.length);
}

/**
 * Renders the quote selection as the terminal readout the visitor saw,
 * priced from lib/packages.ts — never from the client's numbers. If the
 * client-reported total disagrees with the server's (tampering, or stale
 * prices cached in an old tab), the discrepancy is called out rather than
 * silently resolved.
 */
function quoteBreakdown(data: Submission): string {
  const lines: string[] = ["> quote.sh"];

  const pkg = data.packageType ? findPackage(data.packageType) : undefined;
  if (pkg) {
    lines.push(`PACKAGE   ${pkg.name} — ${formatUsd(pkg.price)}`);
  } else if (data.packageType) {
    lines.push(`PACKAGE   ${data.packageType} (unrecognized — not priced)`);
  }

  for (const slug of data.addOns ?? []) {
    const addOn = findAddOn(slug);
    if (addOn) {
      const price = addOn.recurring
        ? `${formatUsd(addOn.price)}/mo`
        : formatUsd(addOn.price);
      lines.push(`ADD-ON    ${addOn.name} — ${price}`);
    } else {
      lines.push(`ADD-ON    ${slug} (unrecognized — not priced)`);
    }
  }

  const total = computeTotal(data.packageType ?? null, data.addOns ?? []);
  const monthly = (data.addOns ?? [])
    .map(findAddOn)
    .filter((a) => a?.recurring)
    .reduce((sum, a) => sum + (a?.price ?? 0), 0);

  lines.push("─".repeat(40));
  lines.push(
    `TOTAL     ${formatUsd(total)} one-time${
      monthly > 0 ? ` + ${formatUsd(monthly)}/mo` : ""
    }`
  );

  if (
    typeof data.estimatedTotal === "number" &&
    data.estimatedTotal !== total
  ) {
    lines.push(
      `NOTE      client-reported total was ${formatUsd(
        data.estimatedTotal
      )} — server priced it at ${formatUsd(total)}`
    );
  }

  return lines.join("\n");
}

function notificationText(data: Submission): string {
  const parts = [
    `NAME      ${data.name}`,
    `EMAIL     ${data.email}`,
    ...(data.company ? [`COMPANY   ${data.company}`] : []),
    ...(data.role ? [`ROLE      ${data.role}`] : []),
    ...(data.projectType ? [`TYPE      ${data.projectType}`] : []),
    ...(data.budget ? [`BUDGET    ${data.budget}`] : []),
  ];
  if (isQuote(data)) parts.push("", quoteBreakdown(data));
  parts.push("", "MESSAGE", data.message);
  return parts.join("\n");
}

function autoReplyText(data: Submission): string {
  const parts = [
    `Hi ${data.name},`,
    "",
    "Thanks for reaching out — I got your message and I'll reply within 24 hours.",
  ];
  if (isQuote(data)) {
    parts.push(
      "",
      "Here's the estimate you built, for your records:",
      "",
      quoteBreakdown(data),
      "",
      "This is a starting point, not a binding quote — I'll confirm scope and price once I understand the project."
    );
  }
  parts.push("", "— Matthew", "MVella Studios · South Florida");
  return parts.join("\n");
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

  // Honeypot tripped: answer 200 so the bot learns nothing, send nothing.
  if (data.website) {
    return NextResponse.json({ ok: true });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // Explicit failure — the forms surface the direct email on anything
    // non-2xx rather than pretending the message went through.
    return NextResponse.json(
      { error: "Email is not configured (RESEND_API_KEY missing)" },
      { status: 503 }
    );
  }

  const resend = new Resend(apiKey);

  /**
   * Employment gets its own subject so hiring mail is filterable and never
   * reads as another project quote in the inbox.
   */
  const subject = isEmployment(data)
    ? `[HIRING] ${data.role || "Full-time role"} — ${data.name}${
        data.company ? ` · ${data.company}` : ""
      }`
    : isQuote(data)
      ? `Quote request — ${data.name}`
      : `New inquiry — ${data.name}`;

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: TO_EMAIL,
    replyTo: data.email,
    subject,
    text: notificationText(data),
  });

  if (error) {
    // Log the provider's own message — without it a failed send is a bare
    // 502 with nothing to diagnose from.
    console.error("contact notification failed:", JSON.stringify(error));
    return NextResponse.json(
      { error: "Failed to send notification" },
      { status: 502 }
    );
  }

  // Auto-reply is best-effort: the sandbox sender can't deliver to arbitrary
  // addresses, and losing the confirmation must not fail a delivered lead.
  try {
    const { error: replyError } = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.email,
      subject: "Got your message — MVella Studios",
      text: autoReplyText(data),
    });
    if (replyError) {
      console.error("contact auto-reply failed:", JSON.stringify(replyError));
    }
  } catch (err) {
    // Notification already landed; nothing actionable for the visitor.
    console.error("contact auto-reply threw:", err);
  }

  return NextResponse.json({ ok: true });
}

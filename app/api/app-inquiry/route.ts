import { NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";
import { findStudioApp, studioApps } from "@/lib/apps";
import { FROM_EMAIL as DEFAULT_FROM_EMAIL, NOTIFY_EMAIL } from "@/lib/contact";
import { esc, link, renderEmail, type EmailBlock } from "@/lib/email";

/**
 * Support + Feedback for studio apps (AlarmQR, CyberSimply, …).
 * Same Resend pattern as /api/contact: notify Matthew, best-effort auto-reply.
 */
const TO_EMAIL = process.env.CONTACT_TO_EMAIL ?? NOTIFY_EMAIL;
const FROM_EMAIL = process.env.CONTACT_FROM_EMAIL ?? DEFAULT_FROM_EMAIL;

const appSlugs = studioApps.map((a) => a.slug) as [string, ...string[]];

const schema = z.object({
  kind: z.enum(["support", "feedback"]),
  name: z.string().trim().min(1, "Name is required").max(200),
  email: z.string().trim().email("Valid email required").max(320),
  app: z.enum(appSlugs),
  message: z.string().trim().min(1, "Message is required").max(5000),
  topic: z.string().trim().max(100).optional(),
  rating: z.number().int().min(1).max(5).optional(),
  /** Honeypot — anything here means a bot. */
  website: z.string().max(1000).optional(),
});

type Submission = z.infer<typeof schema>;

function appLabel(slug: string): string {
  return findStudioApp(slug)?.name ?? slug;
}

function notificationText(data: Submission): string {
  const parts = [
    `KIND      ${data.kind.toUpperCase()}`,
    `APP       ${appLabel(data.app)}`,
    `NAME      ${data.name}`,
    `EMAIL     ${data.email}`,
    ...(data.topic ? [`TOPIC     ${data.topic}`] : []),
    ...(typeof data.rating === "number" ? [`RATING    ${data.rating}/5`] : []),
    "",
    "MESSAGE",
    data.message,
  ];
  return parts.join("\n");
}

function notificationHtml(data: Submission): string {
  const blocks: EmailBlock[] = [
    {
      kind: "rows",
      rows: [
        ["KIND", esc(data.kind.toUpperCase())],
        ["APP", esc(appLabel(data.app))],
        ["NAME", esc(data.name)],
        ["EMAIL", link(`mailto:${esc(data.email)}`, esc(data.email))],
        ...(data.topic ? [["TOPIC", esc(data.topic)] as [string, string]] : []),
        ...(typeof data.rating === "number"
          ? [["RATING", esc(`${data.rating}/5`)] as [string, string]]
          : []),
      ],
    },
    { kind: "divider" },
    { kind: "p", html: esc(data.message).replace(/\n/g, "<br>") },
  ];
  return renderEmail({
    eyebrow: data.kind === "support" ? "app support" : "app feedback",
    blocks,
  });
}

function autoReplyHtml(data: Submission): string {
  const app = esc(appLabel(data.app));
  const blocks: EmailBlock[] = [
    { kind: "p", html: `Hi ${esc(data.name)},` },
    {
      kind: "p",
      html:
        data.kind === "support"
          ? `Thanks for writing about ${app}. I got your support request and will reply as soon as I can.`
          : `Thanks for the feedback on ${app}. I read every note — it helps decide what to build next.`,
    },
    { kind: "p", html: "— Matthew" },
  ];
  return renderEmail({
    eyebrow: data.kind === "support" ? "support received" : "feedback received",
    blocks,
  });
}

function autoReplyText(data: Submission): string {
  const app = appLabel(data.app);
  return [
    `Hi ${data.name},`,
    "",
    data.kind === "support"
      ? `Thanks for writing about ${app}. I got your support request and will reply as soon as I can.`
      : `Thanks for the feedback on ${app}. I read every note — it helps decide what to build next.`,
    "",
    "— Matthew",
    "MVella Studios · South Florida",
  ].join("\n");
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

  if (data.website) {
    return NextResponse.json({ ok: true });
  }

  if (data.kind === "support" && !data.topic) {
    return NextResponse.json(
      { error: "Topic is required for support requests" },
      { status: 400 }
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Email is not configured (RESEND_API_KEY missing)" },
      { status: 503 }
    );
  }

  const resend = new Resend(apiKey);
  const appName = appLabel(data.app);
  const subject =
    data.kind === "support"
      ? `[SUPPORT] ${appName}${data.topic ? ` · ${data.topic}` : ""} — ${data.name}`
      : `[FEEDBACK] ${appName}${
          typeof data.rating === "number" ? ` · ${data.rating}/5` : ""
        } — ${data.name}`;

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: TO_EMAIL,
    replyTo: data.email,
    subject,
    text: notificationText(data),
    html: notificationHtml(data),
  });

  if (error) {
    console.error("app-inquiry notification failed:", JSON.stringify(error));
    return NextResponse.json(
      { error: "Failed to send notification" },
      { status: 502 }
    );
  }

  try {
    const { error: replyError } = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.email,
      subject:
        data.kind === "support"
          ? `Got your ${appName} support request — MVella Studios`
          : `Thanks for the ${appName} feedback — MVella Studios`,
      text: autoReplyText(data),
      html: autoReplyHtml(data),
    });
    if (replyError) {
      console.error("app-inquiry auto-reply failed:", JSON.stringify(replyError));
    }
  } catch (err) {
    console.error("app-inquiry auto-reply threw:", err);
  }

  return NextResponse.json({ ok: true });
}

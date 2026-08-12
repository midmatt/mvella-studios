"use client";

import { useState } from "react";

import { fieldClass, labelClass } from "./form-styles";
import { studioApps } from "@/lib/apps";
import { DIRECT_EMAIL } from "@/lib/contact";

export type AppInquiryKind = "support" | "feedback";

type Status = "idle" | "submitting" | "success" | "error";

const SUPPORT_TOPICS = [
  "Bug / crash",
  "Account / login",
  "Billing / purchase",
  "How do I…",
  "Other",
] as const;

/**
 * Shared Support + Feedback form. Posts to /api/app-inquiry with Resend
 * notification + auto-reply. Success stays inline (these aren't Ads
 * conversion surfaces the way /contact is).
 */
export default function AppInquiryForm({ kind }: { kind: AppInquiryKind }) {
  const [status, setStatus] = useState<Status>("idle");
  const isSupport = kind === "support";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    if (data.website) return;

    setStatus("submitting");

    try {
      const res = await fetch("/api/app-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          kind,
          rating:
            typeof data.rating === "string" && data.rating !== ""
              ? Number(data.rating)
              : undefined,
        }),
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div
        role="status"
        className="border border-steel/40 bg-panel px-6 py-8"
      >
        <p className="mono-label text-phosphor">&gt; message sent</p>
        <p className="mt-4 text-body text-paper/80">
          {isSupport
            ? "Thanks — I got your support request and will reply as soon as I can."
            : "Thanks for the feedback. I read every note and it helps shape what ships next."}
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mono-label mt-6 text-paper/70 underline-offset-4 transition-colors hover:text-phosphor hover:underline"
        >
          Send another →
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate={false} className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor={`${kind}-name`} className={labelClass}>
            Name
          </label>
          <input
            id={`${kind}-name`}
            name="name"
            type="text"
            required
            autoComplete="name"
            className={fieldClass}
          />
        </div>

        <div>
          <label htmlFor={`${kind}-email`} className={labelClass}>
            Email
          </label>
          <input
            id={`${kind}-email`}
            name="email"
            type="email"
            required
            autoComplete="email"
            className={fieldClass}
          />
        </div>

        <div>
          <label htmlFor={`${kind}-app`} className={labelClass}>
            App
          </label>
          <select
            id={`${kind}-app`}
            name="app"
            required
            defaultValue=""
            className={fieldClass}
          >
            <option value="" disabled>
              Select an app
            </option>
            {studioApps.map((app) => (
              <option key={app.slug} value={app.slug}>
                {app.name}
              </option>
            ))}
          </select>
        </div>

        {isSupport ? (
          <div>
            <label htmlFor="support-topic" className={labelClass}>
              Topic
            </label>
            <select
              id="support-topic"
              name="topic"
              required
              defaultValue=""
              className={fieldClass}
            >
              <option value="" disabled>
                Select one
              </option>
              {SUPPORT_TOPICS.map((topic) => (
                <option key={topic} value={topic}>
                  {topic}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div>
            <label htmlFor="feedback-rating" className={labelClass}>
              Rating (optional)
            </label>
            <select
              id="feedback-rating"
              name="rating"
              defaultValue=""
              className={fieldClass}
            >
              <option value="">No rating</option>
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  {n} / 5
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div>
        <label htmlFor={`${kind}-message`} className={labelClass}>
          {isSupport ? "How can I help?" : "Your feedback"}
        </label>
        <textarea
          id={`${kind}-message`}
          name="message"
          required
          rows={6}
          placeholder={
            isSupport
              ? "What happened, what you expected, and your device / OS if you know it."
              : "What worked, what didn’t, and anything you’d love to see next."
          }
          className={`${fieldClass} resize-y`}
        />
      </div>

      <div aria-hidden="true" className="absolute left-[-9999px] top-0">
        <label htmlFor={`${kind}-website`}>Website (leave blank)</label>
        <input
          id={`${kind}-website`}
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="flex flex-wrap items-center gap-6">
        <button
          type="submit"
          disabled={status === "submitting"}
          className="mono-label bg-phosphor px-6 py-3 text-ink transition-colors hover:bg-paper disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "submitting"
            ? "Sending…"
            : isSupport
              ? "Send support request"
              : "Send feedback"}
        </button>

        {status === "error" && (
          <p role="alert" className="mono-label text-paper/70">
            Couldn&rsquo;t send &mdash; email{" "}
            <a
              href={`mailto:${DIRECT_EMAIL}`}
              className="text-phosphor underline-offset-4 hover:underline"
            >
              {DIRECT_EMAIL}
            </a>{" "}
            directly.
          </p>
        )}
      </div>
    </form>
  );
}

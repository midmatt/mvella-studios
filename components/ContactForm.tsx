"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { fieldClass, labelClass } from "./form-styles";
import { DIRECT_EMAIL } from "@/lib/contact";
import { trackGoogleAdsConversion } from "@/lib/google-ads";

/**
 * Standalone contact form for /contact (spec §4 fields, §5 submission).
 *
 * Posts to /api/contact (zod validation, Resend notification + auto-reply).
 * On a real 2xx response, redirects to /contact/thank-you (the conversion
 * landing). Failures and honeypot hits never redirect.
 *
 * Google Ads: thank-you page is the preferred conversion surface going
 * forward (see comment there). trackGoogleAdsConversion() still runs here
 * until Matthew confirms Ads is listening on the thank-you URL only —
 * remove this call to avoid double-counting once that is set.
 */
const PROJECT_TYPES = ["Website", "Web App", "Mobile App", "Other"] as const;

const BUDGET_RANGES = [
  "Under $1,000",
  "$1,000 – $3,000",
  "$3,000 – $7,000",
  "$7,000+",
  "Not sure yet",
] as const;

type Status = "idle" | "submitting" | "error";

export default function ContactForm() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("idle");
  /** Guards against firing the Ads conversion more than once per mount. */
  const conversionSent = useRef(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    // Client-side honeypot check. The server must repeat this — anything here
    // is trivially bypassed by a bot that posts directly to the endpoint.
    if (data.website) return;

    setStatus("submitting");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);

      if (!conversionSent.current) {
        conversionSent.current = true;
        trackGoogleAdsConversion();
      }

      router.push("/contact/thank-you");
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate={false} className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className={labelClass}>
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            autoComplete="name"
            className={fieldClass}
          />
        </div>

        <div>
          <label htmlFor="email" className={labelClass}>
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className={fieldClass}
          />
        </div>

        <div>
          <label htmlFor="projectType" className={labelClass}>
            Project type
          </label>
          <select
            id="projectType"
            name="projectType"
            required
            defaultValue=""
            className={fieldClass}
          >
            <option value="" disabled>
              Select one
            </option>
            {PROJECT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="budget" className={labelClass}>
            Budget range
          </label>
          <select
            id="budget"
            name="budget"
            required
            defaultValue=""
            className={fieldClass}
          >
            <option value="" disabled>
              Select one
            </option>
            {BUDGET_RANGES.map((range) => (
              <option key={range} value={range}>
                {range}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="message" className={labelClass}>
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={6}
          placeholder="What are you building, and what&rsquo;s the deadline?"
          className={`${fieldClass} resize-y`}
        />
      </div>

      {/*
        Honeypot. Positioned off-screen rather than display:none — some bots
        skip hidden inputs — and taken out of the tab order and the
        accessibility tree so no human ever reaches it.
      */}
      <div aria-hidden="true" className="absolute left-[-9999px] top-0">
        <label htmlFor="contact-website">Website (leave blank)</label>
        <input
          id="contact-website"
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
          {status === "submitting" ? "Sending…" : "Send message"}
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

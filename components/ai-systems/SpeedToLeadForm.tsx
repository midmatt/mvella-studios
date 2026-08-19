"use client";

import { useEffect, useRef, useState } from "react";
import { fieldClass, labelClass } from "@/components/form-styles";
import { DEMO_SERVICE_TYPES } from "@/lib/ai-systems/types";
import type { DemoCallStatus, DemoLeadWatch } from "@/lib/ai-systems/types";

type Status = "idle" | "submitting" | "live" | "error";

const STATUS_COPY: Record<DemoCallStatus, string> = {
  pending: "Queued — waiting for the agent",
  qualifying: "Scoring the request",
  dialing: "Dialing your number",
  ringing: "Your phone should be ringing",
  answered: "Call connected",
  no_answer: "No answer — sending a text",
  voicemail: "Voicemail — sending a text",
  busy: "Line busy — sending a text",
  sms_sent: "Text sent with a booking link",
  booked: "Call booked on the calendar",
  failed: "Call did not start — check n8n / Vapi",
  consent_declined: "Recording consent declined — call ended",
};

export default function SpeedToLeadForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [watch, setWatch] = useState<DemoLeadWatch | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const submittedAt = useRef<number | null>(null);

  useEffect(() => {
    if (status !== "live" || !submittedAt.current) return;
    const start = submittedAt.current;
    const tick = () => setElapsedMs(Date.now() - start);
    tick();
    const id = window.setInterval(tick, 80);
    return () => window.clearInterval(id);
  }, [status]);

  useEffect(() => {
    if (status !== "live" || !watch) return;
    const token = sessionStorage.getItem("demo_watch_token");
    if (!token) return;

    let cancelled = false;
    const poll = async () => {
      try {
        const res = await fetch(`/api/ai-systems/leads/watch/${token}`);
        if (!res.ok || cancelled) return;
        const next = (await res.json()) as DemoLeadWatch;
        if (!cancelled) setWatch(next);
      } catch {
        // Poll is best-effort; the dashboard is the source of truth.
      }
    };

    const id = window.setInterval(poll, 1200);
    void poll();
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [status, watch?.id]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    if (data.website) return;

    setStatus("submitting");
    setError(null);

    try {
      const res = await fetch("/api/ai-systems/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          phone: data.phone,
          serviceType: data.serviceType,
          description: data.description,
          consent: data.consent === "on",
          website: data.website,
        }),
      });
      const payload = (await res.json().catch(() => null)) as {
        error?: string;
        watchToken?: string;
        id?: string;
        n8n?: boolean;
      } | null;
      if (!res.ok) {
        throw new Error(payload?.error ?? `Request failed: ${res.status}`);
      }
      if (payload?.watchToken) {
        sessionStorage.setItem("demo_watch_token", payload.watchToken);
      }
      submittedAt.current = Date.now();
      setElapsedMs(0);
      setWatch({
        id: payload?.id ?? "",
        name: String(data.name),
        call_status: payload?.n8n ? "qualifying" : "pending",
        booked: false,
        response_time_seconds: null,
        contact_channel: null,
        submitted_at: new Date().toISOString(),
      });
      setStatus("live");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start the demo");
      setStatus("error");
    }
  }

  if (status === "live" && watch) {
    return (
      <LiveReadout
        watch={watch}
        elapsedMs={elapsedMs}
        onReset={() => {
          sessionStorage.removeItem("demo_watch_token");
          submittedAt.current = null;
          setWatch(null);
          setElapsedMs(0);
          setStatus("idle");
        }}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate={false} className="relative space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="demo-name" className={labelClass}>
            Name
          </label>
          <input
            id="demo-name"
            name="name"
            type="text"
            required
            autoComplete="name"
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor="demo-phone" className={labelClass}>
            Phone
          </label>
          <input
            id="demo-phone"
            name="phone"
            type="tel"
            required
            autoComplete="tel"
            inputMode="tel"
            placeholder="(305) 555-0142"
            className={fieldClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="demo-service" className={labelClass}>
          Service type
        </label>
        <select
          id="demo-service"
          name="serviceType"
          required
          defaultValue=""
          className={fieldClass}
        >
          <option value="" disabled>
            Select one
          </option>
          {DEMO_SERVICE_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="demo-description" className={labelClass}>
          Brief description
        </label>
        <textarea
          id="demo-description"
          name="description"
          required
          rows={5}
          maxLength={2000}
          placeholder="Storm damage on a two-story, insurance claim already opened, need someone on-site this week."
          className={`${fieldClass} resize-y`}
        />
      </div>

      <div className="flex items-start gap-3">
        <input
          id="demo-consent"
          name="consent"
          type="checkbox"
          required
          className="mt-1 h-4 w-4 shrink-0 border-steel bg-panel accent-phosphor"
        />
        <label htmlFor="demo-consent" className="text-body text-paper/70">
          Call and text me at this number about this request. The call may be
          recorded; Florida law requires all-party consent, and the agent will
          ask before any qualifying questions.
        </label>
      </div>

      <div aria-hidden="true" className="absolute left-[-9999px] top-0">
        <label htmlFor="demo-website">Website (leave blank)</label>
        <input
          id="demo-website"
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
          {status === "submitting" ? "Starting…" : "Call me in seconds"}
        </button>
        {status === "error" && (
          <p role="alert" className="mono-label text-paper/70">
            {error ?? "Couldn’t start the demo."}
          </p>
        )}
      </div>
    </form>
  );
}

function LiveReadout({
  watch,
  elapsedMs,
  onReset,
}: {
  watch: DemoLeadWatch;
  elapsedMs: number;
  onReset: () => void;
}) {
  const seconds = (elapsedMs / 1000).toFixed(1);
  const terminal =
    watch.booked ||
    watch.call_status === "sms_sent" ||
    watch.call_status === "consent_declined" ||
    watch.call_status === "failed";

  return (
    <div className="border border-steel/40 bg-panel p-6 sm:p-8">
      <p className="mono-label text-phosphor">live · speed-to-lead</p>
      <p
        className="mt-4 font-mono text-[clamp(3.5rem,12vw,6rem)] font-medium leading-none tabular-nums tracking-tight text-paper"
        aria-live="polite"
      >
        {seconds}
        <span className="ml-2 text-h3 text-paper/40">s</span>
      </p>
      <p className="mt-4 text-body text-paper/70">
        {STATUS_COPY[watch.call_status]}
        {watch.response_time_seconds != null && (
          <>
            {" "}
            First contact in {watch.response_time_seconds.toFixed(1)}s.
          </>
        )}
      </p>
      {watch.booked && (
        <p className="mt-2 text-body text-phosphor">Booked on the calendar.</p>
      )}
      {terminal && (
        <button
          type="button"
          onClick={onReset}
          className="mono-label mt-8 text-paper/70 underline-offset-4 hover:text-phosphor hover:underline"
        >
          Run another demo →
        </button>
      )}
    </div>
  );
}

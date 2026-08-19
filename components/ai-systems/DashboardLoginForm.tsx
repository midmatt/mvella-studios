"use client";

import { useState } from "react";
import { fieldClass, labelClass } from "@/components/form-styles";

export default function DashboardLoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    const password = String(new FormData(event.currentTarget).get("password") ?? "");

    try {
      const res = await fetch("/api/ai-systems/dashboard/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const payload = (await res.json().catch(() => null)) as {
        error?: string;
        redirect?: string;
      } | null;
      if (!res.ok) {
        throw new Error(payload?.error ?? "Sign-in failed");
      }
      window.location.assign(payload?.redirect ?? "/ai-systems/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="dashboard-password" className={labelClass}>
          Password
        </label>
        <input
          id="dashboard-password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className={fieldClass}
        />
      </div>
      <div className="flex flex-wrap items-center gap-6">
        <button
          type="submit"
          disabled={submitting}
          className="mono-label bg-phosphor px-6 py-3 text-ink transition-colors hover:bg-paper disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Checking…" : "Open dashboard"}
        </button>
        {error && (
          <p role="alert" className="mono-label text-paper/70">
            {error}
          </p>
        )}
      </div>
    </form>
  );
}

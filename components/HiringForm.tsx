"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { fieldClass, labelClass } from "./form-styles";

/**
 * "Hiring for a full-time role?" — the closing section of /about.
 *
 * Expands inline rather than opening a modal: a recruiter reading the bio
 * shouldn't lose it behind an overlay, and the expand/collapse mirrors the
 * mobile nav's AnimatePresence height transition rather than introducing a
 * new interaction pattern.
 *
 * Posts to the shared /api/contact with inquiryType "employment", which is
 * what gives the notification its own [HIRING] subject line.
 *
 * NOTE: `company` here is a REAL field. The honeypot is `website` across
 * every form on the site — see the schema comment in the API route for why
 * that rename was necessary.
 */
type Status = "idle" | "submitting" | "success" | "error";

const DIRECT_EMAIL = "mvella303@gmail.com";

export default function HiringForm() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const reduceMotion = useReducedMotion();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = Object.fromEntries(new FormData(form).entries());

    if (fields.website) return; // honeypot; server repeats the check

    setStatus("submitting");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inquiryType: "employment",
          name: fields.name,
          email: fields.email,
          company: fields.company,
          role: fields.role,
          message: fields.message,
          website: fields.website,
        }),
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  return (
    <section
      id="hiring"
      aria-label="Full-time role inquiries"
      className="border-t border-steel/40 bg-ink"
    >
      <div className="mx-auto max-w-6xl px-6 py-24">
        <p className="mono-label text-phosphor">&gt; cat ./availability</p>
        <h2 className="mt-4 font-display text-h2 text-paper">
          Hiring for a full-time role?
        </h2>
        <p className="mt-6 max-w-xl text-body text-paper/70">
          Freelance is the day job, but I&rsquo;m open to hearing about
          full-time positions — particularly ones where security is part of
          the engineering work rather than a separate department.
        </p>

        {status === "success" ? (
          <div className="mt-10 max-w-2xl border border-phosphor bg-panel p-8">
            <p className="mono-label text-phosphor">&gt; inquiry sent</p>
            <p className="mt-4 text-body text-paper/80">
              Thanks — I&rsquo;ll get back to you within 24 hours.
            </p>
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-controls="hiring-form"
              className="mono-label mt-10 border border-steel px-5 py-3 text-paper transition-colors hover:border-phosphor hover:text-phosphor"
            >
              {open ? "> close" : "> get in touch about a role"}
            </button>

            <AnimatePresence initial={false}>
              {open && (
                <motion.div
                  id="hiring-form"
                  className="overflow-hidden"
                  initial={
                    reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }
                  }
                  animate={
                    reduceMotion
                      ? { opacity: 1 }
                      : { height: "auto", opacity: 1 }
                  }
                  exit={
                    reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }
                  }
                  transition={{ duration: 0.28, ease: "easeOut" }}
                >
                  <form
                    onSubmit={handleSubmit}
                    className="mt-8 max-w-2xl space-y-6"
                  >
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div>
                        <label htmlFor="hiring-company" className={labelClass}>
                          Company
                        </label>
                        <input
                          id="hiring-company"
                          name="company"
                          type="text"
                          required
                          autoComplete="organization"
                          className={fieldClass}
                        />
                      </div>
                      <div>
                        <label htmlFor="hiring-name" className={labelClass}>
                          Your name
                        </label>
                        <input
                          id="hiring-name"
                          name="name"
                          type="text"
                          required
                          autoComplete="name"
                          className={fieldClass}
                        />
                      </div>
                      <div>
                        <label htmlFor="hiring-email" className={labelClass}>
                          Email
                        </label>
                        <input
                          id="hiring-email"
                          name="email"
                          type="email"
                          required
                          autoComplete="email"
                          className={fieldClass}
                        />
                      </div>
                      <div>
                        <label htmlFor="hiring-role" className={labelClass}>
                          Role / Position
                        </label>
                        <input
                          id="hiring-role"
                          name="role"
                          type="text"
                          required
                          className={fieldClass}
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="hiring-message" className={labelClass}>
                        Message
                      </label>
                      <textarea
                        id="hiring-message"
                        name="message"
                        required
                        rows={5}
                        placeholder="The team, the stack, and what the role actually involves."
                        className={`${fieldClass} resize-y`}
                      />
                    </div>

                    {/* Honeypot — off-screen, out of the tab order and the
                        accessibility tree. `website`, not `company`: Company
                        above is a real field. */}
                    <div
                      aria-hidden="true"
                      className="absolute left-[-9999px] top-0"
                    >
                      <label htmlFor="hiring-website">
                        Website (leave blank)
                      </label>
                      <input
                        id="hiring-website"
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
                        {status === "submitting" ? "Sending…" : "Send inquiry"}
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
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </section>
  );
}

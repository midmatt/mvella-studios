"use client";

import { useMemo, useState } from "react";
import {
  hiringEducation,
  hiringExperience,
  hiringTrack,
  hiringTracks,
  type CareerTrack,
} from "@/lib/hiring";
import { profile } from "@/lib/profile";
import { DIRECT_EMAIL } from "@/lib/contact";
import { fieldClass, labelClass } from "./form-styles";

/**
 * Full employer packet for /hiring — track picker, resume download, resume
 * body, and the inquiry form.
 */
type Status = "idle" | "submitting" | "success" | "error";

export default function HiringPacket() {
  const [trackId, setTrackId] = useState<CareerTrack>("software");
  const [status, setStatus] = useState<Status>("idle");
  const track = useMemo(() => hiringTrack(trackId), [trackId]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = Object.fromEntries(new FormData(form).entries());
    if (fields.website) return;

    setStatus("submitting");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inquiryType: "employment",
          careerTrack: trackId,
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
    <div className="bg-ink">
      {/* Intro + track picker */}
      <section className="border-t border-steel/40">
        <div className="mx-auto max-w-6xl px-6 pb-12 pt-6">
          <p className="mono-label text-phosphor">&gt; cat ./hiring</p>
          <h1 className="mt-4 font-display text-h2 text-paper">
            Hiring for Summer 2027
          </h1>
          <p className="mt-6 max-w-2xl text-body text-paper/70">
            {profile.name} is open to a Software Engineering or Security
            Engineering internship for Summer 2027. Pick a track to load the
            matching resume and project emphasis.
          </p>

          <div
            className="mt-10 grid gap-px bg-steel/40 sm:grid-cols-2"
            role="radiogroup"
            aria-label="Career track"
          >
            {hiringTracks.map((option) => {
              const selected = trackId === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setTrackId(option.id)}
                  className={`bg-panel px-5 py-5 text-left transition-colors ${
                    selected
                      ? "bg-panel-raised ring-1 ring-inset ring-phosphor"
                      : "hover:bg-panel-raised"
                  }`}
                >
                  <span className="mono-label text-phosphor">
                    {selected ? "> " : ""}
                    {option.title}
                  </span>
                  <span className="mt-2 block text-[0.8125rem] leading-snug text-paper/60">
                    {option.tagline}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={track.resumeHref}
              download={track.resumeDownloadAs}
              className="mono-label border border-phosphor px-5 py-3 text-phosphor transition-colors hover:bg-phosphor hover:text-ink"
            >
              Download resume
            </a>
          </div>
          <p className="mono-label mt-3 text-paper/40">{track.seeking}</p>
        </div>
      </section>

      {/* Summary + highlights */}
      <section className="border-t border-steel/40">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <p className="mono-label text-phosphor">&gt; summary</p>
          <h2 className="mt-3 font-display text-xl text-paper sm:text-2xl">
            {track.title} profile
          </h2>
          <p className="mt-6 max-w-3xl text-body text-paper/70">{track.summary}</p>

          <div className="mt-10 grid gap-10 lg:grid-cols-2">
            <div>
              <p className="mono-label text-paper/50">EDUCATION</p>
              <ul className="mt-4 space-y-3">
                {hiringEducation.map((line) => (
                  <li key={line} className="text-body text-paper/75">
                    {line}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mono-label text-paper/50">
                {trackId === "security"
                  ? "SECURITY & HONORS"
                  : "CERTIFICATIONS & HONORS"}
              </p>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-body text-paper/75">
                {track.highlights.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Skills */}
      <section className="border-t border-steel/40">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <p className="mono-label text-phosphor">&gt; skills</p>
          <h2 className="mt-3 font-display text-xl text-paper sm:text-2xl">
            Technical skills
          </h2>
          <dl className="mt-8 grid gap-6 sm:grid-cols-2">
            {track.skills.map((section) => (
              <div key={section.title} className="border border-steel/40 p-5">
                <dt className="mono-label text-paper/50">{section.title}</dt>
                <dd className="mt-3 text-body text-paper/75">
                  {section.items.join(" ")}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Projects */}
      <section className="border-t border-steel/40">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <p className="mono-label text-phosphor">&gt; projects</p>
          <h2 className="mt-3 font-display text-xl text-paper sm:text-2xl">
            Selected projects
          </h2>
          <ul className="mt-10 space-y-10">
            {track.projects.map((project) => (
              <li
                key={project.name}
                className="border-t border-steel/40 pt-8 first:border-t-0 first:pt-0"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="font-display text-lg text-paper">
                    {project.name}
                  </h3>
                  <p className="mono-label text-paper/45">{project.timeframe}</p>
                </div>
                <p className="mono-label mt-2 text-paper/55">{project.role}</p>
                <ul className="mt-4 list-disc space-y-2 pl-5 text-body text-paper/70">
                  {project.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Experience */}
      <section className="border-t border-steel/40">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <p className="mono-label text-phosphor">&gt; experience</p>
          <h2 className="mt-3 font-display text-xl text-paper sm:text-2xl">
            Experience
          </h2>
          <ul className="mt-8 space-y-8">
            {hiringExperience.map((job) => (
              <li key={job.title}>
                <h3 className="font-display text-lg text-paper">{job.title}</h3>
                <ul className="mt-4 list-disc space-y-2 pl-5 text-body text-paper/70">
                  {job.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Inquiry form */}
      <section
        id="inquire"
        aria-label="Role inquiry form"
        className="border-t border-steel/40"
      >
        <div className="mx-auto max-w-6xl px-6 py-16">
          <p className="mono-label text-phosphor">&gt; inquire</p>
          <h2 className="mt-3 font-display text-xl text-paper sm:text-2xl">
            Get in touch about a role
          </h2>
          <p className="mt-4 max-w-2xl text-body text-paper/70">
            Submitting as <span className="text-paper">{track.title}</span>.
            I&rsquo;ll reply within 24 hours.
          </p>

          {status === "success" ? (
            <div className="mt-10 max-w-2xl border border-phosphor bg-panel p-8">
              <p className="mono-label text-phosphor">&gt; inquiry sent</p>
              <p className="mt-4 text-body text-paper/80">
                Thanks — I&rsquo;ll get back to you within 24 hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-10 max-w-2xl space-y-6">
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
                    placeholder={
                      trackId === "security"
                        ? "e.g. Security Engineering Intern"
                        : "e.g. Software Engineering Intern"
                    }
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
                  placeholder={
                    trackId === "security"
                      ? "The security team, the threat model, and what the internship involves."
                      : "The team, the stack, and what the internship involves."
                  }
                  className={`${fieldClass} resize-y`}
                />
              </div>

              <div aria-hidden="true" className="absolute left-[-9999px] top-0">
                <label htmlFor="hiring-website">Website (leave blank)</label>
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
          )}
        </div>
      </section>
    </div>
  );
}

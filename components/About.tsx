import fs from "node:fs";
import path from "node:path";
import Image from "next/image";
import { profile } from "@/lib/profile";

/**
 * About (spec §4) — two columns on desktop: mono system readout + bio + links
 * on the left, photo on the right. Stacks on mobile with the photo kept
 * (scaled down), unlike the hero.
 *
 * Asset presence is resolved at build time: a missing photo falls back to a
 * panel-coloured placeholder, and a missing résumé hides the button rather
 * than shipping a link to a 404.
 *
 * Logo-backed qualifications (CyberPatriot, McFatter, …) live in a separate
 * Credentials section so the mono CERTS row stays text-only.
 */
function publicAssetExists(urlPath: string): boolean {
  try {
    return fs.existsSync(path.join(process.cwd(), "public", urlPath));
  } catch {
    return false;
  }
}

const readoutRows: Array<[string, string[]]> = [
  ["EDUCATION", profile.education],
  ["CERTS", profile.certifications],
  ["FOCUS", profile.focus],
];

const socialIcons: Record<string, string> = {
  GitHub:
    "M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58 0-.29-.01-1.05-.02-2.06-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.21.09 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5.99.11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.11-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6.01 0c2.29-1.55 3.3-1.23 3.3-1.23.65 1.66.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.81 5.62-5.49 5.92.43.37.82 1.1.82 2.22 0 1.61-.02 2.9-.02 3.29 0 .32.22.7.83.58A12.01 12.01 0 0 0 24 12.5C24 5.87 18.63.5 12 .5Z",
  LinkedIn:
    "M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05a3.74 3.74 0 0 1 3.37-1.85c3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0Z",
};

export default function About() {
  const hasPhoto = publicAssetExists(profile.photo);
  const hasResume = Boolean(
    profile.resumeUrl && publicAssetExists(profile.resumeUrl)
  );

  const socials = [
    { label: "LinkedIn", href: profile.linkedinUrl },
    { label: "GitHub", href: profile.githubUrl },
  ].filter((s): s is { label: string; href: string } => Boolean(s.href));

  return (
    <section
      id="about"
      aria-label="About Matthew Vella"
      className="border-t border-steel/40 bg-ink"
    >
      <div className="mx-auto max-w-6xl px-6 pb-24 pt-8 md:pt-12">
        <p className="mono-label text-phosphor">&gt; whoami --verbose</p>
        {/* h1: About owns the /about page, which had no top-level heading.
            Already styled at h2 size, so this is semantics only. */}
        <h1 className="mt-4 font-display text-h2 text-paper">
          {profile.name}
        </h1>

        <div className="mt-14 grid gap-12 md:grid-cols-[1fr_minmax(0,22rem)] md:gap-16">
          {/* Left — system readout, bio, links */}
          <div className="order-2 md:order-1">
            <dl className="border-y border-steel/40 py-6">
              {readoutRows.map(([label, values]) =>
                values.length === 0 ? null : (
                  <div
                    key={label}
                    className="grid gap-1 py-2.5 sm:grid-cols-[7rem_1fr] sm:gap-4"
                  >
                    <dt className="mono-label text-paper/50">{label}</dt>
                    <dd className="space-y-1">
                      {values.map((value) => (
                        <p
                          key={value}
                          className="font-mono text-label uppercase text-paper/80"
                        >
                          {value}
                        </p>
                      ))}
                    </dd>
                  </div>
                )
              )}
            </dl>

            <div className="mt-8 max-w-xl space-y-5">
              {profile.bio.map((paragraph) => (
                <p key={paragraph} className="text-body text-paper/70">
                  {paragraph}
                </p>
              ))}
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              {/* Hidden entirely when /public/resume.pdf is absent */}
              {hasResume && (
                <a
                  href={profile.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mono-label border border-phosphor px-5 py-3 text-phosphor transition-colors hover:bg-phosphor hover:text-ink"
                >
                  Download Resume
                </a>
              )}

              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="flex h-11 w-11 items-center justify-center border border-steel text-paper/70 transition-colors hover:border-phosphor hover:text-phosphor"
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="18"
                    height="18"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d={socialIcons[social.label]} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Right — photo, full color inside a phosphor keyline */}
          <div className="order-1 md:order-2">
            <div className="mx-auto max-w-[15rem] border border-phosphor p-3 sm:max-w-[18rem] md:max-w-none md:p-4">
              <div className="relative aspect-[4/5] w-full bg-panel">
                {hasPhoto ? (
                  <Image
                    src={profile.photo}
                    alt={`${profile.name}, founder of MVella Studios`}
                    fill
                    sizes="(min-width: 768px) 22rem, 18rem"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-panel-raised px-4 text-center">
                    <span className="mono-label text-paper/50">
                      {profile.name}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <p className="mono-label mt-4 text-center text-paper/40 md:text-left">
              Based in South Florida
            </p>
          </div>
        </div>
      </div>

    </section>
  );
}

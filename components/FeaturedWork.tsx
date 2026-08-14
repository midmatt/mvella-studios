"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { isAppStoreProject, projects } from "@/lib/projects";

/**
 * Homepage work section — a lighter counterpart to the full feed now living
 * at /work. Deliberately not the case-file treatment: no typed readout, no
 * device chrome, no stack list. Thumbnail, name, tagline, one status line.
 *
 * Capped at four: every project is currently `featured`, so without the slice
 * this would render the whole feed and defeat the point of condensing.
 */
const MAX_CARDS = 4;

const STATUS_LABEL: Record<string, string> = {
  live: "LIVE",
  shipped: "SHIPPED",
  in_development: "IN DEVELOPMENT",
};

function Card({ project }: { project: (typeof projects)[number] }) {
  const [imageFailed, setImageFailed] = useState(false);

  /**
   * App Store projects have 9:19.5 portrait screenshots. Covering a 16:10
   * card with one crops away everything but the status bar, so those are
   * contained (letterboxed against the ink screen) while landscape site
   * screenshots still fill the frame.
   */
  const portrait = isAppStoreProject(project);

  return (
    <li className="group bg-panel transition-colors duration-300 hover:bg-panel-raised">
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-ink">
        {imageFailed ? (
          <div className="flex h-full w-full items-center justify-center px-4 text-center">
            <span className="mono-label text-paper/50">{project.name}</span>
          </div>
        ) : (
          <Image
            src={project.heroImage}
            alt={`${project.name} — featured project screenshot`}
            fill
            sizes="(min-width: 768px) 552px, calc(100vw - 48px)"
            className={`${
              portrait ? "object-contain" : "object-cover object-top"
            } motion-safe:transition-transform motion-safe:duration-700 motion-safe:group-hover:scale-[1.02]`}
            onError={() => setImageFailed(true)}
          />
        )}
      </div>

      <div className="relative p-8">
        <p className="eyebrow text-phosphor">
          {STATUS_LABEL[project.status] ?? project.status} · {project.year}
        </p>
        <h3 className="mt-4 font-display text-h3 text-paper">{project.name}</h3>
        <p className="mt-3 pr-10 text-body text-paper/70">{project.tagline}</p>
        <span
          aria-hidden="true"
          className="absolute bottom-8 right-8 flex h-9 w-9 items-center justify-center border border-steel text-paper/50 transition-colors duration-300 group-hover:border-phosphor group-hover:bg-phosphor group-hover:text-ink"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M7 17 17 7M9 7h8v8" />
          </svg>
        </span>
      </div>
    </li>
  );
}

export default function FeaturedWork() {
  const featured = projects.filter((p) => p.featured).slice(0, MAX_CARDS);
  if (featured.length === 0) return null;

  return (
    <section
      id="work"
      aria-label="Featured work"
      className="border-t border-steel/40 bg-ink"
    >
      <div className="mx-auto max-w-6xl px-6 py-24">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow eyebrow--slash">Featured projects</p>
            <h2 className="mt-4 font-display text-h2 uppercase text-paper">
              Selected work<span className="text-phosphor">.</span>
            </h2>
          </div>
          <Link
            href="/work"
            className="mono-label inline-flex items-center gap-2 border border-steel px-5 py-3 text-paper transition-colors hover:border-phosphor hover:text-phosphor"
          >
            View All Projects
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M7 17 17 7M9 7h8v8" />
            </svg>
          </Link>
        </div>

        {/* gap-px over a steel wash = hairline divider grid */}
        <ul className="mt-14 grid gap-px overflow-hidden border border-steel/40 bg-steel/40 md:grid-cols-2">
          {featured.map((project) => (
            <Card key={project.slug} project={project} />
          ))}
        </ul>
      </div>
    </section>
  );
}

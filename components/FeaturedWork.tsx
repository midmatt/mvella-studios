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

      <div className="p-8">
        <p className="mono-label text-paper/50">
          <span aria-hidden="true" className="mr-1.5 text-phosphor">
            ●
          </span>
          {STATUS_LABEL[project.status] ?? project.status} · {project.year}
        </p>
        <h3 className="mt-4 font-display text-h3 text-paper">{project.name}</h3>
        <p className="mt-3 text-body text-paper/70">{project.tagline}</p>
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
        <p className="mono-label text-phosphor">&gt; ls ./work --featured</p>
        <h2 className="mt-4 font-display text-h2 text-paper">Featured work</h2>

        {/* gap-px over a steel wash = hairline divider grid */}
        <ul className="mt-14 grid gap-px bg-steel/40 md:grid-cols-2">
          {featured.map((project) => (
            <Card key={project.slug} project={project} />
          ))}
        </ul>

        <Link
          href="/work"
          className="mono-label mt-10 inline-block border border-steel px-5 py-3 text-paper transition-colors hover:border-phosphor hover:text-phosphor"
        >
          View All Work &rarr;
        </Link>
      </div>
    </section>
  );
}

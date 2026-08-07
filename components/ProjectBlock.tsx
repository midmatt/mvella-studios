"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import {
  isAppStoreProject,
  resolvedUrl,
  type Project,
} from "@/lib/projects";
import CaseFileReadout from "./CaseFileReadout";
import StarRating, { averageRating } from "./StarRating";
import DeviceFrame, { type DeviceVariant } from "./DeviceFrame";

interface Cta {
  label: string;
  href: string;
  external: boolean;
}

/** Malformed URLs fall through as undefined rather than throwing. */
function hostnameOf(url?: string): string | undefined {
  if (!url) return undefined;
  try {
    return new URL(url).hostname;
  } catch {
    return undefined;
  }
}

/** Bare domain for the browser frame's address bar. */
function domainOf(url?: string): string | undefined {
  return hostnameOf(url)?.replace(/^www\./i, "");
}

function ctaFor(project: Project): Cta | null {
  const liveUrl = resolvedUrl(project);

  if (liveUrl) {
    // Label follows the destination, not the category — VoiceLocal is a
    // product that lives on its own site rather than the App Store.
    return {
      label: isAppStoreProject(project) ? "View on App Store" : "Visit Site",
      href: liveUrl,
      external: true,
    };
  }
  if (project.category === "client") return null;
  if (project.caseStudyUrl) {
    return { label: "Read the case study", href: project.caseStudyUrl, external: false };
  }
  return null;
}

/**
 * One full-bleed work-feed block (spec §4): case-file readout → hero art →
 * title/tagline → CTA. Blocks alternate background and mirror alignment —
 * a nod to the mirrored wordmark. If the hero image is missing, a
 * panel-colored fallback with the project name keeps the layout intact.
 */
export default function ProjectBlock({
  project,
  index,
}: {
  project: Project;
  index: number;
}) {
  const mirrored = index % 2 === 1;
  const [imageFailed, setImageFailed] = useState(false);
  const reduceMotion = useReducedMotion();
  const rise = reduceMotion ? 0 : 12;
  const reveal = {
    hidden: { opacity: 0, y: rise },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
    },
  };
  const cta = ctaFor(project);

  /**
   * Variant is derived from the destination, not a slug list: anything on
   * apps.apple.com is an iOS app and gets the phone bezel, everything else
   * gets browser chrome. That covers CyberSimply and AlarmQR today and stays
   * correct as projects are appended — including VoiceLocal, a product that
   * ships from its own site rather than the App Store, so it reads as a
   * browser block alongside the client work.
   */
  const liveUrl = resolvedUrl(project);
  const frameVariant: DeviceVariant = isAppStoreProject(project)
    ? "phone"
    : "browser";

  const ctaClass =
    "mono-label shrink-0 border border-steel px-5 py-3 text-paper transition-colors hover:border-phosphor hover:text-phosphor";

  return (
    <article className={`group ${mirrored ? "bg-panel" : "bg-ink"}`}>
      <motion.div
        className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-20 md:py-28"
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.12 } },
        }}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-10% 0px" }}
      >
        <div className={mirrored ? "md:self-end" : undefined}>
          <CaseFileReadout project={project} index={index} />
        </div>

        <motion.div variants={reveal}>
          <DeviceFrame variant={frameVariant} domain={domainOf(liveUrl)}>
            {imageFailed ? (
              <div
                className={`flex h-full w-full items-center justify-center px-4 text-center ${
                  mirrored ? "bg-panel-raised" : "bg-panel"
                }`}
              >
                <span className="mono-label text-paper/60">{project.name}</span>
              </div>
            ) : (
              <Image
                src={project.heroImage}
                alt={`${project.name} — hero`}
                fill
                sizes={
                  frameVariant === "phone"
                    ? "(min-width: 640px) 16rem, 15rem"
                    : "(min-width: 1200px) 1104px, calc(100vw - 48px)"
                }
                className="object-cover motion-safe:transition-transform motion-safe:duration-700 motion-safe:group-hover:scale-[1.02]"
                onError={() => setImageFailed(true)}
              />
            )}
          </DeviceFrame>
        </motion.div>

        <motion.div
          variants={reveal}
          className={`flex flex-col gap-6 md:items-end md:justify-between ${
            mirrored ? "md:flex-row-reverse" : "md:flex-row"
          }`}
        >
          <div className={mirrored ? "md:text-right" : undefined}>
            {/* h2 under /work's h1 — it was an h3 when the feed was one
                section of the homepage. Already styled at h2 size, so the
                tag change is semantics only, no visual difference. */}
            <h2 className="font-display text-h2 text-paper">{project.name}</h2>
            <p className="mt-3 max-w-xl text-body text-paper/70">
              {project.tagline}
            </p>
            {/* No project has reviews yet — renders nothing until one does. */}
            <StarRating
              rating={averageRating(project.reviews)}
              count={project.reviews?.length}
              className={`mt-4 ${mirrored ? "md:justify-end" : ""}`}
            />
          </div>

          {cta ? (
            cta.external ? (
              <a
                href={cta.href}
                target="_blank"
                rel="noopener noreferrer"
                className={ctaClass}
              >
                {cta.label}
              </a>
            ) : (
              <Link href={cta.href} className={ctaClass}>
                {cta.label}
              </Link>
            )
          ) : (
            project.status === "in_development" && (
              <p className="mono-label shrink-0 text-paper/50">
                &gt; in development
              </p>
            )
          )}
        </motion.div>
      </motion.div>
    </article>
  );
}

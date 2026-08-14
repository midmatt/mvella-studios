"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import {
  isAppStoreProject,
  projectCtas,
  resolvedUrl,
  type Project,
} from "@/lib/projects";
import { services } from "@/lib/services";
import CaseFileReadout from "./CaseFileReadout";
import StarRating, { averageRating } from "./StarRating";
import DeviceFrame, { type DeviceVariant } from "./DeviceFrame";
import PhonePreviewGallery from "./PhonePreviewGallery";

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
  const ctas = projectCtas(project);

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
  const ctaSecondaryClass =
    "mono-label shrink-0 border border-steel/60 px-5 py-3 text-paper/80 transition-colors hover:border-phosphor hover:text-phosphor";

  return (
    <article
      id={project.slug}
      className={`group ${mirrored ? "bg-panel" : "bg-ink"}`}
    >
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
          {project.previewImages && project.previewImages.length > 0 ? (
            <PhonePreviewGallery
              images={project.previewImages}
              name={project.name}
            />
          ) : (
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
                  alt={`${project.name} — product screenshot`}
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
          )}
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
            <h2 className="font-display text-h2 text-paper">
              <Link
                href={`/work/${project.slug}`}
                className="transition-colors hover:text-phosphor"
              >
                {project.name}
              </Link>
            </h2>
            <p className="mt-3 max-w-xl text-body text-paper/70">
              {project.tagline}
            </p>
            {/* No project has reviews yet — renders nothing until one does. */}
            <StarRating
              rating={averageRating(project.reviews)}
              count={project.reviews?.length}
              className={`mt-4 ${mirrored ? "md:justify-end" : ""}`}
            />
            {project.relatedServiceSlug ? (
              <p
                className={`mono-label mt-4 text-paper/50 ${
                  mirrored ? "md:text-right" : ""
                }`}
              >
                Service:{" "}
                <Link
                  href={`/services#${project.relatedServiceSlug}`}
                  className="text-phosphor underline-offset-4 transition-colors hover:underline"
                >
                  {services.find((s) => s.slug === project.relatedServiceSlug)
                    ?.title ?? project.relatedServiceSlug}
                </Link>
              </p>
            ) : null}
          </div>

          {ctas.length > 0 ? (
            <div className="flex shrink-0 flex-wrap gap-3">
              {ctas.map((cta, i) => {
                const className = i === 0 ? ctaClass : ctaSecondaryClass;
                return cta.external ? (
                  <a
                    key={cta.href}
                    href={cta.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={className}
                  >
                    {cta.label}
                  </a>
                ) : (
                  <Link key={cta.href} href={cta.href} className={className}>
                    {cta.label}
                  </Link>
                );
              })}
            </div>
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

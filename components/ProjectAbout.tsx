"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  isAppStoreProject,
  projectCtas,
  resolvedUrl,
  type Project,
} from "@/lib/projects";
import { services } from "@/lib/services";
import CaseFileReadout from "./CaseFileReadout";
import DeviceFrame, { type DeviceVariant } from "./DeviceFrame";
import PhonePreviewGallery from "./PhonePreviewGallery";

const STATUS_LABEL: Record<Project["status"], string> = {
  live: "LIVE",
  shipped: "SHIPPED",
  in_development: "IN DEVELOPMENT",
};

function hostnameOf(url?: string): string | undefined {
  if (!url) return undefined;
  try {
    return new URL(url).hostname;
  } catch {
    return undefined;
  }
}

function domainOf(url?: string): string | undefined {
  return hostnameOf(url)?.replace(/^www\./i, "");
}

/**
 * Per-product about page — same case-file / device-chrome language as /work,
 * with the longer description and store-or-website CTAs.
 */
export default function ProjectAbout({
  project,
  index,
}: {
  project: Project;
  index: number;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const ctas = projectCtas(project);
  const liveUrl = resolvedUrl(project);
  const frameVariant: DeviceVariant = isAppStoreProject(project)
    ? "phone"
    : "browser";
  const relatedService = services.find(
    (s) => s.slug === project.relatedServiceSlug,
  );

  const ctaClass =
    "mono-label shrink-0 border border-steel px-5 py-3 text-paper transition-colors hover:border-phosphor hover:text-phosphor";
  const ctaSecondaryClass =
    "mono-label shrink-0 border border-steel/60 px-5 py-3 text-paper/80 transition-colors hover:border-phosphor hover:text-phosphor";

  return (
    <article className="bg-ink">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 pb-24 pt-6 md:gap-14">
        <CaseFileReadout project={project} index={index} />

        {project.previewImages && project.previewImages.length > 0 ? (
          <PhonePreviewGallery
            images={project.previewImages}
            name={project.name}
          />
        ) : (
          <DeviceFrame variant={frameVariant} domain={domainOf(liveUrl)}>
            {imageFailed ? (
              <div className="flex h-full w-full items-center justify-center bg-panel px-4 text-center">
                <span className="mono-label text-paper/60">{project.name}</span>
              </div>
            ) : (
              <Image
                src={project.heroImage}
                alt={`${project.name} — product screenshot`}
                fill
                priority
                sizes={
                  frameVariant === "phone"
                    ? "(min-width: 640px) 16rem, 15rem"
                    : "(min-width: 1200px) 1104px, calc(100vw - 48px)"
                }
                className="object-cover"
                onError={() => setImageFailed(true)}
              />
            )}
          </DeviceFrame>
        )}

        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            <p className="eyebrow text-phosphor">
              {STATUS_LABEL[project.status]} · {project.year}
            </p>
            <h1 className="mt-4 font-display text-h2 text-paper">
              {project.name}
            </h1>
            <p className="mt-6 text-body text-paper/70">{project.about}</p>
            {relatedService ? (
              <p className="mono-label mt-6 text-paper/50">
                Service:{" "}
                <Link
                  href={`/services#${relatedService.slug}`}
                  className="text-phosphor underline-offset-4 transition-colors hover:underline"
                >
                  {relatedService.title}
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
          ) : project.status === "in_development" ? (
            <p className="mono-label shrink-0 text-paper/50">
              &gt; in development
            </p>
          ) : null}
        </div>

        <p className="border-t border-steel/40 pt-10">
          <Link
            href="/work"
            className="mono-label inline-flex items-center gap-2 text-paper/70 underline-offset-4 transition-colors hover:text-phosphor hover:underline"
          >
            ← All projects
          </Link>
        </p>
      </div>
    </article>
  );
}

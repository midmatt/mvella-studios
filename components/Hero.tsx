"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import HeroBackground from "./HeroBackground";
import AvailabilityBadge from "./AvailabilityBadge";

const EYEBROW = "FREELANCE DEVELOPER";
const TYPE_SPEED_MS = 55;
const START_DELAY_MS = 400;

/**
 * Hero — copy and CTAs paint immediately; the portrait is never hidden
 * behind an opacity-0 motion wrapper (that was the 4.85s LCP render delay).
 *
 * Mobile: copy first, compact portrait, no min-h-svh — so the two CTAs land
 * in the first viewport at 375×667. Desktop keeps the two-column agency layout.
 *
 * The typewriter only drives the eyebrow; it does not gate headline or CTAs.
 */
export default function Hero() {
  const [typed, setTyped] = useState("");
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      setTyped(EYEBROW);
      return;
    }

    let interval: ReturnType<typeof setInterval> | undefined;
    const startTimeout = setTimeout(() => {
      let i = 0;
      interval = setInterval(() => {
        i += 1;
        setTyped(EYEBROW.slice(0, i));
        if (i >= EYEBROW.length) clearInterval(interval);
      }, TYPE_SPEED_MS);
    }, START_DELAY_MS);

    return () => {
      clearTimeout(startTimeout);
      clearInterval(interval);
    };
  }, [reduceMotion]);

  return (
    <section className="relative overflow-hidden pt-16 lg:flex lg:min-h-svh lg:items-center">
      <HeroBackground />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-ink"
      />

      <div className="relative mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-5 px-6 py-5 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8 lg:py-20">
        {/* Copy first on every breakpoint so mobile CTAs are above the fold. */}
        <div>
          <p className="eyebrow mb-3 flex h-5 items-center lg:mb-6">
            <span className="sr-only">{EYEBROW}</span>
            <span aria-hidden="true">
              {typed}
              <span className="ml-0.5 inline-block h-[1.05em] w-[0.5em] translate-y-[0.15em] bg-phosphor motion-safe:animate-cursor-blink" />
            </span>
            <span aria-hidden="true" className="ml-3 text-phosphor/40">
              //////
            </span>
          </p>

          <h1 className="max-w-3xl font-display text-[clamp(2.5rem,5vw,4.25rem)] uppercase leading-none tracking-[-0.02em] text-paper">
            Security-minded software, built and{" "}
            <span className="text-phosphor">shipped</span>
            <span className="text-phosphor">.</span>
          </h1>

          <p className="mt-3 max-w-md text-[0.9375rem] leading-snug text-paper/70 lg:mt-7 lg:text-body lg:leading-relaxed">
            Freelance web and mobile development from a cybersecurity student
            who ships fast.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2 lg:mt-8 lg:gap-4">
            <Link
              href="/contact"
              className="mono-label bg-phosphor px-4 py-2.5 text-ink transition-colors hover:bg-paper lg:px-6 lg:py-3"
            >
              Start a Project&nbsp;&rarr;
            </Link>
            <Link
              href="/work"
              className="mono-label border border-steel px-4 py-2.5 text-paper transition-colors hover:border-phosphor hover:text-phosphor lg:px-6 lg:py-3"
            >
              View My Work
            </Link>
          </div>

          <div className="mt-5 hidden items-center gap-5 sm:flex lg:mt-10">
            <span className="mono-label text-paper/40">Find me on</span>
            <div className="flex items-center gap-4 text-paper/60">
              <a
                href="https://github.com/midmatt"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="transition-colors hover:text-phosphor"
              >
                <GithubIcon />
              </a>
              <a
                href="https://www.linkedin.com/in/matthew-vella-234189326/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="transition-colors hover:text-phosphor"
              >
                <LinkedinIcon />
              </a>
              <a
                href="https://www.instagram.com/matt_ve11a"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="transition-colors hover:text-phosphor"
              >
                <InstagramIcon />
              </a>
              <a
                href="/contact"
                aria-label="Email"
                className="transition-colors hover:text-phosphor"
              >
                <MailIcon />
              </a>
            </div>
          </div>
        </div>

        {/* Portrait paints at opacity 1. Compact on mobile so it stays in-viewport
            without pushing CTAs below the fold; full agency frame from lg up.
            Box matches the PNG (343×658) so a reload can't stretch it: fill + a
            3:4 / lg:w-full column was painting object-fit:fill before contain. */}
        <div className="relative mx-auto aspect-[343/658] h-56 w-fit lg:h-auto lg:w-full lg:max-w-[22.5rem]">
          <div
            aria-hidden="true"
            className="absolute right-[6%] top-[8%] h-[70%] w-[62%] bg-phosphor"
            style={{ clipPath: "polygon(22% 0, 100% 0, 78% 100%, 0 100%)" }}
          />
          <div
            aria-hidden="true"
            className="absolute right-[2%] top-[4%] h-[52%] w-[34%] border border-phosphor/40"
            style={{ clipPath: "polygon(30% 0, 100% 0, 70% 100%, 0 100%)" }}
          />
          <div
            aria-hidden="true"
            className="absolute inset-x-[8%] bottom-0 h-[60%] rounded-[50%] bg-phosphor/10 blur-2xl"
          />

          <Image
            src="/about/matthew-header.png"
            alt="Matthew Vella"
            width={343}
            height={658}
            priority
            fetchPriority="high"
            sizes="(min-width: 1024px) 360px, 117px"
            className="relative h-full w-full object-contain object-bottom drop-shadow-[0_25px_45px_rgba(0,0,0,0.55)]"
            style={{ objectFit: "contain" }}
          />

          <div className="absolute -bottom-2 left-0 hidden lg:-left-6 lg:block">
            <AvailabilityBadge />
          </div>
        </div>
      </div>
    </section>
  );
}

function GithubIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .5A11.5 11.5 0 0 0 .5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.36-3.88-1.36-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.2 1.77 1.2 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.43-2.7 5.4-5.26 5.69.41.36.78 1.07.78 2.16v3.2c0 .31.2.67.8.56A11.5 11.5 0 0 0 23.5 12 11.5 11.5 0 0 0 12 .5Z" />
    </svg>
  );
}

function LinkedinIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.44-2.13 2.94v5.67H9.35V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13ZM7.12 20.45H3.55V9h3.57v11.45ZM22.22 0H1.77C.8 0 0 .78 0 1.75v20.5C0 23.2.8 24 1.77 24h20.45c.98 0 1.78-.8 1.78-1.75V1.75C24 .78 23.2 0 22.22 0Z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m3 6 9 7 9-7" />
    </svg>
  );
}

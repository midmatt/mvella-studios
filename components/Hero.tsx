"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import HeroBackground from "./HeroBackground";
import AvailabilityBadge from "./AvailabilityBadge";

const EYEBROW = "FREELANCE DEVELOPER";
const TYPE_SPEED_MS = 55;
const START_DELAY_MS = 400;

/**
 * Redesigned hero (agency-portrait reference): a slashed mono eyebrow that
 * types itself out once, a bold uppercase headline with a single accent word
 * and trailing accent period, subhead, CTAs, and a socials row on the left;
 * the cut-out portrait framed by angular phosphor shapes and a rotating
 * availability badge on the right.
 *
 * Reduced motion: no typing, no rise — simple fades only.
 */
export default function Hero() {
  const reduceMotion = useReducedMotion();
  const [typed, setTyped] = useState("");

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

  const rise = reduceMotion ? 0 : 16;
  const reveal = {
    hidden: { opacity: 0, y: rise },
    show: { opacity: 1, y: 0 },
  };

  return (
    <section className="relative flex min-h-svh items-center overflow-hidden pt-16">
      <HeroBackground />
      {/* Fade the node field out into the stats bar below */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-ink"
      />

      <div className="relative mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-12 px-6 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8 lg:py-20">
        {/* ── Left column ─────────────────────────────────────────── */}
        <div className="order-2 lg:order-1">
          {/* Eyebrow — typed once on load, trailed by hairline slashes. */}
          <p className="eyebrow mb-6 flex h-5 items-center">
            <span className="sr-only">{EYEBROW}</span>
            <span aria-hidden="true">
              {typed}
              <span className="ml-0.5 inline-block h-[1.05em] w-[0.5em] translate-y-[0.15em] bg-phosphor motion-safe:animate-cursor-blink" />
            </span>
            <span aria-hidden="true" className="ml-3 text-phosphor/40">
              //////
            </span>
          </p>

          <motion.h1
            className="max-w-2xl font-display text-display uppercase leading-[0.95] text-paper"
            variants={reveal}
            initial="hidden"
            animate="show"
            transition={{ duration: 0.6, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            I build digital
            <br />
            <span className="text-phosphor">products</span>
            <span className="text-phosphor">.</span>
          </motion.h1>

          <motion.div
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.12, delayChildren: 1.15 } },
            }}
            initial="hidden"
            animate="show"
          >
            <motion.p
              variants={reveal}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="mt-7 max-w-md text-body text-paper/70"
            >
              Freelance web and mobile development from a cybersecurity student
              who ships fast — without cutting corners on security.
            </motion.p>

            <motion.div
              variants={reveal}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="mt-8 flex flex-wrap items-center gap-4"
            >
              <Link
                href="/contact"
                className="mono-label bg-phosphor px-6 py-3 text-ink transition-colors hover:bg-paper"
              >
                Start a Project&nbsp;&rarr;
              </Link>
              <Link
                href="/work"
                className="mono-label border border-steel px-6 py-3 text-paper transition-colors hover:border-phosphor hover:text-phosphor"
              >
                View My Work
              </Link>
            </motion.div>

            {/* Socials row — the reference's "FIND ME ON" strip. */}
            <motion.div
              variants={reveal}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="mt-10 flex items-center gap-5"
            >
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
            </motion.div>
          </motion.div>
        </div>

        {/* ── Right column: portrait ──────────────────────────────── */}
        <motion.div
          className="relative order-1 mx-auto w-full max-w-sm lg:order-2 lg:max-w-none"
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="relative aspect-[3/4] w-full">
            {/* Angular phosphor accent shapes behind the subject. */}
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
            {/* Soft radial base so the cut-out doesn't float on pure ink. */}
            <div
              aria-hidden="true"
              className="absolute inset-x-[8%] bottom-0 h-[60%] rounded-[50%] bg-phosphor/10 blur-2xl"
            />

            <Image
              src="/about/matthew-header.png"
              alt="Matthew Vella"
              fill
              priority
              sizes="(min-width: 1024px) 480px, 384px"
              className="relative object-contain object-bottom drop-shadow-[0_25px_45px_rgba(0,0,0,0.55)]"
            />

            {/* Rotating availability badge, bottom-left of the portrait. */}
            <div className="absolute -bottom-2 left-0 lg:-left-6">
              <AvailabilityBadge />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ── Inline social icons (currentColor, 20px) ───────────────────── */
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

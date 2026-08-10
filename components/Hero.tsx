"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import HeroBackground from "./HeroBackground";
import StatusCard from "./StatusCard";

const PROMPT = "> whoami";
const TYPE_SPEED_MS = 75;
const START_DELAY_MS = 450;

/**
 * One orchestrated moment on load (spec §1 Motion): the mono eyebrow types
 * itself out once, then the headline fades/rises in, then subhead + CTAs.
 * Reduced motion: no typing, no rise — simple fades only.
 */
export default function Hero() {
  const reduceMotion = useReducedMotion();
  const [typed, setTyped] = useState("");
  const [typingDone, setTypingDone] = useState(false);

  useEffect(() => {
    if (reduceMotion) {
      setTyped(PROMPT);
      setTypingDone(true);
      return;
    }

    let interval: ReturnType<typeof setInterval> | undefined;
    let doneTimeout: ReturnType<typeof setTimeout> | undefined;
    const startTimeout = setTimeout(() => {
      let i = 0;
      interval = setInterval(() => {
        i += 1;
        setTyped(PROMPT.slice(0, i));
        if (i >= PROMPT.length) {
          clearInterval(interval);
          doneTimeout = setTimeout(() => setTypingDone(true), 300);
        }
      }, TYPE_SPEED_MS);
    }, START_DELAY_MS);

    return () => {
      clearTimeout(startTimeout);
      clearInterval(interval);
      clearTimeout(doneTimeout);
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

      {/* Reduced padding below md: the status card is 306px tall stacked
          under the CTAs, which pushes the mobile layout past the fold and
          clips the card's bottom edge. The section is min-h-svh with centred
          content, so this only relaxes the minimum — it doesn't tighten the
          layout when there's room. Desktop padding is unchanged. */}
      <div className="relative mx-auto w-full max-w-6xl px-6 py-12 md:py-24">
        {/* Eyebrow — typed once on load. Full text kept in the DOM for screen readers. */}
        <p className="mono-label mb-6 h-5 text-phosphor">
          <span className="sr-only">{PROMPT}</span>
          <span aria-hidden="true">
            {typed}
            <span className="ml-0.5 inline-block h-[1.1em] w-[0.55em] translate-y-[0.2em] bg-phosphor motion-safe:animate-cursor-blink" />
          </span>
        </p>

        {/*
          The wrapper is the positioning context for the floating status card:
          anchoring to the h1 alone (rather than the whole text block) is what
          centers the card on the headline instead of on the eyebrow-to-CTA
          stack, which sits ~70px lower.
        */}
        <div className="relative">
          <motion.h1
            className="max-w-4xl text-balance font-display text-display text-paper"
            variants={reveal}
            initial="hidden"
            animate={typingDone ? "show" : "hidden"}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            Built to hold up under pressure.
          </motion.h1>

          {/*
            Floated only from lg up. At md the headline's own ink is ~430px of
            a 720px container, which doesn't leave room for a 336px card
            without colliding — below lg it renders stacked instead (see the
            instance under the CTAs). Only one of the two is ever in the
            accessibility tree, since the other is display:none.
          */}
          {/*
            Centring lives on this plain wrapper, not on the motion element:
            framer-motion writes its own inline `transform` for the reveal,
            which silently overrides a Tailwind `-translate-y-1/2` and drops
            the card half its height too low.
          */}
          {/*
            data-hero-anchor is read by HeroBackground to tether nearby graph
            nodes to this card's centre. It sits on the wrapper rather than
            the motion element so the measured rect is the settled position,
            not one mid-reveal. Only the floated instance carries it — the
            stacked one below lg has no rect to measure and no hub to tether.
          */}
          <div
            data-hero-anchor
            className="absolute right-0 top-1/2 hidden -translate-y-1/2 lg:block"
          >
            <motion.div
              variants={reveal}
              initial="hidden"
              animate={typingDone ? "show" : "hidden"}
              transition={{ duration: 0.5, delay: 0.5, ease: "easeOut" }}
            >
              <StatusCard />
            </motion.div>
          </div>
        </div>

        <motion.div
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.12, delayChildren: 0.25 } },
          }}
          initial="hidden"
          animate={typingDone ? "show" : "hidden"}
        >
          <motion.p
            variants={reveal}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="mt-8 max-w-xl text-body text-paper/70 md:mt-12"
          >
            Freelance web and mobile development from a cybersecurity student who
            ships fast without cutting corners on security.
          </motion.p>

          <motion.div
            variants={reveal}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="mt-8 flex flex-wrap items-center gap-4 md:mt-10"
          >
            <Link
              href="/#work"
              className="mono-label bg-phosphor px-6 py-3 text-ink transition-colors hover:bg-paper"
            >
              View Work
            </Link>
            {/* Straight to the form now. Scrolling to #contact would land on
                the closing section, whose only content is a button to here. */}
            <Link
              href="/contact"
              className="mono-label border border-steel px-6 py-3 text-paper transition-colors hover:border-phosphor hover:text-phosphor"
            >
              Start a Project
            </Link>
          </motion.div>

          {/* Stacked counterpart to the floated card — there is no right-hand
              column to fill below lg, so it becomes the last item in the flow. */}
          <motion.div
            variants={reveal}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="mt-10 lg:hidden"
          >
            <StatusCard />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

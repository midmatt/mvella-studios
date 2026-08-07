"use client";

import { animate, motion, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { projects } from "@/lib/projects";

/**
 * Stats bar (spec §4) — Voodoo-style hard numbers. Counts are derived from
 * lib/projects.ts so they stay accurate as projects are appended; the
 * Security+ entry is the one deliberately static stat.
 */
/** Start of Matthew's time in the cybersecurity field. */
const CYBER_START = new Date(2023, 7, 1); // August 2023

/**
 * Full years elapsed since `start`. Derived rather than hardcoded so the
 * counter ticks over on its own each August without a code change.
 */
function fullYearsSince(start: Date, now = new Date()): number {
  let years = now.getFullYear() - start.getFullYear();
  const monthDelta = now.getMonth() - start.getMonth();
  if (monthDelta < 0 || (monthDelta === 0 && now.getDate() < start.getDate())) {
    years -= 1;
  }
  return years;
}

const stats: Array<{ value: number | string; label: string; suffix?: string }> = [
  {
    value: projects.filter(
      (p) => p.category === "product" && p.status !== "in_development"
    ).length,
    label: "Products shipped",
  },
  {
    value: projects.filter(
      (p) => p.category === "client" && p.status === "live"
    ).length,
    label: "Client sites live",
  },
  {
    value: fullYearsSince(CYBER_START),
    suffix: "+",
    label: "Years in cybersecurity",
  },
  {
    /**
     * Every project in the array is built end-to-end by one person — no
     * agency layer, no handoff to a junior. For a small business choosing a
     * freelancer, "the person you talk to is the person who builds it" is
     * the reassurance that actually closes the deal.
     */
    value: Math.round(
      (projects.filter((p) => /solo|freelance/i.test(p.role)).length /
        projects.length) *
        100
    ),
    suffix: "%",
    label: "Solo-built — you work directly with the developer",
  },
];

/** Counts 0 → value once in view; zero-padded to keep the "hard counter" look. */
function CountUp({ value, suffix }: { value: number; suffix?: string }) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduceMotion) {
      setN(value);
      return;
    }
    const controls = animate(0, value, {
      duration: 0.9,
      ease: "easeOut",
      onUpdate: (v) => setN(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, reduceMotion, value]);

  return (
    <span ref={ref}>
      {String(n).padStart(2, "0")}
      {suffix ? <span className="text-phosphor">{suffix}</span> : null}
    </span>
  );
}

export default function StatsBar() {
  const reduceMotion = useReducedMotion();
  const rise = reduceMotion ? 0 : 12;
  const reveal = {
    hidden: { opacity: 0, y: rise },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  return (
    <section aria-label="Studio stats" className="border-y border-steel/40">
      {/* gap-px over a steel wash = hairline divider grid */}
      <motion.div
        className="mx-auto grid max-w-6xl grid-cols-2 gap-px bg-steel/40 md:grid-cols-4"
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.1 } },
        }}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-10% 0px" }}
      >
        {stats.map((stat) => (
          <motion.div
            key={stat.label}
            variants={reveal}
            className="bg-ink px-6 py-10 md:px-8 md:py-12"
          >
            <p className="flex h-14 items-end font-display font-semibold leading-none text-paper md:h-16">
              {typeof stat.value === "number" ? (
                <span className="text-5xl md:text-6xl">
                  <CountUp value={stat.value} suffix={stat.suffix} />
                </span>
              ) : (
                <span className="text-3xl md:text-4xl">{stat.value}</span>
              )}
            </p>
            <p className="mono-label mt-4 text-paper/60">{stat.label}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

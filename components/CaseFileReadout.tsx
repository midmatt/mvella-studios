"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { Project } from "@/lib/projects";

const TYPE_SPEED_MS = 45;

const STATUS_LABEL: Record<Project["status"], string> = {
  live: "LIVE",
  shipped: "SHIPPED",
  in_development: "IN DEVELOPMENT",
};

/**
 * The signature case-file readout (spec §1): the header line types itself in
 * as the block enters the viewport, then the metadata lines fade in staggered.
 * Reduced motion: no typing, simple fades only. Full text stays in the DOM
 * for screen readers — the animation is presentation-only.
 */
export default function CaseFileReadout({
  project,
  index,
}: {
  project: Project;
  index: number;
}) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px" });

  const header = `> case_${String(index + 1).padStart(2, "0")} // ${project.slug}`;
  const [typed, setTyped] = useState("");
  const [headerDone, setHeaderDone] = useState(false);

  useEffect(() => {
    if (!inView) return;
    if (reduceMotion) {
      setTyped(header);
      setHeaderDone(true);
      return;
    }

    let i = 0;
    const interval = setInterval(() => {
      i += 1;
      setTyped(header.slice(0, i));
      if (i >= header.length) {
        clearInterval(interval);
        setHeaderDone(true);
      }
    }, TYPE_SPEED_MS);

    return () => clearInterval(interval);
  }, [inView, reduceMotion, header]);

  const rows: Array<[label: string, value: string]> = [
    ["STACK", project.stack.join(" · ")],
    ["ROLE", project.role],
    ["STATUS", STATUS_LABEL[project.status]],
    ["YEAR", String(project.year)],
  ];

  return (
    <div ref={ref} className="font-mono text-label uppercase">
      <div className="sr-only">
        <p>{header}</p>
        {rows.map(([label, value]) => (
          <p key={label}>
            {label} {value}
          </p>
        ))}
      </div>

      <div aria-hidden="true">
        <p className="h-5 text-phosphor">
          {typed}
          {!headerDone && (
            <span className="ml-0.5 inline-block h-[1.1em] w-[0.55em] translate-y-[0.2em] bg-phosphor motion-safe:animate-cursor-blink" />
          )}
        </p>

        <motion.div
          className="mt-3 space-y-1.5"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.09 } },
          }}
          initial="hidden"
          animate={headerDone ? "show" : "hidden"}
        >
          {rows.map(([label, value]) => (
            <motion.p
              key={label}
              variants={{
                hidden: { opacity: 0 },
                show: { opacity: 1, transition: { duration: 0.25 } },
              }}
              className="grid grid-cols-[5rem_1fr] gap-x-4"
            >
              <span className="text-paper/50">{label}</span>
              <span className="text-paper/80">
                {label === "STATUS" && (
                  <span className="mr-1.5 text-phosphor">●</span>
                )}
                {value}
              </span>
            </motion.p>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

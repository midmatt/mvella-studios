"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { credentials, type Credential } from "@/lib/credentials";

/**
 * Compact qualifications coverflow — same rotation model as OOTastings'
 * FeaturedTastings (index + modulo, CSS transform/opacity, wrap fade),
 * dialed down so the logos skim rather than dominate the homepage.
 *
 * Equal card chrome: fixed logo well + clamped caption so FIU's wide mark
 * and the round seals occupy the same footprint. Side peeks stay visible;
 * cards beyond |slot| > 1 stay hidden so a four-item ring still reads as
 * left / centre / right.
 */

const SHIFT = 58;
const SIDE_SCALE = 0.78;
const SIDE_OPACITY = 0.55;
const SIDE_TILT = 8;

const SLIDE_MS = 320;
const WRAP_MS = 120;
const AUTOPLAY_MS = 5500;

type Wrap = { id: number; seq: number } | null;

function CredentialCard({
  credential,
  active,
}: {
  credential: Credential;
  active: boolean;
}) {
  const inner = (
    <>
      {/* Fixed well — every logo is contained to the same box */}
      <div className="flex h-16 w-full items-center justify-center sm:h-20">
        <Image
          src={credential.logo}
          alt=""
          width={credential.width}
          height={credential.height}
          className="max-h-14 w-auto max-w-[9.5rem] object-contain sm:max-h-16 sm:max-w-[11rem]"
          aria-hidden
        />
      </div>
      <p className="mono-label mt-4 truncate text-paper">{credential.name}</p>
      <p className="mt-1.5 line-clamp-2 min-h-[2.5rem] text-[0.8125rem] leading-snug text-paper/55">
        {credential.caption}
      </p>
      {credential.href ? (
        <span
          className={`mono-label mt-4 inline-block text-phosphor/70 transition-colors ${
            active ? "group-hover:text-phosphor" : ""
          }`}
        >
          Learn more →
        </span>
      ) : null}
    </>
  );

  const className =
    "flex h-full flex-col border border-steel/50 bg-panel px-5 py-5 transition-colors duration-300 group-hover:border-phosphor/40 group-hover:bg-panel-raised sm:px-6 sm:py-6";

  if (credential.href) {
    return (
      <a
        href={credential.href}
        target="_blank"
        rel="noopener noreferrer"
        tabIndex={active ? 0 : -1}
        aria-label={`${credential.name} — ${credential.caption}. Learn more`}
        className={`group block h-full ${className}`}
        onClick={(e) => {
          // Side cards are for rotation; only the centre card is a real link.
          if (!active) e.preventDefault();
        }}
      >
        {inner}
      </a>
    );
  }

  return <div className={className}>{inner}</div>;
}

export default function Credentials() {
  const total = credentials.length;
  const [active, setActive] = useState(0);
  const [wrap, setWrap] = useState<Wrap>(null);
  const [hovered, setHovered] = useState(false);
  const [motionOk, setMotionOk] = useState(true);
  const seq = useRef(0);
  const touch = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setMotionOk(!mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const go = useCallback(
    (dir: 1 | -1) => {
      seq.current += 1;
      setWrap({
        id: dir === 1 ? (active - 1 + total) % total : (active + 1) % total,
        seq: seq.current,
      });
      setActive((active + dir + total) % total);
    },
    [active, total],
  );

  useEffect(() => {
    if (!wrap) return;
    const t = setTimeout(() => setWrap(null), WRAP_MS);
    return () => clearTimeout(t);
  }, [wrap]);

  useEffect(() => {
    if (hovered || !motionOk || total < 2) return;
    const t = setTimeout(() => go(1), AUTOPLAY_MS);
    return () => clearTimeout(t);
  }, [hovered, motionOk, go, total]);

  /** Signed slot: 0 centre, ±1 sides; |slot| > 1 is off-stage. */
  const slotOf = (i: number) => {
    const raw = (i - active + total) % total;
    return raw > total / 2 ? raw - total : raw;
  };

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touch.current = { x: t.clientX, y: t.clientY };
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touch.current;
    touch.current = null;
    if (!start) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return;
    go(dx < 0 ? 1 : -1);
  };

  if (total === 0) return null;

  return (
    <section
      id="credentials"
      aria-label="Qualifications"
      className="border-t border-steel/40 bg-ink"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setHovered(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setHovered(false);
        }
      }}
    >
      <div className="mx-auto max-w-6xl px-6 py-12 md:py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow eyebrow--slash">Credentials</p>
            <h2 className="mt-2 font-display text-xl uppercase text-paper sm:text-2xl">
              Qualifications<span className="text-phosphor">.</span>
            </h2>
          </div>

          {total > 1 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label="Previous qualification"
                className="mono-label flex h-9 w-9 items-center justify-center border border-steel text-paper/70 transition-colors hover:border-phosphor hover:text-phosphor"
              >
                ←
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                aria-label="Next qualification"
                className="mono-label flex h-9 w-9 items-center justify-center border border-steel text-paper/70 transition-colors hover:border-phosphor hover:text-phosphor"
              >
                →
              </button>
            </div>
          )}
        </div>

        {/* Coverflow stage — shared grid cell, cards positioned by transform */}
        <div
          className="relative mt-8"
          style={{ perspective: "1400px" }}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <div
            className="relative mx-auto grid h-[13.5rem] w-full max-w-[18rem] place-items-center sm:h-[14.5rem] sm:max-w-[20rem]"
            role="list"
            aria-roledescription="carousel"
            aria-label="Qualification logos"
          >
            {credentials.map((credential, i) => {
              const slot = slotOf(i);
              const isCenter = slot === 0;
              const onStage = Math.abs(slot) <= 1;
              const isWrapping = wrap?.id === i;

              return (
                <article
                  key={credential.slug}
                  role="listitem"
                  aria-hidden={!isCenter}
                  aria-current={isCenter ? "true" : undefined}
                  className="col-start-1 row-start-1 h-full w-full will-change-[transform,opacity]"
                  style={{
                    transform: onStage
                      ? `translate3d(${slot * SHIFT}%, 0, 0) scale(${
                          isCenter ? 1 : SIDE_SCALE
                        }) rotateY(${slot * -SIDE_TILT}deg)`
                      : `translate3d(${slot * SHIFT}%, 0, 0) scale(${SIDE_SCALE})`,
                    opacity: isWrapping
                      ? 0
                      : onStage
                        ? isCenter
                          ? 1
                          : SIDE_OPACITY
                        : 0,
                    zIndex: isCenter ? 30 : onStage ? 10 : 0,
                    pointerEvents: isCenter ? "auto" : onStage ? "auto" : "none",
                    transitionProperty: isWrapping
                      ? "opacity"
                      : "transform, opacity",
                    transitionDuration: `${isWrapping ? WRAP_MS : SLIDE_MS}ms`,
                    transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                  onClick={() => {
                    if (slot === 1) go(1);
                    else if (slot === -1) go(-1);
                  }}
                >
                  <CredentialCard credential={credential} active={isCenter} />
                </article>
              );
            })}
          </div>
        </div>

        {/* Dots */}
        {total > 1 && (
          <div
            className="mt-6 flex items-center justify-center gap-2"
            role="tablist"
            aria-label="Qualification slides"
          >
            {credentials.map((credential, i) => (
              <button
                key={credential.slug}
                type="button"
                role="tab"
                aria-selected={i === active}
                aria-label={`Show ${credential.name}`}
                onClick={() => {
                  if (i === active) return;
                  setActive(i);
                }}
                className={`h-1.5 transition-all duration-300 ${
                  i === active
                    ? "w-6 bg-phosphor"
                    : "w-1.5 bg-steel hover:bg-paper/40"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

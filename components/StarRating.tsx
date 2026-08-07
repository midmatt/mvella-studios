"use client";

import { useId } from "react";

/**
 * Star rating in the site's own voice — a hand-authored geometric star path
 * (sharp 5-point, outer r10 / inner r4.2), phosphor for filled and steel for
 * unfilled. Deliberately not an icon-pack glyph.
 *
 * Reused in two places: per-project reviews in the work feed, and the
 * testimonials grid. Renders nothing when there is nothing to show, so an
 * empty or absent reviews array is a no-op rather than a broken row.
 */
const STAR_PATH =
  "M12 2 L14.47 8.6 L21.51 8.91 L16 13.3 L17.88 20.09 L12 16.2 L6.12 20.09 L8.01 13.3 L2.49 8.91 L9.53 8.6 Z";

const STARS = [0, 1, 2, 3, 4];

export default function StarRating({
  rating,
  count,
  size = 14,
  className = "",
}: {
  /** 0–5; fractional values render a partially filled star. */
  rating?: number | null;
  /** Optional review count, rendered as a mono suffix. */
  count?: number;
  size?: number;
  className?: string;
}) {
  const id = useId();

  if (rating == null || Number.isNaN(rating) || rating <= 0) return null;

  const clamped = Math.min(5, Math.max(0, rating));
  const label =
    `${clamped.toFixed(1)} out of 5` +
    (count ? ` from ${count} review${count === 1 ? "" : "s"}` : "");

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span
        role="img"
        aria-label={label}
        className="flex items-center gap-[3px]"
      >
        {STARS.map((i) => {
          // Portion of this star that should read as filled (0–1).
          const fill = Math.min(1, Math.max(0, clamped - i));
          const clipId = `${id}-star-${i}`;

          return (
            <svg
              key={i}
              width={size}
              height={size}
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="shrink-0 overflow-visible"
            >
              <path d={STAR_PATH} className="fill-steel" />
              {fill > 0 && (
                <>
                  <defs>
                    <clipPath id={clipId}>
                      <rect x="0" y="0" width={24 * fill} height="24" />
                    </clipPath>
                  </defs>
                  <path
                    d={STAR_PATH}
                    className="fill-phosphor"
                    clipPath={`url(#${clipId})`}
                  />
                </>
              )}
            </svg>
          );
        })}
      </span>

      {count ? (
        <span className="mono-label text-paper/50">
          {clamped.toFixed(1)} · {count} review{count === 1 ? "" : "s"}
        </span>
      ) : null}
    </div>
  );
}

/** Average of a review list — null when there is nothing to average. */
export function averageRating(
  reviews?: ReadonlyArray<{ rating: number }>
): number | null {
  if (!reviews?.length) return null;
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return sum / reviews.length;
}

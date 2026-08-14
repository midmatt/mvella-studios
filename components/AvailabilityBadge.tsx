/**
 * Rotating circular badge for the hero portrait — the reference's
 * "AVAILABLE FOR FREELANCE" seal, in the site's phosphor voice. Text runs
 * around a circular path and slowly rotates; a static arrow sits in the
 * middle. Rotation is CSS-only and pauses under reduced-motion via the
 * `motion-safe:` variant.
 */
export default function AvailabilityBadge() {
  return (
    <div className="relative h-24 w-24 sm:h-28 sm:w-28">
      <div className="absolute inset-0 rounded-full bg-ink/80 backdrop-blur-sm" />
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 h-full w-full motion-safe:animate-[spin_14s_linear_infinite]"
        aria-hidden="true"
      >
        <defs>
          <path
            id="badge-circle"
            d="M50,50 m-37,0 a37,37 0 1,1 74,0 a37,37 0 1,1 -74,0"
          />
        </defs>
        <text className="fill-phosphor font-mono text-[10.5px] uppercase tracking-[0.14em]">
          <textPath href="#badge-circle" startOffset="0%">
            Available for freelance · Available for freelance ·
          </textPath>
        </text>
      </svg>
      {/* Static arrow at the centre */}
      <span className="absolute inset-0 flex items-center justify-center">
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-phosphor"
          aria-hidden="true"
        >
          <path d="M7 17 17 7M9 7h8v8" />
        </svg>
      </span>
      <span className="sr-only">Currently available for freelance work</span>
    </div>
  );
}

/**
 * Floating availability panel for the hero.
 *
 * A ~270px square-ish panel with 20px rounding and stacked label-above-value
 * fields (rather than the side-by-side grid the case-file readout uses).
 * The v3 traffic-light title bar is gone: the card is headed by a single
 * phosphor mono line, matching the hero eyebrow and the case-file header.
 *
 * Presentational only — Hero owns the reveal animation and decides whether
 * this renders floated (lg+) or stacked under the CTAs (below lg). When
 * floated, HeroBackground tethers nearby graph nodes to its centre; see the
 * `data-hero-anchor` attribute in Hero.tsx.
 *
 * The cursor blinks on the site's existing `cursor-blink` (1.1s) rather than
 * the v3 preview's 1s, so it stays in step with the hero eyebrow and the
 * case-file readout cursors.
 */

/** Fixed 340px — the value column is sized to fit "AVAILABLE FOR PROJECTS"
 *  on one line at 16px mono (211px of the 292px inner width). */
const CARD_WIDTH = "w-[340px]";

export default function StatusCard() {
  return (
    <div
      className={`${CARD_WIDTH} max-w-full overflow-hidden rounded-[24px] border border-steel bg-panel/90 px-6 py-[26px] shadow-[0_20px_60px_rgba(0,0,0,0.55)] backdrop-blur-[6px]`}
    >
      {/* Lower-case deliberately: the field label directly beneath is an
          upper-case STATUS, and two stacked "STATUS" lines read as a bug. */}
      <p className="mb-6 font-mono text-[14px] tracking-[0.03em] text-phosphor">
        &gt; status
      </p>

      <dl className="space-y-6 font-mono">
        <div>
          <dt className="mb-1.5 text-[12px] uppercase tracking-[0.1em] text-paper/40">
            Status
          </dt>
          <dd className="flex items-center gap-2 whitespace-nowrap text-[16px] text-phosphor">
            <span
              aria-hidden="true"
              className="h-[7px] w-[7px] shrink-0 rounded-full bg-phosphor shadow-[0_0_8px_rgba(232,163,61,0.9)] motion-safe:animate-status-pulse"
            />
            AVAILABLE FOR PROJECTS
          </dd>
        </div>

        <div>
          <dt className="mb-1.5 text-[12px] uppercase tracking-[0.1em] text-paper/40">
            Location
          </dt>
          <dd className="whitespace-nowrap text-[16px] text-paper">
            SOUTH FLORIDA, USA
          </dd>
        </div>

        <div>
          <dt className="mb-1.5 text-[12px] uppercase tracking-[0.1em] text-paper/40">
            Response
          </dt>
          <dd className="whitespace-nowrap text-[16px] text-paper">
            &lt; 24 HRS
            <span
              aria-hidden="true"
              className="ml-[2px] inline-block h-[16px] w-[8px] align-middle bg-phosphor motion-safe:animate-cursor-blink"
            />
          </dd>
        </div>
      </dl>
    </div>
  );
}

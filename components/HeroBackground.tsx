"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * Layered node-network hero background.
 *
 * ⚠️ These LAYERS values are a reconstruction, not a port —
 * hero-background-preview-v2.html was not available on disk, so the numbers
 * below are tuned by eye to the described behaviour (far/mid/near varying in
 * size, speed, and glow). Replace this block wholesale with the real config
 * from the preview file; nothing else in this component needs to change.
 *
 * Node positions are normalised 0–1 and scaled at draw time, so a resize
 * repositions the field proportionally instead of re-seeding it.
 */
interface Layer {
  name: string;
  count: number;
  speed: number; // normalised units per second
  radius: number;
  glow: number;
  alpha: number;
  parallax: number; // px of offset at full mouse deflection
  link: number; // px — max distance for a connecting line
  color: string;
  /**
   * Present only on the hub layer: seeds the nodes inside a disc instead of
   * across the whole field, and makes them bounce off its edge rather than
   * wrap, so the cluster stays coherent instead of dispersing.
   */
  hub?: { x: number; y: number; spread: number };
  /** Whether this layer's nodes can tether to the status card. */
  tether?: boolean;
}

/** Nodes within this many px of the card's centre are tether candidates. */
const TETHER_RADIUS = 180;
/** Only the closest few connect — more than this reads as a starburst. */
const TETHER_MAX = 4;

const LAYERS: Layer[] = [
  {
    name: "far",
    count: 42,
    speed: 0.004, // normalised units per second
    radius: 1.1,
    glow: 4,
    alpha: 0.3,
    parallax: 6, // px of offset at full mouse deflection
    link: 90, // px — max distance for a connecting line
    color: "#F6F5EF",
  },
  {
    name: "mid",
    count: 26,
    speed: 0.009,
    radius: 1.8,
    glow: 8,
    alpha: 0.45,
    parallax: 14,
    link: 130,
    color: "#F6F5EF",
  },
  {
    name: "near",
    count: 14,
    speed: 0.016,
    radius: 2.8,
    glow: 16,
    alpha: 0.75,
    parallax: 28,
    link: 170,
    color: "#E8A33D", // phosphor — the near layer is the only accent-lit one
    tether: true,
  },
  {
    /**
     * Focal cluster behind the hero's status card, so the right side reads as
     * a hub rather than scattered dots. Same visual family as "near" (phosphor,
     * similar radius) at ~10x the local density and more glow, but held to a
     * lower alpha — the card sits on top of it and has to stay legible.
     *
     * The centre is a compromise across widths: the card's midpoint lands near
     * 0.70 of the viewport at 1920 and 0.81 at 1024, since the container is
     * centred and capped at 72rem.
     */
    name: "hub",
    count: 14,
    speed: 0.005,
    radius: 2.6,
    glow: 24,
    alpha: 0.55,
    parallax: 22,
    link: 110,
    color: "#E8A33D",
    hub: { x: 0.75, y: 0.46, spread: 0.17 },
    tether: true,
  },
];

/**
 * Below this width the hub layer is skipped entirely. It exists to anchor the
 * floating status card, which stacks into the flow under `lg` — and on a phone
 * the fixed 110px link radius spans a third of the canvas, turning the cluster
 * into a dense web across the subhead instead of a focal point.
 * Keep in sync with the `lg:` breakpoint the card floats at in Hero.tsx.
 */
const HUB_MIN_WIDTH = 1024;

interface Node {
  x: number; // 0–1
  y: number; // 0–1
  vx: number;
  vy: number;
}

function seedLayer(layer: Layer): Node[] {
  return Array.from({ length: layer.count }, () => {
    const angle = Math.random() * Math.PI * 2;
    const vx = Math.cos(angle) * layer.speed;
    const vy = Math.sin(angle) * layer.speed;

    if (layer.hub) {
      // sqrt keeps the distribution even across the disc's area — without it
      // the nodes bunch toward the centre and the cluster loses its shape.
      const r = Math.sqrt(Math.random()) * layer.hub.spread;
      const a = Math.random() * Math.PI * 2;
      return {
        x: layer.hub.x + Math.cos(a) * r,
        y: layer.hub.y + Math.sin(a) * r,
        vx,
        vy,
      };
    }

    return { x: Math.random(), y: Math.random(), vx, vy };
  });
}

export default function HeroBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const layers = LAYERS.map(seedLayer);

    let width = 0;
    let height = 0;
    let frame = 0;
    let last = 0;

    // Target vs. current offset — the current value eases toward the target
    // so the parallax lags the cursor slightly instead of snapping.
    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };

    // Card centre in canvas space. Measured from the DOM rather than derived
    // from the layout maths, so it survives changes to the card's width or
    // the container's max-width. Inactive when the card isn't floated.
    const anchor = { x: 0, y: 0, active: false };

    const measureAnchor = () => {
      const el = document.querySelector<HTMLElement>("[data-hero-anchor]");
      if (!el) {
        anchor.active = false;
        return;
      }
      const rect = el.getBoundingClientRect();
      // Zero-sized below lg, where the element is display:none.
      if (rect.width === 0 || rect.height === 0) {
        anchor.active = false;
        return;
      }
      const canvasRect = canvas.getBoundingClientRect();
      anchor.x = rect.left + rect.width / 2 - canvasRect.left;
      anchor.y = rect.top + rect.height / 2 - canvasRect.top;
      anchor.active = true;
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      measureAnchor();

      // Radial gradient background — a faint lift behind the headline,
      // falling off to flat ink at the edges.
      const gradient = ctx.createRadialGradient(
        width * 0.5,
        height * 0.42,
        0,
        width * 0.5,
        height * 0.42,
        Math.max(width, height) * 0.75
      );
      gradient.addColorStop(0, "#17170F");
      gradient.addColorStop(0.55, "#101010");
      gradient.addColorStop(1, "#0B0B0A");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      LAYERS.forEach((layer, li) => {
        if (layer.hub && width < HUB_MIN_WIDTH) return;

        const nodes = layers[li];
        const ox = current.x * layer.parallax;
        const oy = current.y * layer.parallax;

        // Pixel positions once per layer, reused for links and nodes.
        const pts = nodes.map((n) => ({
          x: n.x * width + ox,
          y: n.y * height + oy,
        }));

        // Links first, unglowed, so nodes sit on top of the web.
        ctx.shadowBlur = 0;
        ctx.lineWidth = 1;
        for (let i = 0; i < pts.length; i++) {
          for (let j = i + 1; j < pts.length; j++) {
            const dx = pts[i].x - pts[j].x;
            const dy = pts[i].y - pts[j].y;
            const dist = Math.hypot(dx, dy);
            if (dist > layer.link) continue;
            const strength = (1 - dist / layer.link) * layer.alpha * 0.28;
            ctx.strokeStyle = layer.color;
            ctx.globalAlpha = strength;
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.stroke();
          }
        }

        ctx.shadowBlur = layer.glow;
        ctx.shadowColor = layer.color;
        ctx.fillStyle = layer.color;
        ctx.globalAlpha = layer.alpha;
        for (const p of pts) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, layer.radius, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      drawTethers();

      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
    };

    /**
     * Ties the status card into the graph: the closest few phosphor nodes run
     * a faint line to the card's centre, so it reads as a node in the network
     * rather than a panel sitting on top of it. The segment that crosses the
     * card is hidden behind its own background, so the lines appear to
     * terminate at the card's edges.
     */
    const drawTethers = () => {
      if (!anchor.active) return;

      const candidates: Array<{ x: number; y: number; dist: number }> = [];

      LAYERS.forEach((layer, li) => {
        if (!layer.tether) return;
        if (layer.hub && width < HUB_MIN_WIDTH) return;

        const ox = current.x * layer.parallax;
        const oy = current.y * layer.parallax;

        for (const n of layers[li]) {
          const x = n.x * width + ox;
          const y = n.y * height + oy;
          const dist = Math.hypot(x - anchor.x, y - anchor.y);
          if (dist <= TETHER_RADIUS) candidates.push({ x, y, dist });
        }
      });

      candidates.sort((a, b) => a.dist - b.dist);

      ctx.shadowBlur = 0;
      ctx.lineWidth = 1;
      ctx.strokeStyle = "#E8A33D";

      for (const c of candidates.slice(0, TETHER_MAX)) {
        // Fades out toward the radius so nodes drifting past the threshold
        // dissolve instead of popping off.
        ctx.globalAlpha = (1 - c.dist / TETHER_RADIUS) * 0.3;
        ctx.beginPath();
        ctx.moveTo(c.x, c.y);
        ctx.lineTo(anchor.x, anchor.y);
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
    };

    const step = (now: number) => {
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
      last = now;

      current.x += (target.x - current.x) * 0.05;
      current.y += (target.y - current.y) * 0.05;

      LAYERS.forEach((layer, li) => {
        const hub = layer.hub;
        if (hub && width < HUB_MIN_WIDTH) return;

        for (const n of layers[li]) {
          n.x += n.vx * dt;
          n.y += n.vy * dt;

          if (hub) {
            // Reflect off the disc's edge along the radial normal. A plain
            // velocity flip would send nodes back down their own path, which
            // reads mechanical; reflecting keeps the drift organic.
            const dx = n.x - hub.x;
            const dy = n.y - hub.y;
            const dist = Math.hypot(dx, dy);
            if (dist > hub.spread) {
              const nx = dx / dist;
              const ny = dy / dist;
              const dot = n.vx * nx + n.vy * ny;
              n.vx -= 2 * dot * nx;
              n.vy -= 2 * dot * ny;
              n.x = hub.x + nx * hub.spread;
              n.y = hub.y + ny * hub.spread;
            }
            continue;
          }

          // Wrap rather than bounce — keeps the field from clumping at edges.
          if (n.x < -0.05) n.x = 1.05;
          if (n.x > 1.05) n.x = -0.05;
          if (n.y < -0.05) n.y = 1.05;
          if (n.y > 1.05) n.y = -0.05;
        }
      });

      draw();
      frame = requestAnimationFrame(step);
    };

    const onMouseMove = (e: MouseEvent) => {
      // -1..1 from viewport centre.
      target.x = (e.clientX / window.innerWidth) * 2 - 1;
      target.y = (e.clientY / window.innerHeight) * 2 - 1;
    };

    resize();
    window.addEventListener("resize", resize);

    if (reduceMotion) {
      // Frozen: one static frame, parallax pinned to 0,0, no listener, no RAF.
      draw();
    } else {
      window.addEventListener("mousemove", onMouseMove);
      frame = requestAnimationFrame(step);
    }

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, [reduceMotion]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}

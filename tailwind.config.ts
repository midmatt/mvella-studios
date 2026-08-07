import type { Config } from "tailwindcss";

/**
 * Design tokens from MVELLA-STUDIOS-SITE-SPEC.md §1.
 * Colors are sampled from the wordmark — black/cream with exactly one
 * warm accent (`phosphor`). Do not add a second accent color.
 */
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0B0B0A", // page background
        panel: {
          DEFAULT: "#171715", // card/section surfaces
          raised: "#1F1F1C", // hovered/elevated surfaces
        },
        steel: "#3D3B3A", // borders, dividers, muted text
        paper: "#F6F5EF", // primary text
        phosphor: "#E8A33D", // the one accent — CTAs, active states, status dots
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        // Scale from spec §1: hero 72–96px / h2 40px / h3 24px / body 17px / mono label 13px
        display: ["clamp(3rem, 7.5vw, 6rem)", { lineHeight: "1.02", letterSpacing: "-0.02em", fontWeight: "700" }],
        h2: ["2.5rem", { lineHeight: "1.1", letterSpacing: "-0.01em", fontWeight: "600" }],
        h3: ["1.5rem", { lineHeight: "1.25", fontWeight: "600" }],
        body: ["1.0625rem", { lineHeight: "1.65" }],
        label: ["0.8125rem", { lineHeight: "1.5", letterSpacing: "0.1em" }],
      },
      keyframes: {
        "cursor-blink": {
          "0%, 49%": { opacity: "1" },
          "50%, 100%": { opacity: "0" },
        },
        // Availability dot — a slow breath, not a blink. Deliberately eased
        // and never fully off, so it reads as "live" without flashing.
        "status-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.35" },
        },
      },
      animation: {
        "cursor-blink": "cursor-blink 1.1s step-end infinite",
        "status-pulse": "status-pulse 1.8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;

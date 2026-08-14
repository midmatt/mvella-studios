import { Inter, JetBrains_Mono } from "next/font/google";
import localFont from "next/font/local";

/**
 * Display: General Sans (spec §1). Not on Google Fonts — self-hosted from
 * Fontshare (ITF Free Font License). Bold/semibold weights only, per spec.
 */
export const displayFont = localFont({
  src: [
    { path: "./fonts/GeneralSans-Semibold.woff2", weight: "600", style: "normal" },
    { path: "./fonts/GeneralSans-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-display",
  // Headline is the lab LCP element (portrait often loses to HTML text on
  // mobile). Don't preload or swap this face on the critical path — optional
  // + no preload lets the h1 paint at FCP instead of waiting ~2s for woff2.
  display: "optional",
  preload: false,
});

export const bodyFont = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const monoFont = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

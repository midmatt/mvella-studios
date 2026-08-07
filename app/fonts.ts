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
  display: "swap",
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

/**
 * Client-facing About content. Recruiters go to /hiring — nothing internship-
 * or resume-shaped belongs here.
 */
export interface Profile {
  name: string;
  location: string;
  email: string;
  bio: string[];
  photo: string;
  /** Short mono readout for the About system panel. */
  background: string[];
  builds: string[];
  approach: string[];
  linkedinUrl?: string;
  githubUrl?: string;
}

export const profile: Profile = {
  name: "Matthew Vella",
  location: "Miami, FL",
  email: "Matthew@mvella.com",

  bio: [
    "I'm the founder of MVella Studios — a one-person practice that designs, builds, and ships web and mobile products for small businesses. I've also built my own apps that are live on the Apple App Store, so the same hands that write your site are the ones that have taken software through production, payments, and the App Store.",
    "I came up through cybersecurity — FIU Honors College, a technical degree from McFatter, and competition work hardening real systems. That background shows up in how client work gets built: auth, payments, and data access are designed in from the start, not patched on after launch.",
    "If you need a marketing site, a storefront, or a mobile app that actually ships and stays maintained, you're in the right place.",
  ],

  photo: "/about/matthew.jpg",

  background: [
    "FIU Honors College — Cybersecurity, AI minor",
    "McFatter Technical College — Applied Cybersecurity",
    "Based in Miami, FL · working with clients nationwide",
  ],

  builds: [
    "Marketing sites & storefronts — Next.js, TypeScript",
    "Mobile apps — React Native, Expo, App Store",
    "Payments, email, and production infrastructure",
  ],

  approach: [
    "Security-minded architecture from day one",
    "You work directly with the developer",
    "Shipped, monitored, and maintained — not handed off",
  ],

  linkedinUrl: "https://www.linkedin.com/in/matthew-vella-234189326/",
  githubUrl: "https://github.com/midmatt",
};

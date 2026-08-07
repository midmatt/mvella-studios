/**
 * Single source of truth for About-section content (spec §4).
 *
 * Draft copy — the bio is written from the facts in the spec, not dictated by
 * Matthew, so it should be tuned to his voice before launch the same way the
 * hero headline is.
 */
export interface Profile {
  name: string;
  bio: string[]; // one string per paragraph
  photo: string;
  education: string[];
  certifications: string[];
  focus: string[];
  resumeUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
}

export const profile: Profile = {
  name: "Matthew Vella",

  bio: [
    "I'm a cybersecurity student at FIU's Honors College with a prior technical degree, and I've been building software the whole way through. Three of my own apps are shipped and live, and I freelance for small businesses across South Florida — marketing sites, storefronts, and iOS apps.",
    "Most developers treat security as something you add at the end. I don't. Every project starts with the same questions I'd ask if I were the one attacking it: what's exposed, what's trusted, and what happens when something fails. I build software the way I'd want it secured.",
  ],

  photo: "/about/matthew.jpg",

  education: [
    "B.S. Cybersecurity — Florida International University, Honors College",
    "REPLACE — prior technical degree (confirm exact title and institution)",
  ],

  // Left empty deliberately — see the note in components/About.tsx.
  certifications: [],

  focus: [
    "Web development — Next.js, TypeScript",
    "iOS & mobile — React Native, Expo, Swift",
    "Security-minded architecture",
  ],

  // Both assets are absent from /public right now; the About section hides
  // the corresponding control rather than linking a 404. Drop the files in
  // and the links appear on the next build — no code change needed.
  resumeUrl: "/resume.pdf",
  linkedinUrl: "https://www.linkedin.com/in/matthew-vella-234189326/",
  githubUrl: "https://github.com/midmatt",
};

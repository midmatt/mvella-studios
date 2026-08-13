/**
 * Field qualifications shown as logo cards (About + homepage).
 *
 * Append here as Matthew picks up more — CompTIA, etc. Each entry needs a
 * logo under /public/credentials and a short caption. Leave `href` undefined
 * when there's no public page worth linking.
 */
export interface Credential {
  slug: string;
  name: string;
  /** One-line achievement, shown under the logo. */
  caption: string;
  logo: string;
  /** Intrinsic logo size — drives next/image width/height for layout. */
  width: number;
  height: number;
  href?: string;
}

export const credentials: Credential[] = [
  {
    slug: "fiu-cybersecurity",
    name: "Florida International University",
    caption:
      "Honors College — B.S. Cybersecurity, minor in Artificial Intelligence (in progress)",
    logo: "/credentials/fiu.png",
    width: 800,
    height: 373,
    href: "https://www.fiu.edu/",
  },
  {
    slug: "mcfatter-cybersecurity",
    name: "McFatter Technical College",
    caption: "Graduated — Cybersecurity",
    logo: "/credentials/mcfatter.png",
    width: 289,
    height: 101,
    href: "https://www.mcfattertechnicalcollege.edu/",
  },
  {
    slug: "cyberpatriot-platinum",
    name: "CyberPatriot",
    caption: "National Youth Cyber Defense Competition — Platinum tier, Linux Team Lead",
    logo: "/credentials/cyberpatriot.png",
    width: 276,
    height: 276,
    href: "https://www.uscyberpatriot.org/",
  },
  {
    slug: "silver-knight-vocational",
    name: "Silver Knight Awards",
    caption: "Nominee — Vocational-Technical (Miami Herald)",
    logo: "/credentials/silver-knight.png",
    width: 1024,
    height: 1024,
    href: "https://www.miamiherald.com/site-services/miami-herald-events/silver-knight/",
  },
];

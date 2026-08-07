import type { Metadata } from "next";
import WorkFeed from "@/components/WorkFeed";

export const metadata: Metadata = {
  title: "Work — MVella Studios",
  description:
    "Shipped products and client work: iOS apps on the App Store, and Next.js sites and storefronts for South Florida businesses.",
};

/**
 * The full work feed, relocated from the homepage. WorkFeed itself is
 * unchanged — same case-file treatment, same source of truth in
 * lib/projects.ts. The homepage now shows FeaturedWork instead and links here.
 */
export default function WorkPage() {
  /* pt-16 clears the fixed 4rem nav, matching /about */
  return (
    <div className="pt-16">
      <WorkFeed />
    </div>
  );
}

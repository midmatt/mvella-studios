import type { Metadata } from "next";
import WorkFeed from "@/components/WorkFeed";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Work — MVella Studios",
  description:
    "Shipped mobile apps on the App Store plus Next.js marketing sites and storefronts for South Florida businesses — MVella Studios work.",
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
      <div className="mx-auto max-w-6xl px-6 pt-10">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Work" },
          ]}
        />
      </div>
      <WorkFeed />
    </div>
  );
}

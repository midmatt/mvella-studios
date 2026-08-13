import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import HiringPacket from "@/components/HiringPacket";

export const metadata: Metadata = {
  title: "Hiring — MVella Studios",
  description:
    "Summer 2027 Software Engineering and Security Engineering internship materials for Matthew Vella — resumes, projects, and contact.",
  robots: {
    // Indexable so recruiters can find it, but it's not a primary marketing page.
    index: true,
    follow: true,
  },
};

export default function HiringPage() {
  return (
    <div className="pt-16">
      <div className="mx-auto max-w-6xl px-6 pt-10">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Hiring" },
          ]}
        />
      </div>
      <HiringPacket />
    </div>
  );
}

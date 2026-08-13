import Hero from "@/components/Hero";
import StatsBar from "@/components/StatsBar";
import Credentials from "@/components/Credentials";
import FeaturedWork from "@/components/FeaturedWork";
import ServicesTeaser from "@/components/ServicesTeaser";
import Testimonials from "@/components/Testimonials";
import HiringTeaser from "@/components/HiringTeaser";
import ClosingCta from "@/components/ClosingCta";

/**
 * Condensed homepage. Qualifications skim above Featured Work. A hiring
 * teaser sits near the bottom for recruiters; ClosingCta keeps the primary
 * client CTA last.
 */
export default function Home() {
  return (
    <>
      <Hero />
      <StatsBar />
      <Credentials />
      <FeaturedWork />
      <ServicesTeaser />
      <Testimonials />
      <HiringTeaser />
      <ClosingCta />
    </>
  );
}

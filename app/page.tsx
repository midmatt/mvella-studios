import Hero from "@/components/Hero";
import StatsBar from "@/components/StatsBar";
import Credentials from "@/components/Credentials";
import FeaturedWork from "@/components/FeaturedWork";
import ServicesTeaser from "@/components/ServicesTeaser";
import Testimonials from "@/components/Testimonials";
import ClosingCta from "@/components/ClosingCta";

/**
 * Condensed homepage. Qualifications sit under the stats bar as a skim
 * carousel — logos first, detail on click — before Featured Work so the
 * credentials frame the work rather than trailing it.
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
      <ClosingCta />
    </>
  );
}

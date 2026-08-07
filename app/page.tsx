import Hero from "@/components/Hero";
import StatsBar from "@/components/StatsBar";
import FeaturedWork from "@/components/FeaturedWork";
import ServicesTeaser from "@/components/ServicesTeaser";
import Testimonials from "@/components/Testimonials";
import ClosingCta from "@/components/ClosingCta";

/**
 * Condensed homepage. The full Work feed moved to /work, Services to
 * /services, and the contact form to /contact; what's left here is the
 * lighter teaser version of each, every one ending in a link to its page.
 *
 * Testimonials moved below the work and services blocks (it used to sit
 * directly under the stats bar) — social proof reads better after there's
 * something to be proof of. Hero, StatsBar, and Testimonials are otherwise
 * untouched.
 */
export default function Home() {
  return (
    <>
      <Hero />
      <StatsBar />
      <FeaturedWork />
      <ServicesTeaser />
      <Testimonials />
      <ClosingCta />
    </>
  );
}

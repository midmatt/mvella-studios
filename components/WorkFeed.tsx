import { projects } from "@/lib/projects";
import ProjectBlock from "./ProjectBlock";

/**
 * The work feed (spec §4) — loops lib/projects.ts, the single source of
 * truth. Appending a project there adds a block here automatically.
 *
 * Renders an h1: this now owns the /work page rather than being one section
 * of the homepage, and the page had no top-level heading otherwise. The
 * homepage's lighter grid is FeaturedWork, which keeps its h2.
 */
export default function WorkFeed() {
  return (
    <section id="work" aria-label="Selected work">
      <div className="mx-auto max-w-6xl px-6 pb-16 pt-8 md:pt-12">
        <p className="mono-label text-phosphor">&gt; ls ./work</p>
        <h1 className="mt-4 font-display text-h2 text-paper">Selected work</h1>
      </div>

      {projects.map((project, index) => (
        <ProjectBlock key={project.slug} project={project} index={index} />
      ))}
    </section>
  );
}

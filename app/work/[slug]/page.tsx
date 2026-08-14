import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import ProjectAbout from "@/components/ProjectAbout";
import { getProject, projects } from "@/lib/projects";

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return { title: "Work — MVella Studios" };

  return {
    title: `${project.name} — MVella Studios`,
    description: project.about,
    openGraph: {
      title: `${project.name} — MVella Studios`,
      description: project.about,
      images: [project.heroImage],
    },
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const index = projects.findIndex((p) => p.slug === slug);

  return (
    <div className="pt-16">
      <div className="mx-auto max-w-6xl px-6 pt-10">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Work", href: "/work" },
            { label: project.name },
          ]}
        />
      </div>
      <ProjectAbout project={project} index={index} />
    </div>
  );
}

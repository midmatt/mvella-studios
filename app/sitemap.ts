import type { MetadataRoute } from "next";
import { projects } from "@/lib/projects";
import { SITE_ORIGIN } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const routes: MetadataRoute.Sitemap = [
    "",
    "/work",
    "/services",
    "/about",
    "/hiring",
    "/contact",
    "/support",
    "/feedback",
    "/legal",
    "/terms",
  ].map((path) => ({
    url: `${SITE_ORIGIN}${path}`,
    lastModified,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority:
      path === "" ? 1 : path === "/contact" || path === "/services" ? 0.9 : 0.7,
  }));

  const workPages: MetadataRoute.Sitemap = projects.map((project) => ({
    url: `${SITE_ORIGIN}/work/${project.slug}`,
    lastModified,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...routes, ...workPages];
}

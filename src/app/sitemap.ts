import type { MetadataRoute } from "next";

import { getPublicArticleSitemapEntries } from "@/features/articles/queries";
import { getPublicNoteSitemapEntries } from "@/features/notes/queries";
import { getPublicProjectSitemapEntries } from "@/features/projects/queries";
import { absoluteSiteUrl, isSiteIndexable } from "@/lib/site-url";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!isSiteIndexable()) return [];

  const [projects, articles, notes] = await Promise.all([
    getPublicProjectSitemapEntries(),
    getPublicArticleSitemapEntries(),
    getPublicNoteSitemapEntries(),
  ]);
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: absoluteSiteUrl("/"), changeFrequency: "monthly", priority: 1 },
    {
      url: absoluteSiteUrl("/projects"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: absoluteSiteUrl("/articles"),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: absoluteSiteUrl("/notes"),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: absoluteSiteUrl("/learning"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  return [
    ...staticRoutes,
    ...projects.map((project) => ({
      url: absoluteSiteUrl(`/projects/${project.slug}`),
      lastModified: project.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...articles.map((article) => ({
      url: absoluteSiteUrl(`/articles/${article.slug}`),
      lastModified: article.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...notes.map((note) => ({
      url: absoluteSiteUrl(`/notes/${note.slug}`),
      lastModified: note.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}

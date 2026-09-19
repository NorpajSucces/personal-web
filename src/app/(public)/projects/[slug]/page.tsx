import type { Metadata } from "next";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { cache } from "react";

import { ProjectDetail } from "@/features/projects/project-detail";
import { getPublicProjectBySlug } from "@/features/projects/queries";
import { createNotFoundMetadata, createPublicMetadata } from "@/lib/seo";

const getProject = cache(getPublicProjectBySlug);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) return createNotFoundMetadata();

  return createPublicMetadata({
    title: project.name,
    description: project.description,
    path: `/projects/${project.slug}`,
    updatedAt: project.updatedAt,
  });
}

export default async function PublicProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await connection();
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();
  return <ProjectDetail project={project} />;
}

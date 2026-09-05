import { connection } from "next/server";
import { notFound } from "next/navigation";

import { ProjectDetail } from "@/features/projects/project-detail";
import { getPublicProjectBySlug } from "@/features/projects/queries";

export default async function PublicProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await connection();
  const { slug } = await params;
  const project = await getPublicProjectBySlug(slug);
  if (!project) notFound();
  return <ProjectDetail project={project} />;
}

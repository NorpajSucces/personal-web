import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProjectDetail } from "@/features/projects/project-detail";
import { getAdminProjectById } from "@/features/projects/queries";
import { projectIdSchema } from "@/features/projects/schema";
import { requireAdmin } from "@/lib/auth/admin";

export const metadata: Metadata = { title: "Project Preview" };

export default async function ProjectPreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const idResult = projectIdSchema.safeParse(id);
  if (!idResult.success) notFound();
  const project = await getAdminProjectById(idResult.data);
  if (!project) notFound();
  return <ProjectDetail project={project} preview />;
}

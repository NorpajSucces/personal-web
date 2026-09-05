import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { updateProject } from "@/features/projects/actions";
import { ProjectForm } from "@/features/projects/project-form";
import { getAdminProjectById } from "@/features/projects/queries";
import { projectIdSchema } from "@/features/projects/schema";
import { requireAdmin } from "@/lib/auth/admin";

export const metadata: Metadata = { title: "Edit Project" };

export default async function EditProjectPage({
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
  const action = updateProject.bind(null, project.id);

  return (
    <>
      <h1 className="font-serif text-4xl tracking-tight">Edit project</h1>
      <p className="mt-3 mb-8 max-w-prose text-muted-foreground">
        Changing the name does not alter the slug. Edit the slug deliberately
        when the public URL should change.
      </p>
      <ProjectForm
        action={action}
        mode="edit"
        hasScreenshot={Boolean(project.screenshotPath)}
        hasCaseStudy={Boolean(project.caseStudy)}
        initialValues={{
          name: project.name,
          slug: project.slug,
          description: project.description,
          technologies: project.technologies.join("\n"),
          projectStatus: project.projectStatus,
          publicationStatus: project.publicationStatus,
          visibility: project.visibility,
          githubUrl: project.githubUrl ?? "",
          liveDemoUrl: project.liveDemoUrl ?? "",
        }}
      />
    </>
  );
}

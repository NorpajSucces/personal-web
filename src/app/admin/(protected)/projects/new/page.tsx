import type { Metadata } from "next";

import { createProject } from "@/features/projects/actions";
import {
  newProjectValues,
  ProjectForm,
} from "@/features/projects/project-form";
import { requireAdmin } from "@/lib/auth/admin";

export const metadata: Metadata = { title: "New Project" };

export default async function NewProjectPage() {
  await requireAdmin();
  return (
    <>
      <h1 className="font-serif text-4xl tracking-tight">New project</h1>
      <p className="mt-3 mb-8 max-w-prose text-muted-foreground">
        New Projects start as private drafts. You can preview and publish them
        after creation.
      </p>
      <ProjectForm
        action={createProject}
        initialValues={newProjectValues}
        mode="create"
      />
    </>
  );
}

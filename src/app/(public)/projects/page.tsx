import type { Metadata } from "next";
import { connection } from "next/server";

import { Container } from "@/components/shared/container";
import { PageIntro } from "@/components/shared/page-intro";
import { ProjectGrid } from "@/features/projects/project-card";
import { getPublicProjects } from "@/features/projects/queries";

export const metadata: Metadata = {
  title: "Projects",
};

export default async function ProjectsPage() {
  await connection();
  const projects = await getPublicProjects();
  return (
    <>
      <PageIntro
        title="Projects"
        description="Selected work, experiments, and engineering case studies."
      />
      <Container className="pb-[var(--section-space)]">
        {projects.length ? (
          <ProjectGrid projects={projects} />
        ) : (
          <div className="rounded-lg border bg-card p-6 sm:p-7">
            <h2 className="font-serif text-2xl">No public projects yet</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Published work will appear here as the collection grows.
            </p>
          </div>
        )}
      </Container>
    </>
  );
}

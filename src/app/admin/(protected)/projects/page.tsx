import type { Metadata } from "next";
import Link from "next/link";

import { DeleteProjectButton } from "@/features/projects/delete-project-button";
import { getAdminProjects } from "@/features/projects/queries";
import { requireAdmin } from "@/lib/auth/admin";

export const metadata: Metadata = { title: "Projects" };

export default async function Page() {
  await requireAdmin();
  const projects = await getAdminProjects();

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <h1 className="font-serif text-4xl tracking-tight">Projects</h1>
          <p className="mt-3 max-w-prose text-muted-foreground">
            Manage proof of work, publication state, and public Project pages.
          </p>
        </div>
        <Link
          href="/admin/projects/new"
          className="inline-flex min-h-11 items-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          New project
        </Link>
      </div>

      {projects.length ? (
        <div className="mt-8 space-y-4">
          {projects.map((project) => {
            const isPublic =
              project.publicationStatus === "published" &&
              project.visibility === "public";
            return (
              <article
                key={project.id}
                className="min-w-0 rounded-lg border bg-card p-5 sm:p-6"
              >
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <h2 className="font-serif text-2xl wrap-anywhere">
                      {project.name}
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground wrap-anywhere">
                      /{project.slug}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2 text-xs">
                      <span className="rounded-full border px-2.5 py-1">
                        {project.projectStatus === "completed"
                          ? "Completed"
                          : "In progress"}
                      </span>
                      <span className="rounded-full border px-2.5 py-1 capitalize">
                        {project.publicationStatus}
                      </span>
                      <span className="rounded-full border px-2.5 py-1 capitalize">
                        {project.visibility}
                      </span>
                    </div>
                    <p className="mt-4 text-xs text-muted-foreground">
                      Updated{" "}
                      {project.updatedAt.toLocaleDateString("en", {
                        dateStyle: "medium",
                      })}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-1">
                    <Link
                      href={`/admin/projects/${project.id}/edit`}
                      className="inline-flex min-h-10 items-center rounded-md px-3 text-sm text-primary hover:bg-accent"
                    >
                      Edit
                    </Link>
                    <Link
                      href={`/admin/projects/${project.id}/preview`}
                      className="inline-flex min-h-10 items-center rounded-md px-3 text-sm text-primary hover:bg-accent"
                    >
                      Preview
                    </Link>
                    {isPublic ? (
                      <Link
                        href={`/projects/${project.slug}`}
                        className="inline-flex min-h-10 items-center rounded-md px-3 text-sm text-primary hover:bg-accent"
                      >
                        View
                      </Link>
                    ) : null}
                    <DeleteProjectButton id={project.id} name={project.name} />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <section
          aria-labelledby="empty-projects-title"
          className="mt-8 rounded-lg border bg-card p-6"
        >
          <h2 id="empty-projects-title" className="font-serif text-2xl">
            No projects yet
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Create your first Project as a private draft, then preview it before
            publishing.
          </p>
          <Link
            href="/admin/projects/new"
            className="mt-5 inline-flex min-h-11 items-center rounded-md border px-4 text-sm font-medium text-primary hover:bg-accent"
          >
            Create project
          </Link>
        </section>
      )}
    </>
  );
}

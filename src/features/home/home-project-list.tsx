import Link from "next/link";

import { projectStatusLabel } from "@/features/projects/project-card";
import type { ProjectSummary } from "@/features/projects/types";

export function HomeProjectList({ projects }: { projects: ProjectSummary[] }) {
  return (
    <div className="border-y">
      {projects.map((project) => (
        <article key={project.id} className="border-b py-7 last:border-b-0">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h3 className="font-serif text-2xl leading-tight wrap-anywhere">
              <Link
                href={`/projects/${project.slug}`}
                className="hover:text-primary"
              >
                {project.name}
              </Link>
            </h3>
            <span className="text-xs text-muted-foreground">
              {projectStatusLabel(project.projectStatus)}
            </span>
          </div>
          <p className="mt-3 whitespace-pre-line text-sm leading-6 wrap-anywhere text-muted-foreground">
            {project.description}
          </p>
          {project.technologies.length ? (
            <p className="mt-4 text-xs leading-6 text-muted-foreground">
              {project.technologies.join(" · ")}
            </p>
          ) : null}
          <Link
            href={`/projects/${project.slug}`}
            className="mt-4 inline-flex min-h-10 items-center text-sm font-medium text-primary hover:underline"
          >
            View project →
          </Link>
        </article>
      ))}
    </div>
  );
}

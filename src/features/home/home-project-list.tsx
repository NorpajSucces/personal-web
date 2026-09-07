import Link from "next/link";

import { projectStatusLabel } from "@/features/projects/project-card";
import type { ProjectSummary } from "@/features/projects/types";

export function HomeProjectList({ projects }: { projects: ProjectSummary[] }) {
  return (
    <div className="border-y">
      {projects.map((project, index) => (
        <article
          key={project.id}
          className="grid grid-cols-[2rem_minmax(0,1fr)] gap-x-3 border-b py-7 last:border-b-0 sm:grid-cols-[2.5rem_minmax(0,1fr)] sm:gap-x-4"
        >
          <p
            aria-hidden="true"
            className="pt-1 font-mono text-[0.6875rem] tracking-[0.12em] text-muted-foreground"
          >
            {String(index + 1).padStart(2, "0")}
          </p>
          <div className="min-w-0">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h3 className="font-serif text-2xl leading-tight wrap-anywhere">
                <Link
                  href={`/projects/${project.slug}`}
                  className="rounded-sm transition-colors hover:text-primary motion-reduce:transition-none"
                >
                  {project.name}
                </Link>
              </h3>
              <span className="font-mono text-[0.6875rem] tracking-[0.08em] text-muted-foreground uppercase">
                {projectStatusLabel(project.projectStatus)}
              </span>
            </div>
            <p className="mt-3 whitespace-pre-line text-sm leading-6 wrap-anywhere text-muted-foreground">
              {project.description}
            </p>
            {project.technologies.length ? (
              <p className="mt-4 font-mono text-[0.6875rem] leading-6 wrap-anywhere text-muted-foreground">
                {project.technologies.join(" / ")}
              </p>
            ) : null}
            <Link
              href={`/projects/${project.slug}`}
              className="group mt-4 inline-flex min-h-10 items-center gap-2 rounded-sm font-mono text-xs font-medium tracking-[0.06em] text-primary uppercase hover:text-foreground"
            >
              View project
              <span
                aria-hidden="true"
                className="transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
              >
                →
              </span>
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}

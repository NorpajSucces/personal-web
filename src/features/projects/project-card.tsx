import Link from "next/link";

import { SurfaceCard } from "@/components/shared/surface-card";

import type { ProjectSummary } from "./types";

export function projectStatusLabel(status: ProjectSummary["projectStatus"]) {
  return status === "completed" ? "Completed" : "In progress";
}

function ExternalLink({ href, children }: { href: string; children: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="rounded-sm text-sm font-medium text-primary underline-offset-4 hover:underline"
    >
      {children} <span aria-hidden="true">↗</span>
    </a>
  );
}

export function ProjectCard({ project }: { project: ProjectSummary }) {
  return (
    <SurfaceCard className="flex h-full min-w-0 flex-col">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h2 className="font-serif text-2xl leading-tight wrap-anywhere">
          <Link
            href={`/projects/${project.slug}`}
            className="rounded-sm hover:text-primary"
          >
            {project.name}
          </Link>
        </h2>
        <span className="rounded-full border px-2.5 py-1 text-xs text-muted-foreground">
          {projectStatusLabel(project.projectStatus)}
        </span>
      </div>
      <p className="mt-4 whitespace-pre-line text-sm leading-6 wrap-anywhere text-muted-foreground">
        {project.description}
      </p>
      {project.technologies.length ? (
        <ul aria-label="Technologies" className="mt-5 flex flex-wrap gap-2">
          {project.technologies.map((technology) => (
            <li
              key={technology}
              className="max-w-full rounded-full bg-muted px-2.5 py-1 text-xs wrap-anywhere"
            >
              {technology}
            </li>
          ))}
        </ul>
      ) : null}
      <div className="mt-auto flex flex-wrap gap-x-5 gap-y-2 pt-6">
        <Link
          href={`/projects/${project.slug}`}
          className="rounded-sm text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          View project →
        </Link>
        {project.githubUrl ? (
          <ExternalLink href={project.githubUrl}>GitHub</ExternalLink>
        ) : null}
        {project.liveDemoUrl ? (
          <ExternalLink href={project.liveDemoUrl}>Live demo</ExternalLink>
        ) : null}
      </div>
    </SurfaceCard>
  );
}

export function ProjectGrid({ projects }: { projects: ProjectSummary[] }) {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}

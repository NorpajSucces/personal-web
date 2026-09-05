import Link from "next/link";

import { Container } from "@/components/shared/container";

import { parseCaseStudy } from "./case-study";
import { projectStatusLabel } from "./project-card";
import type { Project } from "./types";

export function ProjectDetail({
  project,
  preview = false,
}: {
  project: Project;
  preview?: boolean;
}) {
  const blocks = parseCaseStudy(project.caseStudy);
  return (
    <Container>
      <article className="mx-auto max-w-[var(--container-reading)] py-[clamp(4rem,10vw,8rem)]">
        {preview ? (
          <p className="mb-5 rounded-md border border-primary/40 bg-accent px-4 py-3 text-sm text-accent-foreground">
            Admin preview · {project.publicationStatus} · {project.visibility}
          </p>
        ) : null}
        <Link
          href={preview ? "/admin/projects" : "/projects"}
          className="inline-flex min-h-10 items-center rounded-sm text-sm text-primary hover:underline"
        >
          ← {preview ? "Back to Projects admin" : "All projects"}
        </Link>
        <p className="mt-7 text-xs font-semibold tracking-[0.18em] text-primary uppercase">
          {projectStatusLabel(project.projectStatus)}
        </p>
        <h1 className="mt-4 font-serif text-[clamp(3rem,8vw,5.5rem)] leading-[0.95] font-medium tracking-[-0.04em] wrap-anywhere text-balance">
          {project.name}
        </h1>
        <p className="mt-7 whitespace-pre-line text-lg leading-8 wrap-anywhere text-muted-foreground">
          {project.description}
        </p>
        {project.technologies.length ? (
          <ul aria-label="Technologies" className="mt-7 flex flex-wrap gap-2">
            {project.technologies.map((technology) => (
              <li
                key={technology}
                className="max-w-full rounded-full border bg-card px-3 py-1.5 text-sm wrap-anywhere"
              >
                {technology}
              </li>
            ))}
          </ul>
        ) : null}
        <div className="mt-7 flex flex-wrap gap-5">
          {project.githubUrl ? (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-sm font-medium text-primary hover:underline"
            >
              GitHub ↗
            </a>
          ) : null}
          {project.liveDemoUrl ? (
            <a
              href={project.liveDemoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-sm font-medium text-primary hover:underline"
            >
              Live demo ↗
            </a>
          ) : null}
        </div>
        {blocks.length ? (
          <section
            aria-labelledby="case-study-title"
            className="mt-14 border-t pt-10"
          >
            <h2 id="case-study-title" className="font-serif text-3xl">
              Case study
            </h2>
            <div className="mt-7 space-y-6">
              {blocks.map((block, index) => {
                if (block.type === "heading")
                  return (
                    <h3 key={index} className="font-serif text-2xl">
                      {block.text}
                    </h3>
                  );
                if (block.type === "quote")
                  return (
                    <blockquote
                      key={index}
                      className="border-l-2 border-primary pl-5 text-muted-foreground"
                    >
                      {block.text}
                    </blockquote>
                  );
                if (block.type === "code")
                  return (
                    <pre
                      key={index}
                      className="overflow-x-auto rounded-lg border bg-card p-4 text-sm"
                    >
                      <code>{block.text}</code>
                    </pre>
                  );
                if (block.type === "bullet" || block.type === "ordered") {
                  const List = block.type === "bullet" ? "ul" : "ol";
                  return (
                    <List
                      key={index}
                      className={
                        block.type === "bullet"
                          ? "list-disc space-y-2 pl-6"
                          : "list-decimal space-y-2 pl-6"
                      }
                    >
                      {block.items?.map((item, itemIndex) => (
                        <li key={itemIndex}>{item}</li>
                      ))}
                    </List>
                  );
                }
                return (
                  <p
                    key={index}
                    className="whitespace-pre-line leading-8 text-muted-foreground"
                  >
                    {block.text}
                  </p>
                );
              })}
            </div>
          </section>
        ) : null}
      </article>
    </Container>
  );
}

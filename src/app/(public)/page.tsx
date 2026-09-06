import { connection } from "next/server";

import { Container } from "@/components/shared/container";
import { Section } from "@/components/shared/section";
import { SectionHeading } from "@/components/shared/section-heading";
import { SurfaceCard } from "@/components/shared/surface-card";
import { ArticleGrid } from "@/features/articles/article-card";
import { getPublicArticles } from "@/features/articles/queries";
import { getHomeContent } from "@/features/home/queries";
import { LearningTimeline } from "@/features/learning/learning-timeline";
import { getPublicLearningEntries } from "@/features/learning/queries";
import { NoteGrid } from "@/features/notes/note-card";
import { getPublicNotes } from "@/features/notes/queries";
import { ProjectGrid } from "@/features/projects/project-card";
import { getPublicProjects } from "@/features/projects/queries";

export default async function HomePage() {
  await connection();
  const [content, latestProjects, latestArticles, latestNotes, latestLearning] =
    await Promise.all([
      getHomeContent(),
      getPublicProjects(3),
      getPublicArticles({ limit: 3 }),
      getPublicNotes({ limit: 3 }),
      getPublicLearningEntries({ limit: 3 }),
    ]);
  const contactLinks = [
    {
      label: content.publicEmail,
      href: content.publicEmail ? `mailto:${content.publicEmail}` : "",
    },
    { label: "GitHub", href: content.githubUrl },
    { label: "LinkedIn", href: content.linkedinUrl },
  ].filter((link) => link.href);
  return (
    <>
      <section aria-labelledby="hero-title">
        <Container>
          <div className="max-w-4xl py-[clamp(6rem,15vw,11rem)]">
            <p className="mb-5 text-xs font-semibold tracking-[0.18em] text-primary uppercase">
              Personal digital home
            </p>
            <h1
              id="hero-title"
              className="font-serif text-[clamp(3.5rem,10vw,7rem)] leading-[0.9] font-medium tracking-[-0.05em] wrap-anywhere whitespace-pre-line text-balance"
            >
              {content.heroTitle}
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 wrap-anywhere whitespace-pre-line text-muted-foreground text-pretty sm:text-xl">
              {content.heroDescription}
            </p>
          </div>
        </Container>
      </section>

      <Section id="about" aria-labelledby="about-title">
        <Container>
          <div className="max-w-[var(--container-reading)] wrap-anywhere whitespace-pre-line">
            <SectionHeading id="about-title" title={content.aboutTitle} />
            <p className="font-serif text-xl leading-9 text-foreground text-pretty sm:text-2xl sm:leading-10">
              {content.aboutContent}
            </p>
          </div>
        </Container>
      </Section>

      <Section id="projects" aria-labelledby="projects-title">
        <Container>
          <SectionHeading
            id="projects-title"
            title="Latest projects"
            description="Recent proof of work and engineering case studies."
            action={{ href: "/projects", label: "View all projects" }}
          />
          {latestProjects.length ? (
            <ProjectGrid projects={latestProjects} />
          ) : (
            <SurfaceCard>
              <p className="text-sm leading-6 text-muted-foreground">
                Published projects will appear here.
              </p>
            </SurfaceCard>
          )}
        </Container>
      </Section>

      <Section id="articles" aria-labelledby="articles-title">
        <Container>
          <SectionHeading
            id="articles-title"
            title="Latest articles"
            description="Developed, long-form writing across technical and personal subjects."
            action={{ href: "/articles", label: "View all articles" }}
          />
          {latestArticles.length ? (
            <ArticleGrid articles={latestArticles} />
          ) : (
            <SurfaceCard>
              <p className="text-sm leading-6 text-muted-foreground">
                Published articles will appear here.
              </p>
            </SurfaceCard>
          )}
        </Container>
      </Section>

      <Section id="notes" aria-labelledby="notes-title">
        <Container>
          <SectionHeading
            id="notes-title"
            title="Latest notes"
            description="Shorter observations, references, reflections, and evolving thoughts."
            action={{ href: "/notes", label: "View all notes" }}
          />
          {latestNotes.length ? (
            <NoteGrid notes={latestNotes} />
          ) : (
            <SurfaceCard>
              <p className="text-sm leading-6 text-muted-foreground">
                Published notes will appear here.
              </p>
            </SurfaceCard>
          )}
        </Container>
      </Section>

      <Section id="learning" aria-labelledby="learning-title">
        <Container>
          <SectionHeading
            id="learning-title"
            title="Latest learning"
            description="A chronological record of exploration and practice."
            action={{ href: "/learning", label: "View learning journey" }}
          />
          {latestLearning.length ? (
            <LearningTimeline entries={latestLearning} groupByYear={false} />
          ) : (
            <SurfaceCard>
              <p className="text-sm leading-6 text-muted-foreground">
                Published Learning entries will appear here.
              </p>
            </SurfaceCard>
          )}
        </Container>
      </Section>

      <Section id="contact" aria-labelledby="contact-title">
        <Container>
          <div className="max-w-[var(--container-reading)] wrap-anywhere whitespace-pre-line">
            <SectionHeading
              id="contact-title"
              title={content.contactTitle}
              description={content.contactDescription}
            />
            {contactLinks.length ? (
              <ul className="flex flex-wrap gap-x-6 gap-y-2">
                {contactLinks.map((link) => (
                  <li key={link.href} className="min-w-0">
                    <a
                      href={link.href}
                      className="inline-block rounded-sm py-2 text-primary underline underline-offset-4 hover:text-foreground"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-base leading-7 text-muted-foreground text-pretty">
                Contact details and the message form will be added when the
                contact flow is implemented.
              </p>
            )}
          </div>
        </Container>
      </Section>
    </>
  );
}

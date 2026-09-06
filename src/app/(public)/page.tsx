import { connection } from "next/server";

import { Container } from "@/components/shared/container";
import { Section } from "@/components/shared/section";
import { SectionHeading } from "@/components/shared/section-heading";
import { ExperienceList } from "@/features/home/experience-list";
import { getExperiences } from "@/features/home/experience-queries";
import { HomeProjectList } from "@/features/home/home-project-list";
import { getHomeContent } from "@/features/home/queries";
import { techToolGroups } from "@/features/home/tech-tools";
import { getPublicProjects } from "@/features/projects/queries";

export default async function HomePage() {
  await connection();
  const [content, experiences, latestProjects] = await Promise.all([
    getHomeContent(),
    getExperiences(),
    getPublicProjects(3),
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
        <Container size="home">
          <SectionHeading id="about-title" title={content.aboutTitle} />
          <p className="whitespace-pre-line font-serif text-xl leading-9 wrap-anywhere text-foreground text-pretty sm:text-2xl sm:leading-10">
            {content.aboutContent}
          </p>
        </Container>
      </Section>

      <Section id="experience" aria-labelledby="experience-title">
        <Container size="home">
          <SectionHeading
            id="experience-title"
            title="Experience"
            description="Roles and collaborations that have shaped how I work."
          />
          {experiences.length ? (
            <ExperienceList experiences={experiences} />
          ) : (
            <p className="border-y py-7 text-sm leading-6 text-muted-foreground">
              Experience will be added here.
            </p>
          )}
        </Container>
      </Section>

      <Section id="tech" aria-labelledby="tech-title">
        <Container size="home">
          <SectionHeading
            id="tech-title"
            title="Tech & tools"
            description="Tools I use and have worked with."
          />
          <dl className="border-y">
            {techToolGroups.map((group) => (
              <div
                key={group.label}
                className="grid gap-3 border-b py-5 last:border-b-0 sm:grid-cols-[9rem_1fr] sm:gap-6"
              >
                <dt className="text-sm font-semibold text-primary">
                  {group.label}
                </dt>
                <dd className="text-sm leading-7 wrap-anywhere text-muted-foreground">
                  {group.items.join(" / ")}
                </dd>
              </div>
            ))}
          </dl>
        </Container>
      </Section>

      <Section id="projects" aria-labelledby="projects-title">
        <Container size="home">
          <SectionHeading
            id="projects-title"
            title="Latest projects"
            description="Recent proof of work and engineering case studies."
            action={{ href: "/projects", label: "View all projects" }}
          />
          {latestProjects.length ? (
            <HomeProjectList projects={latestProjects} />
          ) : (
            <p className="border-y py-7 text-sm leading-6 text-muted-foreground">
              Published projects will appear here.
            </p>
          )}
        </Container>
      </Section>

      <Section id="contact" aria-labelledby="contact-title">
        <Container size="home">
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
                    className="inline-block rounded-sm py-2 wrap-anywhere text-primary underline underline-offset-4 hover:text-foreground"
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
        </Container>
      </Section>

      <footer className="border-t border-border/70 py-8">
        <Container size="home">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Zhafran
          </p>
        </Container>
      </footer>
    </>
  );
}

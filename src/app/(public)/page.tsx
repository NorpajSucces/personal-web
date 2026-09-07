import { connection } from "next/server";

import { Container } from "@/components/shared/container";
import { Section } from "@/components/shared/section";
import { SectionHeading } from "@/components/shared/section-heading";
import { ContactForm } from "@/features/contact/contact-form";
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
  const homeRailClassName = "border-x border-border/50";
  return (
    <>
      <section
        aria-labelledby="hero-title"
        className="relative overflow-hidden border-b border-border/70"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
        >
          <Container className="grid h-full grid-cols-4 border-x border-border/40 px-0 opacity-50">
            <span className="border-r border-border/40" />
            <span className="border-r border-border/40" />
            <span className="border-r border-border/40" />
            <span />
          </Container>
        </div>
        <Container className="relative z-10">
          <div className="max-w-4xl py-[clamp(6.5rem,15vw,11rem)]">
            <p className="mb-6 font-mono text-[0.6875rem] font-medium tracking-[0.18em] text-primary uppercase">
              00 / Personal digital home
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

      <Section id="about" aria-labelledby="about-title" className="py-0">
        <Container
          size="home"
          data-home-rail
          className={`${homeRailClassName} py-[var(--section-space)]`}
        >
          <SectionHeading
            id="about-title"
            eyebrow="01 / Profile"
            title={content.aboutTitle}
          />
          <p className="whitespace-pre-line font-serif text-xl leading-9 wrap-anywhere text-foreground text-pretty sm:text-2xl sm:leading-10">
            {content.aboutContent}
          </p>
        </Container>
      </Section>

      <Section
        id="experience"
        aria-labelledby="experience-title"
        className="py-0"
      >
        <Container
          size="home"
          data-home-rail
          className={`${homeRailClassName} py-[var(--section-space)]`}
        >
          <SectionHeading
            id="experience-title"
            eyebrow="02 / Career"
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

      <Section id="tech" aria-labelledby="tech-title" className="py-0">
        <Container
          size="home"
          data-home-rail
          className={`${homeRailClassName} py-[var(--section-space)]`}
        >
          <SectionHeading
            id="tech-title"
            eyebrow="03 / Toolkit"
            title="Tech & tools"
            description="Tools I use and have worked with."
          />
          <dl className="border-y">
            {techToolGroups.map((group, index) => (
              <div
                key={group.label}
                className="grid grid-cols-[2rem_minmax(0,1fr)] gap-x-3 gap-y-2 border-b py-5 last:border-b-0 sm:grid-cols-[2.5rem_8rem_minmax(0,1fr)] sm:gap-x-4"
              >
                <span
                  aria-hidden="true"
                  className="font-mono text-[0.6875rem] tracking-[0.12em] text-muted-foreground"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <dt className="font-mono text-xs font-semibold tracking-[0.04em] text-primary uppercase">
                  {group.label}
                </dt>
                <dd className="col-start-2 font-mono text-xs leading-7 wrap-anywhere text-muted-foreground sm:col-start-3 sm:row-start-1">
                  {group.items.join(" / ")}
                </dd>
              </div>
            ))}
          </dl>
        </Container>
      </Section>

      <Section id="projects" aria-labelledby="projects-title" className="py-0">
        <Container
          size="home"
          data-home-rail
          className={`${homeRailClassName} py-[var(--section-space)]`}
        >
          <SectionHeading
            id="projects-title"
            eyebrow="04 / Recent work"
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

      <Section id="contact" aria-labelledby="contact-title" className="py-0">
        <Container
          size="home"
          data-home-rail
          className={`${homeRailClassName} py-[var(--section-space)]`}
        >
          <SectionHeading
            id="contact-title"
            eyebrow="05 / Connect"
            title={content.contactTitle}
            description={content.contactDescription}
          />
          <ContactForm initialSubmissionId={crypto.randomUUID()} />
          {contactLinks.length ? (
            <div className="mt-10">
              <p className="mb-3 font-mono text-[0.6875rem] tracking-[0.12em] text-muted-foreground uppercase">
                Direct contact
              </p>
              <ul className="border-y">
                {contactLinks.map((link, index) => (
                  <li
                    key={link.href}
                    className="min-w-0 border-b last:border-b-0"
                  >
                    <a
                      href={link.href}
                      className="group grid min-h-14 grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-3 py-3 text-sm hover:text-primary"
                    >
                      <span
                        aria-hidden="true"
                        className="font-mono text-[0.6875rem] tracking-[0.12em] text-muted-foreground"
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="wrap-anywhere">{link.label}</span>
                      <span
                        aria-hidden="true"
                        className="text-primary transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
                      >
                        ↗
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </Container>
      </Section>

      <footer className="border-t border-border/70">
        <Container
          size="home"
          data-home-rail
          className={`${homeRailClassName} py-8`}
        >
          <p className="font-mono text-[0.6875rem] tracking-[0.08em] text-muted-foreground uppercase">
            &copy; {new Date().getFullYear()} Zhafran
          </p>
        </Container>
      </footer>
    </>
  );
}

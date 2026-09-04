import { Container } from "@/components/shared/container";
import { Section } from "@/components/shared/section";
import { SectionHeading } from "@/components/shared/section-heading";
import { SurfaceCard } from "@/components/shared/surface-card";

const latestSections = [
  {
    id: "projects",
    title: "Latest projects",
    description: "Recent proof of work and engineering case studies.",
    action: { href: "/projects", label: "View all projects" },
    emptyMessage: "Published projects will appear here.",
  },
  {
    id: "articles",
    title: "Latest articles",
    description:
      "Developed, long-form writing across technical and personal subjects.",
    action: { href: "/articles", label: "View all articles" },
    emptyMessage: "Published articles will appear here.",
  },
  {
    id: "notes",
    title: "Latest notes",
    description: "Shorter observations, references, and evolving thoughts.",
    action: { href: "/notes", label: "View all notes" },
    emptyMessage: "Published notes will appear here.",
  },
  {
    id: "learning",
    title: "Latest learning",
    description: "A chronological record of exploration and practice.",
    action: { href: "/learning", label: "View learning journey" },
    emptyMessage: "Learning entries will appear here.",
  },
] as const;

export default function HomePage() {
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
              className="font-serif text-[clamp(3.5rem,10vw,7rem)] leading-[0.9] font-medium tracking-[-0.05em] text-balance"
            >
              Hi, I’m Zhafran.
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-muted-foreground text-pretty sm:text-xl">
              This is where I document what I build, what I learn, and how my
              thinking evolves.
            </p>
          </div>
        </Container>
      </section>

      <Section id="about" aria-labelledby="about-title">
        <Container>
          <div className="max-w-[var(--container-reading)]">
            <SectionHeading id="about-title" title="About" />
            <p className="font-serif text-xl leading-9 text-foreground text-pretty sm:text-2xl sm:leading-10">
              This site brings projects, long-form writing, shorter notes, and a
              chronological learning journey into one evolving place.
            </p>
          </div>
        </Container>
      </Section>

      {latestSections.map((section) => (
        <Section
          id={section.id}
          aria-labelledby={`${section.id}-title`}
          key={section.id}
        >
          <Container>
            <SectionHeading
              id={`${section.id}-title`}
              title={section.title}
              description={section.description}
              action={section.action}
            />
            <SurfaceCard>
              <p className="text-sm leading-6 text-muted-foreground">
                {section.emptyMessage}
              </p>
            </SurfaceCard>
          </Container>
        </Section>
      ))}

      <Section id="contact" aria-labelledby="contact-title">
        <Container>
          <div className="max-w-[var(--container-reading)]">
            <SectionHeading
              id="contact-title"
              title="Contact"
              description="A direct way to start a conversation."
            />
            <p className="text-base leading-7 text-muted-foreground text-pretty">
              Contact details and the message form will be added when the
              contact flow is implemented.
            </p>
          </div>
        </Container>
      </Section>
    </>
  );
}

import { Container } from "@/components/shared/container";

type PageIntroProps = {
  title: string;
  description: string;
};

export function PageIntro({ title, description }: PageIntroProps) {
  return (
    <Container>
      <header className="max-w-[var(--container-reading)] py-[clamp(5rem,12vw,9rem)]">
        <p className="mb-4 text-xs font-semibold tracking-[0.18em] text-primary uppercase">
          Personal digital home
        </p>
        <h1 className="font-serif text-[clamp(3rem,8vw,5.5rem)] leading-[0.95] font-medium tracking-[-0.04em] text-balance">
          {title}
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground text-pretty sm:text-xl">
          {description}
        </p>
      </header>
    </Container>
  );
}

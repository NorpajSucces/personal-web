import Link from "next/link";

type SectionHeadingProps = {
  id: string;
  title: string;
  eyebrow?: string;
  description?: string;
  action?: {
    href: string;
    label: string;
  };
};

export function SectionHeading({
  id,
  title,
  eyebrow,
  description,
  action,
}: SectionHeadingProps) {
  return (
    <div className="mb-8 flex flex-col gap-4 border-b border-border/70 pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        {eyebrow ? (
          <p
            aria-hidden="true"
            className="font-mono text-[0.6875rem] leading-none tracking-[0.16em] text-primary uppercase"
          >
            {eyebrow}
          </p>
        ) : null}
        <h2
          id={id}
          className={`font-serif text-[clamp(2rem,5vw,3rem)] leading-none font-medium tracking-[-0.025em] text-balance ${eyebrow ? "mt-3" : ""}`}
        >
          {title}
        </h2>
        {description ? (
          <p className="mt-3 text-base leading-7 text-muted-foreground text-pretty">
            {description}
          </p>
        ) : null}
      </div>

      {action ? (
        <Link
          className="group inline-flex min-h-10 w-fit items-center gap-2 rounded-sm text-sm font-medium text-primary underline-offset-4 transition-colors hover:text-foreground hover:underline"
          href={action.href}
        >
          {action.label}
          <span
            aria-hidden="true"
            className="transition-transform group-hover:translate-x-0.5"
          >
            →
          </span>
        </Link>
      ) : null}
    </div>
  );
}

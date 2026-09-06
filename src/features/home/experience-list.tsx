import { toExperienceView, type Experience } from "./experience";

export function ExperienceList({ experiences }: { experiences: Experience[] }) {
  return (
    <div className="border-y">
      {experiences.map((experience) => {
        const item = toExperienceView(experience);
        return (
          <article
            key={item.id}
            className="grid gap-3 border-b py-7 last:border-b-0 sm:grid-cols-[8rem_1fr] sm:gap-6"
          >
            <p className="text-sm font-medium text-primary">{item.period}</p>
            <div className="min-w-0">
              <h3 className="font-serif text-2xl leading-tight wrap-anywhere">
                {item.role}
              </h3>
              <p className="mt-1 text-sm font-medium wrap-anywhere">
                {item.organization}
              </p>
              {item.description ? (
                <p className="mt-3 whitespace-pre-line leading-7 wrap-anywhere text-muted-foreground">
                  {item.description}
                </p>
              ) : null}
            </div>
          </article>
        );
      })}
    </div>
  );
}

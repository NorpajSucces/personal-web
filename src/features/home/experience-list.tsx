import { toExperienceView, type Experience } from "./experience";

export function ExperienceList({ experiences }: { experiences: Experience[] }) {
  return (
    <div className="border-y">
      {experiences.map((experience, index) => {
        const item = toExperienceView(experience);
        return (
          <article
            key={item.id}
            className="grid grid-cols-[2rem_minmax(0,1fr)] gap-x-3 gap-y-3 border-b py-7 last:border-b-0 sm:grid-cols-[2.5rem_8rem_minmax(0,1fr)] sm:gap-x-4"
          >
            <p
              aria-hidden="true"
              className="font-mono text-[0.6875rem] tracking-[0.12em] text-muted-foreground"
            >
              {String(index + 1).padStart(2, "0")}
            </p>
            <p className="font-mono text-xs font-medium tracking-[-0.02em] text-primary">
              {item.period}
            </p>
            <div className="col-start-2 min-w-0 sm:col-start-3 sm:row-start-1">
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

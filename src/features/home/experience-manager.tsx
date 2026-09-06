import { DeleteExperienceButton } from "./delete-experience-button";
import type { Experience } from "./experience";
import { dateInputValue, formatExperiencePeriod } from "./experience";
import { createExperience, updateExperience } from "./experience-actions";
import { ExperienceForm, newExperienceValues } from "./experience-form";

export function ExperienceManager({
  experiences,
}: {
  experiences: Experience[];
}) {
  return (
    <section
      aria-labelledby="experience-manager-title"
      className="mt-12 border-t pt-10"
    >
      <div className="mb-6">
        <h2 id="experience-manager-title" className="font-serif text-3xl">
          Experience
        </h2>
        <p className="mt-2 max-w-prose text-sm leading-6 text-muted-foreground">
          Experiences appear publicly immediately and are ordered by newest
          start date. Current roles display “Present”.
        </p>
      </div>

      <details
        open={!experiences.length}
        className="rounded-lg border bg-card p-5 sm:p-6"
      >
        <summary className="cursor-pointer font-serif text-2xl">
          Add Experience
        </summary>
        <div className="mt-6">
          <ExperienceForm
            action={createExperience}
            initialValues={newExperienceValues}
            mode="create"
          />
        </div>
      </details>

      {experiences.length ? (
        <div className="mt-5 space-y-4">
          {experiences.map((experience) => (
            <details
              key={experience.id}
              className="rounded-lg border bg-card p-5 sm:p-6"
            >
              <summary className="cursor-pointer">
                <span className="block font-serif text-xl">
                  {experience.role}
                </span>
                <span className="mt-1 block text-sm text-muted-foreground">
                  {experience.organization} ·{" "}
                  {formatExperiencePeriod(experience)}
                </span>
              </summary>
              <div className="mt-6 border-t pt-6">
                <ExperienceForm
                  action={updateExperience.bind(null, experience.id)}
                  initialValues={{
                    role: experience.role,
                    organization: experience.organization,
                    startDate: dateInputValue(experience.startDate),
                    endDate: dateInputValue(experience.endDate),
                    isCurrent: experience.isCurrent,
                    description: experience.description ?? "",
                  }}
                  mode="edit"
                />
                <div className="mt-5 border-t pt-4">
                  <DeleteExperienceButton
                    id={experience.id}
                    label={`${experience.role} at ${experience.organization}`}
                  />
                </div>
              </div>
            </details>
          ))}
        </div>
      ) : (
        <p className="mt-5 text-sm text-muted-foreground">
          No Experience entries yet.
        </p>
      )}
    </section>
  );
}

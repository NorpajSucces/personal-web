import type { experiences } from "@/db/schema/experiences";

export type Experience = typeof experiences.$inferSelect;

export type ExperienceView = {
  id: string;
  role: string;
  organization: string;
  description: string | null;
  period: string;
};

export function dateInputValue(date: Date | null) {
  return date?.toISOString().slice(0, 10) ?? "";
}

export function formatExperiencePeriod(experience: Experience) {
  const startYear = experience.startDate.getUTCFullYear();
  const end = experience.isCurrent
    ? "Present"
    : (experience.endDate?.getUTCFullYear() ?? startYear);
  return `${startYear} — ${end}`;
}

export function toExperienceView(experience: Experience): ExperienceView {
  return {
    id: experience.id,
    role: experience.role,
    organization: experience.organization,
    description: experience.description,
    period: formatExperiencePeriod(experience),
  };
}

import type { LearningEntry } from "./types";

export const learningStatusLabels: Record<
  LearningEntry["learningStatus"],
  string
> = {
  exploring: "Exploring",
  learning: "Learning",
  practicing: "Practicing",
};

export function formatLearningDate(date: Date) {
  return date.toLocaleDateString("en", {
    dateStyle: "long",
    timeZone: "UTC",
  });
}

export function groupLearningEntriesByYear<
  T extends Pick<LearningEntry, "date">,
>(entries: T[]) {
  const groups = new Map<number, T[]>();
  for (const entry of entries) {
    const year = entry.date.getUTCFullYear();
    groups.set(year, [...(groups.get(year) ?? []), entry]);
  }
  return [...groups].map(([year, groupedEntries]) => ({
    year,
    entries: groupedEntries,
  }));
}

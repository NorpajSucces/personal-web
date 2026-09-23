import type { projects } from "@/db/schema/projects";

export type Project = typeof projects.$inferSelect;
export type ProjectSummary = Pick<
  Project,
  | "id"
  | "name"
  | "slug"
  | "description"
  | "technologies"
  | "startPeriod"
  | "endPeriod"
  | "projectStatus"
  | "publicationStatus"
  | "visibility"
  | "githubUrl"
  | "liveDemoUrl"
  | "screenshotPath"
  | "createdAt"
  | "updatedAt"
>;

import { pgEnum } from "drizzle-orm/pg-core";

export const publicationStatusEnum = pgEnum("publication_status", [
  "draft",
  "published",
]);

export const visibilityEnum = pgEnum("visibility", ["public", "private"]);

export const projectStatusEnum = pgEnum("project_status", [
  "in_progress",
  "completed",
]);

export const learningStatusEnum = pgEnum("learning_status", [
  "exploring",
  "learning",
  "practicing",
]);

import { sql } from "drizzle-orm";
import {
  check,
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import {
  projectStatusEnum,
  publicationStatusEnum,
  visibilityEnum,
} from "./enums";

export const projects = pgTable(
  "projects",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description").notNull(),
    screenshotPath: text("screenshot_path"),
    githubUrl: text("github_url"),
    liveDemoUrl: text("live_demo_url"),
    technologies: text("technologies")
      .array()
      .default(sql`ARRAY[]::text[]`)
      .notNull(),
    projectStatus: projectStatusEnum("project_status")
      .default("in_progress")
      .notNull(),
    publicationStatus: publicationStatusEnum("publication_status")
      .default("draft")
      .notNull(),
    visibility: visibilityEnum("visibility").default("private").notNull(),
    caseStudy: jsonb("case_study").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    check("projects_name_not_blank", sql`length(btrim(${table.name})) > 0`),
    check("projects_slug_not_blank", sql`length(btrim(${table.slug})) > 0`),
    index("projects_publication_visibility_updated_at_idx").on(
      table.publicationStatus,
      table.visibility,
      table.updatedAt.desc(),
    ),
  ],
).enableRLS();

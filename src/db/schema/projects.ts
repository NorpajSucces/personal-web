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
    startPeriod: text("start_period"),
    endPeriod: text("end_period"),
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
    check(
      "projects_work_period_valid",
      sql`(
        (${table.startPeriod} is null or ${table.startPeriod} ~ '^[1-9][0-9]{3}(-(0[1-9]|1[0-2]))?$')
        and (${table.endPeriod} is null or ${table.endPeriod} ~ '^[1-9][0-9]{3}(-(0[1-9]|1[0-2]))?$')
        and (${table.projectStatus} <> 'in_progress' or ${table.endPeriod} is null)
        and (
          ${table.startPeriod} is null or ${table.endPeriod} is null
          or substring(${table.startPeriod} from 1 for 4) < substring(${table.endPeriod} from 1 for 4)
          or (
            substring(${table.startPeriod} from 1 for 4) = substring(${table.endPeriod} from 1 for 4)
            and (
              char_length(${table.startPeriod}) = 4
              or char_length(${table.endPeriod}) = 4
              or substring(${table.startPeriod} from 6 for 2) <= substring(${table.endPeriod} from 6 for 2)
            )
          )
        )
      )`,
    ),
    index("projects_publication_visibility_updated_at_idx").on(
      table.publicationStatus,
      table.visibility,
      table.updatedAt.desc(),
    ),
  ],
).enableRLS();

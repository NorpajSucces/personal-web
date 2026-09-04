import { sql } from "drizzle-orm";
import { check, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const homeContent = pgTable(
  "home_content",
  {
    id: integer("id").default(1).primaryKey(),
    heroTitle: text("hero_title").notNull(),
    heroDescription: text("hero_description").notNull(),
    aboutTitle: text("about_title").notNull(),
    aboutContent: text("about_content").notNull(),
    contactTitle: text("contact_title").notNull(),
    contactDescription: text("contact_description").notNull(),
    publicEmail: text("public_email"),
    githubUrl: text("github_url"),
    linkedinUrl: text("linkedin_url"),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    check("home_content_singleton", sql`${table.id} = 1`),
    check(
      "home_content_hero_title_not_blank",
      sql`length(btrim(${table.heroTitle})) > 0`,
    ),
    check(
      "home_content_about_title_not_blank",
      sql`length(btrim(${table.aboutTitle})) > 0`,
    ),
    check(
      "home_content_contact_title_not_blank",
      sql`length(btrim(${table.contactTitle})) > 0`,
    ),
  ],
).enableRLS();

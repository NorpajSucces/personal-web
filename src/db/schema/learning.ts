import { sql } from "drizzle-orm";
import {
  check,
  index,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { articles } from "./articles";
import {
  learningStatusEnum,
  publicationStatusEnum,
  visibilityEnum,
} from "./enums";
import { notes } from "./notes";
import { projects } from "./projects";
import { topics } from "./taxonomy";

export const learningEntries = pgTable(
  "learning_entries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    date: timestamp("date", { withTimezone: true }).notNull(),
    learningStatus: learningStatusEnum("learning_status")
      .default("exploring")
      .notNull(),
    publicationStatus: publicationStatusEnum("publication_status")
      .default("draft")
      .notNull(),
    visibility: visibilityEnum("visibility").default("private").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    check(
      "learning_entries_title_not_blank",
      sql`length(btrim(${table.title})) > 0`,
    ),
    index("learning_entries_publication_visibility_date_idx").on(
      table.publicationStatus,
      table.visibility,
      table.date.desc(),
    ),
  ],
).enableRLS();

export const learningTopics = pgTable(
  "learning_topics",
  {
    learningEntryId: uuid("learning_entry_id")
      .notNull()
      .references(() => learningEntries.id, { onDelete: "cascade" }),
    topicId: uuid("topic_id")
      .notNull()
      .references(() => topics.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({
      name: "learning_topics_pk",
      columns: [table.learningEntryId, table.topicId],
    }),
    index("learning_topics_topic_id_idx").on(table.topicId),
  ],
).enableRLS();

export const learningArticles = pgTable(
  "learning_articles",
  {
    learningEntryId: uuid("learning_entry_id")
      .notNull()
      .references(() => learningEntries.id, { onDelete: "cascade" }),
    articleId: uuid("article_id")
      .notNull()
      .references(() => articles.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({
      name: "learning_articles_pk",
      columns: [table.learningEntryId, table.articleId],
    }),
    index("learning_articles_article_id_idx").on(table.articleId),
  ],
).enableRLS();

export const learningNotes = pgTable(
  "learning_notes",
  {
    learningEntryId: uuid("learning_entry_id")
      .notNull()
      .references(() => learningEntries.id, { onDelete: "cascade" }),
    noteId: uuid("note_id")
      .notNull()
      .references(() => notes.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({
      name: "learning_notes_pk",
      columns: [table.learningEntryId, table.noteId],
    }),
    index("learning_notes_note_id_idx").on(table.noteId),
  ],
).enableRLS();

export const learningProjects = pgTable(
  "learning_projects",
  {
    learningEntryId: uuid("learning_entry_id")
      .notNull()
      .references(() => learningEntries.id, { onDelete: "cascade" }),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({
      name: "learning_projects_pk",
      columns: [table.learningEntryId, table.projectId],
    }),
    index("learning_projects_project_id_idx").on(table.projectId),
  ],
).enableRLS();

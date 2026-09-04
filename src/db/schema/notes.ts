import { sql } from "drizzle-orm";
import {
  check,
  index,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { publicationStatusEnum, visibilityEnum } from "./enums";
import { tags, topics } from "./taxonomy";

export const notes = pgTable(
  "notes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: text("title").notNull(),
    slug: text("slug").notNull().unique(),
    excerpt: text("excerpt").notNull(),
    content: jsonb("content").$type<Record<string, unknown>>().notNull(),
    coverImagePath: text("cover_image_path"),
    publicationStatus: publicationStatusEnum("publication_status")
      .default("draft")
      .notNull(),
    visibility: visibilityEnum("visibility").default("private").notNull(),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    check("notes_title_not_blank", sql`length(btrim(${table.title})) > 0`),
    check("notes_slug_not_blank", sql`length(btrim(${table.slug})) > 0`),
    index("notes_publication_visibility_published_at_idx").on(
      table.publicationStatus,
      table.visibility,
      table.publishedAt.desc(),
    ),
  ],
).enableRLS();

export const noteTopics = pgTable(
  "note_topics",
  {
    noteId: uuid("note_id")
      .notNull()
      .references(() => notes.id, { onDelete: "cascade" }),
    topicId: uuid("topic_id")
      .notNull()
      .references(() => topics.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({
      name: "note_topics_pk",
      columns: [table.noteId, table.topicId],
    }),
    index("note_topics_topic_id_idx").on(table.topicId),
  ],
).enableRLS();

export const noteTags = pgTable(
  "note_tags",
  {
    noteId: uuid("note_id")
      .notNull()
      .references(() => notes.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({
      name: "note_tags_pk",
      columns: [table.noteId, table.tagId],
    }),
    index("note_tags_tag_id_idx").on(table.tagId),
  ],
).enableRLS();

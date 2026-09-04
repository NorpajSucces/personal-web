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

export const articles = pgTable(
  "articles",
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
    check("articles_title_not_blank", sql`length(btrim(${table.title})) > 0`),
    check("articles_slug_not_blank", sql`length(btrim(${table.slug})) > 0`),
    index("articles_publication_visibility_published_at_idx").on(
      table.publicationStatus,
      table.visibility,
      table.publishedAt.desc(),
    ),
  ],
).enableRLS();

export const articleTopics = pgTable(
  "article_topics",
  {
    articleId: uuid("article_id")
      .notNull()
      .references(() => articles.id, { onDelete: "cascade" }),
    topicId: uuid("topic_id")
      .notNull()
      .references(() => topics.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({
      name: "article_topics_pk",
      columns: [table.articleId, table.topicId],
    }),
    index("article_topics_topic_id_idx").on(table.topicId),
  ],
).enableRLS();

export const articleTags = pgTable(
  "article_tags",
  {
    articleId: uuid("article_id")
      .notNull()
      .references(() => articles.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({
      name: "article_tags_pk",
      columns: [table.articleId, table.tagId],
    }),
    index("article_tags_tag_id_idx").on(table.tagId),
  ],
).enableRLS();

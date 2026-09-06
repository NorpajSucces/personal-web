import "server-only";

import { eq, sql } from "drizzle-orm";

import { articleTags, articleTopics } from "@/db/schema/articles";
import { learningTopics } from "@/db/schema/learning";
import { noteTags, noteTopics } from "@/db/schema/notes";
import { tags, topics } from "@/db/schema/taxonomy";

import type { TaxonomyKind } from "./schema";

async function getDatabase() {
  return (await import("@/db")).db;
}

function tableFor(kind: TaxonomyKind) {
  return kind === "topic" ? topics : tags;
}

export async function getTaxonomyOptions() {
  const db = await getDatabase();
  const [topicRows, tagRows] = await Promise.all([
    db.select().from(topics).orderBy(topics.name),
    db.select().from(tags).orderBy(tags.name),
  ]);
  return { topics: topicRows, tags: tagRows };
}

export async function findTaxonomyBySlug(kind: TaxonomyKind, slug: string) {
  const db = await getDatabase();
  const table = tableFor(kind);
  const [item] = await db
    .select()
    .from(table)
    .where(eq(table.slug, slug))
    .limit(1);
  return item;
}

export async function createTaxonomyRecord(
  kind: TaxonomyKind,
  values: { name: string; slug: string },
) {
  const db = await getDatabase();
  const table = tableFor(kind);
  const [item] = await db.insert(table).values(values).returning({
    id: table.id,
    name: table.name,
    slug: table.slug,
  });
  return item;
}

export async function updateTaxonomyRecord(
  kind: TaxonomyKind,
  id: string,
  values: { name: string; slug: string },
) {
  const db = await getDatabase();
  const table = tableFor(kind);
  const [item] = await db
    .update(table)
    .set({ ...values, updatedAt: new Date() })
    .where(eq(table.id, id))
    .returning({ id: table.id });
  return item;
}

export async function deleteTaxonomyRecord(kind: TaxonomyKind, id: string) {
  const db = await getDatabase();
  const table = tableFor(kind);
  const [item] = await db
    .delete(table)
    .where(eq(table.id, id))
    .returning({ id: table.id });
  return item;
}

export async function getAdminTaxonomy() {
  const db = await getDatabase();
  const [topicRows, tagRows] = await Promise.all([
    db
      .select({
        id: topics.id,
        name: topics.name,
        slug: topics.slug,
        articleCount: sql<number>`count(distinct ${articleTopics.articleId})::int`,
        noteCount: sql<number>`count(distinct ${noteTopics.noteId})::int`,
        learningCount: sql<number>`count(distinct ${learningTopics.learningEntryId})::int`,
      })
      .from(topics)
      .leftJoin(articleTopics, eq(topics.id, articleTopics.topicId))
      .leftJoin(noteTopics, eq(topics.id, noteTopics.topicId))
      .leftJoin(learningTopics, eq(topics.id, learningTopics.topicId))
      .groupBy(topics.id)
      .orderBy(topics.name),
    db
      .select({
        id: tags.id,
        name: tags.name,
        slug: tags.slug,
        articleCount: sql<number>`count(distinct ${articleTags.articleId})::int`,
        noteCount: sql<number>`count(distinct ${noteTags.noteId})::int`,
      })
      .from(tags)
      .leftJoin(articleTags, eq(tags.id, articleTags.tagId))
      .leftJoin(noteTags, eq(tags.id, noteTags.tagId))
      .groupBy(tags.id)
      .orderBy(tags.name),
  ]);
  return { topics: topicRows, tags: tagRows };
}

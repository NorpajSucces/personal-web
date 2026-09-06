import "server-only";

import { and, desc, eq, inArray, ne, sql } from "drizzle-orm";

import { noteTags, noteTopics, notes } from "@/db/schema/notes";
import { tags, topics } from "@/db/schema/taxonomy";
import { resolvePublishedAt } from "@/features/publishing/published-at";

import type { NoteFormValues } from "./schema";
import type {
  Note,
  NoteSummary,
  NoteWithTaxonomy,
  TaxonomyOption,
} from "./types";

const summaryColumns = {
  id: notes.id,
  title: notes.title,
  slug: notes.slug,
  excerpt: notes.excerpt,
  publicationStatus: notes.publicationStatus,
  visibility: notes.visibility,
  publishedAt: notes.publishedAt,
  createdAt: notes.createdAt,
  updatedAt: notes.updatedAt,
};

async function getDatabase() {
  return (await import("@/db")).db;
}

async function attachTaxonomy<
  T extends Note | Omit<NoteSummary, "topics" | "tags">,
>(rows: T[]) {
  if (!rows.length)
    return [] as Array<
      T & { topics: TaxonomyOption[]; tags: TaxonomyOption[] }
    >;
  const db = await getDatabase();
  const ids = rows.map((row) => row.id);
  const [topicRows, tagRows] = await Promise.all([
    db
      .select({
        noteId: noteTopics.noteId,
        id: topics.id,
        name: topics.name,
        slug: topics.slug,
      })
      .from(noteTopics)
      .innerJoin(topics, eq(noteTopics.topicId, topics.id))
      .where(inArray(noteTopics.noteId, ids))
      .orderBy(topics.name),
    db
      .select({
        noteId: noteTags.noteId,
        id: tags.id,
        name: tags.name,
        slug: tags.slug,
      })
      .from(noteTags)
      .innerJoin(tags, eq(noteTags.tagId, tags.id))
      .where(inArray(noteTags.noteId, ids))
      .orderBy(tags.name),
  ]);
  return rows.map((row) => ({
    ...row,
    topics: topicRows
      .filter((item) => item.noteId === row.id)
      .map(({ id, name, slug }) => ({ id, name, slug })),
    tags: tagRows
      .filter((item) => item.noteId === row.id)
      .map(({ id, name, slug }) => ({ id, name, slug })),
  }));
}

export async function getAdminNotes(): Promise<NoteSummary[]> {
  const db = await getDatabase();
  const rows = await db
    .select(summaryColumns)
    .from(notes)
    .orderBy(desc(notes.updatedAt));
  return attachTaxonomy(rows);
}

export async function getAdminNoteById(
  id: string,
): Promise<NoteWithTaxonomy | undefined> {
  const db = await getDatabase();
  const [note] = await db.select().from(notes).where(eq(notes.id, id)).limit(1);
  if (!note) return undefined;
  return (await attachTaxonomy([note]))[0];
}

export async function isNoteSlugAvailable(slug: string, excludeId?: string) {
  const db = await getDatabase();
  const condition = excludeId
    ? and(eq(notes.slug, slug), ne(notes.id, excludeId))
    : eq(notes.slug, slug);
  const [note] = await db
    .select({ id: notes.id })
    .from(notes)
    .where(condition)
    .limit(1);
  return !note;
}

export async function noteTaxonomySelectionExists(
  topicIds: string[],
  tagIds: string[],
) {
  const db = await getDatabase();
  const [topicRows, tagRows] = await Promise.all([
    topicIds.length
      ? db
          .select({ id: topics.id })
          .from(topics)
          .where(inArray(topics.id, topicIds))
      : Promise.resolve([]),
    tagIds.length
      ? db.select({ id: tags.id }).from(tags).where(inArray(tags.id, tagIds))
      : Promise.resolve([]),
  ]);
  return (
    topicRows.length === topicIds.length && tagRows.length === tagIds.length
  );
}

export async function createNoteRecord(values: NoteFormValues) {
  const db = await getDatabase();
  return db.transaction(async (transaction) => {
    const [note] = await transaction
      .insert(notes)
      .values({
        title: values.title,
        slug: values.slug,
        excerpt: values.excerpt,
        content: values.content,
        publicationStatus: values.publicationStatus,
        visibility: values.visibility,
        publishedAt: resolvePublishedAt(null, values.publicationStatus),
      })
      .returning({ id: notes.id });
    if (values.topicIds.length)
      await transaction.insert(noteTopics).values(
        values.topicIds.map((topicId) => ({
          noteId: note.id,
          topicId,
        })),
      );
    if (values.tagIds.length)
      await transaction
        .insert(noteTags)
        .values(values.tagIds.map((tagId) => ({ noteId: note.id, tagId })));
    return note;
  });
}

export async function updateNoteRecord(existing: Note, values: NoteFormValues) {
  const db = await getDatabase();
  return db.transaction(async (transaction) => {
    const publishedAt = resolvePublishedAt(
      existing.publishedAt,
      values.publicationStatus,
    );
    const [note] = await transaction
      .update(notes)
      .set({
        title: values.title,
        slug: values.slug,
        excerpt: values.excerpt,
        content: values.content,
        publicationStatus: values.publicationStatus,
        visibility: values.visibility,
        publishedAt,
        updatedAt: new Date(),
      })
      .where(eq(notes.id, existing.id))
      .returning({ id: notes.id });
    if (!note) return undefined;
    await Promise.all([
      transaction.delete(noteTopics).where(eq(noteTopics.noteId, existing.id)),
      transaction.delete(noteTags).where(eq(noteTags.noteId, existing.id)),
    ]);
    if (values.topicIds.length)
      await transaction.insert(noteTopics).values(
        values.topicIds.map((topicId) => ({
          noteId: existing.id,
          topicId,
        })),
      );
    if (values.tagIds.length)
      await transaction
        .insert(noteTags)
        .values(values.tagIds.map((tagId) => ({ noteId: existing.id, tagId })));
    return note;
  });
}

export async function deleteNoteRecord(id: string) {
  const db = await getDatabase();
  const [note] = await db
    .delete(notes)
    .where(eq(notes.id, id))
    .returning({ id: notes.id });
  return note;
}

const publicCondition = and(
  eq(notes.publicationStatus, "published"),
  eq(notes.visibility, "public"),
);

export type PublicNoteFilters = {
  topic?: string;
  tag?: string;
  limit?: number;
};

export async function getPublicNotes(
  filters: PublicNoteFilters = {},
): Promise<NoteSummary[]> {
  const db = await getDatabase();
  const conditions = [publicCondition];
  if (filters.topic)
    conditions.push(sql`exists (
      select 1 from ${noteTopics}
      inner join ${topics} on ${noteTopics.topicId} = ${topics.id}
      where ${noteTopics.noteId} = ${notes.id}
        and ${topics.slug} = ${filters.topic}
    )`);
  if (filters.tag)
    conditions.push(sql`exists (
      select 1 from ${noteTags}
      inner join ${tags} on ${noteTags.tagId} = ${tags.id}
      where ${noteTags.noteId} = ${notes.id}
        and ${tags.slug} = ${filters.tag}
    )`);
  const query = db
    .select(summaryColumns)
    .from(notes)
    .where(and(...conditions))
    .orderBy(desc(notes.publishedAt), desc(notes.updatedAt));
  const rows = filters.limit ? await query.limit(filters.limit) : await query;
  return attachTaxonomy(rows);
}

export async function getPublicNoteBySlug(
  slug: string,
): Promise<NoteWithTaxonomy | undefined> {
  const db = await getDatabase();
  const [note] = await db
    .select()
    .from(notes)
    .where(and(publicCondition, eq(notes.slug, slug)))
    .limit(1);
  if (!note) return undefined;
  return (await attachTaxonomy([note]))[0];
}

export async function getPublicNoteTaxonomy() {
  const db = await getDatabase();
  const [topicRows, tagRows] = await Promise.all([
    db
      .selectDistinct({ id: topics.id, name: topics.name, slug: topics.slug })
      .from(topics)
      .innerJoin(noteTopics, eq(topics.id, noteTopics.topicId))
      .innerJoin(notes, eq(noteTopics.noteId, notes.id))
      .where(publicCondition)
      .orderBy(topics.name),
    db
      .selectDistinct({ id: tags.id, name: tags.name, slug: tags.slug })
      .from(tags)
      .innerJoin(noteTags, eq(tags.id, noteTags.tagId))
      .innerJoin(notes, eq(noteTags.noteId, notes.id))
      .where(publicCondition)
      .orderBy(tags.name),
  ]);
  return { topics: topicRows, tags: tagRows };
}

import "server-only";

import { and, desc, eq, inArray, sql } from "drizzle-orm";

import { articles } from "@/db/schema/articles";
import {
  learningArticles,
  learningEntries,
  learningNotes,
  learningProjects,
  learningTopics,
} from "@/db/schema/learning";
import { notes } from "@/db/schema/notes";
import { projects } from "@/db/schema/projects";
import { topics } from "@/db/schema/taxonomy";

import type { LearningFormValues } from "./schema";
import type {
  LearningEntry,
  LearningEntryWithRelations,
  LearningRelationOptions,
  RelatedContent,
  TaxonomyOption,
} from "./types";

async function getDatabase() {
  return (await import("@/db")).db;
}

async function attachRelations(
  rows: LearningEntry[],
  publicRelatedOnly = false,
): Promise<LearningEntryWithRelations[]> {
  if (!rows.length) return [];
  const db = await getDatabase();
  const ids = rows.map((row) => row.id);
  const publicArticleCondition = publicRelatedOnly
    ? and(
        eq(articles.publicationStatus, "published"),
        eq(articles.visibility, "public"),
      )
    : undefined;
  const publicNoteCondition = publicRelatedOnly
    ? and(
        eq(notes.publicationStatus, "published"),
        eq(notes.visibility, "public"),
      )
    : undefined;
  const publicProjectCondition = publicRelatedOnly
    ? and(
        eq(projects.publicationStatus, "published"),
        eq(projects.visibility, "public"),
      )
    : undefined;
  const [topicRows, articleRows, noteRows, projectRows] = await Promise.all([
    db
      .select({
        learningEntryId: learningTopics.learningEntryId,
        id: topics.id,
        name: topics.name,
        slug: topics.slug,
      })
      .from(learningTopics)
      .innerJoin(topics, eq(learningTopics.topicId, topics.id))
      .where(inArray(learningTopics.learningEntryId, ids))
      .orderBy(topics.name),
    db
      .select({
        learningEntryId: learningArticles.learningEntryId,
        id: articles.id,
        title: articles.title,
        slug: articles.slug,
        publicationStatus: articles.publicationStatus,
        visibility: articles.visibility,
      })
      .from(learningArticles)
      .innerJoin(articles, eq(learningArticles.articleId, articles.id))
      .where(
        and(
          inArray(learningArticles.learningEntryId, ids),
          publicArticleCondition,
        ),
      )
      .orderBy(articles.title),
    db
      .select({
        learningEntryId: learningNotes.learningEntryId,
        id: notes.id,
        title: notes.title,
        slug: notes.slug,
        publicationStatus: notes.publicationStatus,
        visibility: notes.visibility,
      })
      .from(learningNotes)
      .innerJoin(notes, eq(learningNotes.noteId, notes.id))
      .where(
        and(inArray(learningNotes.learningEntryId, ids), publicNoteCondition),
      )
      .orderBy(notes.title),
    db
      .select({
        learningEntryId: learningProjects.learningEntryId,
        id: projects.id,
        title: projects.name,
        slug: projects.slug,
        publicationStatus: projects.publicationStatus,
        visibility: projects.visibility,
      })
      .from(learningProjects)
      .innerJoin(projects, eq(learningProjects.projectId, projects.id))
      .where(
        and(
          inArray(learningProjects.learningEntryId, ids),
          publicProjectCondition,
        ),
      )
      .orderBy(projects.name),
  ]);

  function relatedFor(
    id: string,
    relatedRows: Array<RelatedContent & { learningEntryId: string }>,
  ) {
    return relatedRows
      .filter((item) => item.learningEntryId === id)
      .map(({ id, title, slug, publicationStatus, visibility }) => ({
        id,
        title,
        slug,
        publicationStatus,
        visibility,
      }));
  }

  return rows.map((row) => ({
    ...row,
    topics: topicRows
      .filter((item) => item.learningEntryId === row.id)
      .map(({ id, name, slug }) => ({ id, name, slug })),
    articles: relatedFor(row.id, articleRows),
    notes: relatedFor(row.id, noteRows),
    projects: relatedFor(row.id, projectRows),
  }));
}

export async function getAdminLearningEntries() {
  const db = await getDatabase();
  const rows = await db
    .select()
    .from(learningEntries)
    .orderBy(desc(learningEntries.updatedAt));
  return attachRelations(rows);
}

export async function getAdminLearningEntryById(
  id: string,
): Promise<LearningEntryWithRelations | undefined> {
  const db = await getDatabase();
  const [entry] = await db
    .select()
    .from(learningEntries)
    .where(eq(learningEntries.id, id))
    .limit(1);
  if (!entry) return undefined;
  return (await attachRelations([entry]))[0];
}

export async function getLearningRelationOptions(): Promise<LearningRelationOptions> {
  const db = await getDatabase();
  const [articleRows, noteRows, projectRows] = await Promise.all([
    db
      .select({
        id: articles.id,
        title: articles.title,
        slug: articles.slug,
        publicationStatus: articles.publicationStatus,
        visibility: articles.visibility,
      })
      .from(articles)
      .orderBy(articles.title),
    db
      .select({
        id: notes.id,
        title: notes.title,
        slug: notes.slug,
        publicationStatus: notes.publicationStatus,
        visibility: notes.visibility,
      })
      .from(notes)
      .orderBy(notes.title),
    db
      .select({
        id: projects.id,
        title: projects.name,
        slug: projects.slug,
        publicationStatus: projects.publicationStatus,
        visibility: projects.visibility,
      })
      .from(projects)
      .orderBy(projects.name),
  ]);
  return { articles: articleRows, notes: noteRows, projects: projectRows };
}

export async function learningSelectionExists(values: {
  topicIds: string[];
  articleIds: string[];
  noteIds: string[];
  projectIds: string[];
}) {
  const db = await getDatabase();
  const [topicRows, articleRows, noteRows, projectRows] = await Promise.all([
    values.topicIds.length
      ? db
          .select({ id: topics.id })
          .from(topics)
          .where(inArray(topics.id, values.topicIds))
      : Promise.resolve([]),
    values.articleIds.length
      ? db
          .select({ id: articles.id })
          .from(articles)
          .where(inArray(articles.id, values.articleIds))
      : Promise.resolve([]),
    values.noteIds.length
      ? db
          .select({ id: notes.id })
          .from(notes)
          .where(inArray(notes.id, values.noteIds))
      : Promise.resolve([]),
    values.projectIds.length
      ? db
          .select({ id: projects.id })
          .from(projects)
          .where(inArray(projects.id, values.projectIds))
      : Promise.resolve([]),
  ]);
  return (
    topicRows.length === values.topicIds.length &&
    articleRows.length === values.articleIds.length &&
    noteRows.length === values.noteIds.length &&
    projectRows.length === values.projectIds.length
  );
}

async function insertJunctions(
  transaction: Parameters<
    Parameters<Awaited<ReturnType<typeof getDatabase>>["transaction"]>[0]
  >[0],
  learningEntryId: string,
  values: LearningFormValues,
) {
  const inserts = [];
  if (values.topicIds.length)
    inserts.push(
      transaction
        .insert(learningTopics)
        .values(
          values.topicIds.map((topicId) => ({ learningEntryId, topicId })),
        ),
    );
  if (values.articleIds.length)
    inserts.push(
      transaction.insert(learningArticles).values(
        values.articleIds.map((articleId) => ({
          learningEntryId,
          articleId,
        })),
      ),
    );
  if (values.noteIds.length)
    inserts.push(
      transaction
        .insert(learningNotes)
        .values(values.noteIds.map((noteId) => ({ learningEntryId, noteId }))),
    );
  if (values.projectIds.length)
    inserts.push(
      transaction.insert(learningProjects).values(
        values.projectIds.map((projectId) => ({
          learningEntryId,
          projectId,
        })),
      ),
    );
  await Promise.all(inserts);
}

export async function createLearningEntryRecord(values: LearningFormValues) {
  const db = await getDatabase();
  return db.transaction(async (transaction) => {
    const [entry] = await transaction
      .insert(learningEntries)
      .values({
        title: values.title,
        description: values.description,
        date: values.date,
        learningStatus: values.learningStatus,
        publicationStatus: values.publicationStatus,
        visibility: values.visibility,
      })
      .returning({ id: learningEntries.id });
    await insertJunctions(transaction, entry.id, values);
    return entry;
  });
}

export async function updateLearningEntryRecord(
  existing: LearningEntry,
  values: LearningFormValues,
) {
  const db = await getDatabase();
  return db.transaction(async (transaction) => {
    const [entry] = await transaction
      .update(learningEntries)
      .set({
        title: values.title,
        description: values.description,
        date: values.date,
        learningStatus: values.learningStatus,
        publicationStatus: values.publicationStatus,
        visibility: values.visibility,
        updatedAt: new Date(),
      })
      .where(eq(learningEntries.id, existing.id))
      .returning({ id: learningEntries.id });
    if (!entry) return undefined;
    await Promise.all([
      transaction
        .delete(learningTopics)
        .where(eq(learningTopics.learningEntryId, existing.id)),
      transaction
        .delete(learningArticles)
        .where(eq(learningArticles.learningEntryId, existing.id)),
      transaction
        .delete(learningNotes)
        .where(eq(learningNotes.learningEntryId, existing.id)),
      transaction
        .delete(learningProjects)
        .where(eq(learningProjects.learningEntryId, existing.id)),
    ]);
    await insertJunctions(transaction, existing.id, values);
    return entry;
  });
}

export async function deleteLearningEntryRecord(id: string) {
  const db = await getDatabase();
  const [entry] = await db
    .delete(learningEntries)
    .where(eq(learningEntries.id, id))
    .returning({ id: learningEntries.id });
  return entry;
}

const publicLearningCondition = and(
  eq(learningEntries.publicationStatus, "published"),
  eq(learningEntries.visibility, "public"),
);

export type PublicLearningFilters = {
  topic?: string;
  limit?: number;
};

export async function getPublicLearningEntries(
  filters: PublicLearningFilters = {},
) {
  const db = await getDatabase();
  const conditions = [publicLearningCondition];
  if (filters.topic)
    conditions.push(sql`exists (
      select 1 from ${learningTopics}
      inner join ${topics} on ${learningTopics.topicId} = ${topics.id}
      where ${learningTopics.learningEntryId} = ${learningEntries.id}
        and ${topics.slug} = ${filters.topic}
    )`);
  const query = db
    .select()
    .from(learningEntries)
    .where(and(...conditions))
    .orderBy(desc(learningEntries.date), desc(learningEntries.updatedAt));
  const rows = filters.limit ? await query.limit(filters.limit) : await query;
  return attachRelations(rows, true);
}

export async function getPublicLearningTopics(): Promise<TaxonomyOption[]> {
  const db = await getDatabase();
  return db
    .selectDistinct({ id: topics.id, name: topics.name, slug: topics.slug })
    .from(topics)
    .innerJoin(learningTopics, eq(topics.id, learningTopics.topicId))
    .innerJoin(
      learningEntries,
      eq(learningTopics.learningEntryId, learningEntries.id),
    )
    .where(publicLearningCondition)
    .orderBy(topics.name);
}

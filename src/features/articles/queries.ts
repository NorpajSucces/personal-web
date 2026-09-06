import "server-only";

import { and, desc, eq, inArray, ne, sql } from "drizzle-orm";

import { articleTags, articleTopics, articles } from "@/db/schema/articles";
import { tags, topics } from "@/db/schema/taxonomy";

import type { ArticleFormValues } from "./schema";
import { resolvePublishedAt } from "./publishing";
import type {
  Article,
  ArticleSummary,
  ArticleWithTaxonomy,
  TaxonomyOption,
} from "./types";

const summaryColumns = {
  id: articles.id,
  title: articles.title,
  slug: articles.slug,
  excerpt: articles.excerpt,
  publicationStatus: articles.publicationStatus,
  visibility: articles.visibility,
  publishedAt: articles.publishedAt,
  createdAt: articles.createdAt,
  updatedAt: articles.updatedAt,
};

async function getDatabase() {
  return (await import("@/db")).db;
}

async function attachTaxonomy<
  T extends Article | Omit<ArticleSummary, "topics" | "tags">,
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
        articleId: articleTopics.articleId,
        id: topics.id,
        name: topics.name,
        slug: topics.slug,
      })
      .from(articleTopics)
      .innerJoin(topics, eq(articleTopics.topicId, topics.id))
      .where(inArray(articleTopics.articleId, ids))
      .orderBy(topics.name),
    db
      .select({
        articleId: articleTags.articleId,
        id: tags.id,
        name: tags.name,
        slug: tags.slug,
      })
      .from(articleTags)
      .innerJoin(tags, eq(articleTags.tagId, tags.id))
      .where(inArray(articleTags.articleId, ids))
      .orderBy(tags.name),
  ]);
  return rows.map((row) => ({
    ...row,
    topics: topicRows
      .filter((item) => item.articleId === row.id)
      .map(({ id, name, slug }) => ({ id, name, slug })),
    tags: tagRows
      .filter((item) => item.articleId === row.id)
      .map(({ id, name, slug }) => ({ id, name, slug })),
  }));
}

export async function getAdminArticles(): Promise<ArticleSummary[]> {
  const db = await getDatabase();
  const rows = await db
    .select(summaryColumns)
    .from(articles)
    .orderBy(desc(articles.updatedAt));
  return attachTaxonomy(rows);
}

export async function getAdminArticleById(
  id: string,
): Promise<ArticleWithTaxonomy | undefined> {
  const db = await getDatabase();
  const [article] = await db
    .select()
    .from(articles)
    .where(eq(articles.id, id))
    .limit(1);
  if (!article) return undefined;
  return (await attachTaxonomy([article]))[0];
}

export async function isArticleSlugAvailable(slug: string, excludeId?: string) {
  const db = await getDatabase();
  const condition = excludeId
    ? and(eq(articles.slug, slug), ne(articles.id, excludeId))
    : eq(articles.slug, slug);
  const [article] = await db
    .select({ id: articles.id })
    .from(articles)
    .where(condition)
    .limit(1);
  return !article;
}

export async function taxonomySelectionExists(
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

export async function createArticleRecord(values: ArticleFormValues) {
  const db = await getDatabase();
  return db.transaction(async (transaction) => {
    const [article] = await transaction
      .insert(articles)
      .values({
        title: values.title,
        slug: values.slug,
        excerpt: values.excerpt,
        content: values.content,
        publicationStatus: values.publicationStatus,
        visibility: values.visibility,
        publishedAt: resolvePublishedAt(null, values.publicationStatus),
      })
      .returning({ id: articles.id });
    if (values.topicIds.length)
      await transaction.insert(articleTopics).values(
        values.topicIds.map((topicId) => ({
          articleId: article.id,
          topicId,
        })),
      );
    if (values.tagIds.length)
      await transaction
        .insert(articleTags)
        .values(
          values.tagIds.map((tagId) => ({ articleId: article.id, tagId })),
        );
    return article;
  });
}

export async function updateArticleRecord(
  existing: Article,
  values: ArticleFormValues,
) {
  const db = await getDatabase();
  return db.transaction(async (transaction) => {
    const publishedAt = resolvePublishedAt(
      existing.publishedAt,
      values.publicationStatus,
    );
    const [article] = await transaction
      .update(articles)
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
      .where(eq(articles.id, existing.id))
      .returning({ id: articles.id });
    if (!article) return undefined;
    await Promise.all([
      transaction
        .delete(articleTopics)
        .where(eq(articleTopics.articleId, existing.id)),
      transaction
        .delete(articleTags)
        .where(eq(articleTags.articleId, existing.id)),
    ]);
    if (values.topicIds.length)
      await transaction.insert(articleTopics).values(
        values.topicIds.map((topicId) => ({
          articleId: existing.id,
          topicId,
        })),
      );
    if (values.tagIds.length)
      await transaction
        .insert(articleTags)
        .values(
          values.tagIds.map((tagId) => ({ articleId: existing.id, tagId })),
        );
    return article;
  });
}

export async function deleteArticleRecord(id: string) {
  const db = await getDatabase();
  const [article] = await db
    .delete(articles)
    .where(eq(articles.id, id))
    .returning({ id: articles.id });
  return article;
}

const publicCondition = and(
  eq(articles.publicationStatus, "published"),
  eq(articles.visibility, "public"),
);

export type PublicArticleFilters = {
  topic?: string;
  tag?: string;
  limit?: number;
};

export async function getPublicArticles(
  filters: PublicArticleFilters = {},
): Promise<ArticleSummary[]> {
  const db = await getDatabase();
  const conditions = [publicCondition];
  if (filters.topic)
    conditions.push(sql`exists (
      select 1 from ${articleTopics}
      inner join ${topics} on ${articleTopics.topicId} = ${topics.id}
      where ${articleTopics.articleId} = ${articles.id}
        and ${topics.slug} = ${filters.topic}
    )`);
  if (filters.tag)
    conditions.push(sql`exists (
      select 1 from ${articleTags}
      inner join ${tags} on ${articleTags.tagId} = ${tags.id}
      where ${articleTags.articleId} = ${articles.id}
        and ${tags.slug} = ${filters.tag}
    )`);
  const query = db
    .select(summaryColumns)
    .from(articles)
    .where(and(...conditions))
    .orderBy(desc(articles.publishedAt), desc(articles.updatedAt));
  const rows = filters.limit ? await query.limit(filters.limit) : await query;
  return attachTaxonomy(rows);
}

export async function getPublicArticleBySlug(
  slug: string,
): Promise<ArticleWithTaxonomy | undefined> {
  const db = await getDatabase();
  const [article] = await db
    .select()
    .from(articles)
    .where(and(publicCondition, eq(articles.slug, slug)))
    .limit(1);
  if (!article) return undefined;
  return (await attachTaxonomy([article]))[0];
}

export async function getPublicArticleTaxonomy() {
  const db = await getDatabase();
  const [topicRows, tagRows] = await Promise.all([
    db
      .selectDistinct({ id: topics.id, name: topics.name, slug: topics.slug })
      .from(topics)
      .innerJoin(articleTopics, eq(topics.id, articleTopics.topicId))
      .innerJoin(articles, eq(articleTopics.articleId, articles.id))
      .where(publicCondition)
      .orderBy(topics.name),
    db
      .selectDistinct({ id: tags.id, name: tags.name, slug: tags.slug })
      .from(tags)
      .innerJoin(articleTags, eq(tags.id, articleTags.tagId))
      .innerJoin(articles, eq(articleTags.articleId, articles.id))
      .where(publicCondition)
      .orderBy(tags.name),
  ]);
  return { topics: topicRows, tags: tagRows };
}

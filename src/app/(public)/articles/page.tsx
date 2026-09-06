import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";

import { Container } from "@/components/shared/container";
import { PageIntro } from "@/components/shared/page-intro";
import { ArticleGrid } from "@/features/articles/article-card";
import {
  getPublicArticles,
  getPublicArticleTaxonomy,
} from "@/features/articles/queries";

export const metadata: Metadata = {
  title: "Articles",
};

function filterHref(topic?: string, tag?: string) {
  const query = new URLSearchParams();
  if (topic) query.set("topic", topic);
  if (tag) query.set("tag", tag);
  const value = query.toString();
  return value ? `/articles?${value}` : "/articles";
}

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string; tag?: string }>;
}) {
  await connection();
  const filters = await searchParams;
  const [{ topics, tags }, articles] = await Promise.all([
    getPublicArticleTaxonomy(),
    getPublicArticles({ topic: filters.topic, tag: filters.tag }),
  ]);
  return (
    <>
      <PageIntro
        title="Articles"
        description="Developed, long-form writing across technical and personal subjects."
      />
      <Container className="pb-[var(--section-space)]">
        {topics.length || tags.length ? (
          <nav
            aria-label="Filter Articles"
            className="mb-8 space-y-4 border-y py-5"
          >
            {topics.length ? (
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="mr-1 font-medium">Topics</span>
                {topics.map((topic) => (
                  <Link
                    key={topic.id}
                    href={filterHref(
                      filters.topic === topic.slug ? undefined : topic.slug,
                      filters.tag,
                    )}
                    aria-current={
                      filters.topic === topic.slug ? "page" : undefined
                    }
                    className="rounded-full border px-3 py-1.5 aria-current:border-primary aria-current:bg-accent"
                  >
                    {topic.name}
                  </Link>
                ))}
              </div>
            ) : null}
            {tags.length ? (
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="mr-1 font-medium">Tags</span>
                {tags.map((tag) => (
                  <Link
                    key={tag.id}
                    href={filterHref(
                      filters.topic,
                      filters.tag === tag.slug ? undefined : tag.slug,
                    )}
                    aria-current={filters.tag === tag.slug ? "page" : undefined}
                    className="rounded-full border px-3 py-1.5 aria-current:border-primary aria-current:bg-accent"
                  >
                    #{tag.name}
                  </Link>
                ))}
              </div>
            ) : null}
            {filters.topic || filters.tag ? (
              <Link
                href="/articles"
                className="inline-block text-sm text-primary hover:underline"
              >
                Clear filters
              </Link>
            ) : null}
          </nav>
        ) : null}
        {articles.length ? (
          <ArticleGrid articles={articles} />
        ) : (
          <section
            className="rounded-lg border bg-card p-6"
            aria-labelledby="articles-empty"
          >
            <h2 id="articles-empty" className="font-serif text-2xl">
              {filters.topic || filters.tag
                ? "No matching Articles"
                : "No public Articles yet"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {filters.topic || filters.tag
                ? "Try another Topic or Tag, or clear the current filters."
                : "Published writing will appear here as the collection grows."}
            </p>
          </section>
        )}
      </Container>
    </>
  );
}

import Link from "next/link";

import { SurfaceCard } from "@/components/shared/surface-card";

import type { ArticleSummary } from "./types";

export function formatArticleDate(date: Date | null) {
  return date?.toLocaleDateString("en", { dateStyle: "long" }) ?? "Unscheduled";
}

export function ArticleCard({ article }: { article: ArticleSummary }) {
  return (
    <SurfaceCard className="flex h-full min-w-0 flex-col">
      <p className="text-xs font-semibold tracking-[0.15em] text-primary uppercase">
        {formatArticleDate(article.publishedAt)}
      </p>
      <h2 className="mt-3 font-serif text-3xl leading-tight wrap-anywhere">
        <Link
          href={`/articles/${article.slug}`}
          className="rounded-sm hover:text-primary"
        >
          {article.title}
        </Link>
      </h2>
      <p className="mt-4 whitespace-pre-line text-sm leading-6 wrap-anywhere text-muted-foreground">
        {article.excerpt}
      </p>
      {article.topics.length || article.tags.length ? (
        <div className="mt-5 space-y-2 text-xs">
          {article.topics.length ? (
            <p className="flex flex-wrap gap-2" aria-label="Topics">
              {article.topics.map((topic) => (
                <span
                  key={topic.id}
                  className="rounded-full border px-2.5 py-1"
                >
                  {topic.name}
                </span>
              ))}
            </p>
          ) : null}
          {article.tags.length ? (
            <p
              className="flex flex-wrap gap-x-3 gap-y-1 text-muted-foreground"
              aria-label="Tags"
            >
              {article.tags.map((tag) => (
                <span key={tag.id}>#{tag.name}</span>
              ))}
            </p>
          ) : null}
        </div>
      ) : null}
      <Link
        href={`/articles/${article.slug}`}
        className="mt-auto inline-flex min-h-10 items-center pt-6 text-sm font-medium text-primary hover:underline"
      >
        Read Article →
      </Link>
    </SurfaceCard>
  );
}

export function ArticleGrid({ articles }: { articles: ArticleSummary[] }) {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  );
}

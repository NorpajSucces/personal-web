import Link from "next/link";

import { Container } from "@/components/shared/container";
import { RichTextRenderer } from "@/features/rich-text/renderer";

import { formatArticleDate } from "./article-card";
import type { ArticleWithTaxonomy } from "./types";

export function ArticleDetail({
  article,
  preview = false,
}: {
  article: ArticleWithTaxonomy;
  preview?: boolean;
}) {
  return (
    <Container>
      <article className="mx-auto max-w-[var(--container-reading)] py-[clamp(4rem,10vw,8rem)]">
        {preview ? (
          <p className="mb-5 rounded-md border border-primary/40 bg-accent px-4 py-3 text-sm text-accent-foreground">
            Admin preview · {article.publicationStatus} · {article.visibility}
          </p>
        ) : null}
        <Link
          href={preview ? "/admin/articles" : "/articles"}
          className="inline-flex min-h-10 items-center rounded-sm text-sm text-primary hover:underline"
        >
          ← {preview ? "Back to Articles admin" : "All Articles"}
        </Link>
        <p className="mt-8 text-xs font-semibold tracking-[0.18em] text-primary uppercase">
          {article.publishedAt
            ? formatArticleDate(article.publishedAt)
            : preview
              ? "Not published yet"
              : "Article"}
        </p>
        <h1 className="mt-4 font-serif text-[clamp(3rem,8vw,5.5rem)] leading-[0.95] font-medium tracking-[-0.04em] wrap-anywhere text-balance">
          {article.title}
        </h1>
        <p className="mt-7 whitespace-pre-line text-lg leading-8 wrap-anywhere text-muted-foreground">
          {article.excerpt}
        </p>
        {article.topics.length || article.tags.length ? (
          <div className="mt-7 space-y-3 border-y py-5 text-sm">
            {article.topics.length ? (
              <p className="flex flex-wrap items-center gap-2">
                <span className="font-medium">Topics:</span>
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
              <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground">
                <span className="font-medium text-foreground">Tags:</span>
                {article.tags.map((tag) => (
                  <span key={tag.id}>#{tag.name}</span>
                ))}
              </p>
            ) : null}
          </div>
        ) : null}
        <div className="mt-10">
          <RichTextRenderer content={article.content} />
        </div>
      </article>
    </Container>
  );
}

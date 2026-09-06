import type { Metadata } from "next";
import Link from "next/link";

import { formatArticleDate } from "@/features/articles/article-card";
import { DeleteArticleButton } from "@/features/articles/delete-article-button";
import { getAdminArticles } from "@/features/articles/queries";
import { requireAdmin } from "@/lib/auth/admin";

export const metadata: Metadata = { title: "Articles" };

export default async function ArticlesAdminPage() {
  await requireAdmin();
  const articles = await getAdminArticles();
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <h1 className="font-serif text-4xl tracking-tight">Articles</h1>
          <p className="mt-3 max-w-prose text-muted-foreground">
            Write, organize, preview, and publish long-form work.
          </p>
        </div>
        <Link
          href="/admin/articles/new"
          className="inline-flex min-h-11 items-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          New Article
        </Link>
      </div>
      {articles.length ? (
        <div className="mt-8 space-y-4">
          {articles.map((article) => {
            const isPublic =
              article.publicationStatus === "published" &&
              article.visibility === "public";
            return (
              <article
                key={article.id}
                className="rounded-lg border bg-card p-5 sm:p-6"
              >
                <div className="flex flex-col gap-5 sm:flex-row sm:justify-between">
                  <div className="min-w-0">
                    <h2 className="font-serif text-2xl wrap-anywhere">
                      {article.title}
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground wrap-anywhere">
                      /{article.slug}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2 text-xs">
                      <span className="rounded-full border px-2.5 py-1 capitalize">
                        {article.publicationStatus}
                      </span>
                      <span className="rounded-full border px-2.5 py-1 capitalize">
                        {article.visibility}
                      </span>
                      {article.topics.map((topic) => (
                        <span
                          key={topic.id}
                          className="rounded-full bg-muted px-2.5 py-1"
                        >
                          {topic.name}
                        </span>
                      ))}
                      {article.tags.map((tag) => (
                        <span
                          key={tag.id}
                          className="px-1 py-1 text-muted-foreground"
                        >
                          #{tag.name}
                        </span>
                      ))}
                    </div>
                    <p className="mt-4 text-xs text-muted-foreground">
                      {article.publishedAt
                        ? `Published ${formatArticleDate(article.publishedAt)}`
                        : `Updated ${article.updatedAt.toLocaleDateString("en", { dateStyle: "medium" })}`}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-1">
                    <Link
                      href={`/admin/articles/${article.id}/edit`}
                      className="inline-flex min-h-10 items-center rounded-md px-3 text-sm text-primary hover:bg-accent"
                    >
                      Edit
                    </Link>
                    <Link
                      href={`/admin/articles/${article.id}/preview`}
                      className="inline-flex min-h-10 items-center rounded-md px-3 text-sm text-primary hover:bg-accent"
                    >
                      Preview
                    </Link>
                    {isPublic ? (
                      <Link
                        href={`/articles/${article.slug}`}
                        className="inline-flex min-h-10 items-center rounded-md px-3 text-sm text-primary hover:bg-accent"
                      >
                        View
                      </Link>
                    ) : null}
                    <DeleteArticleButton
                      id={article.id}
                      title={article.title}
                    />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <section
          className="mt-8 rounded-lg border bg-card p-6"
          aria-labelledby="empty-articles"
        >
          <h2 id="empty-articles" className="font-serif text-2xl">
            No Articles yet
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Create a private draft and preview the reading experience before
            publishing.
          </p>
          <Link
            href="/admin/articles/new"
            className="mt-5 inline-flex min-h-11 items-center rounded-md border px-4 text-sm font-medium text-primary hover:bg-accent"
          >
            Create Article
          </Link>
        </section>
      )}
    </>
  );
}

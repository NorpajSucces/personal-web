import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { cache } from "react";

import { ArticleDetail } from "@/features/articles/article-detail";
import { getPublicArticleBySlug } from "@/features/articles/queries";
import { createNotFoundMetadata, createPublicMetadata } from "@/lib/seo";

const getArticle = cache(getPublicArticleBySlug);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return createNotFoundMetadata();

  return createPublicMetadata({
    title: article.title,
    description: article.excerpt,
    path: `/articles/${article.slug}`,
    type: "article",
    publishedAt: article.publishedAt,
    updatedAt: article.updatedAt,
  });
}

export default async function PublicArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await connection();
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();
  return <ArticleDetail article={article} />;
}

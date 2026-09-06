import { notFound } from "next/navigation";
import { connection } from "next/server";

import { ArticleDetail } from "@/features/articles/article-detail";
import { getPublicArticleBySlug } from "@/features/articles/queries";

export default async function PublicArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await connection();
  const { slug } = await params;
  const article = await getPublicArticleBySlug(slug);
  if (!article) notFound();
  return <ArticleDetail article={article} />;
}

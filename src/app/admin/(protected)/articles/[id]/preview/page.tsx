import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ArticleDetail } from "@/features/articles/article-detail";
import { getAdminArticleById } from "@/features/articles/queries";
import { articleIdSchema } from "@/features/articles/schema";
import { requireAdmin } from "@/lib/auth/admin";

export const metadata: Metadata = { title: "Article Preview" };

export default async function ArticlePreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const idResult = articleIdSchema.safeParse(id);
  if (!idResult.success) notFound();
  const article = await getAdminArticleById(idResult.data);
  if (!article) notFound();
  return <ArticleDetail article={article} preview />;
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { updateArticle } from "@/features/articles/actions";
import { ArticleForm } from "@/features/articles/article-form";
import { getAdminArticleById } from "@/features/articles/queries";
import { articleIdSchema } from "@/features/articles/schema";
import { isRichTextDocument } from "@/features/rich-text/contract";
import { getTaxonomyOptions } from "@/features/taxonomy/queries";
import { requireAdmin } from "@/lib/auth/admin";

export const metadata: Metadata = { title: "Edit Article" };

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const idResult = articleIdSchema.safeParse(id);
  if (!idResult.success) notFound();
  const [article, taxonomy] = await Promise.all([
    getAdminArticleById(idResult.data),
    getTaxonomyOptions(),
  ]);
  if (!article || !isRichTextDocument(article.content)) notFound();
  return (
    <>
      <h1 className="font-serif text-4xl tracking-tight">Edit Article</h1>
      <p className="mt-3 mb-8 max-w-prose text-muted-foreground">
        Changing the title does not alter its slug. Change the public URL
        deliberately.
      </p>
      <ArticleForm
        action={updateArticle.bind(null, article.id)}
        initialValues={{
          title: article.title,
          slug: article.slug,
          excerpt: article.excerpt,
          content: article.content,
          publicationStatus: article.publicationStatus,
          visibility: article.visibility,
          topicIds: article.topics.map((topic) => topic.id),
          tagIds: article.tags.map((tag) => tag.id),
          publishedAt:
            article.publishedAt?.toLocaleDateString("en", {
              dateStyle: "long",
            }) ?? null,
        }}
        initialTopics={taxonomy.topics}
        initialTags={taxonomy.tags}
        mode="edit"
        hasCoverImage={Boolean(article.coverImagePath)}
      />
    </>
  );
}

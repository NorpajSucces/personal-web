import type { Metadata } from "next";

import { createArticle } from "@/features/articles/actions";
import {
  ArticleForm,
  newArticleValues,
} from "@/features/articles/article-form";
import { getTaxonomyOptions } from "@/features/taxonomy/queries";
import { requireAdmin } from "@/lib/auth/admin";

export const metadata: Metadata = { title: "New Article" };

export default async function NewArticlePage() {
  await requireAdmin();
  const taxonomy = await getTaxonomyOptions();
  return (
    <>
      <h1 className="font-serif text-4xl tracking-tight">New Article</h1>
      <p className="mt-3 mb-8 max-w-prose text-muted-foreground">
        New Articles start as private drafts. Rich content is saved as canonical
        Tiptap JSON.
      </p>
      <ArticleForm
        action={createArticle}
        initialValues={newArticleValues}
        initialTopics={taxonomy.topics}
        initialTags={taxonomy.tags}
        mode="create"
      />
    </>
  );
}

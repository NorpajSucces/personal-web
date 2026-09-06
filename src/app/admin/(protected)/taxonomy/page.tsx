import type { Metadata } from "next";

import {
  DeleteTaxonomyButton,
  TaxonomyCreateForm,
  TaxonomyEditForm,
} from "@/features/taxonomy/taxonomy-forms";
import { getAdminTaxonomy } from "@/features/taxonomy/queries";
import { requireAdmin } from "@/lib/auth/admin";

export const metadata: Metadata = { title: "Topics & Tags" };

export default async function TaxonomyPage() {
  await requireAdmin();
  const taxonomy = await getAdminTaxonomy();
  return (
    <>
      <h1 className="font-serif text-4xl tracking-tight">Topics & Tags</h1>
      <p className="mt-3 max-w-prose text-muted-foreground">
        Shared organization for Articles, Notes, and Learning. Deleting an item
        removes relationships, never the content itself.
      </p>
      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <section
          className="rounded-lg border bg-card p-5 sm:p-6"
          aria-labelledby="topics-title"
        >
          <h2 id="topics-title" className="font-serif text-3xl">
            Topics
          </h2>
          <TaxonomyCreateForm kind="topic" />
          <div className="mt-6 space-y-4">
            {taxonomy.topics.length ? (
              taxonomy.topics.map((topic) => (
                <article key={topic.id} className="rounded-md border p-4">
                  <TaxonomyEditForm
                    kind="topic"
                    id={topic.id}
                    name={topic.name}
                  />
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs text-muted-foreground">
                      /{topic.slug} · {topic.articleCount} Articles ·{" "}
                      {topic.noteCount} Notes · {topic.learningCount} Learning
                    </p>
                    <DeleteTaxonomyButton
                      kind="topic"
                      id={topic.id}
                      name={topic.name}
                    />
                  </div>
                </article>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No Topics yet.</p>
            )}
          </div>
        </section>
        <section
          className="rounded-lg border bg-card p-5 sm:p-6"
          aria-labelledby="tags-title"
        >
          <h2 id="tags-title" className="font-serif text-3xl">
            Tags
          </h2>
          <TaxonomyCreateForm kind="tag" />
          <div className="mt-6 space-y-4">
            {taxonomy.tags.length ? (
              taxonomy.tags.map((tag) => (
                <article key={tag.id} className="rounded-md border p-4">
                  <TaxonomyEditForm kind="tag" id={tag.id} name={tag.name} />
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs text-muted-foreground">
                      /{tag.slug} · {tag.articleCount} Articles ·{" "}
                      {tag.noteCount} Notes
                    </p>
                    <DeleteTaxonomyButton
                      kind="tag"
                      id={tag.id}
                      name={tag.name}
                    />
                  </div>
                </article>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No Tags yet.</p>
            )}
          </div>
        </section>
      </div>
    </>
  );
}

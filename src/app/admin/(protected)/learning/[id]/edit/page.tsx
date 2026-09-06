import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { updateLearningEntry } from "@/features/learning/actions";
import {
  dateInputValue,
  LearningForm,
} from "@/features/learning/learning-form";
import {
  getAdminLearningEntryById,
  getLearningRelationOptions,
} from "@/features/learning/queries";
import { learningEntryIdSchema } from "@/features/learning/schema";
import { getTaxonomyOptions } from "@/features/taxonomy/queries";
import { requireAdmin } from "@/lib/auth/admin";

export const metadata: Metadata = { title: "Edit Learning Entry" };

export default async function EditLearningPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const idResult = learningEntryIdSchema.safeParse(id);
  if (!idResult.success) notFound();
  const [entry, taxonomy, relationOptions] = await Promise.all([
    getAdminLearningEntryById(idResult.data),
    getTaxonomyOptions(),
    getLearningRelationOptions(),
  ]);
  if (!entry) notFound();
  return (
    <>
      <h1 className="font-serif text-4xl tracking-tight">
        Edit Learning Entry
      </h1>
      <p className="mt-3 mb-8 max-w-prose text-muted-foreground">
        Update the chronology, stage, relationships, and publication boundary.
      </p>
      <LearningForm
        action={updateLearningEntry.bind(null, entry.id)}
        initialValues={{
          title: entry.title,
          description: entry.description,
          date: dateInputValue(entry.date),
          learningStatus: entry.learningStatus,
          publicationStatus: entry.publicationStatus,
          visibility: entry.visibility,
          topicIds: entry.topics.map((topic) => topic.id),
          articleIds: entry.articles.map((article) => article.id),
          noteIds: entry.notes.map((note) => note.id),
          projectIds: entry.projects.map((project) => project.id),
        }}
        initialTopics={taxonomy.topics}
        relationOptions={relationOptions}
        mode="edit"
      />
    </>
  );
}

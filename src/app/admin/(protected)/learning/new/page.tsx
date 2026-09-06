import type { Metadata } from "next";

import { createLearningEntry } from "@/features/learning/actions";
import {
  LearningForm,
  newLearningValues,
} from "@/features/learning/learning-form";
import { getLearningRelationOptions } from "@/features/learning/queries";
import { getTaxonomyOptions } from "@/features/taxonomy/queries";
import { requireAdmin } from "@/lib/auth/admin";

export const metadata: Metadata = { title: "New Learning Entry" };

export default async function NewLearningPage() {
  await requireAdmin();
  const [taxonomy, relationOptions] = await Promise.all([
    getTaxonomyOptions(),
    getLearningRelationOptions(),
  ]);
  return (
    <>
      <h1 className="font-serif text-4xl tracking-tight">New Learning Entry</h1>
      <p className="mt-3 mb-8 max-w-prose text-muted-foreground">
        New entries start as private drafts. Capture a concise moment in the
        learning journey and optionally connect related work.
      </p>
      <LearningForm
        action={createLearningEntry}
        initialValues={newLearningValues}
        initialTopics={taxonomy.topics}
        relationOptions={relationOptions}
        mode="create"
      />
    </>
  );
}

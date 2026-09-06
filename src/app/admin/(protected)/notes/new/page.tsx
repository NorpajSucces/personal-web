import type { Metadata } from "next";

import { createNote } from "@/features/notes/actions";
import { newNoteValues, NoteForm } from "@/features/notes/note-form";
import { getTaxonomyOptions } from "@/features/taxonomy/queries";
import { requireAdmin } from "@/lib/auth/admin";

export const metadata: Metadata = { title: "New Note" };

export default async function NewNotePage() {
  await requireAdmin();
  const taxonomy = await getTaxonomyOptions();
  return (
    <>
      <h1 className="font-serif text-4xl tracking-tight">New Note</h1>
      <p className="mt-3 mb-8 max-w-prose text-muted-foreground">
        New Notes start as private drafts. Rich content uses the shared Tiptap
        JSON contract.
      </p>
      <NoteForm
        action={createNote}
        initialValues={newNoteValues}
        initialTopics={taxonomy.topics}
        initialTags={taxonomy.tags}
        mode="create"
      />
    </>
  );
}

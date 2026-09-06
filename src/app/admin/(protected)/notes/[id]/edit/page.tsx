import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { updateNote } from "@/features/notes/actions";
import { NoteForm } from "@/features/notes/note-form";
import { getAdminNoteById } from "@/features/notes/queries";
import { noteIdSchema } from "@/features/notes/schema";
import { isRichTextDocument } from "@/features/rich-text/contract";
import { getTaxonomyOptions } from "@/features/taxonomy/queries";
import { requireAdmin } from "@/lib/auth/admin";

export const metadata: Metadata = { title: "Edit Note" };

export default async function EditNotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const idResult = noteIdSchema.safeParse(id);
  if (!idResult.success) notFound();
  const [note, taxonomy] = await Promise.all([
    getAdminNoteById(idResult.data),
    getTaxonomyOptions(),
  ]);
  if (!note || !isRichTextDocument(note.content)) notFound();
  return (
    <>
      <h1 className="font-serif text-4xl tracking-tight">Edit Note</h1>
      <p className="mt-3 mb-8 max-w-prose text-muted-foreground">
        Changing the title does not alter its slug. Change the public URL
        deliberately.
      </p>
      <NoteForm
        action={updateNote.bind(null, note.id)}
        initialValues={{
          title: note.title,
          slug: note.slug,
          excerpt: note.excerpt,
          content: note.content,
          publicationStatus: note.publicationStatus,
          visibility: note.visibility,
          topicIds: note.topics.map((topic) => topic.id),
          tagIds: note.tags.map((tag) => tag.id),
          publishedAt:
            note.publishedAt?.toLocaleDateString("en", {
              dateStyle: "long",
            }) ?? null,
        }}
        initialTopics={taxonomy.topics}
        initialTags={taxonomy.tags}
        mode="edit"
        hasCoverImage={Boolean(note.coverImagePath)}
      />
    </>
  );
}

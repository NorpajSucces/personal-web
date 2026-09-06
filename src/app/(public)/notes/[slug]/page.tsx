import { notFound } from "next/navigation";
import { connection } from "next/server";

import { NoteDetail } from "@/features/notes/note-detail";
import { getPublicNoteBySlug } from "@/features/notes/queries";

export default async function PublicNotePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await connection();
  const { slug } = await params;
  const note = await getPublicNoteBySlug(slug);
  if (!note) notFound();
  return <NoteDetail note={note} />;
}

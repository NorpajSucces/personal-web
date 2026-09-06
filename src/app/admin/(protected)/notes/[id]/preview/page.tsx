import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { NoteDetail } from "@/features/notes/note-detail";
import { getAdminNoteById } from "@/features/notes/queries";
import { noteIdSchema } from "@/features/notes/schema";
import { requireAdmin } from "@/lib/auth/admin";

export const metadata: Metadata = { title: "Note Preview" };

export default async function NotePreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const idResult = noteIdSchema.safeParse(id);
  if (!idResult.success) notFound();
  const note = await getAdminNoteById(idResult.data);
  if (!note) notFound();
  return <NoteDetail note={note} preview />;
}

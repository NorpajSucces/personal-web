import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { cache } from "react";

import { NoteDetail } from "@/features/notes/note-detail";
import { getCachedPublicNoteBySlug } from "@/lib/cache/public-queries";
import { createNotFoundMetadata, createPublicMetadata } from "@/lib/seo";

const getNote = cache(getCachedPublicNoteBySlug);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const note = await getNote(slug);
  if (!note) return createNotFoundMetadata();

  return createPublicMetadata({
    title: note.title,
    description: note.excerpt,
    path: `/notes/${note.slug}`,
    type: "article",
    publishedAt: note.publishedAt,
    updatedAt: note.updatedAt,
  });
}

export default async function PublicNotePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await connection();
  const { slug } = await params;
  const note = await getNote(slug);
  if (!note) notFound();
  return <NoteDetail note={note} />;
}

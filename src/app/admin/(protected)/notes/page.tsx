import type { Metadata } from "next";
import Link from "next/link";

import { DeleteNoteButton } from "@/features/notes/delete-note-button";
import { formatNoteDate } from "@/features/notes/note-card";
import { getAdminNotes } from "@/features/notes/queries";
import { requireAdmin } from "@/lib/auth/admin";

export const metadata: Metadata = { title: "Notes" };

export default async function NotesAdminPage() {
  await requireAdmin();
  const notes = await getAdminNotes();
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <h1 className="font-serif text-4xl tracking-tight">Notes</h1>
          <p className="mt-3 max-w-prose text-muted-foreground">
            Capture, organize, preview, and publish shorter writing.
          </p>
        </div>
        <Link
          href="/admin/notes/new"
          className="inline-flex min-h-11 items-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          New Note
        </Link>
      </div>
      {notes.length ? (
        <div className="mt-8 space-y-4">
          {notes.map((note) => {
            const isPublic =
              note.publicationStatus === "published" &&
              note.visibility === "public";
            return (
              <article
                key={note.id}
                className="rounded-lg border bg-card p-5 sm:p-6"
              >
                <div className="flex flex-col gap-5 sm:flex-row sm:justify-between">
                  <div className="min-w-0">
                    <h2 className="font-serif text-2xl wrap-anywhere">
                      {note.title}
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground wrap-anywhere">
                      /{note.slug}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2 text-xs">
                      <span className="rounded-full border px-2.5 py-1 capitalize">
                        {note.publicationStatus}
                      </span>
                      <span className="rounded-full border px-2.5 py-1 capitalize">
                        {note.visibility}
                      </span>
                      {note.topics.map((topic) => (
                        <span
                          key={topic.id}
                          className="rounded-full bg-muted px-2.5 py-1"
                        >
                          {topic.name}
                        </span>
                      ))}
                      {note.tags.map((tag) => (
                        <span
                          key={tag.id}
                          className="px-1 py-1 text-muted-foreground"
                        >
                          #{tag.name}
                        </span>
                      ))}
                    </div>
                    <p className="mt-4 text-xs text-muted-foreground">
                      {note.publishedAt
                        ? `Published ${formatNoteDate(note.publishedAt)}`
                        : `Updated ${note.updatedAt.toLocaleDateString("en", { dateStyle: "medium" })}`}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-1">
                    <Link
                      href={`/admin/notes/${note.id}/edit`}
                      className="inline-flex min-h-10 items-center rounded-md px-3 text-sm text-primary hover:bg-accent"
                    >
                      Edit
                    </Link>
                    <Link
                      href={`/admin/notes/${note.id}/preview`}
                      className="inline-flex min-h-10 items-center rounded-md px-3 text-sm text-primary hover:bg-accent"
                    >
                      Preview
                    </Link>
                    {isPublic ? (
                      <Link
                        href={`/notes/${note.slug}`}
                        className="inline-flex min-h-10 items-center rounded-md px-3 text-sm text-primary hover:bg-accent"
                      >
                        View
                      </Link>
                    ) : null}
                    <DeleteNoteButton id={note.id} title={note.title} />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <section
          className="mt-8 rounded-lg border bg-card p-6"
          aria-labelledby="empty-notes"
        >
          <h2 id="empty-notes" className="font-serif text-2xl">
            No Notes yet
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Capture a private draft and preview it before publishing.
          </p>
          <Link
            href="/admin/notes/new"
            className="mt-5 inline-flex min-h-11 items-center rounded-md border px-4 text-sm font-medium text-primary hover:bg-accent"
          >
            Create Note
          </Link>
        </section>
      )}
    </>
  );
}

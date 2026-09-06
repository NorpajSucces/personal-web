import Link from "next/link";

import { SurfaceCard } from "@/components/shared/surface-card";

import type { NoteSummary } from "./types";

export function formatNoteDate(date: Date | null) {
  return date?.toLocaleDateString("en", { dateStyle: "long" }) ?? "Unscheduled";
}

export function NoteCard({ note }: { note: NoteSummary }) {
  return (
    <SurfaceCard className="flex h-full min-w-0 flex-col">
      <p className="text-xs font-semibold tracking-[0.15em] text-primary uppercase">
        Note · {formatNoteDate(note.publishedAt)}
      </p>
      <h2 className="mt-3 font-serif text-2xl leading-tight wrap-anywhere">
        <Link
          href={`/notes/${note.slug}`}
          className="rounded-sm hover:text-primary"
        >
          {note.title}
        </Link>
      </h2>
      <p className="mt-3 whitespace-pre-line text-sm leading-6 wrap-anywhere text-muted-foreground">
        {note.excerpt}
      </p>
      {note.topics.length || note.tags.length ? (
        <div className="mt-4 space-y-2 text-xs">
          {note.topics.length ? (
            <p className="flex flex-wrap gap-2" aria-label="Topics">
              {note.topics.map((topic) => (
                <span
                  key={topic.id}
                  className="rounded-full border px-2.5 py-1"
                >
                  {topic.name}
                </span>
              ))}
            </p>
          ) : null}
          {note.tags.length ? (
            <p
              className="flex flex-wrap gap-x-3 gap-y-1 text-muted-foreground"
              aria-label="Tags"
            >
              {note.tags.map((tag) => (
                <span key={tag.id}>#{tag.name}</span>
              ))}
            </p>
          ) : null}
        </div>
      ) : null}
      <Link
        href={`/notes/${note.slug}`}
        className="mt-auto inline-flex min-h-10 items-center pt-5 text-sm font-medium text-primary hover:underline"
      >
        Read Note →
      </Link>
    </SurfaceCard>
  );
}

export function NoteGrid({ notes }: { notes: NoteSummary[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {notes.map((note) => (
        <NoteCard key={note.id} note={note} />
      ))}
    </div>
  );
}

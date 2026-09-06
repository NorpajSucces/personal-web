import Link from "next/link";

import { Container } from "@/components/shared/container";
import { RichTextRenderer } from "@/features/rich-text/renderer";

import { formatNoteDate } from "./note-card";
import type { NoteWithTaxonomy } from "./types";

export function NoteDetail({
  note,
  preview = false,
}: {
  note: NoteWithTaxonomy;
  preview?: boolean;
}) {
  return (
    <Container>
      <article className="mx-auto max-w-[var(--container-reading)] py-[clamp(4rem,9vw,7rem)]">
        {preview ? (
          <p className="mb-5 rounded-md border border-primary/40 bg-accent px-4 py-3 text-sm text-accent-foreground">
            Admin preview · {note.publicationStatus} · {note.visibility}
          </p>
        ) : null}
        <Link
          href={preview ? "/admin/notes" : "/notes"}
          className="inline-flex min-h-10 items-center rounded-sm text-sm text-primary hover:underline"
        >
          ← {preview ? "Back to Notes admin" : "All Notes"}
        </Link>
        <p className="mt-7 text-xs font-semibold tracking-[0.18em] text-primary uppercase">
          {note.publishedAt
            ? `Note · ${formatNoteDate(note.publishedAt)}`
            : preview
              ? "Note · Not published yet"
              : "Note"}
        </p>
        <h1 className="mt-4 font-serif text-[clamp(2.75rem,7vw,4.75rem)] leading-[0.98] font-medium tracking-[-0.035em] wrap-anywhere text-balance">
          {note.title}
        </h1>
        <p className="mt-6 whitespace-pre-line text-lg leading-8 wrap-anywhere text-muted-foreground">
          {note.excerpt}
        </p>
        {note.topics.length || note.tags.length ? (
          <div className="mt-6 space-y-3 border-y py-4 text-sm">
            {note.topics.length ? (
              <p className="flex flex-wrap items-center gap-2">
                <span className="font-medium">Topics:</span>
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
              <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground">
                <span className="font-medium text-foreground">Tags:</span>
                {note.tags.map((tag) => (
                  <span key={tag.id}>#{tag.name}</span>
                ))}
              </p>
            ) : null}
          </div>
        ) : null}
        <div className="mt-8">
          <RichTextRenderer content={note.content} />
        </div>
      </article>
    </Container>
  );
}

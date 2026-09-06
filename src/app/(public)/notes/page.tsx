import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";

import { Container } from "@/components/shared/container";
import { PageIntro } from "@/components/shared/page-intro";
import { NoteGrid } from "@/features/notes/note-card";
import {
  getPublicNotes,
  getPublicNoteTaxonomy,
} from "@/features/notes/queries";

export const metadata: Metadata = {
  title: "Notes",
};

function filterHref(topic?: string, tag?: string) {
  const query = new URLSearchParams();
  if (topic) query.set("topic", topic);
  if (tag) query.set("tag", tag);
  const value = query.toString();
  return value ? `/notes?${value}` : "/notes";
}

export default async function NotesPage({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string; tag?: string }>;
}) {
  await connection();
  const filters = await searchParams;
  const [{ topics, tags }, notes] = await Promise.all([
    getPublicNoteTaxonomy(),
    getPublicNotes({ topic: filters.topic, tag: filters.tag }),
  ]);
  return (
    <>
      <PageIntro
        title="Notes"
        description="Shorter observations, references, reflections, and evolving thoughts."
      />
      <Container className="pb-[var(--section-space)]">
        {topics.length || tags.length ? (
          <nav
            aria-label="Filter Notes"
            className="mb-8 space-y-4 border-y py-5"
          >
            {topics.length ? (
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="mr-1 font-medium">Topics</span>
                {topics.map((topic) => (
                  <Link
                    key={topic.id}
                    href={filterHref(
                      filters.topic === topic.slug ? undefined : topic.slug,
                      filters.tag,
                    )}
                    aria-current={
                      filters.topic === topic.slug ? "page" : undefined
                    }
                    className="rounded-full border px-3 py-1.5 aria-current:border-primary aria-current:bg-accent"
                  >
                    {topic.name}
                  </Link>
                ))}
              </div>
            ) : null}
            {tags.length ? (
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="mr-1 font-medium">Tags</span>
                {tags.map((tag) => (
                  <Link
                    key={tag.id}
                    href={filterHref(
                      filters.topic,
                      filters.tag === tag.slug ? undefined : tag.slug,
                    )}
                    aria-current={filters.tag === tag.slug ? "page" : undefined}
                    className="rounded-full border px-3 py-1.5 aria-current:border-primary aria-current:bg-accent"
                  >
                    #{tag.name}
                  </Link>
                ))}
              </div>
            ) : null}
            {filters.topic || filters.tag ? (
              <Link
                href="/notes"
                className="inline-block text-sm text-primary hover:underline"
              >
                Clear filters
              </Link>
            ) : null}
          </nav>
        ) : null}
        {notes.length ? (
          <NoteGrid notes={notes} />
        ) : (
          <section
            className="rounded-lg border bg-card p-6"
            aria-labelledby="notes-empty"
          >
            <h2 id="notes-empty" className="font-serif text-2xl">
              {filters.topic || filters.tag
                ? "No matching Notes"
                : "No public Notes yet"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {filters.topic || filters.tag
                ? "Try another Topic or Tag, or clear the current filters."
                : "Published Notes will appear here as the collection grows."}
            </p>
          </section>
        )}
      </Container>
    </>
  );
}

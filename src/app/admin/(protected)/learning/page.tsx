import type { Metadata } from "next";
import Link from "next/link";

import { DeleteLearningButton } from "@/features/learning/delete-learning-button";
import { getAdminLearningEntries } from "@/features/learning/queries";
import {
  formatLearningDate,
  learningStatusLabels,
} from "@/features/learning/status";
import { requireAdmin } from "@/lib/auth/admin";

export const metadata: Metadata = { title: "Learning" };

export default async function LearningAdminPage() {
  await requireAdmin();
  const entries = await getAdminLearningEntries();
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <h1 className="font-serif text-4xl tracking-tight">Learning</h1>
          <p className="mt-3 max-w-prose text-muted-foreground">
            Manage the chronological journey and connect it to related work.
          </p>
        </div>
        <Link
          href="/admin/learning/new"
          className="inline-flex min-h-11 items-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          New Learning Entry
        </Link>
      </div>
      {entries.length ? (
        <div className="mt-8 space-y-4">
          {entries.map((entry) => (
            <article
              key={entry.id}
              className="rounded-lg border bg-card p-5 sm:p-6"
            >
              <div className="flex flex-col gap-5 sm:flex-row sm:justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-semibold tracking-wider text-primary uppercase">
                    {formatLearningDate(entry.date)}
                  </p>
                  <h2 className="mt-2 font-serif text-2xl wrap-anywhere">
                    {entry.title}
                  </h2>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full border px-2.5 py-1">
                      {learningStatusLabels[entry.learningStatus]}
                    </span>
                    <span className="rounded-full border px-2.5 py-1 capitalize">
                      {entry.publicationStatus}
                    </span>
                    <span className="rounded-full border px-2.5 py-1 capitalize">
                      {entry.visibility}
                    </span>
                    {entry.topics.map((topic) => (
                      <span
                        key={topic.id}
                        className="rounded-full bg-muted px-2.5 py-1"
                      >
                        {topic.name}
                      </span>
                    ))}
                  </div>
                  <p className="mt-4 text-xs text-muted-foreground">
                    {entry.articles.length} Articles · {entry.notes.length}{" "}
                    Notes · {entry.projects.length} Projects
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-1">
                  <Link
                    href={`/admin/learning/${entry.id}/edit`}
                    className="inline-flex min-h-10 items-center rounded-md px-3 text-sm text-primary hover:bg-accent"
                  >
                    Edit
                  </Link>
                  <Link
                    href={`/admin/learning/${entry.id}/preview`}
                    className="inline-flex min-h-10 items-center rounded-md px-3 text-sm text-primary hover:bg-accent"
                  >
                    Preview
                  </Link>
                  {entry.publicationStatus === "published" &&
                  entry.visibility === "public" ? (
                    <Link
                      href="/learning"
                      className="inline-flex min-h-10 items-center rounded-md px-3 text-sm text-primary hover:bg-accent"
                    >
                      View
                    </Link>
                  ) : null}
                  <DeleteLearningButton id={entry.id} title={entry.title} />
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <section
          className="mt-8 rounded-lg border bg-card p-6"
          aria-labelledby="empty-learning"
        >
          <h2 id="empty-learning" className="font-serif text-2xl">
            No Learning entries yet
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Start with a private draft and preview it before publishing.
          </p>
          <Link
            href="/admin/learning/new"
            className="mt-5 inline-flex min-h-11 items-center rounded-md border px-4 text-sm font-medium text-primary hover:bg-accent"
          >
            Create Learning Entry
          </Link>
        </section>
      )}
    </>
  );
}

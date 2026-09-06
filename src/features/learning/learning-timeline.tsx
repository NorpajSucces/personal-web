import Link from "next/link";

import { SurfaceCard } from "@/components/shared/surface-card";

import {
  formatLearningDate,
  groupLearningEntriesByYear,
  learningStatusLabels,
} from "./status";
import type { LearningEntryWithRelations, RelatedContent } from "./types";

type RelatedGroupProps = {
  label: string;
  route: "articles" | "notes" | "projects";
  items: RelatedContent[];
  preview: boolean;
};

function RelatedGroup({ label, route, items, preview }: RelatedGroupProps) {
  if (!items.length) return null;
  return (
    <div>
      <dt className="text-xs font-semibold tracking-wider uppercase">
        {label}
      </dt>
      <dd className="mt-2 flex flex-wrap gap-2">
        {items.map((item) => {
          const isPublic =
            item.publicationStatus === undefined ||
            (item.publicationStatus === "published" &&
              item.visibility === "public");
          const href =
            preview && !isPublic
              ? `/admin/${route}/${item.id}/edit`
              : `/${route}/${item.slug}`;
          return (
            <Link
              key={item.id}
              href={href}
              className="rounded-md border px-2.5 py-1.5 text-sm text-primary hover:bg-accent"
            >
              {item.title}
              {preview && item.publicationStatus
                ? ` · ${item.publicationStatus}/${item.visibility}`
                : ""}
            </Link>
          );
        })}
      </dd>
    </div>
  );
}

export function LearningEntryCard({
  entry,
  preview = false,
}: {
  entry: LearningEntryWithRelations;
  preview?: boolean;
}) {
  const hasRelated =
    entry.articles.length || entry.notes.length || entry.projects.length;
  return (
    <SurfaceCard className="min-w-0">
      {preview ? (
        <p className="mb-4 rounded-md border border-primary/40 bg-accent px-3 py-2 text-sm text-accent-foreground capitalize">
          Admin preview · {entry.publicationStatus} · {entry.visibility}
        </p>
      ) : null}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs">
        <time
          dateTime={entry.date.toISOString().slice(0, 10)}
          className="font-semibold tracking-[0.12em] text-primary uppercase"
        >
          {formatLearningDate(entry.date)}
        </time>
        <span className="rounded-full border px-2.5 py-1 font-medium">
          {learningStatusLabels[entry.learningStatus]}
        </span>
      </div>
      <h2 className="mt-4 font-serif text-2xl leading-tight wrap-anywhere sm:text-3xl">
        {entry.title}
      </h2>
      <p className="mt-3 whitespace-pre-line leading-7 wrap-anywhere text-muted-foreground">
        {entry.description}
      </p>
      {entry.topics.length ? (
        <p className="mt-4 flex flex-wrap gap-2" aria-label="Topics">
          {entry.topics.map((topic) => (
            <span
              key={topic.id}
              className="rounded-full bg-muted px-2.5 py-1 text-xs"
            >
              {topic.name}
            </span>
          ))}
        </p>
      ) : null}
      {hasRelated ? (
        <dl className="mt-5 grid gap-4 border-t pt-4 text-muted-foreground sm:grid-cols-3">
          <RelatedGroup
            label="Articles"
            route="articles"
            items={entry.articles}
            preview={preview}
          />
          <RelatedGroup
            label="Notes"
            route="notes"
            items={entry.notes}
            preview={preview}
          />
          <RelatedGroup
            label="Projects"
            route="projects"
            items={entry.projects}
            preview={preview}
          />
        </dl>
      ) : null}
    </SurfaceCard>
  );
}

export function LearningTimeline({
  entries,
  groupByYear = true,
}: {
  entries: LearningEntryWithRelations[];
  groupByYear?: boolean;
}) {
  const groups = groupByYear
    ? groupLearningEntriesByYear(entries)
    : [{ year: null, entries }];
  return (
    <div className="space-y-10">
      {groups.map((group) => (
        <section
          key={group.year ?? "latest"}
          aria-labelledby={
            group.year ? `learning-year-${group.year}` : undefined
          }
        >
          {group.year ? (
            <h2
              id={`learning-year-${group.year}`}
              className="mb-5 font-serif text-3xl tracking-tight"
            >
              {group.year}
            </h2>
          ) : null}
          <ol className="relative space-y-5 border-l border-border pl-5 sm:pl-8">
            {group.entries.map((entry) => (
              <li key={entry.id} className="relative">
                <span
                  aria-hidden="true"
                  className="absolute top-7 -left-[1.58rem] size-2.5 rounded-full border border-primary bg-background sm:-left-[2.33rem]"
                />
                <LearningEntryCard entry={entry} />
              </li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}

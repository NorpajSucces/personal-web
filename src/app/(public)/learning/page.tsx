import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";

import { Container } from "@/components/shared/container";
import { PageIntro } from "@/components/shared/page-intro";
import { SurfaceCard } from "@/components/shared/surface-card";
import { LearningTimeline } from "@/features/learning/learning-timeline";
import {
  getPublicLearningEntries,
  getPublicLearningTopics,
} from "@/features/learning/queries";

export const metadata: Metadata = {
  title: "Learning",
};

export default async function LearningPage({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string }>;
}) {
  await connection();
  const filters = await searchParams;
  const [topics, entries] = await Promise.all([
    getPublicLearningTopics(),
    getPublicLearningEntries({ topic: filters.topic }),
  ]);
  return (
    <>
      <PageIntro
        title="Learning"
        description="A chronological map of exploration, learning, and practice across any domain."
      />
      <Container className="pb-[var(--section-space)]">
        {topics.length ? (
          <nav aria-label="Filter Learning" className="mb-8 border-y py-5">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="mr-1 font-medium">Topics</span>
              {topics.map((topic) => {
                const selected = filters.topic === topic.slug;
                return (
                  <Link
                    key={topic.id}
                    href={
                      selected ? "/learning" : `/learning?topic=${topic.slug}`
                    }
                    aria-current={selected ? "page" : undefined}
                    className="rounded-full border px-3 py-1.5 aria-current:border-primary aria-current:bg-accent"
                  >
                    {topic.name}
                  </Link>
                );
              })}
              {filters.topic ? (
                <Link
                  href="/learning"
                  className="min-h-10 rounded-md px-3 py-2 text-primary hover:underline"
                >
                  Clear filter
                </Link>
              ) : null}
            </div>
          </nav>
        ) : null}
        {entries.length ? (
          <LearningTimeline entries={entries} />
        ) : (
          <SurfaceCard>
            <h2 className="font-serif text-2xl">No Learning entries found</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {filters.topic
                ? "No public entries match this Topic."
                : "Published Learning entries will appear here."}
            </p>
          </SurfaceCard>
        )}
      </Container>
    </>
  );
}

import "server-only";

import { unstable_cache } from "next/cache";

import { getHomeContent } from "@/features/home/queries";
import { getExperiences } from "@/features/home/experience-queries";
import {
  getPublicArticles,
  getPublicArticleBySlug,
  getPublicArticleTaxonomy,
  type PublicArticleFilters,
} from "@/features/articles/queries";
import {
  getPublicNotes,
  getPublicNoteBySlug,
  getPublicNoteTaxonomy,
  type PublicNoteFilters,
} from "@/features/notes/queries";
import {
  getPublicLearningEntries,
  getPublicLearningTopics,
  type PublicLearningFilters,
} from "@/features/learning/queries";
import {
  getPublicProjectBySlug,
  getPublicProjects,
} from "@/features/projects/queries";
import type {
  ArticleSummary,
  ArticleWithTaxonomy,
} from "@/features/articles/types";
import type { NoteSummary, NoteWithTaxonomy } from "@/features/notes/types";
import type { LearningEntryWithRelations } from "@/features/learning/types";
import type { Project, ProjectSummary } from "@/features/projects/types";
import type { Experience } from "@/features/home/experience";

import {
  PUBLIC_CACHE_REVALIDATE_SECONDS,
  PUBLIC_CACHE_TAGS,
} from "./public-tags";

type DateLike = Date | string;

function reviveDate(value: DateLike | null): Date | null {
  return value === null || value instanceof Date ? value : new Date(value);
}

type Timestamped = {
  createdAt: Date;
  updatedAt: Date;
};

function reviveTimestamps<T extends Timestamped>(row: T): T {
  return {
    ...row,
    createdAt: reviveDate(row.createdAt)!,
    updatedAt: reviveDate(row.updatedAt)!,
  };
}

type PublishedContent = Timestamped & {
  publishedAt: Date | null;
};

function revivePublishedContent<T extends PublishedContent>(row: T): T {
  return {
    ...reviveTimestamps(row),
    publishedAt: reviveDate(row.publishedAt),
  };
}

type ExperienceRow = Timestamped & {
  startDate: Date;
  endDate: Date | null;
};

function reviveExperience<T extends ExperienceRow>(row: T): T {
  return {
    ...row,
    startDate: reviveDate(row.startDate)!,
    endDate: reviveDate(row.endDate),
    createdAt: reviveDate(row.createdAt)!,
    updatedAt: reviveDate(row.updatedAt)!,
  };
}

type LearningRow = Timestamped & {
  date: Date;
};

function reviveLearningEntry<T extends LearningRow>(row: T): T {
  return {
    ...row,
    date: reviveDate(row.date)!,
    createdAt: reviveDate(row.createdAt)!,
    updatedAt: reviveDate(row.updatedAt)!,
  };
}

const cachedHomeContent = unstable_cache(
  getHomeContent,
  ["public-home-content"],
  {
    revalidate: PUBLIC_CACHE_REVALIDATE_SECONDS,
    tags: [PUBLIC_CACHE_TAGS.home],
  },
);

const cachedExperiences = unstable_cache(
  getExperiences,
  ["public-experiences"],
  {
    revalidate: PUBLIC_CACHE_REVALIDATE_SECONDS,
    tags: [PUBLIC_CACHE_TAGS.home],
  },
);

const cachedPublicProjects = unstable_cache(
  getPublicProjects,
  ["public-projects"],
  {
    revalidate: PUBLIC_CACHE_REVALIDATE_SECONDS,
    tags: [PUBLIC_CACHE_TAGS.projects],
  },
);

const cachedPublicProjectBySlug = unstable_cache(
  getPublicProjectBySlug,
  ["public-project-by-slug"],
  {
    revalidate: PUBLIC_CACHE_REVALIDATE_SECONDS,
    tags: [PUBLIC_CACHE_TAGS.projects],
  },
);

const cachedPublicArticles = unstable_cache(
  getPublicArticles,
  ["public-articles"],
  {
    revalidate: PUBLIC_CACHE_REVALIDATE_SECONDS,
    tags: [PUBLIC_CACHE_TAGS.articles, PUBLIC_CACHE_TAGS.taxonomy],
  },
);

const cachedPublicArticleBySlug = unstable_cache(
  getPublicArticleBySlug,
  ["public-article-by-slug"],
  {
    revalidate: PUBLIC_CACHE_REVALIDATE_SECONDS,
    tags: [PUBLIC_CACHE_TAGS.articles, PUBLIC_CACHE_TAGS.taxonomy],
  },
);

const cachedPublicArticleTaxonomy = unstable_cache(
  getPublicArticleTaxonomy,
  ["public-article-taxonomy"],
  {
    revalidate: PUBLIC_CACHE_REVALIDATE_SECONDS,
    tags: [PUBLIC_CACHE_TAGS.articles, PUBLIC_CACHE_TAGS.taxonomy],
  },
);

const cachedPublicNotes = unstable_cache(getPublicNotes, ["public-notes"], {
  revalidate: PUBLIC_CACHE_REVALIDATE_SECONDS,
  tags: [PUBLIC_CACHE_TAGS.notes, PUBLIC_CACHE_TAGS.taxonomy],
});

const cachedPublicNoteBySlug = unstable_cache(
  getPublicNoteBySlug,
  ["public-note-by-slug"],
  {
    revalidate: PUBLIC_CACHE_REVALIDATE_SECONDS,
    tags: [PUBLIC_CACHE_TAGS.notes, PUBLIC_CACHE_TAGS.taxonomy],
  },
);

const cachedPublicNoteTaxonomy = unstable_cache(
  getPublicNoteTaxonomy,
  ["public-note-taxonomy"],
  {
    revalidate: PUBLIC_CACHE_REVALIDATE_SECONDS,
    tags: [PUBLIC_CACHE_TAGS.notes, PUBLIC_CACHE_TAGS.taxonomy],
  },
);

const cachedPublicLearningEntries = unstable_cache(
  getPublicLearningEntries,
  ["public-learning"],
  {
    revalidate: PUBLIC_CACHE_REVALIDATE_SECONDS,
    tags: [PUBLIC_CACHE_TAGS.learning, PUBLIC_CACHE_TAGS.taxonomy],
  },
);

const cachedPublicLearningTopics = unstable_cache(
  getPublicLearningTopics,
  ["public-learning-topics"],
  {
    revalidate: PUBLIC_CACHE_REVALIDATE_SECONDS,
    tags: [PUBLIC_CACHE_TAGS.learning, PUBLIC_CACHE_TAGS.taxonomy],
  },
);

export async function getCachedHomeContent() {
  return cachedHomeContent();
}

export async function getCachedExperiences(): Promise<Experience[]> {
  const rows = await cachedExperiences();
  return rows.map(reviveExperience);
}

export async function getCachedPublicProjects(
  limit?: number,
): Promise<ProjectSummary[]> {
  const rows = await cachedPublicProjects(limit);
  return rows.map(reviveTimestamps);
}

export async function getCachedPublicProjectBySlug(
  slug: string,
): Promise<Project | undefined> {
  const project = await cachedPublicProjectBySlug(slug);
  return project ? reviveTimestamps(project) : undefined;
}

export async function getCachedPublicArticles(
  filters: PublicArticleFilters = {},
): Promise<ArticleSummary[]> {
  const rows = await cachedPublicArticles(filters);
  return rows.map(revivePublishedContent);
}

export async function getCachedPublicArticleBySlug(
  slug: string,
): Promise<ArticleWithTaxonomy | undefined> {
  const article = await cachedPublicArticleBySlug(slug);
  return article ? revivePublishedContent(article) : undefined;
}

export async function getCachedPublicArticleTaxonomy() {
  return cachedPublicArticleTaxonomy();
}

export async function getCachedPublicNotes(
  filters: PublicNoteFilters = {},
): Promise<NoteSummary[]> {
  const rows = await cachedPublicNotes(filters);
  return rows.map(revivePublishedContent);
}

export async function getCachedPublicNoteBySlug(
  slug: string,
): Promise<NoteWithTaxonomy | undefined> {
  const note = await cachedPublicNoteBySlug(slug);
  return note ? revivePublishedContent(note) : undefined;
}

export async function getCachedPublicNoteTaxonomy() {
  return cachedPublicNoteTaxonomy();
}

export async function getCachedPublicLearningEntries(
  filters: PublicLearningFilters = {},
): Promise<LearningEntryWithRelations[]> {
  const rows = await cachedPublicLearningEntries(filters);
  return rows.map(reviveLearningEntry);
}

export async function getCachedPublicLearningTopics() {
  return cachedPublicLearningTopics();
}

import type { learningEntries } from "@/db/schema/learning";

export type LearningEntry = typeof learningEntries.$inferSelect;

export type TaxonomyOption = {
  id: string;
  name: string;
  slug: string;
};

export type RelatedContent = {
  id: string;
  title: string;
  slug: string;
  publicationStatus?: "draft" | "published";
  visibility?: "private" | "public";
};

export type LearningRelations = {
  topics: TaxonomyOption[];
  articles: RelatedContent[];
  notes: RelatedContent[];
  projects: RelatedContent[];
};

export type LearningEntryWithRelations = LearningEntry & LearningRelations;

export type LearningRelationOptions = Pick<
  LearningRelations,
  "articles" | "notes" | "projects"
>;

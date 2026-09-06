import type { notes } from "@/db/schema/notes";

export type Note = typeof notes.$inferSelect;

export type TaxonomyOption = {
  id: string;
  name: string;
  slug: string;
};

export type NoteWithTaxonomy = Note & {
  topics: TaxonomyOption[];
  tags: TaxonomyOption[];
};

export type NoteSummary = Pick<
  Note,
  | "id"
  | "title"
  | "slug"
  | "excerpt"
  | "publicationStatus"
  | "visibility"
  | "publishedAt"
  | "createdAt"
  | "updatedAt"
> & {
  topics: TaxonomyOption[];
  tags: TaxonomyOption[];
};

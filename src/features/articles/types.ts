import type { articles } from "@/db/schema/articles";

export type Article = typeof articles.$inferSelect;

export type TaxonomyOption = {
  id: string;
  name: string;
  slug: string;
};

export type ArticleWithTaxonomy = Article & {
  topics: TaxonomyOption[];
  tags: TaxonomyOption[];
};

export type ArticleSummary = Pick<
  Article,
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

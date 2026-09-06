import { z } from "zod";

import {
  hasMeaningfulRichText,
  parseRichTextJson,
  type RichTextDocument,
} from "../rich-text/contract.ts";

import { normalizeArticleSlug } from "./slug.ts";

export const publicationStatuses = ["draft", "published"] as const;
export const visibilityOptions = ["private", "public"] as const;
export const articleIdSchema = z.uuid();

function normalizeSingleLine(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

const requiredSingleLine = z
  .string()
  .transform(normalizeSingleLine)
  .pipe(z.string().min(1, "This field cannot be empty."));

const requiredExcerpt = z
  .string()
  .refine((value) => value.trim().length > 0, {
    message: "This field cannot be empty.",
  })
  .transform((value) => value.replace(/\r\n?/g, "\n").trim());

const richTextSchema = z.string().transform((value, context) => {
  const document = parseRichTextJson(value);
  if (!document) {
    context.addIssue({
      code: "custom",
      message: "The Article content is not valid Tiptap JSON.",
    });
    return z.NEVER;
  }
  if (!hasMeaningfulRichText(document)) {
    context.addIssue({
      code: "custom",
      message: "Write some Article content before saving.",
    });
    return z.NEVER;
  }
  return document;
});

const idSelection = z.array(z.uuid()).transform((ids) => [...new Set(ids)]);

export const articleFormSchema = z.object({
  title: requiredSingleLine,
  slug: z
    .string()
    .transform(normalizeArticleSlug)
    .pipe(
      z
        .string()
        .min(1, "Enter a slug.")
        .regex(
          /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
          "Use lowercase letters, numbers, and single hyphens only.",
        ),
    ),
  excerpt: requiredExcerpt,
  content: richTextSchema,
  publicationStatus: z.enum(publicationStatuses),
  visibility: z.enum(visibilityOptions),
  topicIds: idSelection,
  tagIds: idSelection,
});

export type ArticleFormValues = z.infer<typeof articleFormSchema>;
export type ArticleFormInput = Omit<ArticleFormValues, "content"> & {
  content: RichTextDocument;
};
export type ArticleFormField =
  | "title"
  | "slug"
  | "excerpt"
  | "content"
  | "publicationStatus"
  | "visibility"
  | "topicIds"
  | "tagIds";
export type ArticleFormState = {
  status: "idle" | "success" | "error";
  message: string;
  errors?: Partial<Record<ArticleFormField, string[]>>;
};

export const initialArticleFormState: ArticleFormState = {
  status: "idle",
  message: "",
};

export function parseArticleFormData(formData: FormData) {
  return articleFormSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    excerpt: formData.get("excerpt"),
    content: formData.get("contentJson"),
    publicationStatus: formData.get("publicationStatus"),
    visibility: formData.get("visibility"),
    topicIds: formData.getAll("topicIds"),
    tagIds: formData.getAll("tagIds"),
  });
}

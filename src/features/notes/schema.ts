import { z } from "zod";

import {
  hasMeaningfulRichText,
  parseRichTextJson,
  type RichTextDocument,
} from "../rich-text/contract.ts";

import { normalizeNoteSlug } from "./slug.ts";

export const notePublicationStatuses = ["draft", "published"] as const;
export const noteVisibilityOptions = ["private", "public"] as const;
export const noteIdSchema = z.uuid();

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
      message: "The Note content is not valid Tiptap JSON.",
    });
    return z.NEVER;
  }
  if (!hasMeaningfulRichText(document)) {
    context.addIssue({
      code: "custom",
      message: "Write some Note content before saving.",
    });
    return z.NEVER;
  }
  return document;
});

const idSelection = z.array(z.uuid()).transform((ids) => [...new Set(ids)]);

export const noteFormSchema = z.object({
  title: requiredSingleLine,
  slug: z
    .string()
    .transform(normalizeNoteSlug)
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
  publicationStatus: z.enum(notePublicationStatuses),
  visibility: z.enum(noteVisibilityOptions),
  topicIds: idSelection,
  tagIds: idSelection,
});

export type NoteFormValues = z.infer<typeof noteFormSchema>;
export type NoteFormInput = Omit<NoteFormValues, "content"> & {
  content: RichTextDocument;
};
export type NoteFormField =
  | "title"
  | "slug"
  | "excerpt"
  | "content"
  | "publicationStatus"
  | "visibility"
  | "topicIds"
  | "tagIds";
export type NoteFormState = {
  status: "idle" | "success" | "error";
  message: string;
  errors?: Partial<Record<NoteFormField, string[]>>;
};

export const initialNoteFormState: NoteFormState = {
  status: "idle",
  message: "",
};

export function parseNoteFormData(formData: FormData) {
  return noteFormSchema.safeParse({
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

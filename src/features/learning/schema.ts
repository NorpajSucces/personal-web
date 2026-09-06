import { z } from "zod";

export const learningStatuses = [
  "exploring",
  "learning",
  "practicing",
] as const;
export const learningPublicationStatuses = ["draft", "published"] as const;
export const learningVisibilityOptions = ["private", "public"] as const;
export const learningEntryIdSchema = z.uuid();

function normalizeSingleLine(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

const requiredSingleLine = z
  .string()
  .transform(normalizeSingleLine)
  .pipe(z.string().min(1, "This field cannot be empty."));

const requiredDescription = z
  .string()
  .refine((value) => value.trim().length > 0, {
    message: "This field cannot be empty.",
  })
  .transform((value) => value.replace(/\r\n?/g, "\n").trim());

const learningDate = z.string().transform((value, context) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    context.addIssue({ code: "custom", message: "Choose a valid date." });
    return z.NEVER;
  }
  const date = new Date(`${value}T00:00:00.000Z`);
  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== value
  ) {
    context.addIssue({ code: "custom", message: "Choose a valid date." });
    return z.NEVER;
  }
  return date;
});

const idSelection = z.array(z.uuid()).transform((ids) => [...new Set(ids)]);

export const learningFormSchema = z.object({
  title: requiredSingleLine,
  description: requiredDescription,
  date: learningDate,
  learningStatus: z.enum(learningStatuses),
  publicationStatus: z.enum(learningPublicationStatuses),
  visibility: z.enum(learningVisibilityOptions),
  topicIds: idSelection,
  articleIds: idSelection,
  noteIds: idSelection,
  projectIds: idSelection,
});

export type LearningFormValues = z.infer<typeof learningFormSchema>;
export type LearningFormField =
  | "title"
  | "description"
  | "date"
  | "learningStatus"
  | "publicationStatus"
  | "visibility"
  | "topicIds"
  | "articleIds"
  | "noteIds"
  | "projectIds";
export type LearningFormState = {
  status: "idle" | "success" | "error";
  message: string;
  errors?: Partial<Record<LearningFormField, string[]>>;
};

export const initialLearningFormState: LearningFormState = {
  status: "idle",
  message: "",
};

export function parseLearningFormData(formData: FormData) {
  return learningFormSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    date: formData.get("date"),
    learningStatus: formData.get("learningStatus"),
    publicationStatus: formData.get("publicationStatus"),
    visibility: formData.get("visibility"),
    topicIds: formData.getAll("topicIds"),
    articleIds: formData.getAll("articleIds"),
    noteIds: formData.getAll("noteIds"),
    projectIds: formData.getAll("projectIds"),
  });
}

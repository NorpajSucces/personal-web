import { z } from "zod";

import { normalizeProjectSlug } from "./slug.ts";

export const projectStatuses = ["in_progress", "completed"] as const;
export const publicationStatuses = ["draft", "published"] as const;
export const visibilityOptions = ["private", "public"] as const;
export const projectIdSchema = z.uuid();

function normalizeSingleLine(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export function parseTechnologies(value: string) {
  const seen = new Set<string>();

  return value
    .split(/[\n,]/)
    .map(normalizeSingleLine)
    .filter((technology) => {
      const key = technology.toLocaleLowerCase("en");
      if (!technology || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

const requiredSingleLine = z
  .string()
  .transform(normalizeSingleLine)
  .pipe(z.string().min(1, "This field cannot be empty."));

const requiredText = z
  .string()
  .refine((value) => value.trim().length > 0, {
    message: "This field cannot be empty.",
  })
  .transform((value) => value.replace(/\r\n?/g, "\n"));

const optionalUrl = z
  .string()
  .trim()
  .refine(
    (value) =>
      value === "" || z.url({ protocol: /^https?$/ }).safeParse(value).success,
    { message: "Enter a valid http:// or https:// URL or leave this empty." },
  );

export const projectFormSchema = z.object({
  name: requiredSingleLine,
  slug: z
    .string()
    .transform(normalizeProjectSlug)
    .pipe(
      z
        .string()
        .min(1, "Enter a slug.")
        .regex(
          /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
          "Use lowercase letters, numbers, and single hyphens only.",
        ),
    ),
  description: requiredText,
  technologies: z.string().transform(parseTechnologies),
  projectStatus: z.enum(projectStatuses),
  publicationStatus: z.enum(publicationStatuses),
  visibility: z.enum(visibilityOptions),
  githubUrl: optionalUrl,
  liveDemoUrl: optionalUrl,
});

export type ProjectFormValues = z.infer<typeof projectFormSchema>;
export type ProjectFormField = keyof z.input<typeof projectFormSchema>;
export type ProjectFormState = {
  status: "idle" | "success" | "error";
  message: string;
  errors?: Partial<Record<ProjectFormField, string[]>>;
};

export const initialProjectFormState: ProjectFormState = {
  status: "idle",
  message: "",
};

export function parseProjectFormData(formData: FormData) {
  return projectFormSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    technologies: formData.get("technologies"),
    projectStatus: formData.get("projectStatus"),
    publicationStatus: formData.get("publicationStatus"),
    visibility: formData.get("visibility"),
    githubUrl: formData.get("githubUrl"),
    liveDemoUrl: formData.get("liveDemoUrl"),
  });
}

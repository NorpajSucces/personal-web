import { z } from "zod";

import { isSafeHttpUrl } from "../../lib/url.ts";
import { isValidMediaPath } from "../media/config.ts";

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
  .refine((value) => value === "" || isSafeHttpUrl(value), {
    message: "Enter a valid http:// or https:// URL or leave this empty.",
  });

const optionalMediaPath = z.preprocess(
  (value) => value ?? "",
  z
    .string()
    .trim()
    .refine((value) => value === "" || isValidMediaPath(value), {
      message: "Upload a valid image or leave this empty.",
    }),
);

const projectPeriodPattern = /^[1-9]\d{3}(?:-(?:0[1-9]|1[0-2]))?$/;

const optionalProjectPeriod = z.preprocess(
  (value) => value ?? "",
  z
    .string()
    .trim()
    .refine((value) => value === "" || projectPeriodPattern.test(value), {
      message: "Enter a valid month and year, a year, or leave this empty.",
    })
    .transform((value) => value || null),
);

export const projectFormSchema = z
  .object({
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
    startPeriod: optionalProjectPeriod,
    endPeriod: optionalProjectPeriod,
    projectStatus: z.enum(projectStatuses),
    publicationStatus: z.enum(publicationStatuses),
    visibility: z.enum(visibilityOptions),
    githubUrl: optionalUrl,
    liveDemoUrl: optionalUrl,
    screenshotPath: optionalMediaPath,
  })
  .superRefine((values, context) => {
    if (values.projectStatus === "in_progress" && values.endPeriod) {
      context.addIssue({
        code: "custom",
        path: ["endPeriod"],
        message: "Leave the end period empty while the project is in progress.",
      });
    }

    if (!values.startPeriod || !values.endPeriod) return;
    const [startYear, startMonth] = values.startPeriod.split("-").map(Number);
    const [endYear, endMonth] = values.endPeriod.split("-").map(Number);
    const isEarlier =
      startYear > endYear ||
      (startYear === endYear &&
        startMonth !== undefined &&
        endMonth !== undefined &&
        startMonth > endMonth);

    if (isEarlier) {
      context.addIssue({
        code: "custom",
        path: ["endPeriod"],
        message: "The end period cannot be earlier than the start period.",
      });
    }
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
    startPeriod: formData.get("startPeriod"),
    endPeriod: formData.get("endPeriod"),
    projectStatus: formData.get("projectStatus"),
    publicationStatus: formData.get("publicationStatus"),
    visibility: formData.get("visibility"),
    githubUrl: formData.get("githubUrl"),
    liveDemoUrl: formData.get("liveDemoUrl"),
    screenshotPath: formData.get("screenshotPath"),
  });
}

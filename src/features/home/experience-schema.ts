import { z } from "zod";

export const experienceIdSchema = z.uuid();

function normalizeSingleLine(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

const requiredSingleLine = z
  .string()
  .transform(normalizeSingleLine)
  .pipe(z.string().min(1, "This field cannot be empty."));

function parseDate(value: string, context: z.RefinementCtx) {
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
}

const requiredDate = z
  .string()
  .transform((value, context) => parseDate(value, context));

const optionalDate = z
  .string()
  .transform((value, context) =>
    value === "" ? null : parseDate(value, context),
  );

export const experienceFormSchema = z
  .object({
    role: requiredSingleLine,
    organization: requiredSingleLine,
    startDate: requiredDate,
    endDate: optionalDate,
    isCurrent: z.boolean(),
    description: z
      .string()
      .transform((value) => value.replace(/\r\n?/g, "\n").trim() || null),
  })
  .superRefine((values, context) => {
    if (values.isCurrent && values.endDate)
      context.addIssue({
        code: "custom",
        path: ["endDate"],
        message: "A current Experience cannot have an end date.",
      });
    if (!values.isCurrent && !values.endDate)
      context.addIssue({
        code: "custom",
        path: ["endDate"],
        message: "Choose an end date or mark this Experience as current.",
      });
    if (
      values.startDate instanceof Date &&
      values.endDate instanceof Date &&
      values.endDate < values.startDate
    )
      context.addIssue({
        code: "custom",
        path: ["endDate"],
        message: "End date cannot be before the start date.",
      });
  });

export type ExperienceFormValues = z.infer<typeof experienceFormSchema>;
export type ExperienceFormField =
  | "role"
  | "organization"
  | "startDate"
  | "endDate"
  | "isCurrent"
  | "description";
export type ExperienceFormState = {
  status: "idle" | "success" | "error";
  message: string;
  errors?: Partial<Record<ExperienceFormField, string[]>>;
};

export const initialExperienceFormState: ExperienceFormState = {
  status: "idle",
  message: "",
};

export function parseExperienceFormData(formData: FormData) {
  return experienceFormSchema.safeParse({
    role: formData.get("role"),
    organization: formData.get("organization"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate") ?? "",
    isCurrent: formData.get("isCurrent") === "on",
    description: formData.get("description") ?? "",
  });
}

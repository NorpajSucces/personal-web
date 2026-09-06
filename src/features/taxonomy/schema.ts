import { z } from "zod";

import { generateSlug } from "../../lib/slug.ts";

export const taxonomyKinds = ["topic", "tag"] as const;
export const taxonomyKindSchema = z.enum(taxonomyKinds);
export const taxonomyIdSchema = z.uuid();

export const taxonomyNameSchema = z
  .string()
  .transform((value) => value.trim().replace(/\s+/g, " "))
  .pipe(z.string().min(1, "Enter a name."));

export function parseTaxonomyName(value: unknown) {
  const result = taxonomyNameSchema.safeParse(value);
  if (!result.success) return result;
  const slug = generateSlug(result.data);
  if (!slug)
    return {
      success: false as const,
      error: {
        issues: [{ message: "Use a name containing letters or numbers." }],
      },
    };
  return { success: true as const, data: { name: result.data, slug } };
}

export type TaxonomyKind = z.infer<typeof taxonomyKindSchema>;
export type TaxonomyActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

export const initialTaxonomyActionState: TaxonomyActionState = {
  status: "idle",
  message: "",
};

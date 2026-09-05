import { z } from "zod";

const requiredText = z
  .string()
  .refine((value) => value.trim().length > 0, {
    message: "This field cannot be empty.",
  })
  // Browser form submissions use CRLF; keep stored plain text consistent.
  .transform((value) => value.replace(/\r\n?/g, "\n"));

const optionalEmail = z
  .string()
  .trim()
  .refine((value) => value === "" || z.email().safeParse(value).success, {
    message: "Enter a valid email address or leave this empty.",
  });

const optionalUrl = z
  .string()
  .trim()
  .refine(
    (value) =>
      value === "" || z.url({ protocol: /^https?$/ }).safeParse(value).success,
    { message: "Enter a valid http:// or https:// URL or leave this empty." },
  );

export const homeContentSchema = z.object({
  heroTitle: requiredText,
  heroDescription: requiredText,
  aboutTitle: requiredText,
  aboutContent: requiredText,
  contactTitle: requiredText,
  contactDescription: requiredText,
  publicEmail: optionalEmail,
  githubUrl: optionalUrl,
  linkedinUrl: optionalUrl,
});

export type HomeContentValues = z.infer<typeof homeContentSchema>;
export type HomeFormState = {
  status: "idle" | "success" | "error";
  message: string;
  errors?: Partial<Record<keyof HomeContentValues, string[]>>;
};

import { z } from "zod";

export const CONTACT_LIMITS = {
  name: 100,
  email: 254,
  messageMin: 10,
  messageMax: 5_000,
} as const;

const nameSchema = z
  .string()
  .trim()
  .min(1, "Enter your name.")
  .max(CONTACT_LIMITS.name, "Keep your name under 100 characters.")
  .refine((value) => !/[\r\n]/.test(value), {
    message: "Enter your name on one line.",
  });

const emailSchema = z
  .string()
  .trim()
  .max(CONTACT_LIMITS.email, "Enter a valid email address.")
  .refine((value) => z.email().safeParse(value).success, {
    message: "Enter a valid email address.",
  })
  .transform((value) => value.toLowerCase());

const messageSchema = z
  .string()
  .transform((value) => value.replace(/\r\n?/g, "\n").trim())
  .pipe(
    z
      .string()
      .min(
        CONTACT_LIMITS.messageMin,
        "Write at least 10 characters so I can understand your message.",
      )
      .max(
        CONTACT_LIMITS.messageMax,
        "Keep your message under 5,000 characters.",
      ),
  );

export const contactFormSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  message: messageSchema,
});

export const contactSubmissionIdSchema = z.uuid();

export type ContactFormValues = z.infer<typeof contactFormSchema>;
export type ContactFormField = keyof ContactFormValues;
export type ContactFormState = {
  status: "idle" | "success" | "error";
  message: string;
  errors?: Partial<Record<ContactFormField, string[]>>;
};

export const initialContactFormState: ContactFormState = {
  status: "idle",
  message: "",
};

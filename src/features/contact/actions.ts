"use server";

import { z } from "zod";

import { deliverContactMessage } from "./email";
import {
  contactFormSchema,
  contactSubmissionIdSchema,
  type ContactFormState,
} from "./schema";

const successState: ContactFormState = {
  status: "success",
  message: "Message sent. Thanks for reaching out.",
};

const deliveryFailureState: ContactFormState = {
  status: "error",
  message: "Something went wrong while sending your message. Please try again.",
};

function isSuspiciousSubmission(formData: FormData) {
  const honeypot = formData.get("website");
  return (
    honeypot !== null &&
    (typeof honeypot !== "string" || honeypot.trim().length > 0)
  );
}

export async function sendContactMessage(
  _previousState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  if (!(formData instanceof FormData)) return deliveryFailureState;

  // Do not reveal honeypot behavior to automated submitters.
  if (isSuspiciousSubmission(formData)) return successState;

  const result = contactFormSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    message: formData.get("message"),
  });
  if (!result.success) {
    return {
      status: "error",
      message: "Please check the highlighted fields.",
      errors: z.flattenError(result.error).fieldErrors,
    };
  }

  const submissionId = contactSubmissionIdSchema.safeParse(
    formData.get("submissionId"),
  );
  if (!submissionId.success) return deliveryFailureState;

  const delivered = await deliverContactMessage(result.data, submissionId.data);
  return delivered ? successState : deliveryFailureState;
}

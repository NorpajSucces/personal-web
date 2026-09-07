import "server-only";

import { Resend } from "resend";
import { z } from "zod";

import type { ContactFormValues } from "./schema";

const destinationSchema = z.email();

function isValidSender(value: string) {
  if (/[\r\n]/.test(value)) return false;
  const bracketedAddress = value.match(/<([^<>]+)>$/)?.[1];
  return destinationSchema.safeParse(bracketedAddress ?? value).success;
}

function getContactEmailConfig() {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const to = process.env.CONTACT_EMAIL?.trim();
  const from = process.env.CONTACT_FROM_EMAIL?.trim();

  if (
    !apiKey ||
    !to ||
    !destinationSchema.safeParse(to).success ||
    !from ||
    !isValidSender(from)
  ) {
    return null;
  }

  return { apiKey, from, to };
}

function createContactEmailText({ name, email, message }: ContactFormValues) {
  return [
    "A new message was submitted through the personal website Contact form.",
    "",
    `Name: ${name}`,
    `Email: ${email}`,
    "",
    "Message:",
    message,
  ].join("\n");
}

export async function deliverContactMessage(
  values: ContactFormValues,
  submissionId: string,
) {
  const config = getContactEmailConfig();
  if (!config) return false;

  try {
    const resend = new Resend(config.apiKey);
    const { error } = await resend.emails.send(
      {
        from: config.from,
        to: config.to,
        replyTo: values.email,
        subject: "New message from the personal website",
        text: createContactEmailText(values),
      },
      { idempotencyKey: `contact/${submissionId}` },
    );
    return !error;
  } catch {
    return false;
  }
}

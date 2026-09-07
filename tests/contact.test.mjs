import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  CONTACT_LIMITS,
  contactFormSchema,
} from "../src/features/contact/schema.ts";

const validContact = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  message: "I would like to discuss a thoughtful collaboration.",
};

test("valid Contact input is trimmed and normalized", () => {
  assert.deepEqual(
    contactFormSchema.parse({
      name: "  Ada Lovelace  ",
      email: "  ADA@EXAMPLE.COM  ",
      message: "  First line.\r\nSecond line.  ",
    }),
    {
      name: "Ada Lovelace",
      email: "ada@example.com",
      message: "First line.\nSecond line.",
    },
  );
});

test("Contact rejects invalid email addresses", () => {
  for (const email of [
    "",
    "not-an-email",
    "hello@",
    "hello@example.com\r\nBcc:other@example.com",
  ]) {
    const result = contactFormSchema.safeParse({ ...validContact, email });
    assert.equal(result.success, false);
    assert(result.error.flatten().fieldErrors.email.length);
  }
});

test("Contact rejects effectively empty names and messages", () => {
  for (const values of [
    { ...validContact, name: " \n\t " },
    { ...validContact, message: " \r\n\t " },
    { ...validContact, message: "Too short" },
  ]) {
    const result = contactFormSchema.safeParse(values);
    assert.equal(result.success, false);
  }
});

test("Contact rejects oversized messages", () => {
  const result = contactFormSchema.safeParse({
    ...validContact,
    message: "a".repeat(CONTACT_LIMITS.messageMax + 1),
  });
  assert.equal(result.success, false);
  assert(result.error.flatten().fieldErrors.message.length);
});

test("Home renders an accessible Contact form without exposing email configuration", async () => {
  const [home, form] = await Promise.all([
    readFile(new URL("../src/app/(public)/page.tsx", import.meta.url), "utf8"),
    readFile(
      new URL("../src/features/contact/contact-form.tsx", import.meta.url),
      "utf8",
    ),
  ]);
  assert.match(home, /<ContactForm initialSubmissionId=/);
  assert.match(home, /05 \/ Connect/);
  assert.match(form, /<label[\s\S]*Name/);
  assert.match(form, /<label[\s\S]*Email/);
  assert.match(form, /<label[\s\S]*Message/);
  assert.match(form, /aria-live="polite"/);
  assert.match(form, /formRef\.current\?\.reset\(\)/);
  assert.match(form, /disabled=\{pending \|\| coolingDown\}/);
  assert.doesNotMatch(home + form, /RESEND_API_KEY|CONTACT_EMAIL/);
});

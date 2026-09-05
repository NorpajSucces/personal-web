import assert from "node:assert/strict";
import test from "node:test";

import {
  defaultHomeContent,
  toHomeContentValues,
} from "../src/features/home/defaults.ts";
import { homeContentSchema } from "../src/features/home/schema.ts";

test("existing Home copy is valid and returned for an absent row", () => {
  assert.deepEqual(
    homeContentSchema.parse(defaultHomeContent),
    defaultHomeContent,
  );
  assert.deepEqual(toHomeContentValues(), defaultHomeContent);
  const values = toHomeContentValues();
  values.heroTitle = "Changed locally";
  assert.notEqual(defaultHomeContent.heroTitle, values.heroTitle);
});

test("all required text fields reject empty and whitespace-only input", () => {
  for (const key of [
    "heroTitle",
    "heroDescription",
    "aboutTitle",
    "aboutContent",
    "contactTitle",
    "contactDescription",
  ]) {
    for (const value of [
      "",
      " \n\t",
      null,
      undefined,
      new File(["text"], "content.txt"),
    ]) {
      assert.equal(
        homeContentSchema.safeParse({ ...defaultHomeContent, [key]: value })
          .success,
        false,
      );
    }
  }
});

test("meaningful whitespace and multiline plain text are preserved", () => {
  const aboutContent = "  An opening thought.\n\nA second paragraph.  ";
  assert.equal(
    homeContentSchema.parse({ ...defaultHomeContent, aboutContent })
      .aboutContent,
    aboutContent,
  );
});

test("browser line endings are normalized without removing paragraphs or spaces", () => {
  const value = "  First paragraph.\r\n\r\nSecond paragraph.  ";
  assert.equal(
    homeContentSchema.parse({ ...defaultHomeContent, aboutContent: value })
      .aboutContent,
    "  First paragraph.\n\nSecond paragraph.  ",
  );
});

test("optional email is normalized and malformed email is rejected", () => {
  assert.equal(
    homeContentSchema.parse({
      ...defaultHomeContent,
      publicEmail: "  hello@example.com  ",
    }).publicEmail,
    "hello@example.com",
  );
  for (const publicEmail of [
    "not-an-email",
    "hello@",
    "hello@example.com\r\nBcc:other@example.com",
  ]) {
    assert.equal(
      homeContentSchema.safeParse({ ...defaultHomeContent, publicEmail })
        .success,
      false,
    );
  }
});

test("social links accept only valid HTTP or HTTPS URLs", () => {
  for (const key of ["githubUrl", "linkedinUrl"]) {
    for (const value of [
      "https://example.com/profile",
      "http://example.com/profile",
      "",
      "   ",
    ]) {
      assert.equal(
        homeContentSchema.safeParse({ ...defaultHomeContent, [key]: value })
          .success,
        true,
      );
    }
    for (const value of [
      "invalid",
      "/profile",
      "//example.com",
      "https://",
      "javascript:alert(1)",
      "data:text/html,unsafe",
      "ftp://example.com",
      "mailto:hello@example.com",
    ]) {
      assert.equal(
        homeContentSchema.safeParse({ ...defaultHomeContent, [key]: value })
          .success,
        false,
      );
    }
  }
});

test("existing row maps its actual values without replacing intentional empty links", () => {
  const row = {
    ...defaultHomeContent,
    id: 1,
    heroTitle: "An updated introduction",
    publicEmail: null,
    githubUrl: null,
    linkedinUrl: "https://example.com/profile",
    updatedAt: new Date(),
  };
  assert.deepEqual(toHomeContentValues(row), {
    ...defaultHomeContent,
    heroTitle: row.heroTitle,
    linkedinUrl: row.linkedinUrl,
  });
  assert.equal("id" in toHomeContentValues(row), false);
  assert.equal("updatedAt" in toHomeContentValues(row), false);
});

test("untrusted IDs and timestamps are not part of the editable contract", () => {
  assert.deepEqual(
    homeContentSchema.parse({
      ...defaultHomeContent,
      id: 2,
      updatedAt: "tampered",
    }),
    defaultHomeContent,
  );
});

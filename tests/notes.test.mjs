import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { noteFormSchema } from "../src/features/notes/schema.ts";
import {
  generateNoteSlug,
  normalizeNoteSlug,
} from "../src/features/notes/slug.ts";
import { resolvePublishedAt } from "../src/features/publishing/published-at.ts";
import {
  hasMeaningfulRichText,
  isRichTextDocument,
  parseRichTextJson,
} from "../src/features/rich-text/contract.ts";

const content = {
  type: "doc",
  content: [
    {
      type: "paragraph",
      content: [
        { type: "text", text: "A captured " },
        { type: "text", text: "thought", marks: [{ type: "italic" }] },
      ],
    },
    {
      type: "callout",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "Worth revisiting." }],
        },
      ],
    },
  ],
};

const validNote = {
  title: "  A   small observation ",
  slug: "a-small-observation",
  excerpt: "Something useful to remember.",
  content: JSON.stringify(content),
  publicationStatus: "draft",
  visibility: "private",
  topicIds: ["11111111-1111-4111-8111-111111111111"],
  tagIds: ["22222222-2222-4222-8222-222222222222"],
};

test("valid Note input normalizes and keeps the canonical rich-text document", () => {
  const result = noteFormSchema.parse(validNote);
  assert.equal(result.title, "A small observation");
  assert.equal(result.publicationStatus, "draft");
  assert.equal(result.visibility, "private");
  assert.deepEqual(result.content, content);
});

test("Note validation rejects empty copy, invalid statuses, and invalid taxonomy IDs", () => {
  for (const candidate of [
    { ...validNote, title: "   " },
    { ...validNote, excerpt: "\n" },
    { ...validNote, publicationStatus: "scheduled" },
    { ...validNote, visibility: "members" },
    { ...validNote, topicIds: ["not-a-uuid"] },
    { ...validNote, tagIds: ["not-a-uuid"] },
  ])
    assert.equal(noteFormSchema.safeParse(candidate).success, false);
});

test("Note slugs generate on create and normalize intentional edits", () => {
  assert.equal(
    generateNoteSlug("Films, Books & Small Moments"),
    "films-books-and-small-moments",
  );
  assert.equal(normalizeNoteSlug("  Kept_Slug  "), "kept-slug");
  for (const slug of ["note/path", "note?draft=1", "!!!", "-"])
    assert.equal(
      noteFormSchema.safeParse({ ...validNote, slug }).success,
      false,
    );
});

test("Notes reuse the shared safe Tiptap JSON contract and renderer", () => {
  assert.equal(isRichTextDocument(content), true);
  assert.equal(hasMeaningfulRichText(content), true);
  assert.deepEqual(parseRichTextJson(JSON.stringify(content)), content);
  const detailSource = readFileSync(
    new URL("../src/features/notes/note-detail.tsx", import.meta.url),
    "utf8",
  );
  assert.match(detailSource, /RichTextRenderer/);
  assert.doesNotMatch(detailSource, /dangerouslySetInnerHTML/);
  assert.equal(
    noteFormSchema.safeParse({
      ...validNote,
      content: JSON.stringify({
        type: "doc",
        content: [{ type: "html", attrs: { html: "<script>" } }],
      }),
    }).success,
    false,
  );
});

test("publishedAt is set once and preserved through Note edits and unpublishing", () => {
  const firstPublish = new Date("2026-09-07T05:00:00.000Z");
  assert.equal(
    resolvePublishedAt(null, "draft", () => firstPublish),
    null,
  );
  assert.equal(
    resolvePublishedAt(null, "published", () => firstPublish),
    firstPublish,
  );
  assert.equal(resolvePublishedAt(firstPublish, "draft"), firstPublish);
  assert.equal(resolvePublishedAt(firstPublish, "published"), firstPublish);
});

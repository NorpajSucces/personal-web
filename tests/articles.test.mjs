import assert from "node:assert/strict";
import test from "node:test";

import { resolvePublishedAt } from "../src/features/articles/publishing.ts";
import { articleFormSchema } from "../src/features/articles/schema.ts";
import {
  generateArticleSlug,
  normalizeArticleSlug,
} from "../src/features/articles/slug.ts";
import {
  hasMeaningfulRichText,
  isRichTextDocument,
  parseRichTextJson,
} from "../src/features/rich-text/contract.ts";
import { parseTaxonomyName } from "../src/features/taxonomy/schema.ts";

const content = {
  type: "doc",
  content: [
    {
      type: "heading",
      attrs: { level: 2 },
      content: [{ type: "text", text: "A useful section" }],
    },
    {
      type: "paragraph",
      content: [
        { type: "text", text: "Safe " },
        { type: "text", text: "content", marks: [{ type: "bold" }] },
      ],
    },
  ],
};

const validArticle = {
  title: "  A   thoughtful Article ",
  slug: "a-thoughtful-article",
  excerpt: "A concise introduction.",
  content: JSON.stringify(content),
  publicationStatus: "draft",
  visibility: "private",
  topicIds: ["11111111-1111-4111-8111-111111111111"],
  tagIds: ["22222222-2222-4222-8222-222222222222"],
};

test("valid Article input normalizes and preserves canonical Tiptap JSON", () => {
  const result = articleFormSchema.parse(validArticle);
  assert.equal(result.title, "A thoughtful Article");
  assert.deepEqual(result.content, content);
  assert.deepEqual(result.topicIds, validArticle.topicIds);
});

test("Article validation rejects empty copy, unsafe status, and invalid taxonomy IDs", () => {
  for (const [field, value] of [
    ["title", "  "],
    ["excerpt", "\n"],
    ["publicationStatus", "archived"],
    ["visibility", "unlisted"],
    ["topicIds", ["not-a-uuid"]],
  ]) {
    assert.equal(
      articleFormSchema.safeParse({ ...validArticle, [field]: value }).success,
      false,
    );
  }
});

test("Article slugs use the proven create and intentional-edit behavior", () => {
  assert.equal(
    generateArticleSlug(" Café & Code: Notes "),
    "cafe-and-code-notes",
  );
  assert.equal(
    normalizeArticleSlug(" Existing_Slug--2026 "),
    "existing-slug-2026",
  );
  for (const slug of ["article/path", "article?draft=1", "!!!", "-"])
    assert.equal(
      articleFormSchema.safeParse({ ...validArticle, slug }).success,
      false,
    );
});

test("rich-text validation accepts supported nodes and rejects HTML or unsafe links", () => {
  assert.equal(isRichTextDocument(content), true);
  assert.equal(hasMeaningfulRichText(content), true);
  assert.deepEqual(parseRichTextJson(JSON.stringify(content)), content);
  for (const invalid of [
    { type: "doc", content: [{ type: "html", attrs: { html: "<script>" } }] },
    {
      type: "doc",
      content: [{ type: "heading", attrs: { level: 1 }, content: [] }],
    },
    {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "bad",
              marks: [{ type: "link", attrs: { href: "javascript:alert(1)" } }],
            },
          ],
        },
      ],
    },
    { type: "doc", content: [{ type: "paragraph" }] },
  ]) {
    assert.equal(
      articleFormSchema.safeParse({
        ...validArticle,
        content: JSON.stringify(invalid),
      }).success,
      false,
    );
  }
});

test("taxonomy normalization produces shared collision-resistant slugs", () => {
  assert.deepEqual(parseTaxonomyName("  Café   Culture "), {
    success: true,
    data: { name: "Café Culture", slug: "cafe-culture" },
  });
  assert.equal(parseTaxonomyName("!!!").success, false);
});

test("publishedAt is set once and preserved through edits and unpublishing", () => {
  const firstPublish = new Date("2026-09-06T05:00:00.000Z");
  assert.equal(
    resolvePublishedAt(null, "draft", () => firstPublish),
    null,
  );
  assert.equal(
    resolvePublishedAt(null, "published", () => firstPublish),
    firstPublish,
  );
  const original = new Date("2026-01-02T03:04:05.000Z");
  assert.equal(
    resolvePublishedAt(original, "published", () => firstPublish),
    original,
  );
  assert.equal(
    resolvePublishedAt(original, "draft", () => firstPublish),
    original,
  );
});

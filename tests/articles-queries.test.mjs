import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { registerHooks } from "node:module";
import { after, beforeEach, mock, test } from "node:test";
import { fileURLToPath } from "node:url";
import { drizzle } from "drizzle-orm/pg-proxy";

const sourceRoot = new URL("../src/", import.meta.url);
const hooks = registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === "server-only")
      return { url: "data:text/javascript,export {};", shortCircuit: true };
    let url;
    if (specifier.startsWith("@/"))
      url = new URL(specifier.slice(2), sourceRoot);
    else if (
      specifier.startsWith(".") &&
      context.parentURL?.startsWith(sourceRoot.href)
    )
      url = new URL(specifier, context.parentURL);
    if (url) {
      for (const suffix of [".ts", "/index.ts"]) {
        const candidate = new URL(url.href + suffix);
        if (existsSync(fileURLToPath(candidate)))
          return nextResolve(candidate.href, context);
      }
    }
    return nextResolve(specifier, context);
  },
});

const id = "11111111-1111-4111-8111-111111111111";
const topicId = "22222222-2222-4222-8222-222222222222";
const tagId = "33333333-3333-4333-8333-333333333333";
const now = new Date("2026-09-06T00:00:00.000Z");
const document = {
  type: "doc",
  content: [{ type: "paragraph", content: [{ type: "text", text: "Body" }] }],
};
const calls = [];
let mode;
const database = drizzle(async (query, params) => {
  calls.push({ query, params });
  if (mode === "detail") {
    if (
      query.includes('from "articles"') &&
      query.includes('"articles"."slug"')
    )
      return {
        rows: [
          [
            id,
            "Public Article",
            "public-article",
            "Excerpt",
            document,
            null,
            "published",
            "public",
            now,
            now,
            now,
          ],
        ],
      };
    if (query.includes('from "article_topics"'))
      return { rows: [[id, topicId, "Technology", "technology"]] };
    if (query.includes('from "article_tags"'))
      return { rows: [[id, tagId, "Next.js", "next-js"]] };
  }
  return { rows: [] };
});

mock.module("../src/db/index.ts", { namedExports: { db: database } });
const { getPublicArticleBySlug, getPublicArticles } =
  await import("../src/features/articles/queries.ts");

beforeEach(() => {
  calls.length = 0;
  mode = "empty";
});
after(() => {
  mock.restoreAll();
  hooks.deregister();
});

test("public Article list filters Published and Public in SQL before Topic/Tag filters", async () => {
  await getPublicArticles({ topic: "technology", tag: "next-js", limit: 3 });
  const query = calls[0];
  assert.match(query.query, /"articles"\."publication_status" = \$1/);
  assert.match(query.query, /"articles"\."visibility" = \$2/);
  assert.match(
    query.query,
    /exists[\s\S]+"article_topics"[\s\S]+"topics"\."slug" = \$3/,
  );
  assert.match(
    query.query,
    /exists[\s\S]+"article_tags"[\s\S]+"tags"\."slug" = \$4/,
  );
  assert.match(query.query, /order by "articles"\."published_at" desc/);
  assert.deepEqual(query.params.slice(0, 4), [
    "published",
    "public",
    "technology",
    "next-js",
  ]);
});

test("public Article detail applies Published and Public before a guessed slug", async () => {
  assert.equal(await getPublicArticleBySlug("guessed-private"), undefined);
  assert.match(calls[0].query, /"publication_status" = \$1/);
  assert.match(calls[0].query, /"visibility" = \$2/);
  assert.deepEqual(calls[0].params, [
    "published",
    "public",
    "guessed-private",
    1,
  ]);
});

test("public Article detail attaches shared Topics and Tags", async () => {
  mode = "detail";
  const article = await getPublicArticleBySlug("public-article");
  assert.equal(article.title, "Public Article");
  assert.deepEqual(article.topics, [
    { id: topicId, name: "Technology", slug: "technology" },
  ]);
  assert.deepEqual(article.tags, [
    { id: tagId, name: "Next.js", slug: "next-js" },
  ]);
});

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
const now = new Date("2026-09-07T00:00:00.000Z");
const document = {
  type: "doc",
  content: [{ type: "paragraph", content: [{ type: "text", text: "Body" }] }],
};
const calls = [];
let mode;
const database = drizzle(async (query, params) => {
  calls.push({ query, params });
  if (mode === "detail") {
    if (query.includes('from "notes"') && query.includes('"notes"."slug"'))
      return {
        rows: [
          [
            id,
            "Public Note",
            "public-note",
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
    if (query.includes('from "note_topics"'))
      return { rows: [[id, topicId, "Personal", "personal"]] };
    if (query.includes('from "note_tags"'))
      return { rows: [[id, tagId, "Reflection", "reflection"]] };
  }
  return { rows: [] };
});

mock.module("../src/db/index.ts", { namedExports: { db: database } });
const { getPublicNoteBySlug, getPublicNotes } =
  await import("../src/features/notes/queries.ts");

beforeEach(() => {
  calls.length = 0;
  mode = "empty";
});
after(() => {
  mock.restoreAll();
  hooks.deregister();
});

test("public Note list filters Published and Public before Topic/Tag filters", async () => {
  await getPublicNotes({ topic: "personal", tag: "reflection", limit: 3 });
  const query = calls[0];
  assert.match(query.query, /"notes"\."publication_status" = \$1/);
  assert.match(query.query, /"notes"\."visibility" = \$2/);
  assert.match(
    query.query,
    /exists[\s\S]+"note_topics"[\s\S]+"topics"\."slug" = \$3/,
  );
  assert.match(
    query.query,
    /exists[\s\S]+"note_tags"[\s\S]+"tags"\."slug" = \$4/,
  );
  assert.match(query.query, /order by "notes"\."published_at" desc/);
  assert.deepEqual(query.params.slice(0, 4), [
    "published",
    "public",
    "personal",
    "reflection",
  ]);
});

test("public Note detail applies Published and Public to guessed slugs", async () => {
  assert.equal(await getPublicNoteBySlug("guessed-private"), undefined);
  assert.match(calls[0].query, /"publication_status" = \$1/);
  assert.match(calls[0].query, /"visibility" = \$2/);
  assert.deepEqual(calls[0].params, [
    "published",
    "public",
    "guessed-private",
    1,
  ]);
});

test("public Note detail attaches shared Topics and Tags", async () => {
  mode = "detail";
  const note = await getPublicNoteBySlug("public-note");
  assert.equal(note.title, "Public Note");
  assert.deepEqual(note.topics, [
    { id: topicId, name: "Personal", slug: "personal" },
  ]);
  assert.deepEqual(note.tags, [
    { id: tagId, name: "Reflection", slug: "reflection" },
  ]);
});

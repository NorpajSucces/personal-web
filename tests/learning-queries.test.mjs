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

const learningId = "11111111-1111-4111-8111-111111111111";
const topicId = "22222222-2222-4222-8222-222222222222";
const articleId = "33333333-3333-4333-8333-333333333333";
const noteId = "44444444-4444-4444-8444-444444444444";
const projectId = "55555555-5555-4555-8555-555555555555";
const now = new Date("2026-09-08T00:00:00.000Z");
const calls = [];
let mode;
const database = drizzle(async (query, params) => {
  calls.push({ query, params });
  if (mode === "public-related") {
    if (query.includes('from "learning_entries"'))
      return {
        rows: [
          [
            learningId,
            "Public Learning",
            "A visible milestone",
            now,
            "practicing",
            "published",
            "public",
            now,
            now,
          ],
        ],
      };
    if (query.includes('from "learning_topics"'))
      return { rows: [[learningId, topicId, "Databases", "databases"]] };
    if (query.includes('from "learning_articles"'))
      return {
        rows: [
          [
            learningId,
            articleId,
            "Public Article",
            "public-article",
            "published",
            "public",
          ],
        ],
      };
    if (query.includes('from "learning_notes"'))
      return {
        rows: [
          [
            learningId,
            noteId,
            "Public Note",
            "public-note",
            "published",
            "public",
          ],
        ],
      };
    if (query.includes('from "learning_projects"'))
      return {
        rows: [
          [
            learningId,
            projectId,
            "Public Project",
            "public-project",
            "published",
            "public",
          ],
        ],
      };
  }
  return { rows: [] };
});

mock.module("../src/db/index.ts", { namedExports: { db: database } });
const { getPublicLearningEntries } =
  await import("../src/features/learning/queries.ts");

beforeEach(() => {
  calls.length = 0;
  mode = "empty";
});
after(() => {
  mock.restoreAll();
  hooks.deregister();
});

test("public Learning applies Published, Public, Topic, and newest-first ordering", async () => {
  await getPublicLearningEntries({ topic: "databases", limit: 3 });
  const query = calls[0];
  assert.match(query.query, /"learning_entries"\."publication_status" = \$1/);
  assert.match(query.query, /"learning_entries"\."visibility" = \$2/);
  assert.match(
    query.query,
    /exists[\s\S]+"learning_topics"[\s\S]+"topics"\."slug" = \$3/,
  );
  assert.match(query.query, /order by "learning_entries"\."date" desc/);
  assert.deepEqual(query.params.slice(0, 3), [
    "published",
    "public",
    "databases",
  ]);
});

test("public Learning related queries independently require Published and Public", async () => {
  mode = "public-related";
  const [entry] = await getPublicLearningEntries();
  assert.equal(entry.title, "Public Learning");
  assert.deepEqual(entry.topics, [
    { id: topicId, name: "Databases", slug: "databases" },
  ]);
  assert.deepEqual(
    entry.articles.map((item) => item.title),
    ["Public Article"],
  );
  assert.deepEqual(
    entry.notes.map((item) => item.title),
    ["Public Note"],
  );
  assert.deepEqual(
    entry.projects.map((item) => item.title),
    ["Public Project"],
  );

  for (const table of [
    "learning_articles",
    "learning_notes",
    "learning_projects",
  ]) {
    const query = calls.find((call) => call.query.includes(`from "${table}"`));
    assert.match(query.query, /"publication_status" = \$/);
    assert.match(query.query, /"visibility" = \$/);
    assert(query.params.includes("published"));
    assert(query.params.includes("public"));
  }
});

test("draft and private Learning entries are excluded at the primary query", async () => {
  const entries = await getPublicLearningEntries();
  assert.deepEqual(entries, []);
  assert.deepEqual(calls[0].params.slice(0, 2), ["published", "public"]);
  assert.equal(calls.length, 1);
});

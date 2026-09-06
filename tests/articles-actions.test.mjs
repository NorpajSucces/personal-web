import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { registerHooks } from "node:module";
import { after, beforeEach, mock, test } from "node:test";
import { fileURLToPath } from "node:url";

const sourceRoot = new URL("../src/", import.meta.url);
const hooks = registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === "next/cache")
      return nextResolve("next/cache.js", context);
    if (specifier === "next/navigation")
      return nextResolve("next/navigation.js", context);
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
      for (const suffix of [".ts", ".tsx", "/index.ts"]) {
        const candidate = new URL(url.href + suffix);
        if (existsSync(fileURLToPath(candidate)))
          return nextResolve(candidate.href, context);
      }
    }
    return nextResolve(specifier, context);
  },
});

const articleId = "11111111-1111-4111-8111-111111111111";
const topicId = "22222222-2222-4222-8222-222222222222";
const tagId = "33333333-3333-4333-8333-333333333333";
const now = new Date("2026-09-06T00:00:00.000Z");
const document = {
  type: "doc",
  content: [
    { type: "paragraph", content: [{ type: "text", text: "Article body" }] },
  ],
};
const existingArticle = {
  id: articleId,
  title: "Original Article",
  slug: "original-article",
  excerpt: "Original excerpt",
  content: document,
  coverImagePath: null,
  publicationStatus: "draft",
  visibility: "private",
  publishedAt: null,
  createdAt: now,
  updatedAt: now,
  topics: [],
  tags: [],
};

let authorized;
let slugAvailable;
let selectionExists;
let existing;
let taxonomyBySlug;
const calls = [];

mock.module("../src/lib/auth/admin.ts", {
  namedExports: {
    requireAdmin: async () => {
      calls.push({ type: "authorization" });
      if (!authorized) throw new Error("Redirect to login");
      return { id: "admin" };
    },
  },
});
mock.module("next/cache", {
  namedExports: {
    revalidatePath: (path) => calls.push({ type: "revalidate", path }),
  },
});
mock.module("next/navigation", {
  namedExports: {
    redirect: (path) => {
      calls.push({ type: "redirect", path });
      throw new Error("NEXT_REDIRECT");
    },
  },
});
mock.module("../src/features/articles/queries.ts", {
  namedExports: {
    isArticleSlugAvailable: async (slug, excludeId) => {
      calls.push({ type: "slug", slug, excludeId });
      return slugAvailable;
    },
    taxonomySelectionExists: async (topics, tags) => {
      calls.push({ type: "taxonomy-selection", topics, tags });
      return selectionExists;
    },
    createArticleRecord: async (values) => {
      calls.push({ type: "create", values });
      return { id: articleId };
    },
    getAdminArticleById: async (id) => {
      calls.push({ type: "get", id });
      return existing;
    },
    updateArticleRecord: async (article, values) => {
      calls.push({ type: "update", article, values });
      return { id: article.id };
    },
    deleteArticleRecord: async (id) => {
      calls.push({ type: "delete", id });
      return { id };
    },
  },
});
mock.module("../src/features/taxonomy/queries.ts", {
  namedExports: {
    findTaxonomyBySlug: async (kind, slug) => {
      calls.push({ type: "find-taxonomy", kind, slug });
      return taxonomyBySlug;
    },
    createTaxonomyRecord: async (kind, values) => {
      calls.push({ type: "create-taxonomy", kind, values });
      return { id: topicId, ...values };
    },
    updateTaxonomyRecord: async (kind, id, values) => {
      calls.push({ type: "update-taxonomy", kind, id, values });
      return { id };
    },
    deleteTaxonomyRecord: async (kind, id) => {
      calls.push({ type: "delete-taxonomy", kind, id });
      return { id };
    },
  },
});

const { createArticle, deleteArticle, updateArticle } =
  await import("../src/features/articles/actions.ts");
const { initialArticleFormState } =
  await import("../src/features/articles/schema.ts");
const { createInlineTaxonomy, deleteTaxonomy, updateTaxonomy } =
  await import("../src/features/taxonomy/actions.ts");
const { initialTaxonomyActionState } =
  await import("../src/features/taxonomy/schema.ts");

function articleForm(overrides = {}) {
  const values = {
    title: "New Article",
    slug: "new-article",
    excerpt: "A clear excerpt",
    contentJson: JSON.stringify(document),
    publicationStatus: "draft",
    visibility: "private",
    topicIds: [topicId],
    tagIds: [tagId],
    ...overrides,
  };
  const formData = new FormData();
  for (const [key, value] of Object.entries(values)) {
    if (Array.isArray(value))
      value.forEach((item) => formData.append(key, item));
    else formData.set(key, value);
  }
  return formData;
}

beforeEach(() => {
  authorized = true;
  slugAvailable = true;
  selectionExists = true;
  existing = existingArticle;
  taxonomyBySlug = undefined;
  calls.length = 0;
});
after(() => {
  mock.restoreAll();
  hooks.deregister();
});

test("Article create, edit, delete, and taxonomy mutations authorize before input", async () => {
  authorized = false;
  for (const invoke of [
    () => createArticle(initialArticleFormState, null),
    () => updateArticle("invalid", initialArticleFormState, null),
    () => deleteArticle("invalid", initialArticleFormState, null),
    () => createInlineTaxonomy("topic", "Test"),
    () => updateTaxonomy("topic", "invalid", initialTaxonomyActionState, null),
    () => deleteTaxonomy("tag", "invalid", initialTaxonomyActionState, null),
  ]) {
    calls.length = 0;
    await assert.rejects(invoke(), /Redirect to login/);
    assert.deepEqual(calls, [{ type: "authorization" }]);
  }
});

test("authorized Article create validates taxonomy and redirects to immutable ID", async () => {
  await assert.rejects(
    createArticle(initialArticleFormState, articleForm()),
    /NEXT_REDIRECT/,
  );
  const creation = calls.find((call) => call.type === "create");
  assert.deepEqual(creation.values.topicIds, [topicId]);
  assert.deepEqual(creation.values.tagIds, [tagId]);
  assert.equal(creation.values.publicationStatus, "draft");
  assert.equal(creation.values.visibility, "private");
  assert.deepEqual(calls.at(-1), {
    type: "redirect",
    path: `/admin/articles/${articleId}/edit`,
  });
});

test("duplicate Article slug returns a useful error without writing", async () => {
  slugAvailable = false;
  const result = await createArticle(initialArticleFormState, articleForm());
  assert.equal(result.status, "error");
  assert.match(result.errors.slug[0], /already used/);
  assert.equal(
    calls.some((call) => call.type === "create"),
    false,
  );
});

test("Article edit preserves an intentional slug and revalidates old and new URLs", async () => {
  const result = await updateArticle(
    articleId,
    initialArticleFormState,
    articleForm({ title: "Changed title", slug: "intentional-slug" }),
  );
  assert.equal(result.status, "success");
  const update = calls.find((call) => call.type === "update");
  assert.equal(update.values.slug, "intentional-slug");
  assert(calls.some((call) => call.path === "/articles/original-article"));
  assert(calls.some((call) => call.path === "/articles/intentional-slug"));
});

test("Article delete targets only the Article and redirects safely", async () => {
  await assert.rejects(
    deleteArticle(articleId, initialArticleFormState, new FormData()),
    /NEXT_REDIRECT/,
  );
  assert(calls.some((call) => call.type === "delete" && call.id === articleId));
  assert.deepEqual(calls.at(-1), { type: "redirect", path: "/admin/articles" });
});

test("inline taxonomy creation normalizes values and reuses duplicates", async () => {
  const created = await createInlineTaxonomy("topic", " Café   Culture ");
  assert.equal(created.status, "success");
  assert.deepEqual(
    calls.find((call) => call.type === "create-taxonomy").values,
    { name: "Café Culture", slug: "cafe-culture" },
  );
  calls.length = 0;
  taxonomyBySlug = { id: topicId, name: "Café Culture", slug: "cafe-culture" };
  const reused = await createInlineTaxonomy("topic", "Cafe Culture");
  assert.equal(reused.item.id, topicId);
  assert.equal(
    calls.some((call) => call.type === "create-taxonomy"),
    false,
  );
});

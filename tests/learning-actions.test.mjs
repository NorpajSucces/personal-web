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

const entryId = "11111111-1111-4111-8111-111111111111";
const topicId = "22222222-2222-4222-8222-222222222222";
const articleId = "33333333-3333-4333-8333-333333333333";
const noteId = "44444444-4444-4444-8444-444444444444";
const projectId = "55555555-5555-4555-8555-555555555555";
const now = new Date("2026-09-08T00:00:00.000Z");
const existingEntry = {
  id: entryId,
  title: "Original Learning",
  description: "Original description",
  date: now,
  learningStatus: "exploring",
  publicationStatus: "draft",
  visibility: "private",
  createdAt: now,
  updatedAt: now,
  topics: [],
  articles: [],
  notes: [],
  projects: [],
};

let authorized;
let selectionExists;
let existing;
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
mock.module("../src/features/learning/queries.ts", {
  namedExports: {
    learningSelectionExists: async (values) => {
      calls.push({ type: "selection", values });
      return selectionExists;
    },
    createLearningEntryRecord: async (values) => {
      calls.push({ type: "create", values });
      return { id: entryId };
    },
    getAdminLearningEntryById: async (id) => {
      calls.push({ type: "get", id });
      return existing;
    },
    updateLearningEntryRecord: async (entry, values) => {
      calls.push({ type: "update", entry, values });
      return { id: entry.id };
    },
    deleteLearningEntryRecord: async (id) => {
      calls.push({ type: "delete", id });
      return { id };
    },
  },
});

const { createLearningEntry, deleteLearningEntry, updateLearningEntry } =
  await import("../src/features/learning/actions.ts");
const { initialLearningFormState } =
  await import("../src/features/learning/schema.ts");

function learningForm(overrides = {}) {
  const values = {
    title: "New Learning",
    description: "A learning milestone",
    date: "2026-09-08",
    learningStatus: "exploring",
    publicationStatus: "draft",
    visibility: "private",
    topicIds: [topicId],
    articleIds: [articleId],
    noteIds: [noteId],
    projectIds: [projectId],
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
  selectionExists = true;
  existing = existingEntry;
  calls.length = 0;
});
after(() => {
  mock.restoreAll();
  hooks.deregister();
});

test("all Learning mutations authorize before reading external input", async () => {
  authorized = false;
  for (const invoke of [
    () => createLearningEntry(initialLearningFormState, null),
    () => updateLearningEntry("invalid", initialLearningFormState, null),
    () => deleteLearningEntry("invalid", initialLearningFormState, null),
  ]) {
    calls.length = 0;
    await assert.rejects(invoke(), /Redirect to login/);
    assert.deepEqual(calls, [{ type: "authorization" }]);
  }
});

test("authorized Learning create keeps safe defaults and all relationships", async () => {
  await assert.rejects(
    createLearningEntry(initialLearningFormState, learningForm()),
    /NEXT_REDIRECT/,
  );
  const creation = calls.find((call) => call.type === "create");
  assert.equal(creation.values.publicationStatus, "draft");
  assert.equal(creation.values.visibility, "private");
  assert.deepEqual(creation.values.topicIds, [topicId]);
  assert.deepEqual(creation.values.articleIds, [articleId]);
  assert.deepEqual(creation.values.noteIds, [noteId]);
  assert.deepEqual(creation.values.projectIds, [projectId]);
  assert.deepEqual(calls.at(-1), {
    type: "redirect",
    path: `/admin/learning/${entryId}/edit`,
  });
});

test("missing related selection prevents a Learning write", async () => {
  selectionExists = false;
  const result = await createLearningEntry(
    initialLearningFormState,
    learningForm(),
  );
  assert.equal(result.status, "error");
  assert.match(result.message, /no longer exists/);
  assert.equal(
    calls.some((call) => call.type === "create"),
    false,
  );
});

test("Learning edits pass the new stage and revalidate public and admin surfaces", async () => {
  const result = await updateLearningEntry(
    entryId,
    initialLearningFormState,
    learningForm({ learningStatus: "practicing", date: "2026-09-09" }),
  );
  assert.equal(result.status, "success");
  const update = calls.find((call) => call.type === "update");
  assert.equal(update.values.learningStatus, "practicing");
  assert.equal(update.values.date.toISOString(), "2026-09-09T00:00:00.000Z");
  for (const path of ["/", "/learning", "/admin/learning"])
    assert(calls.some((call) => call.path === path));
});

test("Learning delete targets only the entry and redirects to its admin list", async () => {
  await assert.rejects(
    deleteLearningEntry(entryId, initialLearningFormState, new FormData()),
    /NEXT_REDIRECT/,
  );
  assert(calls.some((call) => call.type === "delete" && call.id === entryId));
  assert.deepEqual(calls.at(-1), {
    type: "redirect",
    path: "/admin/learning",
  });
});

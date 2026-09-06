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

const noteId = "11111111-1111-4111-8111-111111111111";
const topicId = "22222222-2222-4222-8222-222222222222";
const tagId = "33333333-3333-4333-8333-333333333333";
const now = new Date("2026-09-07T00:00:00.000Z");
const document = {
  type: "doc",
  content: [
    { type: "paragraph", content: [{ type: "text", text: "Note body" }] },
  ],
};
const existingNote = {
  id: noteId,
  title: "Original Note",
  slug: "original-note",
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
mock.module("../src/features/notes/queries.ts", {
  namedExports: {
    isNoteSlugAvailable: async (slug, excludeId) => {
      calls.push({ type: "slug", slug, excludeId });
      return slugAvailable;
    },
    noteTaxonomySelectionExists: async (topics, tags) => {
      calls.push({ type: "taxonomy-selection", topics, tags });
      return selectionExists;
    },
    createNoteRecord: async (values) => {
      calls.push({ type: "create", values });
      return { id: noteId };
    },
    getAdminNoteById: async (id) => {
      calls.push({ type: "get", id });
      return existing;
    },
    updateNoteRecord: async (note, values) => {
      calls.push({ type: "update", note, values });
      return { id: note.id };
    },
    deleteNoteRecord: async (id) => {
      calls.push({ type: "delete", id });
      return { id };
    },
  },
});

const { createNote, deleteNote, updateNote } =
  await import("../src/features/notes/actions.ts");
const { initialNoteFormState } =
  await import("../src/features/notes/schema.ts");

function noteForm(overrides = {}) {
  const values = {
    title: "New Note",
    slug: "new-note",
    excerpt: "A short observation",
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
  existing = existingNote;
  calls.length = 0;
});
after(() => {
  mock.restoreAll();
  hooks.deregister();
});

test("all Note mutations authorize before reading external input", async () => {
  authorized = false;
  for (const invoke of [
    () => createNote(initialNoteFormState, null),
    () => updateNote("invalid", initialNoteFormState, null),
    () => deleteNote("invalid", initialNoteFormState, null),
  ]) {
    calls.length = 0;
    await assert.rejects(invoke(), /Redirect to login/);
    assert.deepEqual(calls, [{ type: "authorization" }]);
  }
});

test("authorized Note create keeps safe defaults and shared taxonomy links", async () => {
  await assert.rejects(
    createNote(initialNoteFormState, noteForm()),
    /NEXT_REDIRECT/,
  );
  const creation = calls.find((call) => call.type === "create");
  assert.equal(creation.values.publicationStatus, "draft");
  assert.equal(creation.values.visibility, "private");
  assert.deepEqual(creation.values.topicIds, [topicId]);
  assert.deepEqual(creation.values.tagIds, [tagId]);
  assert.deepEqual(calls.at(-1), {
    type: "redirect",
    path: `/admin/notes/${noteId}/edit`,
  });
});

test("duplicate Note slug returns a field error without writing", async () => {
  slugAvailable = false;
  const result = await createNote(initialNoteFormState, noteForm());
  assert.equal(result.status, "error");
  assert.match(result.errors.slug[0], /already used/);
  assert.equal(
    calls.some((call) => call.type === "create"),
    false,
  );
});

test("Note edits preserve an intentional slug and revalidate old and new URLs", async () => {
  const result = await updateNote(
    noteId,
    initialNoteFormState,
    noteForm({ title: "Changed title", slug: "intentional-note-slug" }),
  );
  assert.equal(result.status, "success");
  const update = calls.find((call) => call.type === "update");
  assert.equal(update.values.slug, "intentional-note-slug");
  assert(calls.some((call) => call.path === "/notes/original-note"));
  assert(calls.some((call) => call.path === "/notes/intentional-note-slug"));
});

test("Note delete targets only the Note and redirects to the admin list", async () => {
  await assert.rejects(
    deleteNote(noteId, initialNoteFormState, new FormData()),
    /NEXT_REDIRECT/,
  );
  assert(calls.some((call) => call.type === "delete" && call.id === noteId));
  assert.deepEqual(calls.at(-1), { type: "redirect", path: "/admin/notes" });
});

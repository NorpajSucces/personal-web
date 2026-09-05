import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { registerHooks } from "node:module";
import { after, beforeEach, mock, test } from "node:test";
import { fileURLToPath } from "node:url";
import { drizzle } from "drizzle-orm/pg-proxy";

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
const now = new Date("2026-09-05T00:00:00.000Z");
const projectRow = [
  id,
  "Original name",
  "original-slug",
  "Description",
  null,
  null,
  null,
  ["Next.js"],
  "in_progress",
  "draft",
  "private",
  null,
  now,
  now,
];
let authorized;
let responses;
let databaseError;
const calls = [];
const database = drizzle(async (query, params) => {
  calls.push({ type: "query", query, params });
  if (databaseError) throw databaseError;
  const response = responses.shift();
  if (response instanceof Error) throw response;
  return { rows: response ?? [] };
});

mock.module("../src/db/index.ts", { namedExports: { db: database } });
mock.module("../src/lib/auth/admin.ts", {
  namedExports: {
    requireAdmin: async () => {
      calls.push({ type: "authorization" });
      if (authorized !== "admin") throw new Error("Redirect to login");
      return { id: "test-admin" };
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

const { createProject, deleteProject, updateProject } =
  await import("../src/features/projects/actions.ts");
const { getPublicProjectBySlug, getPublicProjects } =
  await import("../src/features/projects/queries.ts");
const { initialProjectFormState } =
  await import("../src/features/projects/schema.ts");

function projectForm(overrides = {}) {
  const values = {
    name: "New project",
    slug: "new-project",
    description: "Project description",
    technologies: "Next.js\nTypeScript",
    projectStatus: "in_progress",
    publicationStatus: "draft",
    visibility: "private",
    githubUrl: "",
    liveDemoUrl: "",
    ...overrides,
  };
  const formData = new FormData();
  for (const [key, value] of Object.entries(values)) formData.set(key, value);
  return formData;
}

beforeEach(() => {
  authorized = "admin";
  responses = [];
  databaseError = null;
  calls.length = 0;
});
after(() => {
  mock.restoreAll();
  hooks.deregister();
});

test("create, edit, and delete reject unauthenticated and non-admin calls before payload access", async () => {
  for (const identity of [null, "non-admin"]) {
    authorized = identity;
    for (const invoke of [
      () => createProject(initialProjectFormState, null),
      () => updateProject("invalid", initialProjectFormState, null),
      () => deleteProject("invalid", initialProjectFormState, null),
    ]) {
      calls.length = 0;
      await assert.rejects(invoke(), /Redirect to login/);
      assert.deepEqual(calls, [{ type: "authorization" }]);
    }
  }
});

test("authorized create uses safe defaults from the form and redirects to immutable-ID edit route", async () => {
  responses = [[], [[id]]];
  await assert.rejects(
    createProject(initialProjectFormState, projectForm()),
    /NEXT_REDIRECT/,
  );
  assert.deepEqual(
    calls.map((call) => call.type),
    [
      "authorization",
      "query",
      "query",
      "revalidate",
      "revalidate",
      "revalidate",
      "revalidate",
      "redirect",
    ],
  );
  const insert = calls[2];
  assert.match(insert.query, /^insert into "projects"/);
  assert(insert.params.includes("draft"));
  assert(insert.params.includes("private"));
  assert.deepEqual(calls.at(-1), {
    type: "redirect",
    path: `/admin/projects/${id}/edit`,
  });
});

test("duplicate slug returns a useful field error without attempting insert", async () => {
  responses = [[[id]]];
  const result = await createProject(initialProjectFormState, projectForm());
  assert.equal(result.status, "error");
  assert.match(result.errors.slug[0], /already used/);
  assert.deepEqual(
    calls.map((call) => call.type),
    ["authorization", "query"],
  );
});

test("edit preserves an intentional slug while changing the name and updates the row by ID", async () => {
  responses = [[projectRow], [], [[id]]];
  const result = await updateProject(
    id,
    initialProjectFormState,
    projectForm({ name: "Changed name", slug: "original-slug" }),
  );
  assert.equal(result.status, "success");
  const update = calls.find(
    (call) =>
      call.type === "query" && call.query.startsWith('update "projects"'),
  );
  assert(update.params.includes("Changed name"));
  assert(update.params.includes("original-slug"));
  assert.equal(update.params.at(-1), id);
  assert(
    calls.some(
      (call) =>
        call.type === "revalidate" && call.path === "/projects/original-slug",
    ),
  );
});

test("authorized delete identifies the record, deletes by UUID, then redirects safely", async () => {
  responses = [[projectRow], [[id]]];
  await assert.rejects(
    deleteProject(id, initialProjectFormState, new FormData()),
    /NEXT_REDIRECT/,
  );
  const deletion = calls.find(
    (call) =>
      call.type === "query" && call.query.startsWith('delete from "projects"'),
  );
  assert.deepEqual(deletion.params, [id]);
  assert.deepEqual(calls.at(-1), { type: "redirect", path: "/admin/projects" });
});

test("public list filters Published and Public in SQL before ordering and limiting", async () => {
  responses = [[]];
  await getPublicProjects(3);
  const query = calls[0];
  assert.match(
    query.query,
    /where \("projects"\."publication_status" = \$1 and "projects"\."visibility" = \$2\)/,
  );
  assert.match(query.query, /order by "projects"\."updated_at" desc limit \$3/);
  assert.deepEqual(query.params, ["published", "public", 3]);
});

test("public detail applies Published and Public filters together with the guessed slug", async () => {
  responses = [[]];
  assert.equal(
    await getPublicProjectBySlug("guessed-private-project"),
    undefined,
  );
  const query = calls[0];
  assert.match(
    query.query,
    /"publication_status" = \$1 and "projects"\."visibility" = \$2/,
  );
  assert.match(query.query, /"projects"\."slug" = \$3/);
  assert.deepEqual(query.params, [
    "published",
    "public",
    "guessed-private-project",
    1,
  ]);
});

test("database errors never disclose diagnostics through mutation state", async () => {
  responses = [
    [],
    Object.assign(new Error("database password and SQL details"), {
      code: "08006",
    }),
  ];
  const result = await createProject(initialProjectFormState, projectForm());
  assert.equal(result.status, "error");
  assert.equal(JSON.stringify(result).includes("password"), false);
});

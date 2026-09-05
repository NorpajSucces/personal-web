import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { registerHooks } from "node:module";
import { after, beforeEach, mock, test } from "node:test";
import { fileURLToPath } from "node:url";
import { drizzle } from "drizzle-orm/pg-proxy";

// Resolve application TypeScript imports for Node's existing native test runner.
const sourceRoot = new URL("../src/", import.meta.url);
const hooks = registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === "next/cache")
      return nextResolve("next/cache.js", context);
    if (specifier === "server-only") {
      return { url: "data:text/javascript,export {};", shortCircuit: true };
    }
    let url;
    if (specifier.startsWith("@/"))
      url = new URL(specifier.slice(2), sourceRoot);
    else if (
      specifier.startsWith(".") &&
      context.parentURL?.startsWith(sourceRoot.href)
    ) {
      url = new URL(specifier, context.parentURL);
    }
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

let authorized;
let failDatabase;
let resultRows;
const calls = [];
const database = drizzle(async (query, params) => {
  calls.push({ type: "query", query, params });
  if (failDatabase) throw new Error("Sensitive database diagnostics");
  return { rows: resultRows };
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

const { saveHomeContent } = await import("../src/features/home/actions.ts");
const { getHomeContent } = await import("../src/features/home/queries.ts");
const { defaultHomeContent } = await import("../src/features/home/defaults.ts");
const initialState = { status: "idle", message: "" };

function form(values = defaultHomeContent) {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) data.set(key, value);
  return data;
}

beforeEach(() => {
  authorized = "admin";
  failDatabase = false;
  resultRows = [];
  calls.length = 0;
});
after(() => {
  mock.restoreAll();
  hooks.deregister();
});

test("anonymous and non-admin mutations stop before parsing or database access", async () => {
  for (const identity of [null, "non-admin"]) {
    authorized = identity;
    calls.length = 0;
    await assert.rejects(
      saveHomeContent(initialState, null),
      /Redirect to login/,
    );
    assert.deepEqual(calls, [{ type: "authorization" }]);
  }
});

test("invalid input returns field errors and never writes or invalidates", async () => {
  const result = await saveHomeContent(
    initialState,
    form({ ...defaultHomeContent, publicEmail: "invalid", heroTitle: " " }),
  );
  assert.equal(result.status, "error");
  assert(result.errors.publicEmail.length && result.errors.heroTitle.length);
  assert.deepEqual(calls, [{ type: "authorization" }]);
});

test("authorized saves atomically upsert only id 1 before revalidating both pages", async () => {
  const result = await saveHomeContent(
    initialState,
    form({ ...defaultHomeContent, id: "2" }),
  );
  assert.equal(result.status, "success");
  assert.deepEqual(
    calls.map((call) => call.type),
    ["authorization", "query", "revalidate", "revalidate"],
  );
  const write = calls[1];
  assert.match(write.query, /^insert into "home_content"/);
  assert.match(write.query, /on conflict \("id"\) do update set/);
  assert.match(write.query, /"updated_at" = now\(\)/);
  assert.equal(write.params[0], 1);
  assert.equal(write.params.includes("2"), false);
  assert.deepEqual(
    calls.slice(2).map((call) => call.path),
    ["/", "/admin/home"],
  );
});

test("database failure returns generic feedback without invalidation or diagnostics", async () => {
  failDatabase = true;
  const result = await saveHomeContent(initialState, form());
  assert.equal(result.status, "error");
  assert.equal(JSON.stringify(result).includes("Sensitive"), false);
  assert.deepEqual(
    calls.map((call) => call.type),
    ["authorization", "query"],
  );
});

test("singleton read returns defaults only for an absent row", async () => {
  assert.deepEqual(await getHomeContent(), defaultHomeContent);
  assert.match(calls[0].query, /where "home_content"\."id" = \$1 limit \$2/);
  assert.deepEqual(calls[0].params, [1, 1]);
  failDatabase = true;
  await assert.rejects(getHomeContent());
});

test("singleton read returns stored fields without IDs or timestamps", async () => {
  resultRows = [
    [
      1,
      "Saved hero",
      defaultHomeContent.heroDescription,
      "About",
      "Stored about",
      "Contact",
      "Stored contact",
      null,
      "https://example.com/profile",
      null,
      new Date().toISOString(),
    ],
  ];
  assert.deepEqual(await getHomeContent(), {
    ...defaultHomeContent,
    heroTitle: "Saved hero",
    aboutContent: "Stored about",
    contactDescription: "Stored contact",
    githubUrl: "https://example.com/profile",
  });
});

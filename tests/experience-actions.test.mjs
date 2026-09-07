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
const existingExperience = {
  id,
  role: "Original role",
  organization: "Original organization",
  startDate: new Date("2025-01-01T00:00:00.000Z"),
  endDate: new Date("2025-12-31T00:00:00.000Z"),
  isCurrent: false,
  description: null,
  createdAt: new Date("2026-09-06T00:00:00.000Z"),
  updatedAt: new Date("2026-09-06T00:00:00.000Z"),
};
let authorized;
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
mock.module("../src/features/home/experience-queries.ts", {
  namedExports: {
    createExperienceRecord: async (values) => {
      calls.push({ type: "create", values });
      return { id };
    },
    getExperienceById: async (targetId) => {
      calls.push({ type: "get", id: targetId });
      return existing;
    },
    updateExperienceRecord: async (targetId, values) => {
      calls.push({ type: "update", id: targetId, values });
      return { id: targetId };
    },
    deleteExperienceRecord: async (targetId) => {
      calls.push({ type: "delete", id: targetId });
      return { id: targetId };
    },
  },
});

const { createExperience, deleteExperience, updateExperience } =
  await import("../src/features/home/experience-actions.ts");
const { initialExperienceFormState } =
  await import("../src/features/home/experience-schema.ts");

function form(overrides = {}) {
  const values = {
    role: "Software Engineer",
    organization: "Example Studio",
    startDate: "2025-01-01",
    endDate: "2025-12-31",
    description: "Product engineering work.",
    ...overrides,
  };
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) {
    if (value !== null) data.set(key, value);
  }
  return data;
}

beforeEach(() => {
  authorized = true;
  existing = existingExperience;
  calls.length = 0;
});
after(() => {
  mock.restoreAll();
  hooks.deregister();
});

test("all Experience mutations authorize before reading untrusted input", async () => {
  authorized = false;
  for (const invoke of [
    () => createExperience(initialExperienceFormState, null),
    () => updateExperience("invalid", initialExperienceFormState, null),
    () => deleteExperience("invalid", initialExperienceFormState, null),
  ]) {
    calls.length = 0;
    await assert.rejects(invoke(), /Redirect to login/);
    assert.deepEqual(calls, [{ type: "authorization" }]);
  }
});

test("authorized create validates, writes, and revalidates Home surfaces", async () => {
  const result = await createExperience(initialExperienceFormState, form());
  assert.equal(result.status, "success");
  const creation = calls.find((call) => call.type === "create");
  assert.equal(creation.values.role, "Software Engineer");
  assert.equal(
    creation.values.startDate.toISOString(),
    "2025-01-01T00:00:00.000Z",
  );
  assert.equal(creation.values.isCurrent, false);
  assert.deepEqual(
    calls.filter((call) => call.type === "revalidate").map((call) => call.path),
    ["/", "/admin/home"],
  );
});

test("current create stores the validated absent end-date state", async () => {
  const result = await createExperience(
    initialExperienceFormState,
    form({ endDate: null, isCurrent: "on" }),
  );
  assert.equal(result.status, "success");
  const creation = calls.find((call) => call.type === "create");
  assert.equal(creation.values.isCurrent, true);
  assert.equal(creation.values.endDate, null);
});

test("invalid periods return field feedback without writing or revalidating", async () => {
  const result = await createExperience(
    initialExperienceFormState,
    form({ endDate: "2024-12-31" }),
  );
  assert.equal(result.status, "error");
  assert(result.errors.endDate.length);
  assert.deepEqual(calls, [{ type: "authorization" }]);
});

test("edit loads the existing row then updates it by validated UUID", async () => {
  const result = await updateExperience(
    id,
    initialExperienceFormState,
    form({ role: "Senior Engineer" }),
  );
  assert.equal(result.status, "success");
  assert.deepEqual(
    calls.slice(0, 3).map((call) => call.type),
    ["authorization", "get", "update"],
  );
  const update = calls.find((call) => call.type === "update");
  assert.equal(update.id, id);
  assert.equal(update.values.role, "Senior Engineer");
});

test("delete confirms the UUID boundary and revalidates both surfaces", async () => {
  const result = await deleteExperience(
    id,
    initialExperienceFormState,
    new FormData(),
  );
  assert.equal(result.status, "success");
  assert(calls.some((call) => call.type === "delete" && call.id === id));
  assert.deepEqual(
    calls.filter((call) => call.type === "revalidate").map((call) => call.path),
    ["/", "/admin/home"],
  );
});

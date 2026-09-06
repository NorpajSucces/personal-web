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
const calls = [];
const database = drizzle(async (query, params) => {
  calls.push({ query, params });
  return { rows: [] };
});

mock.module("../src/db/index.ts", { namedExports: { db: database } });
const {
  createExperienceRecord,
  deleteExperienceRecord,
  getExperiences,
  updateExperienceRecord,
} = await import("../src/features/home/experience-queries.ts");

const values = {
  role: "Software Engineer",
  organization: "Example Studio",
  startDate: new Date("2025-01-01T00:00:00.000Z"),
  endDate: new Date("2025-12-31T00:00:00.000Z"),
  isCurrent: false,
  description: null,
};

beforeEach(() => calls.splice(0));
after(() => {
  mock.restoreAll();
  hooks.deregister();
});

test("Experience list is ordered automatically by newest start date", async () => {
  await getExperiences();
  assert.match(
    calls[0].query,
    /from "experiences" order by "experiences"\."start_date" desc/,
  );
});

test("Experience writes target only the dedicated table and immutable ID", async () => {
  await createExperienceRecord(values);
  assert.match(calls[0].query, /^insert into "experiences"/);

  calls.length = 0;
  await updateExperienceRecord(id, values);
  assert.match(calls[0].query, /^update "experiences"/);
  assert.equal(calls[0].params.at(-1), id);

  calls.length = 0;
  await deleteExperienceRecord(id);
  assert.match(calls[0].query, /^delete from "experiences"/);
  assert.deepEqual(calls[0].params, [id]);
});

test("current rows are persisted with no end date", async () => {
  await createExperienceRecord({ ...values, isCurrent: true, endDate: null });
  assert(calls[0].params.includes(true));
  assert(calls[0].params.includes(null));
});

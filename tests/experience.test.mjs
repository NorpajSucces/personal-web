import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  experienceFormSchema,
  parseExperienceFormData,
} from "../src/features/home/experience-schema.ts";
import {
  dateInputValue,
  formatExperiencePeriod,
  toExperienceView,
} from "../src/features/home/experience.ts";

const validExperience = {
  role: "  Software   Engineer ",
  organization: " Example   Studio ",
  startDate: "2025-01-15",
  endDate: "2026-06-30",
  isCurrent: false,
  description: "  Built reliable product foundations.  ",
};

function experience(overrides = {}) {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    role: "Software Engineer",
    organization: "Example Studio",
    startDate: new Date("2025-01-15T00:00:00.000Z"),
    endDate: new Date("2026-06-30T00:00:00.000Z"),
    isCurrent: false,
    description: "Built reliable product foundations.",
    createdAt: new Date("2026-09-06T00:00:00.000Z"),
    updatedAt: new Date("2026-09-06T00:00:00.000Z"),
    ...overrides,
  };
}

test("Experience input normalizes text and parses strict calendar dates", () => {
  const result = experienceFormSchema.parse(validExperience);
  assert.equal(result.role, "Software Engineer");
  assert.equal(result.organization, "Example Studio");
  assert.equal(result.startDate.toISOString(), "2025-01-15T00:00:00.000Z");
  assert.equal(result.endDate.toISOString(), "2026-06-30T00:00:00.000Z");
  assert.equal(result.description, "Built reliable product foundations.");

  for (const startDate of ["", "2025-02-30", "15-01-2025"])
    assert.equal(
      experienceFormSchema.safeParse({ ...validExperience, startDate }).success,
      false,
    );
});

test("current Experience requires no end date and maps the period to Present", () => {
  const result = experienceFormSchema.parse({
    ...validExperience,
    endDate: "",
    isCurrent: true,
  });
  assert.equal(result.endDate, null);

  const row = experience({ endDate: null, isCurrent: true });
  assert.equal(formatExperiencePeriod(row), "2025 — Present");
  assert.deepEqual(toExperienceView(row), {
    id: row.id,
    role: row.role,
    organization: row.organization,
    description: row.description,
    period: "2025 — Present",
  });
});

test("date-state validation rejects contradictory and reversed periods", () => {
  for (const candidate of [
    { ...validExperience, isCurrent: true },
    { ...validExperience, endDate: "" },
    { ...validExperience, endDate: "2024-12-31" },
  ])
    assert.equal(experienceFormSchema.safeParse(candidate).success, false);
});

test("browser form data omits a disabled current end date safely", () => {
  const data = new FormData();
  data.set("role", "Current role");
  data.set("organization", "Current organization");
  data.set("startDate", "2026-01-01");
  data.set("isCurrent", "on");
  const result = parseExperienceFormData(data);
  assert.equal(result.success, true);
  assert.equal(result.data.endDate, null);
  assert.equal(result.data.description, null);
});

test("public helpers use UTC-safe date values and restrained Experience rendering", () => {
  const row = experience();
  assert.equal(dateInputValue(row.startDate), "2025-01-15");
  assert.equal(dateInputValue(null), "");
  assert.equal(formatExperiencePeriod(row), "2025 — 2026");

  const source = readFileSync(
    new URL("../src/features/home/experience-list.tsx", import.meta.url),
    "utf8",
  );
  assert.match(source, /toExperienceView/);
  assert.match(source, /item\.period/);
  assert.match(source, /item\.role/);
  assert.match(source, /item\.organization/);
  assert.match(source, /item\.description/);
  assert.doesNotMatch(source, /technology|highlight|location|percentage/i);
});

test("migration contains only the constrained RLS-enabled Experience table", () => {
  const migration = readFileSync(
    new URL("../src/db/migrations/0001_add_experiences.sql", import.meta.url),
    "utf8",
  );
  assert.match(migration, /CREATE TABLE "experiences"/);
  assert.match(migration, /"id" uuid PRIMARY KEY DEFAULT gen_random_uuid\(\)/);
  assert.match(migration, /"start_date" date NOT NULL/);
  assert.match(migration, /"end_date" date/);
  assert.match(migration, /CONSTRAINT "experiences_date_state_valid" CHECK/);
  assert.match(migration, /ENABLE ROW LEVEL SECURITY/);
  assert.match(migration, /"experiences_start_date_idx".*"start_date" DESC/);
  assert.doesNotMatch(migration, /CREATE TABLE "(?!experiences")/);
});

test("Home follows the refined sequence without content-preview queries", () => {
  const home = readFileSync(
    new URL("../src/app/(public)/page.tsx", import.meta.url),
    "utf8",
  );
  const markers = [
    'id="hero-title"',
    'id="about"',
    'id="experience"',
    'id="tech"',
    'id="projects"',
    'id="contact"',
    "<footer",
  ];
  let previous = -1;
  for (const marker of markers) {
    const position = home.indexOf(marker);
    assert(position > previous, `${marker} is out of order or missing`);
    previous = position;
  }
  assert.match(home, /getPublicProjects\(3\)/);
  assert.match(home, /size="home"/);
  assert.match(home, /00 \/ Personal digital home/);
  for (const eyebrow of [
    "01 / Profile",
    "02 / Career",
    "03 / Toolkit",
    "04 / Recent work",
    "05 / Connect",
  ])
    assert.match(home, new RegExp(`eyebrow="${eyebrow}"`));
  assert.match(home, /data-home-rail/);
  assert.doesNotMatch(home, /getPublicArticles|Latest articles/i);
  assert.doesNotMatch(home, /getPublicNotes|Latest notes/i);
  assert.doesNotMatch(home, /getPublicLearningEntries|Latest learning/i);
});

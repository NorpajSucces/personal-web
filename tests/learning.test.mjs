import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { learningFormSchema } from "../src/features/learning/schema.ts";
import {
  formatLearningDate,
  groupLearningEntriesByYear,
  learningStatusLabels,
} from "../src/features/learning/status.ts";

const topicId = "11111111-1111-4111-8111-111111111111";
const articleId = "22222222-2222-4222-8222-222222222222";
const noteId = "33333333-3333-4333-8333-333333333333";
const projectId = "44444444-4444-4444-8444-444444444444";

const validLearning = {
  title: "  Understanding   relational boundaries ",
  description: "Connected a learning entry to supporting work.",
  date: "2026-09-08",
  learningStatus: "learning",
  publicationStatus: "draft",
  visibility: "private",
  topicIds: [topicId, topicId],
  articleIds: [articleId],
  noteIds: [noteId],
  projectIds: [projectId],
};

test("valid Learning input normalizes copy, date, defaults, and relationships", () => {
  const result = learningFormSchema.parse(validLearning);
  assert.equal(result.title, "Understanding relational boundaries");
  assert.equal(result.date.toISOString(), "2026-09-08T00:00:00.000Z");
  assert.equal(result.publicationStatus, "draft");
  assert.equal(result.visibility, "private");
  assert.deepEqual(result.topicIds, [topicId]);
  assert.deepEqual(result.articleIds, [articleId]);
  assert.deepEqual(result.noteIds, [noteId]);
  assert.deepEqual(result.projectIds, [projectId]);
});

test("Learning entries group chronologically by UTC year", () => {
  const groups = groupLearningEntriesByYear([
    { date: new Date("2026-09-08T00:00:00.000Z") },
    { date: new Date("2026-01-01T00:00:00.000Z") },
    { date: new Date("2025-12-31T00:00:00.000Z") },
  ]);
  assert.deepEqual(
    groups.map((group) => [group.year, group.entries.length]),
    [
      [2026, 2],
      [2025, 1],
    ],
  );
});

test("Learning validation rejects empty copy, invalid dates, IDs, and statuses", () => {
  for (const candidate of [
    { ...validLearning, title: "  " },
    { ...validLearning, description: "\n" },
    { ...validLearning, date: "2026-02-30" },
    { ...validLearning, learningStatus: "mastered" },
    { ...validLearning, publicationStatus: "scheduled" },
    { ...validLearning, visibility: "members" },
    { ...validLearning, topicIds: ["not-a-uuid"] },
    { ...validLearning, articleIds: ["not-a-uuid"] },
    { ...validLearning, noteIds: ["not-a-uuid"] },
    { ...validLearning, projectIds: ["not-a-uuid"] },
  ])
    assert.equal(learningFormSchema.safeParse(candidate).success, false);
});

test("Learning statuses are stages with readable labels and no progress values", () => {
  assert.deepEqual(learningStatusLabels, {
    exploring: "Exploring",
    learning: "Learning",
    practicing: "Practicing",
  });
  assert.equal(
    formatLearningDate(new Date("2026-09-08T00:00:00.000Z")),
    "September 8, 2026",
  );
  const formSource = readFileSync(
    new URL("../src/features/learning/learning-form.tsx", import.meta.url),
    "utf8",
  );
  assert.doesNotMatch(formSource, /percentage|proficiency|certificate/i);
  assert.doesNotMatch(formSource, /RichTextEditor|Tiptap/);
});

test("Learning has Topics and related entities but no Tags or public slug", () => {
  const schemaSource = readFileSync(
    new URL("../src/features/learning/schema.ts", import.meta.url),
    "utf8",
  );
  const publicPageSource = readFileSync(
    new URL("../src/app/(public)/learning/page.tsx", import.meta.url),
    "utf8",
  );
  assert.match(schemaSource, /topicIds/);
  assert.match(schemaSource, /articleIds/);
  assert.match(schemaSource, /noteIds/);
  assert.match(schemaSource, /projectIds/);
  assert.doesNotMatch(schemaSource, /tagIds|slug/);
  assert.doesNotMatch(publicPageSource, /\[slug\]|getPublicLearningBySlug/);
});

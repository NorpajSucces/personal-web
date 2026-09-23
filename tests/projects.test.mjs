import assert from "node:assert/strict";
import test from "node:test";

import { parseCaseStudy } from "../src/features/projects/case-study.ts";
import {
  parseTechnologies,
  projectFormSchema,
} from "../src/features/projects/schema.ts";
import {
  generateProjectSlug,
  normalizeProjectSlug,
} from "../src/features/projects/slug.ts";
import { formatProjectPeriod } from "../src/features/projects/period.ts";

const validProject = {
  name: "  Personal   Website  ",
  slug: "personal-website",
  description: "A useful project.\n\nWith context.",
  technologies: "Next.js\nTypeScript, PostgreSQL",
  startPeriod: "2024-09",
  endPeriod: "",
  projectStatus: "in_progress",
  publicationStatus: "draft",
  visibility: "private",
  githubUrl: "https://github.com/example/project",
  liveDemoUrl: "",
  screenshotPath: "",
};

test("a valid Project is normalized and accepted", () => {
  assert.deepEqual(projectFormSchema.parse(validProject), {
    ...validProject,
    name: "Personal Website",
    technologies: ["Next.js", "TypeScript", "PostgreSQL"],
    endPeriod: null,
  });
});

test("project periods preserve month or year precision and reject invalid ranges", () => {
  const yearOnly = projectFormSchema.parse({
    ...validProject,
    startPeriod: "2022",
    endPeriod: "2023",
    projectStatus: "completed",
  });
  assert.equal(yearOnly.startPeriod, "2022");
  assert.equal(yearOnly.endPeriod, "2023");

  for (const value of ["2024-00", "2024-13", "24-09", "2024-9", "abcd"]) {
    assert.equal(
      projectFormSchema.safeParse({ ...validProject, startPeriod: value })
        .success,
      false,
    );
  }

  const reversedRange = projectFormSchema.safeParse({
    ...validProject,
    projectStatus: "completed",
    startPeriod: "2024-10",
    endPeriod: "2024-09",
  });
  assert.equal(reversedRange.success, false);

  const inProgressWithEnd = projectFormSchema.safeParse({
    ...validProject,
    endPeriod: "2025-01",
  });
  assert.equal(inProgressWithEnd.success, false);
});

test("project period labels stay compact for one month and clear for ranges", () => {
  assert.equal(
    formatProjectPeriod("2024-09", "2024-09", "completed"),
    "Sep 2024",
  );
  assert.equal(
    formatProjectPeriod("2024-09", "2024-11", "completed"),
    "Sep–Nov 2024",
  );
  assert.equal(
    formatProjectPeriod("2024-12", "2025-02", "completed"),
    "Dec 2024–Feb 2025",
  );
  assert.equal(formatProjectPeriod("2022", "2024", "completed"), "2022–2024");
  assert.equal(
    formatProjectPeriod("2024", null, "in_progress"),
    "2024–Present",
  );
  assert.equal(formatProjectPeriod(null, null, "completed"), null);
});

test("new slugs are generated predictably from Project names", () => {
  assert.equal(generateProjectSlug(" Café & Code: V2 "), "cafe-and-code-v2");
  assert.equal(generateProjectSlug("Already---spaced"), "already-spaced");
  assert.equal(generateProjectSlug("!!!"), "");
});

test("edited slugs normalize simple casing and spacing but reject unsafe syntax", () => {
  assert.equal(normalizeProjectSlug(" My_Project--2026 "), "my-project-2026");
  for (const slug of [
    "project/path",
    "project.name",
    "project?preview=1",
    "!!!",
    "-",
  ]) {
    assert.equal(
      projectFormSchema.safeParse({ ...validProject, slug }).success,
      false,
    );
  }
});

test("technology input removes blanks and case-insensitive duplicates", () => {
  assert.deepEqual(
    parseTechnologies(
      " Next.js,\nnext.js\n TypeScript  \n\nPostgreSQL,typescript",
    ),
    ["Next.js", "TypeScript", "PostgreSQL"],
  );
  assert.deepEqual(parseTechnologies(" \n,  ,"), []);
});

test("invalid external URLs and unsupported statuses are rejected", () => {
  for (const field of ["githubUrl", "liveDemoUrl"]) {
    for (const value of [
      "javascript:alert(1)",
      "ftp://example.com",
      "/relative",
      "invalid",
    ]) {
      assert.equal(
        projectFormSchema.safeParse({ ...validProject, [field]: value })
          .success,
        false,
      );
    }
  }
  for (const [field, value] of [
    ["projectStatus", "almost_done"],
    ["publicationStatus", "archived"],
    ["visibility", "unlisted"],
  ]) {
    assert.equal(
      projectFormSchema.safeParse({ ...validProject, [field]: value }).success,
      false,
    );
  }
});

test("required Project copy cannot be empty", () => {
  for (const field of ["name", "slug", "description"]) {
    assert.equal(
      projectFormSchema.safeParse({ ...validProject, [field]: " \r\n " })
        .success,
      false,
    );
  }
});

test("case studies render only recognizable text-based Tiptap JSON", () => {
  const blocks = parseCaseStudy({
    type: "doc",
    content: [
      {
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text: "Problem" }],
      },
      {
        type: "paragraph",
        content: [{ type: "text", text: "A <script> tag remains text." }],
      },
      {
        type: "bulletList",
        content: [
          {
            type: "listItem",
            content: [
              { type: "paragraph", content: [{ type: "text", text: "First" }] },
            ],
          },
        ],
      },
      { type: "image", attrs: { src: "https://untrusted.example/image.png" } },
    ],
  });
  assert.deepEqual(blocks, [
    { type: "heading", text: "Problem" },
    { type: "paragraph", text: "A <script> tag remains text." },
    { type: "bullet", items: ["First"] },
  ]);
  for (const value of [
    null,
    {},
    { type: "doc" },
    { type: "other", content: [] },
  ]) {
    assert.deepEqual(parseCaseStudy(value), []);
  }
});

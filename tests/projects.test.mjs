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

const validProject = {
  name: "  Personal   Website  ",
  slug: "personal-website",
  description: "A useful project.\n\nWith context.",
  technologies: "Next.js\nTypeScript, PostgreSQL",
  projectStatus: "in_progress",
  publicationStatus: "draft",
  visibility: "private",
  githubUrl: "https://github.com/example/project",
  liveDemoUrl: "",
};

test("a valid Project is normalized and accepted", () => {
  assert.deepEqual(projectFormSchema.parse(validProject), {
    ...validProject,
    name: "Personal Website",
    technologies: ["Next.js", "TypeScript", "PostgreSQL"],
  });
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

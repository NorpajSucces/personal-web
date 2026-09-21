import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { registerHooks } from "node:module";
import { after, beforeEach, mock, test } from "node:test";
import { fileURLToPath } from "node:url";

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
      for (const suffix of [".ts", ".tsx", "/index.ts"]) {
        const candidate = new URL(url.href + suffix);
        if (existsSync(fileURLToPath(candidate)))
          return nextResolve(candidate.href, context);
      }
    }
    return nextResolve(specifier, context);
  },
});

const originalSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
const queryCalls = [];
const updatedAt = new Date("2026-09-07T00:00:00.000Z");

mock.module("../src/features/projects/queries.ts", {
  namedExports: {
    getPublicProjectSitemapEntries: async () => {
      queryCalls.push("projects");
      return [{ slug: "public-project", updatedAt }];
    },
  },
});
mock.module("../src/features/articles/queries.ts", {
  namedExports: {
    getPublicArticleSitemapEntries: async () => {
      queryCalls.push("articles");
      return [{ slug: "public-article", updatedAt }];
    },
  },
});
mock.module("../src/features/notes/queries.ts", {
  namedExports: {
    getPublicNoteSitemapEntries: async () => {
      queryCalls.push("notes");
      return [{ slug: "public-note", updatedAt }];
    },
  },
});

const { default: robots } = await import("../src/app/robots.ts");
const { default: sitemap } = await import("../src/app/sitemap.ts");
const { createPublicMetadata, metadataDescription } =
  await import("../src/lib/seo.ts");
const { getSafeEmailHref, getSafeHttpUrl } = await import("../src/lib/url.ts");

beforeEach(() => {
  queryCalls.length = 0;
  delete process.env.NEXT_PUBLIC_SITE_URL;
});

after(() => {
  if (originalSiteUrl === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
  else process.env.NEXT_PUBLIC_SITE_URL = originalSiteUrl;
  mock.restoreAll();
  hooks.deregister();
});

test("an unconfigured canonical origin fails closed for indexing", async () => {
  const metadata = createPublicMetadata({
    title: "Projects",
    description: "Public work.",
    path: "/projects",
  });
  assert.deepEqual(metadata.robots, {
    index: false,
    follow: false,
    nocache: true,
  });
  assert.deepEqual(robots(), {
    rules: { userAgent: "*", disallow: "/" },
  });
  assert.deepEqual(await sitemap(), []);
  assert.deepEqual(queryCalls, []);
});

test("configured SEO emits canonicals, social metadata, robots and public sitemap URLs", async () => {
  process.env.NEXT_PUBLIC_SITE_URL = "https://zhafran.example";
  const metadata = createPublicMetadata({
    title: "A public Article",
    description: "A concise public description.",
    path: "/articles/a-public-article",
    type: "article",
    publishedAt: updatedAt,
    updatedAt,
  });
  assert.equal(metadata.alternates.canonical, "/articles/a-public-article");
  assert.equal(metadata.openGraph.type, "article");
  assert.equal(metadata.openGraph.title, "A public Article | Zhafran");
  assert.equal(metadata.robots.index, true);
  assert.deepEqual(robots(), {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/admin/"],
    },
    sitemap: "https://zhafran.example/sitemap.xml",
  });

  const entries = await sitemap();
  assert.deepEqual(queryCalls.sort(), ["articles", "notes", "projects"]);
  assert(entries.some(({ url }) => url.endsWith("/projects/public-project")));
  assert(entries.some(({ url }) => url.endsWith("/articles/public-article")));
  assert(entries.some(({ url }) => url.endsWith("/notes/public-note")));
  assert.equal(
    entries.some(({ url }) => url.includes("/admin")),
    false,
  );
});

test("metadata descriptions are normalized and bounded", () => {
  const description = metadataDescription(`  ${"word ".repeat(50)}  `);
  assert.equal(description.includes("  "), false);
  assert(description.length <= 160);
  assert(description.endsWith("…"));
});

test("publicly editable URLs reject unsafe schemes and credentials", () => {
  assert.equal(
    getSafeHttpUrl("https://example.com/path"),
    "https://example.com/path",
  );
  for (const value of [
    "javascript:alert(1)",
    "data:text/html,unsafe",
    "https://user:password@example.com",
    " https://example.com",
    "https://example.com\n",
    "//example.com/path",
  ]) {
    assert.equal(getSafeHttpUrl(value), null);
  }
  assert.equal(
    getSafeEmailHref("owner@example.com"),
    "mailto:owner@example.com",
  );
  assert.equal(
    getSafeEmailHref("owner%0A@example.com"),
    "mailto:owner%250A@example.com",
  );
  assert.equal(
    getSafeEmailHref("owner@example.com\r\nBcc:other@example.com"),
    null,
  );
  assert.equal(getSafeEmailHref("owner\u2028@example.com"), null);
});

test("Admin and dynamic public routes retain their indexing boundaries", async () => {
  const [adminLayout, projectPage, articlePage, notePage, proxy] =
    await Promise.all(
      [
        "../src/app/admin/layout.tsx",
        "../src/app/(public)/projects/[slug]/page.tsx",
        "../src/app/(public)/articles/[slug]/page.tsx",
        "../src/app/(public)/notes/[slug]/page.tsx",
        "../src/lib/supabase/proxy.ts",
      ].map((path) => readFile(new URL(path, import.meta.url), "utf8")),
    );
  assert.match(adminLayout, /robots: noIndexRobots/);
  assert.match(proxy, /private, no-cache, no-store/);
  for (const source of [projectPage, articlePage, notePage]) {
    assert.match(source, /get(?:Cached)?Public[A-Za-z]+BySlug/);
    assert.match(source, /createNotFoundMetadata\(\)/);
  }
});

test("every CMS mutation authorizes before processing input", async () => {
  const actionFiles = [
    "../src/features/home/actions.ts",
    "../src/features/home/experience-actions.ts",
    "../src/features/projects/actions.ts",
    "../src/features/articles/actions.ts",
    "../src/features/notes/actions.ts",
    "../src/features/learning/actions.ts",
    "../src/features/taxonomy/actions.ts",
  ];
  for (const path of actionFiles) {
    const source = await readFile(new URL(path, import.meta.url), "utf8");
    const exports = source.matchAll(
      /export async function [^(]+\([^]*?\)\s*(?::[^\{]+)?\{/g,
    );
    for (const match of exports) {
      const functionStart = match.index + match[0].length;
      assert.match(
        source.slice(functionStart, functionStart + 180),
        /await requireAdmin\(\)/,
      );
    }
  }
});

test("rich content keeps keyboard focus and semantic table/link safeguards", async () => {
  const [renderer, editor, styles] = await Promise.all(
    [
      "../src/features/rich-text/renderer.tsx",
      "../src/features/rich-text/editor.tsx",
      "../src/app/globals.css",
    ].map((path) => readFile(new URL(path, import.meta.url), "utf8")),
  );
  assert.match(renderer, /scope="col"/);
  assert.match(renderer, /aria-label="Scrollable content table"/);
  assert.match(renderer, /ExternalLink/);
  assert.match(editor, /"aria-multiline": "true"/);
  assert.match(editor, /element\.setAttribute\("aria-invalid"/);
  assert.match(editor, /role="region"/);
  assert.match(styles, /\.rich-text-editor-content:focus-visible/);
});

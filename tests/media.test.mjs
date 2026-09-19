import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  getMediaExtension,
  getMediaUrl,
  isValidMediaPath,
  MAX_MEDIA_SIZE,
} from "../src/features/media/config.ts";
import {
  hasMeaningfulRichText,
  isRichTextDocument,
} from "../src/features/rich-text/contract.ts";

test("media paths are stable URLs and reject traversal", () => {
  assert.equal(isValidMediaPath("article/image one.webp"), true);
  assert.equal(
    getMediaUrl("article/image one.webp"),
    "/api/media/article/image%20one.webp",
  );
  for (const path of [
    "",
    "/media.png",
    "../media.png",
    "a/../media.png",
    "a\\media.png",
  ])
    assert.equal(isValidMediaPath(path), false);
});

test("media validation maps trusted MIME types and enforces the shared size limit", () => {
  assert.equal(getMediaExtension("image/jpeg"), "jpg");
  assert.equal(getMediaExtension("image/webp"), "webp");
  assert.equal(getMediaExtension("image/svg+xml"), null);
  assert.equal(MAX_MEDIA_SIZE, 5 * 1024 * 1024);
});

test("canonical rich text accepts valid private media references only", () => {
  const imageDocument = {
    type: "doc",
    content: [
      {
        type: "image",
        attrs: {
          path: "editor/asset.webp",
          alt: "A useful diagram",
          title: null,
        },
      },
    ],
  };
  assert.equal(isRichTextDocument(imageDocument), true);
  assert.equal(hasMeaningfulRichText(imageDocument), true);
  assert.equal(
    isRichTextDocument({
      ...imageDocument,
      content: [{ type: "image", attrs: { path: "../private.webp" } }],
    }),
    false,
  );
});

test("the Storage migration creates an idempotent private image bucket", () => {
  const migration = readFileSync(
    new URL(
      "../src/db/migrations/0002_add_private_media_bucket.sql",
      import.meta.url,
    ),
    "utf8",
  );
  assert.match(migration, /insert into storage\.buckets/);
  assert.match(migration, /false/);
  assert.match(migration, /5242880/);
  assert.match(migration, /on conflict \(id\) do update/);
  assert.doesNotMatch(migration, /create policy|public\s*=\s*true/i);
});

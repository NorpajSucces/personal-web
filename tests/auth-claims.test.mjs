import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { registerHooks } from "node:module";
import { after, mock, test } from "node:test";
import { fileURLToPath } from "node:url";

const sourceRoot = new URL("../src/", import.meta.url);
const hooks = registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === "server-only")
      return { url: "data:text/javascript,export {};", shortCircuit: true };
    if (specifier === "next/navigation")
      return nextResolve("next/navigation.js", context);
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

const owner = "11111111-1111-4111-8111-111111111111";
const stranger = "22222222-2222-4222-8222-222222222222";
const originalAdminUserId = process.env.ADMIN_USER_ID;
let claimsResult = { data: { claims: { sub: owner } }, error: null };
let claimsCalls = 0;

mock.module("../src/lib/supabase/server.ts", {
  namedExports: {
    createClient: async () => ({
      auth: {
        getClaims: async () => {
          claimsCalls += 1;
          return claimsResult;
        },
        getUser: async () => {
          throw new Error(
            "getUser should not be called for page authorization",
          );
        },
      },
    }),
  },
});

const { getCurrentAdmin } = await import("../src/lib/auth/admin.ts");

after(() => {
  if (originalAdminUserId === undefined) delete process.env.ADMIN_USER_ID;
  else process.env.ADMIN_USER_ID = originalAdminUserId;
  mock.restoreAll();
  hooks.deregister();
});

test("admin page access accepts only verified claims with the configured ID", async () => {
  process.env.ADMIN_USER_ID = owner;
  claimsCalls = 0;
  claimsResult = { data: { claims: { sub: owner } }, error: null };
  assert.equal((await getCurrentAdmin())?.sub, owner);
  assert.equal(claimsCalls, 1);

  claimsResult = { data: { claims: { sub: stranger } }, error: null };
  assert.equal(await getCurrentAdmin(), null);

  claimsResult = { data: { claims: { sub: owner } }, error: { status: 401 } };
  assert.equal(await getCurrentAdmin(), null);

  claimsResult = { data: null, error: null };
  assert.equal(await getCurrentAdmin(), null);
});

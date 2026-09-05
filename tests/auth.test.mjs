import assert from "node:assert/strict";
import { test } from "node:test";

import { requestSignInCode, verifyAdminCode } from "../src/lib/auth/otp.ts";
import { isAdminIdentity } from "../src/lib/auth/policy.ts";
import { emailSchema, otpSchema } from "../src/lib/auth/validation.ts";

const owner = "11111111-1111-4111-8111-111111111111";
const stranger = "22222222-2222-4222-8222-222222222222";
const email = "owner@example.test";
const testCode = "123456";

function mockAuth(overrides = {}) {
  const calls = [];
  return {
    calls,
    async signInWithOtp(input) {
      calls.push(["request", input]);
      return { error: null };
    },
    async verifyOtp(input) {
      calls.push(["verify", input]);
      return { error: null };
    },
    async getUser() {
      calls.push(["identity"]);
      return { data: { user: { id: owner } }, error: null };
    },
    async signOut(input) {
      calls.push(["logout", input]);
      return { error: null };
    },
    ...overrides,
  };
}

test("authorization requires the exact immutable ID and fails closed", () => {
  assert.equal(isAdminIdentity(owner, owner), true);
  for (const id of [stranger, email, "", null, undefined]) {
    assert.equal(isAdminIdentity(id, owner), false);
  }
  assert.equal(isAdminIdentity(owner, undefined), false);
  assert.equal(isAdminIdentity("", ""), false);
});

test("email input is normalized and invalid external input is rejected", () => {
  assert.equal(emailSchema.parse("  OWNER@EXAMPLE.TEST  "), email);
  for (const input of [null, undefined, 123, "invalid", "a".repeat(255)]) {
    assert.equal(emailSchema.safeParse(input).success, false);
  }
});

test("codes preserve leading zeros and accept only supported numeric lengths", () => {
  assert.equal(otpSchema.parse(" 001234 "), "001234");
  assert.equal(otpSchema.safeParse("12345678").success, true);
  for (const input of [
    null,
    123456,
    "12345",
    "12345678901",
    "abc123",
    "12 3456",
  ]) {
    assert.equal(otpSchema.safeParse(input).success, false);
  }
});

test("request never enables automatic user creation", async () => {
  const auth = mockAuth();
  assert.equal(await requestSignInCode(auth, email), undefined);
  assert.deepEqual(auth.calls, [
    ["request", { email, options: { shouldCreateUser: false } }],
  ]);
});

test("unknown accounts, rate limits and transport errors are not disclosed", async () => {
  for (const result of [
    { error: null },
    { error: { code: "user_not_found" } },
    { error: { status: 429 } },
  ]) {
    const auth = mockAuth({ signInWithOtp: async () => result });
    assert.equal(await requestSignInCode(auth, email), undefined);
  }
  const auth = mockAuth({
    signInWithOtp: async () => {
      throw new Error("Transport failed");
    },
  });
  assert.equal(await requestSignInCode(auth, email), undefined);
});

test("successful verification checks the Auth server before authorizing", async () => {
  const auth = mockAuth();
  assert.equal(await verifyAdminCode(auth, email, testCode, owner), true);
  assert.deepEqual(auth.calls, [
    ["verify", { email, token: testCode, type: "email" }],
    ["identity"],
  ]);
});

test("incorrect or expired code cannot authorize", async () => {
  const auth = mockAuth({
    verifyOtp: async () => ({ error: { code: "otp_expired" } }),
  });
  assert.equal(await verifyAdminCode(auth, email, testCode, owner), false);
  assert.deepEqual(auth.calls, []);
});

test("a claimed admin in session data cannot override trusted non-admin identity", async () => {
  const auth = mockAuth({
    verifyOtp: async () => ({ data: { user: { id: owner } }, error: null }),
    getUser: async () => ({ data: { user: { id: stranger } }, error: null }),
  });
  assert.equal(await verifyAdminCode(auth, email, testCode, owner), false);
  assert.deepEqual(auth.calls, [["logout", { scope: "local" }]]);
});

test("identity failure or absent user denies access and clears the session", async () => {
  for (const result of [
    { data: { user: null }, error: null },
    { data: { user: { id: owner } }, error: { status: 401 } },
  ]) {
    const auth = mockAuth({ getUser: async () => result });
    assert.equal(await verifyAdminCode(auth, email, testCode, owner), false);
    assert.equal(auth.calls.at(-1)[0], "logout");
  }
});

test("network and sign-out failures never grant access", async () => {
  const unavailable = async () => {
    throw new Error("Unavailable");
  };
  for (const overrides of [
    { verifyOtp: unavailable },
    { getUser: unavailable },
    {
      getUser: async () => ({ data: { user: { id: stranger } }, error: null }),
      signOut: unavailable,
    },
  ]) {
    assert.equal(
      await verifyAdminCode(mockAuth(overrides), email, testCode, owner),
      false,
    );
  }
});

import assert from "node:assert/strict";
import { existsSync } from "node:fs";
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

const envNames = ["RESEND_API_KEY", "CONTACT_EMAIL", "CONTACT_FROM_EMAIL"];
const originalEnv = Object.fromEntries(
  envNames.map((name) => [name, process.env[name]]),
);
let providerBehavior;
const calls = [];

class MockResend {
  constructor(apiKey) {
    calls.push({ type: "constructor", apiKey });
  }

  emails = {
    send: async (payload, options) => {
      calls.push({ type: "send", payload, options });
      if (providerBehavior === "throw")
        throw new Error("Sensitive provider diagnostics");
      if (providerBehavior === "error")
        return {
          data: null,
          error: { message: "Sensitive provider diagnostics" },
        };
      return { data: { id: "email-id" }, error: null };
    },
  };
}

mock.module("resend", { namedExports: { Resend: MockResend } });

const { deliverContactMessage } =
  await import("../src/features/contact/email.ts");

const values = {
  name: "Visitor",
  email: "visitor@example.com",
  message: "A valid message from the website form.",
};
const submissionId = "11111111-1111-4111-8111-111111111111";

beforeEach(() => {
  process.env.RESEND_API_KEY = "test-api-key";
  process.env.CONTACT_EMAIL = "owner@example.com";
  process.env.CONTACT_FROM_EMAIL = "Personal Website <onboarding@resend.dev>";
  providerBehavior = "success";
  calls.length = 0;
});
after(() => {
  for (const name of envNames) {
    const value = originalEnv[name];
    if (value === undefined) delete process.env[name];
    else process.env[name] = value;
  }
  mock.restoreAll();
  hooks.deregister();
});

test("Resend receives the trusted From and To with visitor Reply-To", async () => {
  assert.equal(await deliverContactMessage(values, submissionId), true);
  assert.deepEqual(calls[0], {
    type: "constructor",
    apiKey: "test-api-key",
  });
  const send = calls[1];
  assert.equal(send.payload.from, process.env.CONTACT_FROM_EMAIL);
  assert.equal(send.payload.to, process.env.CONTACT_EMAIL);
  assert.equal(send.payload.replyTo, values.email);
  assert.notEqual(send.payload.from, values.email);
  assert.equal(send.payload.subject, "New message from the personal website");
  assert.match(send.payload.text, /Name: Visitor/);
  assert.match(send.payload.text, /Email: visitor@example\.com/);
  assert.match(send.payload.text, /Message:\nA valid message/);
  assert.deepEqual(send.options, {
    idempotencyKey: `contact/${submissionId}`,
  });
});

test("Resend error responses and exceptions are converted to failure", async () => {
  providerBehavior = "error";
  assert.equal(await deliverContactMessage(values, submissionId), false);
  calls.length = 0;
  providerBehavior = "throw";
  assert.equal(await deliverContactMessage(values, submissionId), false);
});

test("missing or invalid email configuration fails before provider access", async () => {
  for (const [name, value] of [
    ["RESEND_API_KEY", ""],
    ["CONTACT_EMAIL", "invalid"],
    ["CONTACT_FROM_EMAIL", "invalid"],
  ]) {
    process.env[name] = value;
    calls.length = 0;
    assert.equal(await deliverContactMessage(values, submissionId), false);
    assert.equal(calls.length, 0);
    process.env.RESEND_API_KEY = "test-api-key";
    process.env.CONTACT_EMAIL = "owner@example.com";
    process.env.CONTACT_FROM_EMAIL = "Personal Website <onboarding@resend.dev>";
  }
});

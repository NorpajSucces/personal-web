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

const submissionId = "11111111-1111-4111-8111-111111111111";
let deliverySucceeds;
const deliveries = [];

mock.module("../src/features/contact/email.ts", {
  namedExports: {
    deliverContactMessage: async (values, id) => {
      deliveries.push({ values, id });
      return deliverySucceeds;
    },
  },
});

const { sendContactMessage } =
  await import("../src/features/contact/actions.ts");
const { initialContactFormState } =
  await import("../src/features/contact/schema.ts");

function contactForm(overrides = {}) {
  const values = {
    submissionId,
    website: "",
    name: "Visitor",
    email: "visitor@example.com",
    message: "A valid message from the website form.",
    ...overrides,
  };
  const formData = new FormData();
  for (const [key, value] of Object.entries(values)) formData.set(key, value);
  return formData;
}

beforeEach(() => {
  deliverySucceeds = true;
  deliveries.length = 0;
});
after(() => {
  mock.restoreAll();
  hooks.deregister();
});

test("valid Contact submission invokes delivery with normalized values", async () => {
  const result = await sendContactMessage(
    initialContactFormState,
    contactForm({ name: "  Visitor  ", email: "VISITOR@EXAMPLE.COM" }),
  );
  assert.equal(result.status, "success");
  assert.equal(result.message, "Message sent. Thanks for reaching out.");
  assert.deepEqual(deliveries, [
    {
      id: submissionId,
      values: {
        name: "Visitor",
        email: "visitor@example.com",
        message: "A valid message from the website form.",
      },
    },
  ]);
});

test("invalid Contact fields return specific errors without delivery", async () => {
  const result = await sendContactMessage(
    initialContactFormState,
    contactForm({ name: " ", email: "invalid", message: "short" }),
  );
  assert.equal(result.status, "error");
  assert(result.errors.name.length);
  assert(result.errors.email.length);
  assert(result.errors.message.length);
  assert.equal(deliveries.length, 0);
});

test("a populated honeypot is discarded without calling Resend", async () => {
  const result = await sendContactMessage(
    initialContactFormState,
    contactForm({ website: "https://spam.example" }),
  );
  assert.equal(result.status, "success");
  assert.equal(deliveries.length, 0);
});

test("invalid submission metadata cannot invoke delivery", async () => {
  const result = await sendContactMessage(
    initialContactFormState,
    contactForm({ submissionId: "tampered" }),
  );
  assert.equal(result.status, "error");
  assert.equal(deliveries.length, 0);
});

test("provider failure returns generic feedback without provider details", async () => {
  deliverySucceeds = false;
  const result = await sendContactMessage(
    initialContactFormState,
    contactForm(),
  );
  assert.equal(result.status, "error");
  assert.equal(
    result.message,
    "Something went wrong while sending your message. Please try again.",
  );
  assert.equal(JSON.stringify(result).includes("Resend"), false);
});

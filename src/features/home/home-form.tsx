"use client";

import { useActionState, useEffect, useRef, useState } from "react";

import { saveHomeContent } from "./actions";
import type { HomeContentValues, HomeFormState } from "./schema";

const initialState: HomeFormState = { status: "idle", message: "" };
const sections = [
  {
    title: "Hero",
    fields: [
      { name: "heroTitle", label: "Hero title", type: "text", required: true },
      {
        name: "heroDescription",
        label: "Hero description",
        type: "textarea",
        required: true,
      },
    ],
  },
  {
    title: "About",
    fields: [
      {
        name: "aboutTitle",
        label: "About title",
        type: "text",
        required: true,
      },
      {
        name: "aboutContent",
        label: "About content",
        type: "textarea",
        required: true,
      },
    ],
  },
  {
    title: "Contact",
    fields: [
      {
        name: "contactTitle",
        label: "Contact title",
        type: "text",
        required: true,
      },
      {
        name: "contactDescription",
        label: "Contact description",
        type: "textarea",
        required: true,
      },
      {
        name: "publicEmail",
        label: "Public email",
        type: "email",
        required: false,
      },
      { name: "githubUrl", label: "GitHub URL", type: "url", required: false },
      {
        name: "linkedinUrl",
        label: "LinkedIn URL",
        type: "url",
        required: false,
      },
    ],
  },
] as const;

export function HomeForm({
  initialValues,
}: {
  initialValues: HomeContentValues;
}) {
  const [values, setValues] = useState(initialValues);
  const [state, action, pending] = useActionState(
    saveHomeContent,
    initialState,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.errors) {
      formRef.current
        ?.querySelector<HTMLElement>('[aria-invalid="true"]')
        ?.focus();
    }
  }, [state]);

  return (
    <form
      ref={formRef}
      action={action}
      noValidate
      aria-busy={pending}
      className="space-y-8"
    >
      <p className="text-sm leading-6 text-muted-foreground">
        Changes appear on the public Home as soon as you save. All content is
        plain text. Fields marked optional can be left empty.
      </p>
      {sections.map((section) => (
        <fieldset
          key={section.title}
          className="min-w-0 space-y-5 rounded-lg border bg-card p-5 sm:p-6"
        >
          <legend className="px-2 font-serif text-2xl">{section.title}</legend>
          {section.fields.map((field) => {
            const errors = state.errors?.[field.name];
            const props = {
              id: field.name,
              name: field.name,
              value: values[field.name],
              required: field.required,
              readOnly: pending,
              "aria-invalid": Boolean(errors?.length),
              "aria-describedby": errors?.length
                ? `${field.name}-error`
                : undefined,
              className:
                "block min-h-11 w-full min-w-0 rounded-md border border-input bg-background px-3 py-2 text-base leading-7 aria-invalid:border-destructive",
              onChange: (
                event: React.ChangeEvent<
                  HTMLInputElement | HTMLTextAreaElement
                >,
              ) =>
                setValues((current) => ({
                  ...current,
                  [field.name]: event.target.value,
                })),
            };

            return (
              <div key={field.name} className="space-y-2">
                <label
                  htmlFor={field.name}
                  className="block text-sm font-medium"
                >
                  {field.label}
                  {!field.required && (
                    <span className="font-normal text-muted-foreground">
                      {" "}
                      (optional)
                    </span>
                  )}
                </label>
                {field.type === "textarea" ? (
                  <textarea
                    {...props}
                    rows={field.name === "aboutContent" ? 6 : 3}
                  />
                ) : (
                  <input {...props} type={field.type} />
                )}
                {errors?.length ? (
                  <p
                    id={`${field.name}-error`}
                    className="text-sm text-destructive"
                  >
                    {errors[0]}
                  </p>
                ) : null}
              </div>
            );
          })}
        </fieldset>
      ))}
      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="min-h-11 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-wait disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save Home"}
        </button>
        <p
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="text-sm text-muted-foreground"
        >
          {pending ? "Saving your changes…" : state.message}
        </p>
      </div>
    </form>
  );
}

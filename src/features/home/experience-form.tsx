"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";

import {
  initialExperienceFormState,
  type ExperienceFormField,
  type ExperienceFormState,
} from "./experience-schema";

export type ExperienceFormInitialValues = {
  role: string;
  organization: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  description: string;
};

type ExperienceFormProps = {
  action: (
    state: ExperienceFormState,
    formData: FormData,
  ) => Promise<ExperienceFormState>;
  initialValues: ExperienceFormInitialValues;
  mode: "create" | "edit";
};

const inputClassName =
  "block min-h-11 w-full min-w-0 rounded-md border border-input bg-background px-3 py-2 text-base leading-7 aria-invalid:border-destructive disabled:cursor-not-allowed disabled:opacity-60";

export const newExperienceValues: ExperienceFormInitialValues = {
  role: "",
  organization: "",
  startDate: "",
  endDate: "",
  isCurrent: false,
  description: "",
};

function FieldError({ error, id }: { error?: string; id: string }) {
  return error ? (
    <p id={id} className="text-sm text-destructive">
      {error}
    </p>
  ) : null;
}

export function ExperienceForm({
  action,
  initialValues,
  mode,
}: ExperienceFormProps) {
  const [values, setValues] = useState(initialValues);
  const [state, formAction, pending] = useActionState(
    async (previousState: ExperienceFormState, formData: FormData) => {
      const result = await action(previousState, formData);
      if (mode === "create" && result.status === "success")
        setValues(newExperienceValues);
      return result;
    },
    initialExperienceFormState,
  );
  const formId = useId();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.errors)
      formRef.current
        ?.querySelector<HTMLElement>('[aria-invalid="true"]')
        ?.focus();
  }, [state]);

  function updateValue(
    field: "role" | "organization" | "startDate" | "endDate" | "description",
    value: string,
  ) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function errorProps(field: ExperienceFormField) {
    const errors = state.errors?.[field];
    return {
      "aria-invalid": Boolean(errors?.length),
      "aria-describedby": errors?.length
        ? `${formId}-${field}-error`
        : undefined,
    };
  }

  return (
    <form
      ref={formRef}
      action={formAction}
      noValidate
      aria-busy={pending}
      className="space-y-5"
    >
      <fieldset disabled={pending} className="space-y-5 disabled:opacity-75">
        <legend className="sr-only">
          {mode === "create" ? "New Experience" : "Edit Experience"}
        </legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <label
              htmlFor={`${formId}-role`}
              className="block text-sm font-medium"
            >
              Role
            </label>
            <input
              {...errorProps("role")}
              id={`${formId}-role`}
              name="role"
              value={values.role}
              required
              className={inputClassName}
              onChange={(event) => updateValue("role", event.target.value)}
            />
            <FieldError
              id={`${formId}-role-error`}
              error={state.errors?.role?.[0]}
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor={`${formId}-organization`}
              className="block text-sm font-medium"
            >
              Organization
            </label>
            <input
              {...errorProps("organization")}
              id={`${formId}-organization`}
              name="organization"
              value={values.organization}
              required
              className={inputClassName}
              onChange={(event) =>
                updateValue("organization", event.target.value)
              }
            />
            <FieldError
              id={`${formId}-organization-error`}
              error={state.errors?.organization?.[0]}
            />
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <label
              htmlFor={`${formId}-startDate`}
              className="block text-sm font-medium"
            >
              Start date
            </label>
            <input
              {...errorProps("startDate")}
              id={`${formId}-startDate`}
              name="startDate"
              type="date"
              value={values.startDate}
              required
              className={inputClassName}
              onChange={(event) => updateValue("startDate", event.target.value)}
            />
            <FieldError
              id={`${formId}-startDate-error`}
              error={state.errors?.startDate?.[0]}
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor={`${formId}-endDate`}
              className="block text-sm font-medium"
            >
              End date
            </label>
            <input
              {...errorProps("endDate")}
              id={`${formId}-endDate`}
              name="endDate"
              type="date"
              value={values.endDate}
              required={!values.isCurrent}
              disabled={values.isCurrent}
              className={inputClassName}
              onChange={(event) => updateValue("endDate", event.target.value)}
            />
            <FieldError
              id={`${formId}-endDate-error`}
              error={state.errors?.endDate?.[0]}
            />
          </div>
        </div>
        <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border px-3 text-sm">
          <input
            type="checkbox"
            name="isCurrent"
            checked={values.isCurrent}
            className="size-4 accent-current"
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                isCurrent: event.target.checked,
                endDate: event.target.checked ? "" : current.endDate,
              }))
            }
          />
          Currently here
        </label>
        <div className="space-y-2">
          <label
            htmlFor={`${formId}-description`}
            className="block text-sm font-medium"
          >
            Description{" "}
            <span className="font-normal text-muted-foreground">
              (optional)
            </span>
          </label>
          <textarea
            {...errorProps("description")}
            id={`${formId}-description`}
            name="description"
            value={values.description}
            rows={3}
            className={inputClassName}
            onChange={(event) => updateValue("description", event.target.value)}
          />
          <FieldError
            id={`${formId}-description-error`}
            error={state.errors?.description?.[0]}
          />
        </div>
      </fieldset>
      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="min-h-11 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:cursor-wait disabled:opacity-60"
        >
          {pending
            ? "Saving…"
            : mode === "create"
              ? "Add Experience"
              : "Save Experience"}
        </button>
        <p
          role="status"
          aria-live="polite"
          className="text-sm text-muted-foreground"
        >
          {pending ? "Saving Experience…" : state.message}
        </p>
      </div>
    </form>
  );
}

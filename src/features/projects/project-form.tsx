"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";

import { generateProjectSlug } from "./slug";
import {
  initialProjectFormState,
  type ProjectFormField,
  type ProjectFormState,
} from "./schema";

export type ProjectFormInitialValues = {
  name: string;
  slug: string;
  description: string;
  technologies: string;
  projectStatus: "in_progress" | "completed";
  publicationStatus: "draft" | "published";
  visibility: "private" | "public";
  githubUrl: string;
  liveDemoUrl: string;
};

type ProjectFormProps = {
  action: (
    state: ProjectFormState,
    formData: FormData,
  ) => Promise<ProjectFormState>;
  initialValues: ProjectFormInitialValues;
  mode: "create" | "edit";
  hasScreenshot?: boolean;
  hasCaseStudy?: boolean;
};

const inputClassName =
  "block min-h-11 w-full min-w-0 rounded-md border border-input bg-background px-3 py-2 text-base leading-7 aria-invalid:border-destructive";

function FieldError({
  field,
  error,
}: {
  field: ProjectFormField;
  error?: string;
}) {
  return error ? (
    <p id={`${field}-error`} className="text-sm text-destructive">
      {error}
    </p>
  ) : null;
}

export const newProjectValues: ProjectFormInitialValues = {
  name: "",
  slug: "",
  description: "",
  technologies: "",
  projectStatus: "in_progress",
  publicationStatus: "draft",
  visibility: "private",
  githubUrl: "",
  liveDemoUrl: "",
};

export function ProjectForm({
  action,
  initialValues,
  mode,
  hasScreenshot = false,
  hasCaseStudy = false,
}: ProjectFormProps) {
  const [values, setValues] = useState(initialValues);
  const [slugWasEdited, setSlugWasEdited] = useState(mode === "edit");
  const [state, formAction, pending] = useActionState(
    action,
    initialProjectFormState,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.errors) {
      formRef.current
        ?.querySelector<HTMLElement>('[aria-invalid="true"]')
        ?.focus();
    }
  }, [state]);

  function updateValue(field: keyof ProjectFormInitialValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function errorProps(field: ProjectFormField) {
    const errors = state.errors?.[field];
    return {
      "aria-invalid": Boolean(errors?.length),
      "aria-describedby": errors?.length ? `${field}-error` : undefined,
    };
  }

  return (
    <form
      ref={formRef}
      action={formAction}
      noValidate
      aria-busy={pending}
      className="space-y-8"
    >
      <fieldset
        disabled={pending}
        className="min-w-0 space-y-6 rounded-lg border bg-card p-5 disabled:opacity-75 sm:p-6"
      >
        <legend className="px-2 font-serif text-2xl">Project details</legend>

        <div className="grid min-w-0 gap-5 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <label htmlFor="name" className="block text-sm font-medium">
              Name
            </label>
            <input
              {...errorProps("name")}
              id="name"
              name="name"
              value={values.name}
              required
              autoFocus={mode === "create"}
              className={inputClassName}
              onChange={(event) => {
                const name = event.target.value;
                setValues((current) => ({
                  ...current,
                  name,
                  slug:
                    mode === "create" && !slugWasEdited
                      ? generateProjectSlug(name)
                      : current.slug,
                }));
              }}
            />
            <FieldError field="name" error={state.errors?.name?.[0]} />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <label htmlFor="slug" className="block text-sm font-medium">
              Slug
            </label>
            <input
              {...errorProps("slug")}
              id="slug"
              name="slug"
              value={values.slug}
              required
              spellCheck={false}
              autoCapitalize="none"
              className={inputClassName}
              onChange={(event) => {
                setSlugWasEdited(true);
                updateValue("slug", event.target.value);
              }}
            />
            <p className="text-sm text-muted-foreground">
              Public URL: /projects/{values.slug || "your-project"}
            </p>
            <FieldError field="slug" error={state.errors?.slug?.[0]} />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium">
              Description
            </label>
            <textarea
              {...errorProps("description")}
              id="description"
              name="description"
              value={values.description}
              required
              rows={6}
              className={inputClassName}
              onChange={(event) =>
                updateValue("description", event.target.value)
              }
            />
            <FieldError
              field="description"
              error={state.errors?.description?.[0]}
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <label htmlFor="technologies" className="block text-sm font-medium">
              Technologies
            </label>
            <textarea
              {...errorProps("technologies")}
              id="technologies"
              name="technologies"
              value={values.technologies}
              rows={4}
              className={inputClassName}
              onChange={(event) =>
                updateValue("technologies", event.target.value)
              }
            />
            <p className="text-sm text-muted-foreground">
              Enter one technology per line or separate entries with commas.
              Blank and duplicate entries are removed on save.
            </p>
            <FieldError
              field="technologies"
              error={state.errors?.technologies?.[0]}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="githubUrl" className="block text-sm font-medium">
              GitHub URL{" "}
              <span className="font-normal text-muted-foreground">
                (optional)
              </span>
            </label>
            <input
              {...errorProps("githubUrl")}
              id="githubUrl"
              name="githubUrl"
              type="url"
              value={values.githubUrl}
              className={inputClassName}
              onChange={(event) => updateValue("githubUrl", event.target.value)}
            />
            <FieldError
              field="githubUrl"
              error={state.errors?.githubUrl?.[0]}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="liveDemoUrl" className="block text-sm font-medium">
              Live demo URL{" "}
              <span className="font-normal text-muted-foreground">
                (optional)
              </span>
            </label>
            <input
              {...errorProps("liveDemoUrl")}
              id="liveDemoUrl"
              name="liveDemoUrl"
              type="url"
              value={values.liveDemoUrl}
              className={inputClassName}
              onChange={(event) =>
                updateValue("liveDemoUrl", event.target.value)
              }
            />
            <FieldError
              field="liveDemoUrl"
              error={state.errors?.liveDemoUrl?.[0]}
            />
          </div>
        </div>
      </fieldset>

      <fieldset
        disabled={pending}
        className="min-w-0 space-y-5 rounded-lg border bg-card p-5 disabled:opacity-75 sm:p-6"
      >
        <legend className="px-2 font-serif text-2xl">Publishing</legend>
        <p className="text-sm leading-6 text-muted-foreground">
          A project appears publicly only when it is both Published and Public.
        </p>
        <div className="grid gap-5 sm:grid-cols-3">
          <div className="space-y-2">
            <label
              htmlFor="projectStatus"
              className="block text-sm font-medium"
            >
              Project status
            </label>
            <select
              {...errorProps("projectStatus")}
              id="projectStatus"
              name="projectStatus"
              value={values.projectStatus}
              className={inputClassName}
              onChange={(event) =>
                updateValue("projectStatus", event.target.value)
              }
            >
              <option value="in_progress">In progress</option>
              <option value="completed">Completed</option>
            </select>
            <FieldError
              field="projectStatus"
              error={state.errors?.projectStatus?.[0]}
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="publicationStatus"
              className="block text-sm font-medium"
            >
              Publication status
            </label>
            <select
              {...errorProps("publicationStatus")}
              id="publicationStatus"
              name="publicationStatus"
              value={values.publicationStatus}
              className={inputClassName}
              onChange={(event) =>
                updateValue("publicationStatus", event.target.value)
              }
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
            <FieldError
              field="publicationStatus"
              error={state.errors?.publicationStatus?.[0]}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="visibility" className="block text-sm font-medium">
              Visibility
            </label>
            <select
              {...errorProps("visibility")}
              id="visibility"
              name="visibility"
              value={values.visibility}
              className={inputClassName}
              onChange={(event) =>
                updateValue("visibility", event.target.value)
              }
            >
              <option value="private">Private</option>
              <option value="public">Public</option>
            </select>
            <FieldError
              field="visibility"
              error={state.errors?.visibility?.[0]}
            />
          </div>
        </div>
      </fieldset>

      {mode === "edit" ? (
        <section
          aria-labelledby="media-state-title"
          className="rounded-lg border bg-card p-5 sm:p-6"
        >
          <h2 id="media-state-title" className="font-serif text-2xl">
            Deferred content
          </h2>
          <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="font-medium">Screenshot</dt>
              <dd className="mt-1 text-muted-foreground">
                {hasScreenshot
                  ? "An existing screenshot reference is preserved."
                  : "No screenshot. Upload support will be added with shared media."}
              </dd>
            </div>
            <div>
              <dt className="font-medium">Case study</dt>
              <dd className="mt-1 text-muted-foreground">
                {hasCaseStudy
                  ? "Existing case-study data is preserved and previewed when supported."
                  : "No case study. Authoring will use the shared rich-text editor later."}
              </dd>
            </div>
          </dl>
        </section>
      ) : null}

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="min-h-11 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-wait disabled:opacity-60"
        >
          {pending
            ? "Saving…"
            : mode === "create"
              ? "Create project"
              : "Save project"}
        </button>
        <Link
          href="/admin/projects"
          className="inline-flex min-h-11 items-center rounded-md px-3 text-sm text-muted-foreground hover:text-foreground"
        >
          Cancel
        </Link>
        <p
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="text-sm text-muted-foreground"
        >
          {pending ? "Saving your project…" : state.message}
        </p>
      </div>
    </form>
  );
}

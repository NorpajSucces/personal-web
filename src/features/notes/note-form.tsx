"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";

import {
  emptyRichTextDocument,
  type RichTextDocument,
} from "@/features/rich-text/contract";
import { RichTextEditor } from "@/features/rich-text/editor";
import { TaxonomyPicker } from "@/features/taxonomy/taxonomy-picker";

import {
  initialNoteFormState,
  type NoteFormField,
  type NoteFormState,
} from "./schema";
import { generateNoteSlug } from "./slug";
import type { TaxonomyOption } from "./types";

export type NoteFormInitialValues = {
  title: string;
  slug: string;
  excerpt: string;
  content: RichTextDocument;
  publicationStatus: "draft" | "published";
  visibility: "private" | "public";
  topicIds: string[];
  tagIds: string[];
  publishedAt: string | null;
};

type NoteFormProps = {
  action: (state: NoteFormState, formData: FormData) => Promise<NoteFormState>;
  initialValues: NoteFormInitialValues;
  initialTopics: TaxonomyOption[];
  initialTags: TaxonomyOption[];
  mode: "create" | "edit";
  hasCoverImage?: boolean;
};

const inputClassName =
  "block min-h-11 w-full min-w-0 rounded-md border border-input bg-background px-3 py-2 text-base leading-7 aria-invalid:border-destructive";

export const newNoteValues: NoteFormInitialValues = {
  title: "",
  slug: "",
  excerpt: "",
  content: emptyRichTextDocument,
  publicationStatus: "draft",
  visibility: "private",
  topicIds: [],
  tagIds: [],
  publishedAt: null,
};

function FieldError({
  field,
  error,
}: {
  field: NoteFormField;
  error?: string;
}) {
  return error ? (
    <p id={`${field}-error`} className="text-sm text-destructive">
      {error}
    </p>
  ) : null;
}

export function NoteForm({
  action,
  initialValues,
  initialTopics,
  initialTags,
  mode,
  hasCoverImage = false,
}: NoteFormProps) {
  const [values, setValues] = useState(initialValues);
  const [topics, setTopics] = useState(initialTopics);
  const [tags, setTags] = useState(initialTags);
  const [slugWasEdited, setSlugWasEdited] = useState(mode === "edit");
  const [state, formAction, pending] = useActionState(
    action,
    initialNoteFormState,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state.errors) return;
    const invalid = formRef.current?.querySelector<HTMLElement>(
      '[aria-invalid="true"]',
    );
    invalid?.focus();
  }, [state]);

  function updateValue(
    field: "title" | "slug" | "excerpt" | "publicationStatus" | "visibility",
    value: string,
  ) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function errorProps(field: NoteFormField) {
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
        <legend className="px-2 font-serif text-2xl">Note details</legend>
        <div className="space-y-2">
          <label htmlFor="title" className="block text-sm font-medium">
            Title
          </label>
          <input
            {...errorProps("title")}
            id="title"
            name="title"
            value={values.title}
            required
            autoFocus={mode === "create"}
            className={inputClassName}
            onChange={(event) => {
              const title = event.target.value;
              setValues((current) => ({
                ...current,
                title,
                slug:
                  mode === "create" && !slugWasEdited
                    ? generateNoteSlug(title)
                    : current.slug,
              }));
            }}
          />
          <FieldError field="title" error={state.errors?.title?.[0]} />
        </div>
        <div className="space-y-2">
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
            Public URL: /notes/{values.slug || "your-note"}
          </p>
          <FieldError field="slug" error={state.errors?.slug?.[0]} />
        </div>
        <div className="space-y-2">
          <label htmlFor="excerpt" className="block text-sm font-medium">
            Excerpt
          </label>
          <textarea
            {...errorProps("excerpt")}
            id="excerpt"
            name="excerpt"
            value={values.excerpt}
            required
            rows={3}
            className={inputClassName}
            onChange={(event) => updateValue("excerpt", event.target.value)}
          />
          <FieldError field="excerpt" error={state.errors?.excerpt?.[0]} />
        </div>
        <div className="space-y-2">
          <span className="block text-sm font-medium">Content</span>
          <input
            type="hidden"
            name="contentJson"
            value={JSON.stringify(values.content)}
            readOnly
          />
          <div
            {...errorProps("content")}
            tabIndex={state.errors?.content?.length ? -1 : undefined}
          >
            <RichTextEditor
              value={values.content}
              onChange={(content) =>
                setValues((current) => ({ ...current, content }))
              }
            />
          </div>
          <FieldError field="content" error={state.errors?.content?.[0]} />
        </div>
      </fieldset>

      <fieldset
        disabled={pending}
        className="min-w-0 space-y-5 rounded-lg border bg-card p-5 disabled:opacity-75 sm:p-6"
      >
        <legend className="px-2 font-serif text-2xl">Topics and tags</legend>
        <p className="text-sm leading-6 text-muted-foreground">
          Classify this Note with shared Topics and Tags. Subject does not
          determine whether something is a Note.
        </p>
        <TaxonomyPicker
          kind="topic"
          items={topics}
          selectedIds={values.topicIds}
          onItemsChange={setTopics}
          onSelectionChange={(topicIds) =>
            setValues((current) => ({ ...current, topicIds }))
          }
        />
        <TaxonomyPicker
          kind="tag"
          items={tags}
          selectedIds={values.tagIds}
          onItemsChange={setTags}
          onSelectionChange={(tagIds) =>
            setValues((current) => ({ ...current, tagIds }))
          }
        />
      </fieldset>

      <fieldset
        disabled={pending}
        className="min-w-0 space-y-5 rounded-lg border bg-card p-5 disabled:opacity-75 sm:p-6"
      >
        <legend className="px-2 font-serif text-2xl">Publishing</legend>
        <p className="text-sm leading-6 text-muted-foreground">
          A Note appears publicly only when it is both Published and Public.
        </p>
        <div className="grid gap-5 sm:grid-cols-2">
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
          </div>
        </div>
        <dl className="grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="font-medium">Published date</dt>
            <dd className="mt-1 text-muted-foreground">
              {values.publishedAt
                ? `First published ${values.publishedAt}. This date is preserved.`
                : "Set automatically the first time this Note is published."}
            </dd>
          </div>
          <div>
            <dt className="font-medium">Cover image</dt>
            <dd className="mt-1 text-muted-foreground">
              {hasCoverImage
                ? "An existing cover-image reference is preserved."
                : "No cover image. Upload support will arrive with shared media."}
            </dd>
          </div>
        </dl>
      </fieldset>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="min-h-11 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:cursor-wait disabled:opacity-60"
        >
          {pending
            ? "Saving…"
            : mode === "create"
              ? "Create Note"
              : "Save Note"}
        </button>
        <Link
          href="/admin/notes"
          className="inline-flex min-h-11 items-center rounded-md px-3 text-sm text-muted-foreground hover:text-foreground"
        >
          Cancel
        </Link>
        <p
          role="status"
          aria-live="polite"
          className="text-sm text-muted-foreground"
        >
          {pending ? "Saving your Note…" : state.message}
        </p>
      </div>
    </form>
  );
}

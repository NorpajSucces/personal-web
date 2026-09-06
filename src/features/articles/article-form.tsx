"use client";

import Link from "next/link";
import {
  useActionState,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";

import {
  emptyRichTextDocument,
  type RichTextDocument,
} from "@/features/rich-text/contract";
import { RichTextEditor } from "@/features/rich-text/editor";
import { createInlineTaxonomy } from "@/features/taxonomy/actions";

import { generateArticleSlug } from "./slug";
import {
  initialArticleFormState,
  type ArticleFormField,
  type ArticleFormState,
} from "./schema";
import type { TaxonomyOption } from "./types";

export type ArticleFormInitialValues = {
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

type ArticleFormProps = {
  action: (
    state: ArticleFormState,
    formData: FormData,
  ) => Promise<ArticleFormState>;
  initialValues: ArticleFormInitialValues;
  initialTopics: TaxonomyOption[];
  initialTags: TaxonomyOption[];
  mode: "create" | "edit";
  hasCoverImage?: boolean;
};

const inputClassName =
  "block min-h-11 w-full min-w-0 rounded-md border border-input bg-background px-3 py-2 text-base leading-7 aria-invalid:border-destructive";

export const newArticleValues: ArticleFormInitialValues = {
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
  field: ArticleFormField;
  error?: string;
}) {
  return error ? (
    <p id={`${field}-error`} className="text-sm text-destructive">
      {error}
    </p>
  ) : null;
}

function TaxonomyPicker({
  kind,
  items,
  selectedIds,
  onItemsChange,
  onSelectionChange,
}: {
  kind: "topic" | "tag";
  items: TaxonomyOption[];
  selectedIds: string[];
  onItemsChange: (items: TaxonomyOption[]) => void;
  onSelectionChange: (ids: string[]) => void;
}) {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const label = kind === "topic" ? "Topics" : "Tags";

  function toggle(id: string) {
    onSelectionChange(
      selectedIds.includes(id)
        ? selectedIds.filter((selectedId) => selectedId !== id)
        : [...selectedIds, id],
    );
  }

  function createItem() {
    startTransition(async () => {
      const result = await createInlineTaxonomy(kind, name);
      setMessage(result.message);
      if (result.status === "success" && result.item) {
        const nextItems = items.some((item) => item.id === result.item?.id)
          ? items
          : [...items, result.item].sort((a, b) =>
              a.name.localeCompare(b.name),
            );
        onItemsChange(nextItems);
        if (!selectedIds.includes(result.item.id))
          onSelectionChange([...selectedIds, result.item.id]);
        setName("");
      }
    });
  }

  return (
    <fieldset className="min-w-0 rounded-lg border p-4">
      <legend className="px-2 text-sm font-semibold">{label}</legend>
      {items.length ? (
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <label
              key={item.id}
              className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full border px-3 text-sm has-checked:border-primary has-checked:bg-accent"
            >
              <input
                type="checkbox"
                name={kind === "topic" ? "topicIds" : "tagIds"}
                value={item.id}
                checked={selectedIds.includes(item.id)}
                className="size-4 accent-current"
                onChange={() => toggle(item.id)}
              />
              {item.name}
            </label>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          No {label.toLowerCase()} yet.
        </p>
      )}
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <label htmlFor={`new-${kind}`} className="sr-only">
          New {kind} name
        </label>
        <input
          id={`new-${kind}`}
          value={name}
          placeholder={`New ${kind} name`}
          className={`${inputClassName} flex-1`}
          onChange={(event) => setName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              if (name.trim()) createItem();
            }
          }}
        />
        <button
          type="button"
          disabled={isPending || !name.trim()}
          className="min-h-11 rounded-md border px-4 text-sm font-medium text-primary disabled:opacity-50"
          onClick={createItem}
        >
          {isPending ? "Adding…" : `Add ${kind}`}
        </button>
      </div>
      <p aria-live="polite" className="mt-2 text-sm text-muted-foreground">
        {message}
      </p>
    </fieldset>
  );
}

export function ArticleForm({
  action,
  initialValues,
  initialTopics,
  initialTags,
  mode,
  hasCoverImage = false,
}: ArticleFormProps) {
  const [values, setValues] = useState(initialValues);
  const [topics, setTopics] = useState(initialTopics);
  const [tags, setTags] = useState(initialTags);
  const [slugWasEdited, setSlugWasEdited] = useState(mode === "edit");
  const [state, formAction, pending] = useActionState(
    action,
    initialArticleFormState,
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

  function errorProps(field: ArticleFormField) {
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
        <legend className="px-2 font-serif text-2xl">Article details</legend>
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
                    ? generateArticleSlug(title)
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
            Public URL: /articles/{values.slug || "your-article"}
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
            rows={4}
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
          Topics are broad themes; Tags are specific labels. New shared items
          can be created here and reused by Notes later.
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
          An Article appears publicly only when it is both Published and Public.
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
                : "Set automatically the first time this Article is published."}
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
              ? "Create Article"
              : "Save Article"}
        </button>
        <Link
          href="/admin/articles"
          className="inline-flex min-h-11 items-center rounded-md px-3 text-sm text-muted-foreground hover:text-foreground"
        >
          Cancel
        </Link>
        <p
          role="status"
          aria-live="polite"
          className="text-sm text-muted-foreground"
        >
          {pending ? "Saving your Article…" : state.message}
        </p>
      </div>
    </form>
  );
}
